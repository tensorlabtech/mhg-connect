import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/product/brand-lockup";

export function QrStateShell({
  actions,
  children,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-16 text-center sm:px-6">
      <Link
        aria-label="Về trang chủ MHG Connect"
        className="mx-auto mb-12 w-fit rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="/"
      >
        <BrandLockup />
      </Link>
      {eyebrow ? (
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-4 font-heading text-5xl leading-none font-medium tracking-[-0.035em] sm:text-6xl">
        {title}
      </h1>
      <div className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground">
        {children}
      </div>
      {actions ? (
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {actions}
        </div>
      ) : null}
    </main>
  );
}
