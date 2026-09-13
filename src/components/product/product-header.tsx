"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLockup } from "@/components/product/brand-lockup";
import { IconButton } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ProductHeader({
  admin = false,
  email,
}: {
  admin?: boolean;
  email: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signOut() {
    setError("");
    setPending(true);
    try {
      const response = await authClient.signOut();
      if (response.error) {
        setError("Chưa thể đăng xuất. Vui lòng thử lại.");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError("Không thể kết nối tới máy chủ.");
    } finally {
      setPending(false);
    }
  }

  return (
    <header className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="flex min-h-16 items-center justify-between gap-4 rounded-surface bg-card px-5 sm:min-h-[4.5rem] sm:px-6">
        <Link
          aria-label={admin ? "Về trang quản trị" : "Về bảng điều khiển"}
          className="shrink-0 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={admin ? "/admin" : "/dashboard"}
        >
          <BrandLockup />
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          {error ? (
            <span className="max-w-36 text-xs text-destructive" role="alert">
              {error}
            </span>
          ) : null}
          <span className="hidden max-w-52 truncate text-xs text-muted-foreground md:block">
            {email}
          </span>
          <IconButton
            disabled={pending}
            onClick={signOut}
            size="icon-sm"
            tooltip="Đăng xuất"
            variant="secondary"
          >
            <LogOut aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
