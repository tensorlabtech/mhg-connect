import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPage } from "@/components/product/product-page";
import { Button } from "@/components/ui/button";
import { AdminQrPrintButton } from "@/features/admin/admin-qr-print-button";
import { getAdminQrDetail } from "@/features/admin/admin-data";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { getQrCardDesigns } from "@/features/qr/qr-data";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
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
  const svg = await createPublicQrSvg(qr.publicToken);
  const design =
    typeof query.design === "string"
      ? ((await getQrCardDesigns([qr.id])).get(qr.id) ?? []).find(
          (item) => item.id === query.design,
        )
      : undefined;
  if (typeof query.design === "string" && !design) notFound();
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
      <main className="mx-auto max-w-[20rem] [print-color-adjust:exact]">
        <QrVisualCard
          backgroundUrl={design ? design.backgroundUrl : qr.cardBackgroundUrl}
          className="print:w-[53.98mm]"
          description={description || "Quét để mở hồ sơ"}
          heading={design?.heading || qr.profileName || qr.publicToken}
          headingClassName={
            design?.heading || qr.profileName ? undefined : "text-nowrap"
          }
          location={design?.location ?? qr.profileLocation}
          svg={svg}
          textStyle={design?.textStyle ?? qr.cardTextStyle}
        />
      </main>
    </ProductPage>
  );
}
