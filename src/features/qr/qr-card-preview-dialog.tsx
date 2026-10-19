"use client";
import type { QrCardAppearance } from "./qr-card-appearance";
import type { DigitalIdentity } from "./digital-identity-card";

import { cn } from "cn";
import { ArrowUpRight, LoaderCircle, Plus, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StatusBadge } from "@/components/product/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QrCardTextStyle } from "@/db/schema/product";
import type {
  QrCardFont,
  QrCardOrientation,
  QrCardPosition,
} from "@/features/qr/qr-card-layout";
import { QrCardBackgroundEditor } from "@/features/qr/qr-card-background-editor";
import type { QrCardDesign } from "@/features/qr/qr-card-design";
import { createQrCardDesignAction } from "@/features/qr/qr-card-design-actions";
import { QrCardDesignEditor } from "@/features/qr/qr-card-design-editor";
import type { QrCardPreset } from "@/features/qr/qr-card-presets";

const maxDesigns = 12;

export function QrCardPreviewDialog({
  backgroundUrl,
  description,
  designs: initialDesigns = [],
  font,
  heading,
  location,
  onOpenChange,
  open,
  orientation,
  position,
  logoUrl,
  logoName,
  hideMhgLogo,
  appearance, identity, canAddLogo, enterpriseUpdatedAt,
  presets = [],
  profileId,
  publicToken,
  qrId,
  status,
  svg,
  tagline,
  textColor,
  textStyle,
  version,
}: {
  backgroundUrl: string | null;
  description: string;
  designs?: QrCardDesign[];
  font: QrCardFont;
  heading: string;
  location: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  orientation: QrCardOrientation;
  position: QrCardPosition;
  logoUrl?: string;
  logoName?: string;
  hideMhgLogo?: boolean;
  appearance?: QrCardAppearance; identity?: Partial<DigitalIdentity>; canAddLogo?: boolean; enterpriseUpdatedAt?: string | null;
  presets?: readonly QrCardPreset[];
  profileId?: string | null;
  publicToken: string;
  qrId: string;
  status: string;
  svg: string;
  tagline: string;
  textColor: string | null;
  textStyle: QrCardTextStyle;
  version: number;
}) {
  const router = useRouter();
  const [designs, setDesigns] = useState(initialDesigns);
  const [activeDesign, setActiveDesign] = useState<string>("main");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    if (isSaving) return;
    if (hasUnsavedChanges) {
      setDiscardDialogOpen(true);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  async function addDesign() {
    if (creating || isSaving) return;
    setCreating(true);
    setCreateError(null);
    try {
      const current = designs.find((design) => design.id === activeDesign);
      const result = await createQrCardDesignAction({
        copyFrom: current
          ? {
              font: current.font,
                sourceDesignId: current.id,
              orientation: current.orientation,
              position: current.position,
              tagline: current.tagline,
              textColor: current.textColor,
              textStyle: current.textStyle,
            }
          : null,
        name: `Mẫu ${designs.length + 2}`,
        qrId,
      });
      if (result.success) {
        setDesigns((list) => [...list, result.design]);
        setActiveDesign(result.design.id);
      } else {
        setCreateError(result.error);
      }
    } catch {
      setCreateError("Chưa thể tạo mẫu thẻ. Hãy thử lại.");
    } finally {
      setCreating(false);
    }
  }

  const selectedDesign = designs.find((design) => design.id === activeDesign);

  function discardAndClose() {
    setHasUnsavedChanges(false);
    setDiscardDialogOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent className="sm:max-w-5xl" showCloseButton={!isSaving}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-10">
              <QrCode aria-hidden="true" className="size-5" />
              Mã QR {publicToken}
            </DialogTitle>
            <DialogDescription>
              Bấm trực tiếp trên danh thiếp để sửa. Lưu từng mẫu trước khi chuyển sang mẫu khác.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <div
              aria-label="Mẫu thẻ"
              className="flex flex-wrap items-center gap-2"
              role="tablist"
            >
              {[{ id: "main", name: "Thẻ chính" }, ...designs].map((item) => (
                <button
                  aria-selected={activeDesign === item.id}
                  className={cn(
                    "h-control-sm max-w-full truncate rounded-full px-3.5 text-sm transition-colors sm:max-w-72 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50",
                    activeDesign === item.id
                      ? "bg-secondary text-foreground ring-1 ring-gold/70"
                      : "bg-secondary/55 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  disabled={isSaving || (hasUnsavedChanges && activeDesign !== item.id)}
                  key={item.id}
                  onClick={() => setActiveDesign(item.id)}
                  role="tab"
                  title={item.name}
                  type="button"
                >
                  {item.name}
                </button>
              ))}
              <Button
                disabled={creating || isSaving || hasUnsavedChanges || designs.length >= maxDesigns}
                onClick={() => void addDesign()}
                size="sm"
                type="button"
                variant="ghost"
              >
                {creating ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <Plus aria-hidden="true" />
                )}
                Thêm mẫu thẻ
              </Button>
            </div>
            <p
              className={cn(
                "text-xs leading-5",
                createError ? "text-destructive" : "text-muted-foreground",
              )}
              role={createError ? "alert" : undefined}
            >
              {createError ??
                "Cùng một mã QR, nhiều mẫu thẻ để in cho từng dịp. Thẻ chính hiện ở dashboard và bản in mặc định."}
            </p>
          </div>

          {selectedDesign ? (
            <QrCardDesignEditor
              profileEditHref={profileId ? `/profiles/${profileId}/edit` : undefined}
              defaults={{ description, heading, location }}
              qrId={qrId} identity={identity} canAddLogo={canAddLogo} enterpriseUpdatedAt={enterpriseUpdatedAt}
              onUnsavedChange={setHasUnsavedChanges}
              design={selectedDesign}
              logoUrl={logoUrl}
              logoName={logoName}
              hideMhgLogo={hideMhgLogo}
              downloadName={publicToken}
              key={selectedDesign.id}
              onChange={(next) =>
                setDesigns((list) =>
                  list.map((item) => (item.id === next.id ? next : item)),
                )
              }
              onDeleted={() => {
                setDesigns((list) =>
                  list.filter((item) => item.id !== selectedDesign.id),
                );
                setActiveDesign("main");
              }}
              onPendingChange={setIsSaving}
              presets={presets}
              svg={svg}
            />
          ) : null}
          {/* Thẻ chính luôn được giữ trong cây để không mất phiên bản đã lưu khi chuyển qua lại các mẫu. */}
          <div hidden={Boolean(selectedDesign)}>
            <QrCardBackgroundEditor
              profileEditHref={profileId ? `/profiles/${profileId}/edit` : undefined}
              backgroundUrl={backgroundUrl}
              appearance={appearance} identity={identity} canAddLogo={canAddLogo} enterpriseUpdatedAt={enterpriseUpdatedAt}
              description={description}
              downloadName={publicToken}
              font={font}
              heading={heading}
              location={location}
              onPendingChange={setIsSaving}
              onUnsavedChange={setHasUnsavedChanges}
              orientation={orientation}
              position={position}
              logoUrl={logoUrl}
              logoName={logoName}
              hideMhgLogo={hideMhgLogo}
              presets={presets}
              qrId={qrId}
              svg={svg}
              tagline={tagline}
              textColor={textColor}
              textStyle={textStyle}
              version={version}
            />
          </div>

          <DialogFooter className="items-center sm:justify-between">
            <StatusBadge status={status} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href={`/q/${publicToken}`} target="_blank">
                  Mở trang mã <ArrowUpRight />
                </Link>
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => handleOpenChange(false)}
                type="button"
              >
                {isSaving ? "Đang lưu ảnh…" : "Xong"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setDiscardDialogOpen} open={discardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thẻ có thay đổi chưa lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Nếu rời bây giờ, các thay đổi đang xem trên thẻ sẽ không được lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction onClick={discardAndClose} variant="destructive">
              Rời không lưu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
