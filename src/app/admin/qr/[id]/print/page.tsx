import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPage } from "@/components/product/product-page";
import { Button } from "@/components/ui/button";
import { AdminQrPrintButton } from "@/features/admin/admin-qr-print-button";
import { getAdminQrDetail } from "@/features/admin/admin-data";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { requireAdmin } from "@/lib/session";

export default async function AdminQrPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const qr = await getAdminQrDetail(id);
  if (!qr) notFound();
  const svg = await createPublicQrSvg(qr.publicToken);

  return (
    <ProductPage className="print:max-w-none print:p-0" width="narrow">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/admin/qr/${qr.id}`}>Quay lại chi tiết mã</Link>
        </Button>
        <AdminQrPrintButton />
      </div>
      <main className="mx-auto max-w-lg [print-color-adjust:exact]">
        <QrVisualCard
          backgroundUrl={qr.cardBackgroundUrl}
          className="print:w-[85.6mm]"
          description="Quét để mở hồ sơ"
          heading={qr.publicToken}
          headingClassName="text-nowrap"
          svg={svg}
        />
      </main>
    </ProductPage>
  );
}
