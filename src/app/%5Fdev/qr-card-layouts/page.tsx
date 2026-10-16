import QRCode from "qrcode";
import Link from "next/link";
import { guardDevRoute } from "@/features/dev/dev-route-guard";
import { businessCardTemplates } from "@/features/qr/qr-card-appearance";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { QrInlineCardEditor } from "@/features/qr/qr-inline-card-editor";
import { qrCardFonts } from "@/features/qr/qr-card-layout";
import { BrandLockup } from "@/components/product/brand-lockup";

export default async function QrCardLayoutsPreview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  guardDevRoute();
  const query = await searchParams;
  const font = qrCardFonts.find((f) => f === query.font) ?? "be-vietnam";
  const heading =
    query.long === "1"
      ? "Nguyễn Thị Thành An Người Phụ Trách Điều Hành Doanh Nghiệp"
      : "Nguyễn Minh An";
  const identity = {
    title: "Giám đốc phát triển",
    company: "Công ty Môi trường và Năng lượng",
    phone: "0900000000",
    website: "https://example.com",
    avatarUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%234b5b52'/%3E%3Ccircle cx='60' cy='42' r='21' fill='%23d5ddd3'/%3E%3Cpath d='M18 120v-12a42 42 0 0 1 84 0v12' fill='%23d5ddd3'/%3E%3C/svg%3E",
  };
  const svg = await QRCode.toString("https://example.com/q/DESIGN-PREVIEW", {
    type: "svg",
    margin: 4,
    errorCorrectionLevel: "H",
  });
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <BrandLockup />
      <header className="mt-8 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">
            Danh thiếp, chỉnh ngay trên thẻ
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Cùng bộ hiển thị và công cụ sửa đang dùng trong dashboard thật. Dữ
            liệu ở đây là ví dụ, không ghi vào hồ sơ khách hàng.
          </p>
        </div>
        <Link
          className="text-sm underline underline-offset-4"
          href="/dashboard"
        >
          Mở dashboard
        </Link>
      </header>
      <section className="max-w-3xl" aria-label="Thử chỉnh trực tiếp">
        <QrInlineCardEditor
          preview
          heading={heading}
          identity={identity}
          svg={svg}
          orientation="landscape"
          position="right"
          appearance={{ finish: "signature" }}
          font={font}
          canAddLogo
        />
      </section>
      <section className="mt-16" aria-label="Bộ mẫu danh thiếp">
        <h2 className="font-heading text-2xl">Sáu cách trình bày danh thiếp</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Ảnh, tên, chức danh và thông tin liên hệ có vùng riêng, không chồng
          lên QR. Logo MHG luôn cố định; doanh nghiệp được thêm logo bên cạnh.
        </p>
        <div className="mt-8 grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {businessCardTemplates.map((t) => (
            <article key={t.id} data-template-case={t.id}>
              <h3 className="mb-3 text-sm font-medium">{t.name}</h3>
              <QrVisualCard
                heading={heading}
                identity={identity}
                svg={svg}
                orientation={t.orientation}
                position={t.position}
                appearance={{ finish: t.finish }}
                font={font}
                tagline=""
              />
            </article>
          ))}
        </div>
      </section>
      <nav
        className="mt-10 flex flex-wrap gap-4 text-sm underline underline-offset-4"
        aria-label="Kiểm tra nội dung dài"
      >
        <Link href="/_dev/qr-card-layouts">Tên thông thường</Link>
        <Link href="/_dev/qr-card-layouts?long=1">Thử tên dài</Link>
      </nav>
    </main>
  );
}
