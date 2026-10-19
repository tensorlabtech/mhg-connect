import type { Metadata } from "next";

import { AuthShell } from "@/components/product/auth-shell";
import { AuthTabs } from "@/features/auth/auth-tabs";
import { safeReturnTo } from "@/features/auth/safe-return-to";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Đăng nhập",
};

export default async function LoginPage({
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
          ? "Tiếp tục để kích hoạt và quản lý mã QR này."
          : "Quản lý hồ sơ số và các mã QR thuộc tài khoản của bạn."
      }
      title={fromQr ? "Kích hoạt mã QR" : "Quản lý hồ sơ"}
    >
      <AuthTabs defaultMode="login" returnTo={returnTo} />
    </AuthShell>
  );
}
