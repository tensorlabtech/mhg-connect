"use client";
import type { QrCardAppearance } from "@/features/qr/qr-card-appearance";
import type { DigitalIdentity } from "@/features/qr/digital-identity-card";

import { QrInteractiveSurface } from "@/features/qr/qr-interactive-surface";

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
import type { QrCardTextStyle } from "@/db/schema/product";
import type {
  QrCardFont,
  QrCardOrientation,
  QrCardPosition,
} from "@/features/qr/qr-card-layout";
import { QrVisualCard } from "@/features/qr/qr-visual-card";

export function AdminQrPreviewDialog({
  backgroundUrl,
  className,
  defaultOpen = false,
  id,
  location,
  profileDescription,
  profileName,
  publicToken,
  status,
  svg,
  orientation,
  position,
  logoUrl,
  logoName,
  hideMhgLogo,
  appearance, identity,
  font,
  tagline,
  textColor,
  textStyle,
}: {
  backgroundUrl?: string | null;
  className?: string;
  defaultOpen?: boolean;
  id: string;
  location?: string | null;
  profileDescription?: string;
  profileName?: string | null;
  publicToken: string;
  status: string;
  svg: string;
  orientation?: QrCardOrientation;
  position?: QrCardPosition;
  logoUrl?: string;
  logoName?: string;
  hideMhgLogo?: boolean;
  appearance?: QrCardAppearance; identity?: Partial<DigitalIdentity>;
  font?: QrCardFont;
  tagline?: string;
  textColor?: string | null;
  textStyle?: QrCardTextStyle;
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mã QR {publicToken}</DialogTitle>
          <DialogDescription>
            Gửi thẻ này để người nhận quét. Mã chưa kích hoạt sẽ dẫn họ đến bước
            nhận quyền quản lý.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 sm:grid-cols-[16rem_minmax(0,1fr)] sm:items-stretch">
          <QrInteractiveSurface label={`Thẻ 3D ${profileName || publicToken}`}>
            <QrVisualCard
              backgroundUrl={backgroundUrl}
              description={profileDescription || "Quét để mở mã"}
              heading={profileName || publicToken}
              headingClassName={profileName ? undefined : "text-nowrap"}
              location={location}
              svg={svg}
              orientation={orientation}
              position={position}
              logoUrl={logoUrl}
              logoName={logoName}
              hideMhgLogo={hideMhgLogo}
              appearance={appearance} identity={identity}
              font={font}
              tagline={tagline}
              textColor={textColor}
              textStyle={textStyle}
            />
          </QrInteractiveSurface>
          <div className="flex min-w-0 flex-col">
            <dl className="grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Token</dt>
                <dd className="mt-2 break-words font-medium text-gold">
                  {publicToken}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Trạng thái</dt>
                <dd className="mt-2">
                  <StatusBadge status={status} />
                </dd>
              </div>
            </dl>
            <DialogFooter className="mt-auto grid grid-cols-2 gap-2 pt-8 sm:grid sm:grid-cols-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
