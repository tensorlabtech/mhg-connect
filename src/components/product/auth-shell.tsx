import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/product/brand-lockup";
import { ProductSurface } from "@/components/product/product-page";
import { Button } from "@/components/ui/button";

export function AuthShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Button asChild className="w-fit" size="sm" variant="secondary">
          <Link href="/">
            <ArrowLeft /> Về trang chủ
          </Link>
        </Button>
        <Link
          aria-label="Về trang chủ MHG Connect"
          className="w-fit rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/"
        >
          <BrandLockup />
        </Link>
      </div>
      <h1 className="font-heading text-5xl leading-none font-medium tracking-[-0.035em]">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <ProductSurface className="mt-10 p-5 sm:p-6">{children}</ProductSurface>
    </main>
  );
}
