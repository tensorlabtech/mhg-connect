import { Search } from "lucide-react";
import Link from "next/link";

import {
  DashboardBentoLayout,
  DashboardBentoSidebarCard,
  DashboardMetric,
  DashboardMetricGrid,
} from "@/components/product/dashboard-bento";
import { ProductHeader } from "@/components/product/product-header";
import {
  ProductPage,
  ProductSectionHeading,
} from "@/components/product/product-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminQrCreateDialog } from "@/features/admin/admin-qr-create-dialog";
import { AdminQrList } from "@/features/admin/admin-qr-list";
import { getAdminQrList } from "@/features/admin/admin-data";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const search =
    typeof query.search === "string" ? query.search.trim().toLowerCase() : "";
  const creationError =
    query.error === "token-exists"
      ? "Token này đã tồn tại. Hãy dùng một mã khác."
      : query.error === "invalid-token"
        ? "Token không hợp lệ. Chỉ dùng chữ, số và dấu gạch ngang."
        : null;
  const allItems = await getAdminQrList();
  const items = allItems.filter(
    (item) =>
      !search ||
      item.publicToken.toLowerCase().includes(search) ||
      item.ownerEmail?.toLowerCase().includes(search),
  );
  const scans = allItems.reduce((total, item) => total + item.scanCount, 0);

  return (
    <>
      <ProductHeader admin email={session.user.email} />
      <ProductPage className="pt-6 sm:pt-8">
        <DashboardBentoLayout
          sidebar={
            <>
              <DashboardBentoSidebarCard>
                <p className="text-xs tracking-[0.14em] text-gold uppercase">
                  Vận hành QR
                </p>
                <h1 className="mt-4 font-heading text-4xl leading-none tracking-[-0.035em]">
                  Quản lý mã QR
                </h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Theo dõi vòng đời và chuẩn bị dữ liệu cho mỗi buổi demo.
                </p>
                <div className="mt-6 grid gap-2">
                  <AdminQrCreateDialog />
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Trang cá nhân</Link>
                  </Button>
                </div>
              </DashboardBentoSidebarCard>
            </>
          }
        >
          {creationError ? (
            <p className="mb-6 text-sm text-destructive" role="alert">
              {creationError}
            </p>
          ) : null}
          <DashboardMetricGrid>
            <DashboardMetric
              className="sm:col-span-2 xl:col-span-2"
              label="Tổng lượt quét"
              value={scans}
            />
            <DashboardMetric label="Tổng mã" value={allItems.length} />
            <DashboardMetric
              className="xl:col-span-2"
              label="Đang hoạt động"
              value={allItems.filter((item) => item.status === "active").length}
            />
            <DashboardMetric
              label="Đang khóa"
              value={allItems.filter((item) => item.status === "locked").length}
            />
          </DashboardMetricGrid>

          <section className="mt-10">
            <ProductSectionHeading
              count={`${items.length} mã`}
              title="Danh sách mã"
            />
            <form className="flex max-w-xl gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-11"
                  defaultValue={search}
                  name="search"
                  placeholder="Tìm token hoặc email owner"
                />
              </div>
              <Button type="submit" variant="secondary">
                Tìm
              </Button>
            </form>
            <div className="mt-6">
              {items.length ? (
                <AdminQrList items={items} />
              ) : (
                <div className="py-16 text-center">
                  <p className="font-heading text-3xl">Không có mã phù hợp</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Thử đổi từ khóa tìm kiếm.
                  </p>
                </div>
              )}
            </div>
          </section>
        </DashboardBentoLayout>
      </ProductPage>
    </>
  );
}
