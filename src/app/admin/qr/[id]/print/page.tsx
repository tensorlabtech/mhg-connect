import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPage } from "@/components/product/product-page";
import { Button } from "@/components/ui/button";
import { AdminQrPrintButton } from "@/features/admin/admin-qr-print-button";
import { getAdminQrDetail } from "@/features/admin/admin-data";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { getQrCardDesigns } from "@/features/qr/qr-data";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { getEnterpriseBrand } from "@/features/enterprise/enterprise-data";
import { requireAdmin } from "@/lib/session";

export default async function AdminQrPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const qr = await getAdminQrDetail(id);
  if (!qr) notFound();
  const brand = await getEnterpriseBrand(qr.ownerId);
  const svg = await createPublicQrSvg(qr.publicToken);
  const design =
    typeof query.design === "string"
      ? ((await getQrCardDesigns([qr.id])).get(qr.id) ?? []).find(
          (item) => item.id === query.design,
        )
      : undefined;
  if (typeof query.design === "string" && !design) notFound();
  const orientation = design?.orientation ?? qr.cardOrientation;
  const description =
    design?.description ??
    [qr.profileTitle, qr.profileCompany].filter(Boolean).join(" · ");

  return (
    <ProductPage className="print:max-w-none print:p-0" width="narrow">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/admin/qr/${qr.id}`}>Quay lại chi tiết mã</Link>
        </Button>
        <AdminQrPrintButton />
      </div>
      <main
        className={
          orientation === "landscape"
            ? "mx-auto max-w-[32rem] [print-color-adjust:exact]"
            : "mx-auto max-w-[20rem] [print-color-adjust:exact]"
        }
      >
        <QrVisualCard
          backgroundUrl={design ? design.backgroundUrl : qr.cardBackgroundUrl}
          className={
            orientation === "landscape"
              ? "print:w-[85.6mm]"
              : "print:w-[53.98mm]"
          }
          description={description || "Quét để mở hồ sơ"}
          heading={design?.heading || qr.profileName || qr.publicToken}
          headingClassName={
            design?.heading || qr.profileName ? undefined : "text-nowrap"
          }
          location={design?.location ?? qr.profileLocation}
          orientation={orientation}
          position={design?.position ?? qr.cardPosition}
          logoUrl={brand.url}
          logoName={brand.name}
          appearance={design?.appearance ?? qr.cardAppearance}
          identity={{ avatarUrl: qr.profileAvatarUrl, phone: qr.profileVisibleFields?.phone === false ? null : qr.profilePhone, website: qr.profileVisibleFields?.website === false ? null : qr.profileWebsite, title: qr.profileVisibleFields?.title === false ? null : qr.profileTitle, company: qr.profileVisibleFields?.company === false ? null : qr.profileCompany }}
          svg={svg}
          font={design ? design.font : qr.cardFont}
          tagline={design ? design.tagline : qr.cardTagline}
          textColor={design ? design.textColor : qr.cardTextColor}
          textStyle={design?.textStyle ?? qr.cardTextStyle}
        />
      </main>
    </ProductPage>
  );
}
