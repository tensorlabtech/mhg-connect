import { ArrowLeft, ArrowRight, LockKeyhole, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { after } from "next/server";
import { cache } from "react";

import { QrStateShell } from "@/components/product/qr-state-shell";
import { Button } from "@/components/ui/button";
import { QrActivationAuth } from "@/features/qr/qr-activation-auth";
import { QrActivationClaim } from "@/features/qr/qr-activation-claim";
import {
  getOwnedProfiles,
  getQrByToken,
  recordScan,
} from "@/features/qr/qr-data";
import { PublicProfile } from "@/features/profile/public-profile";
import {
  localizeProfileDocument,
  resolveProfileLocale,
} from "@/features/profile/profile-article";
import { profileDocumentToFlat } from "@/features/profile/profile-document";
import { getPublishedProfileSnapshot } from "@/features/profile/published-profile-snapshot";
import { getSession } from "@/lib/session";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { DigitalCardPreview } from "@/features/qr/digital-card-preview";
import { digitalIdentityFromProfile } from "@/features/qr/digital-identity";
import { getEnterpriseBrand } from "@/features/enterprise/enterprise-data";

export const dynamic = "force-dynamic";
const getQrPageData = cache(getQrByToken);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { token } = await params;
  const query = await searchParams;
  const result = await getQrPageData(token);
  const snapshot = getPublishedProfileSnapshot(result?.profile);
  const document = snapshot
    ? localizeProfileDocument(
        snapshot,
        resolveProfileLocale(snapshot, query.lang),
      )
    : null;

  if (!result || result.qr.status !== "active" || !document) {
    return {
      description: "Trạng thái mã QR trên MHG Connect.",
      robots: { follow: false, index: false },
      title: "Mã QR",
    };
  }

  const profile = profileDocumentToFlat(document);
  const details = [
    profile.visibleFields.title ? profile.title : null,
    profile.visibleFields.company ? profile.company : null,
  ].filter(Boolean);
  const description = details.length
    ? `${details.join(" · ")} — Hồ sơ số trên MHG Connect.`
    : `Hồ sơ số của ${profile.name} trên MHG Connect.`;

  return {
    alternates: { canonical: `/q/${encodeURIComponent(token)}` },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: "MHG Connect — Kết nối sản phẩm với con người",
          height: 630,
          url: "/og-image.png",
          width: 1200,
        },
      ],
      locale: "vi_VN",
      siteName: "MHG Connect",
      title: profile.name.trim() || "Hồ sơ",
      type: "website",
      url: `/q/${encodeURIComponent(token)}`,
    },
    title: profile.name.trim() || "Hồ sơ",
    twitter: {
      card: "summary_large_image",
      description,
      images: ["/og-image.png"],
      title: profile.name.trim() || "Hồ sơ",
    },
  };
}

export default async function QrPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const result = await getQrPageData(token);

  if (!result) {
    return (
      <QrStateShell
        actions={
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft /> Về trang chủ
            </Link>
          </Button>
        }
        eyebrow="Không tìm thấy mã"
        title="Mã QR không hợp lệ"
      >
        <p>
          Mã này chưa tồn tại trong hệ thống. Vui lòng kiểm tra lại đường dẫn
          hoặc tem QR.
        </p>
      </QrStateShell>
    );
  }

  if (result.qr.status === "locked") {
    return (
      <QrStateShell
        actions={
          <Button asChild variant="outline">
            <Link href={`/q/${encodeURIComponent(token)}`}>
              <RefreshCw /> Tải lại trạng thái
            </Link>
          </Button>
        }
        eyebrow={token}
        title="Hồ sơ đang tạm khóa"
      >
        <LockKeyhole className="mx-auto mb-5 size-8 text-destructive" />
        <p>
          Hồ sơ liên kết với mã QR này hiện chưa thể truy cập. Vui lòng quay lại
          sau.
        </p>
      </QrStateShell>
    );
  }

  const session = await getSession();

  if (result.qr.status === "available") {
    if (!session) {
      return <QrActivationAuth token={token} />;
    }

    const ownedProfiles = await getOwnedProfiles(session.user.id);
    const error = typeof query.error === "string" ? query.error : null;

    return (
      <QrActivationClaim
        email={session.user.email}
        error={error}
        profiles={ownedProfiles}
        token={token}
      />
    );
  }

  const isOwner = session?.user.id === result.qr.ownerId;
  const publishedDocument = getPublishedProfileSnapshot(result.profile);
  if (!result.profile || !publishedDocument) {
    return (
      <QrStateShell
        actions={
          isOwner ? (
            <Button asChild size="lg">
              <Link
                href={
                  result.profile
                    ? `/profiles/${result.profile.id}/edit`
                    : `/profiles/new?qr=${encodeURIComponent(token)}`
                }
              >
                {result.profile ? "Cập nhật hồ sơ" : "Tạo hồ sơ"} <ArrowRight />
              </Link>
            </Button>
          ) : undefined
        }
        eyebrow={token}
        title="Hồ sơ chưa sẵn sàng"
      >
        <p>
          {isOwner
            ? "Lưu hồ sơ để người quét mã có thể xem thông tin của bạn."
            : "Chủ sở hữu đang hoàn thiện hồ sơ. Vui lòng quay lại sau."}
        </p>
      </QrStateShell>
    );
  }

  const userAgent = (await headers()).get("user-agent");
  after(async () => {
    await recordScan(result.qr.id, userAgent).catch(() => undefined);
  });
  const profile = { ...result.profile, publicToken: token };
  const locale = resolveProfileLocale(publishedDocument, query.lang);
  const localized = localizeProfileDocument(publishedDocument, locale);
  const [cardSvg, brand] = await Promise.all([
    createPublicQrSvg(token),
    getEnterpriseBrand(result.qr.ownerId, true),
  ]);

  return (
    <PublicProfile
      document={publishedDocument}
      digitalCard={
        <DigitalCardPreview
          identity={digitalIdentityFromProfile(
            profileDocumentToFlat(localized),
          )}
          svg={cardSvg}
          logoUrl={brand.url}
          logoName={brand.name}
          hideMhgLogo={brand.hideMhgLogo}
        />
      }
      locale={locale}
      profile={profile}
    />
  );
}
