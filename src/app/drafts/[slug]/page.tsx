import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ProductPage } from "@/components/product/product-page";
import { canReadLocalDraft } from "@/features/local-draft/local-draft-policy";
import { readLocalProfileDraft } from "@/features/local-draft/local-draft-store";
import { DraftCardWorkbench } from "@/features/local-draft/draft-card-workbench";
import { PublicProfile } from "@/features/profile/public-profile";
import { profileDocumentToFlat } from "@/features/profile/profile-document";
import { digitalIdentityFromProfile } from "@/features/qr/digital-identity";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Hồ sơ nháp local",
  robots: { index: false, follow: false },
};

export default async function LocalDraftPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const host = (await headers()).get("host");
  if (!canReadLocalDraft(process.env.NODE_ENV, host)) notFound();
  const { slug } = await params;
  const draft = await readLocalProfileDraft(slug);
  if (!draft) notFound();
  const flat = profileDocumentToFlat(draft.document);
  const svg = await QRCode.toString(
    `http://${host}/drafts/${encodeURIComponent(slug)}`,
    {
      type: "svg",
      margin: 4,
      errorCorrectionLevel: "H",
      color: { dark: "#0a0a0a", light: "#ffffff" },
    },
  );
  return (
    <>
      <ProductPage className="py-8">
        <header className="mb-8">
          <p className="text-xs font-medium tracking-widest text-gold uppercase">
            Nháp local · Chưa công khai
          </p>
          <h1 className="mt-3 font-heading text-3xl sm:text-4xl">
            {draft.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Chưa tạo tài khoản thật, chưa phát hành mã QR. Avatar là bản chỉnh
            nền từ ảnh bạn cung cấp, chờ duyệt độ giống. Ảnh hoạt động giữ
            nguyên từ nguồn chính thức; chú thích và nguồn nằm trong hồ sơ bên
            dưới.
          </p>
          <a
            href="#ho-so"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Xem toàn bộ hồ sơ và ảnh hoạt động
          </a>
        </header>
        <DraftCardWorkbench
          identity={digitalIdentityFromProfile(flat)}
          card={draft.card}
          svg={svg}
        />
      </ProductPage>
      <section id="ho-so" aria-label="Hồ sơ nháp">
        <PublicProfile
          document={draft.document}
          profile={{ ...flat, publicToken: "LOCAL-DRAFT" }}
          preview
          showActions={false}
        />
      </section>
    </>
  );
}
