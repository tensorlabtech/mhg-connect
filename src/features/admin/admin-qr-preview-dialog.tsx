"use client";

import { ArrowUpRight, Printer, QrCode } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { StatusBadge } from "@/components/product/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrVisualCard } from "@/features/qr/qr-visual-card";

export function AdminQrPreviewDialog({
  backgroundUrl,
  className,
  defaultOpen = false,
  id,
  publicToken,
  status,
  svg,
}: {
  backgroundUrl?: string | null;
  className?: string;
  defaultOpen?: boolean;
  id: string;
  publicToken: string;
  status: string;
  svg: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleOpenChange(open: boolean) {
    if (!open && defaultOpen && searchParams.has("created")) {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.delete("created");
      const query = nextSearchParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  }

  return (
    <Dialog defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={className} variant="secondary">
          <QrCode /> Xem mã QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mã QR {publicToken}</DialogTitle>
          <DialogDescription>
            Gửi thẻ này để người nhận quét. Mã chưa kích hoạt sẽ dẫn họ đến bước
            nhận quyền quản lý.
          </DialogDescription>
        </DialogHeader>
        <QrVisualCard
          backgroundUrl={backgroundUrl}
          description="Quét để mở mã"
          heading={publicToken}
          headingClassName="text-nowrap"
          svg={svg}
        />
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Token</dt>
            <dd className="mt-1 font-medium text-gold">{publicToken}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Trạng thái</dt>
            <dd className="mt-1">
              <StatusBadge status={status} />
            </dd>
          </div>
        </dl>
        <DialogFooter showCloseButton>
          <Button asChild variant="outline">
            <Link href={`/q/${publicToken}`} target="_blank">
              Mở trang mã <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/qr/${id}/print`} target="_blank">
              <Printer /> Bản in
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
