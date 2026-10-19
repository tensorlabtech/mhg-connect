import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getProfilesForDashboard } from "@/features/profile/profile-data";
import { QrTokenForm } from "@/features/qr/qr-token-form";
import { UserQrList } from "@/features/qr/user-qr-list";
import {
  getOwnedQr,
  getPublishedProfilesForQrAssignment,
} from "@/features/qr/qr-data";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const session = await requireSession();
  const [qrItems, profiles, assignmentProfiles] = await Promise.all([
    getOwnedQr(session.user.id),
    getProfilesForDashboard(session.user.id),
    getPublishedProfilesForQrAssignment(session.user.id),
  ]);
  return (
    <>
      <ProductHeader email={session.user.email} />
      <ProductPage className="pt-6 sm:pt-8">
        {query.updated === "profile" ? (
          <Alert className="mb-6">
            <AlertDescription>
              Hồ sơ hiển thị của mã QR đã được cập nhật.
            </AlertDescription>
          </Alert>
        ) : null}
        {query.error === "profile-unavailable" ||
        query.error === "assignment-conflict" ? (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>
              {query.error === "profile-unavailable"
                ? "Hồ sơ đã chọn không còn sẵn sàng để gắn."
                : "Liên kết vừa được thay đổi ở nơi khác. Hãy thử lại."}
            </AlertDescription>
          </Alert>
        ) : null}
        {query.error === "admin-only" ? (
          <Alert className="mb-6">
            <AlertDescription>
              Tài khoản hiện tại không có quyền vận hành mã QR. Hãy đăng xuất và
              đăng nhập bằng tài khoản admin để mở khu vực này.
            </AlertDescription>
          </Alert>
        ) : null}
        <DashboardBentoLayout
          sidebar={
            <>
              <DashboardBentoSidebarCard>
                <h1 className="font-heading text-4xl leading-none tracking-[-0.035em]">
                  Hồ sơ và mã QR
                </h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Quản lý những gì khách nhìn thấy sau mỗi lần quét.
                </p>
                <div className="mt-6 grid gap-2">
                  <Button asChild>
                    <Link href="/profiles/new">
                      <Plus /> Tạo hồ sơ
                    </Link>
                  </Button>
                  {session.user.role === "admin" ? (
                    <Button asChild variant="outline">
                      <Link href="/admin">Vận hành QR</Link>
                    </Button>
                  ) : null}
                </div>
              </DashboardBentoSidebarCard>
            </>
          }
        >
          <section>
            <ProductSectionHeading title="Mã QR đang quản lý" />
            {qrItems.length ? (
              <UserQrList items={qrItems} profiles={assignmentProfiles} />
            ) : (
              <ProductSurface className="max-w-xl">
                <h3 className="text-lg font-medium">Mở hoặc kích hoạt mã QR</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Nhập mã in trên tem để mở. Nếu mã chưa được kích hoạt, bạn có
                  thể nhận quyền quản lý; mã đã thuộc tài khoản khác không thể
                  thêm vào đây.
                </p>
                <div className="mt-6">
                  <QrTokenForm />
                </div>
              </ProductSurface>
            )}
          </section>

          <section className="mt-12">
            <ProductSectionHeading
              count={`${profiles.length} hồ sơ`}
              title="Hồ sơ của bạn"
            />
            {profiles.length ? (
              <div className="grid gap-2">
                {profiles.map((profile) => (
                  <Link
                    className="group flex items-center justify-between gap-4 rounded-surface bg-card p-5 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px sm:px-6"
                    href={`/profiles/${profile.id}/edit`}
                    key={profile.id}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <p className="truncate text-base font-medium">
                        {profile.profileLabel ?? profile.name}
                      </p>
                      {profile.linkedQr.length ? (
                        <p className="hidden text-sm text-muted-foreground sm:block">
                          Đã gắn ·{" "}
                          {profile.linkedQr.map((qr) => qr.token).join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="max-w-xl">
                <p className="text-sm leading-6 text-muted-foreground">
                  Tạo hồ sơ trước, sau đó bạn có thể dùng chung hồ sơ cho nhiều
                  mã QR.
                </p>
                <Button asChild className="mt-5" variant="outline">
                  <Link href="/profiles/new">
                    <Plus /> Tạo hồ sơ đầu tiên
                  </Link>
                </Button>
              </div>
            )}
          </section>
        </DashboardBentoLayout>
      </ProductPage>
    </>
  );
}
