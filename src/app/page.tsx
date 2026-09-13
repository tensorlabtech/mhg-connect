import { ArrowRight, QrCode } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BrandLockup } from "@/components/product/brand-lockup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl items-center px-4 py-16 sm:px-8">
      <section className="w-full py-16 sm:py-24">
        <Link
          aria-label="Trang chủ MHG Connect"
          className="mb-10 inline-flex rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/"
        >
          <BrandLockup />
        </Link>
        <div>
          <Badge variant="gold">Hồ sơ số từ một lần quét</Badge>
        </div>
        <h1 className="mt-8 max-w-4xl font-heading text-6xl leading-[0.95] font-medium tracking-[-0.045em] sm:text-8xl">
          Kết nối sản phẩm với con người.
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          MHG Connect biến mỗi tem QR thành một hồ sơ số có thể cập nhật, chia
          sẻ và quản lý lâu dài.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/q/DEMO-NEW">
              <QrCode /> Mở mã QR mẫu
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">
              Quản lý hồ sơ <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
