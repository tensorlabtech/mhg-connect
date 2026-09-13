import type { Metadata } from "next";

import { AuthShell } from "@/components/product/auth-shell";
import { AuthTabs } from "@/features/auth/auth-tabs";
import { safeReturnTo } from "@/features/auth/safe-return-to";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Tạo tài khoản",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const returnTo = safeReturnTo(
    typeof query.returnTo === "string" ? query.returnTo : null,
  );
  const fromQr = returnTo.startsWith("/q/");

  return (
    <AuthShell
      description={
        fromQr
          ? "Tiếp tục để nhận quyền sở hữu mã QR và dựng hồ sơ."
          : "Một email quản lý được nhiều mã QR và nhiều hồ sơ."
      }
      title={fromQr ? "Kích hoạt mã QR" : "Quản lý hồ sơ"}
    >
      <AuthTabs defaultMode="register" returnTo={returnTo} />
    </AuthShell>
  );
}
