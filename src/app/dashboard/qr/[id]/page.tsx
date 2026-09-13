import { AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductHeader } from "@/components/product/product-header";
import { ProductPage, ProductSurface } from "@/components/product/product-page";
import { StatusBadge } from "@/components/product/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { QrProfileAssignment } from "@/features/qr/qr-profile-assignment";
import {
  getOwnedQrById,
  getPublishedProfilesForQrAssignment,
} from "@/features/qr/qr-data";
import { requireSession } from "@/lib/session";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function UserQrDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const [qr, publishedProfiles] = await Promise.all([
    getOwnedQrById(session.user.id, id),
    getPublishedProfilesForQrAssignment(session.user.id),
  ]);
  if (!qr) notFound();

  const message =
    query.updated === "profile"
      ? "Hồ sơ hiển thị của mã QR đã được cập nhật."
      : query.error === "profile-unavailable"
        ? "Hồ sơ đã chọn không còn sẵn sàng để gắn."
        : query.error === "assignment-conflict"
          ? "Liên kết vừa được thay đổi ở nơi khác. Hãy thử lại."
          : null;

  const rows = [
    { label: "Mã định danh", value: qr.publicToken },
    { label: "Hồ sơ đang hiển thị", value: qr.profileName ?? "Chưa thiết lập" },
    { label: "Lượt quét", value: String(qr.scanCount) },
    {
      label: "Kích hoạt",
      value: qr.activatedAt
        ? dateFormatter.format(qr.activatedAt)
        : "Chưa kích hoạt",
    },
  ];

  return (
    <>
      <ProductHeader email={session.user.email} />
      <ProductPage className="pt-6 sm:pt-8" width="narrow">
        <Button asChild size="sm" variant="ghost">
          <Link href="/dashboard">← Hồ sơ và mã QR</Link>
        </Button>
        <header className="mt-8 flex flex-wrap items-center gap-4">
          <h1 className="font-heading text-5xl tracking-[-0.035em] sm:text-6xl">
            Chi tiết mã QR
          </h1>
          <StatusBadge status={qr.status} />
        </header>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Thông tin vận hành của mã QR đang thuộc tài khoản này.
        </p>
        {message ? (
          <Alert
            className="mt-6 max-w-xl"
            variant={query.updated === "profile" ? "default" : "destructive"}
          >
            {query.updated !== "profile" ? <AlertCircle /> : null}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        <ProductSurface className="mt-10">
          <dl className="grid gap-6 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="mt-2 text-sm font-medium break-words">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-medium">Liên kết hồ sơ</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {qr.profileName
                  ? `Mã này đang dẫn tới hồ sơ ${qr.profileName}.`
                  : "Mã này chưa dẫn tới hồ sơ nào khi được quét."}
              </p>
            </div>
            {qr.status === "active" ? (
              <QrProfileAssignment
                currentProfileId={qr.profileId}
                profiles={publishedProfiles}
                qrId={qr.id}
                qrToken={qr.publicToken}
                version={qr.version}
              />
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {qr.profileId ? (
              <Button asChild variant="secondary">
                <Link href={`/profiles/${qr.profileId}/edit`}>Chỉnh sửa hồ sơ</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={`/q/${qr.publicToken}`} target="_blank">
                Mở hồ sơ công khai <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </ProductSurface>
      </ProductPage>
    </>
  );
}
