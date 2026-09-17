import { ArrowLeft, ArrowUpRight, Printer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DashboardBentoLayout,
  DashboardBentoSidebarCard,
} from "@/components/product/dashboard-bento";
import { ProductHeader } from "@/components/product/product-header";
import {
  ProductPage,
  ProductSectionHeading,
  ProductSurface,
} from "@/components/product/product-page";
import { StatusBadge } from "@/components/product/status-badge";
import { Button } from "@/components/ui/button";
import { AdminQrActions } from "@/features/admin/admin-qr-actions";
import { getAdminQrDetail } from "@/features/admin/admin-data";
import { AdminQrPreviewDialog } from "@/features/admin/admin-qr-preview-dialog";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { requireAdmin } from "@/lib/session";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminQrDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const qr = await getAdminQrDetail(id);
  if (!qr) notFound();
  const query = await searchParams;
  const updated = typeof query.updated === "string" ? query.updated : "";
  const created = query.created === "1";
  const hasTransitionError = query.error === "invalid-transition";
  const svg = await createPublicQrSvg(qr.publicToken);
  const rows = [
    { label: "Ngày tạo", value: dateFormatter.format(qr.createdAt) },
    {
      label: "Kích hoạt",
      value: qr.activatedAt
        ? dateFormatter.format(qr.activatedAt)
        : "Chưa kích hoạt",
    },
    { label: "Chủ sở hữu", value: qr.ownerEmail ?? "Chưa có" },
    { label: "Hồ sơ đang dùng", value: qr.profileName ?? "Chưa liên kết" },
    { label: "Lượt quét", value: String(qr.scanCount) },
  ];

  return (
    <>
      <ProductHeader admin email={session.user.email} />
      <ProductPage className="pt-6 sm:pt-8">
        <DashboardBentoLayout
          sidebar={
            <>
              <Button asChild className="w-fit" size="sm" variant="ghost">
                <Link href="/admin">
                  <ArrowLeft /> Quay lại
                </Link>
              </Button>
              <DashboardBentoSidebarCard>
                <div>
                  <h2 className="text-lg font-medium">Chia sẻ và in</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Mở thẻ QR để gửi cho người nhận hoặc tạo bản in.
                  </p>
                </div>
                <div className="mt-6 grid gap-2">
                  <AdminQrPreviewDialog
                    backgroundUrl={qr.cardBackgroundUrl}
                    className="w-full"
                    defaultOpen={created}
                    id={qr.id}
                    publicToken={qr.publicToken}
                    status={qr.status}
                    svg={svg}
                  />
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/admin/qr/${qr.id}/print`} target="_blank">
                      <Printer /> Bản in mã QR
                    </Link>
                  </Button>
                </div>
              </DashboardBentoSidebarCard>
            </>
          }
        >
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-gold sm:text-4xl">
                {qr.publicToken}
              </h1>
              <StatusBadge status={qr.status} />
            </div>
            <Button asChild variant="outline">
              <Link href={`/q/${qr.publicToken}`} target="_blank">
                Mở trang mã <ArrowUpRight />
              </Link>
            </Button>
          </header>
          {created ? (
            <p className="mt-6 text-sm text-success" role="status">
              Đã tạo mã QR. Bạn có thể mở bản in ngay.
            </p>
          ) : null}
          {updated ? (
            <p className="mt-6 text-sm text-success" role="status">
              Đã cập nhật trạng thái mã QR.
            </p>
          ) : null}
          {hasTransitionError ? (
            <p className="mt-6 text-sm text-destructive" role="alert">
              Trạng thái mã đã thay đổi. Hãy tải lại trang và thử lại.
            </p>
          ) : null}
          <section className="mt-10">
            <ProductSectionHeading title="Thông tin mã" />
            <ProductSurface>
              <dl className="grid gap-6 sm:grid-cols-2">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="mt-2 text-sm break-words">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </ProductSurface>
          </section>
          <section className="mt-10">
            <ProductSectionHeading title="Vận hành mã QR" />
            <ProductSurface>
              <AdminQrActions
                id={qr.id}
                status={qr.status}
                version={qr.version}
              />
            </ProductSurface>
          </section>
        </DashboardBentoLayout>
      </ProductPage>
    </>
  );
}
