"use client";

import { ArrowUpRight, QrCode } from "lucide-react";
import Link from "next/link";
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
import { QrCardBackgroundEditor } from "@/features/qr/qr-card-background-editor";

export function QrCardPreviewDialog({
  backgroundUrl,
  description,
  heading,
  location,
  onOpenChange,
  open,
  publicToken,
  qrId,
  status,
  svg,
  version,
}: {
  backgroundUrl: string | null;
  description: string;
  heading: string;
  location: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  publicToken: string;
  qrId: string;
  status: string;
  svg: string;
  version: number;
}) {
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
  }

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
              Xem, tải xuống hoặc đổi ảnh nền của thẻ trước khi gửi cho người
              nhận quét.
            </DialogDescription>
          </DialogHeader>

          <QrCardBackgroundEditor
            backgroundUrl={backgroundUrl}
            description={description}
            downloadName={publicToken}
            heading={heading}
            location={location}
            onPendingChange={setIsSaving}
            onUnsavedChange={setHasUnsavedChanges}
            qrId={qrId}
            svg={svg}
            version={version}
          />

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
            <AlertDialogTitle>Ảnh nền chưa được lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Lần tải ảnh vừa rồi chưa hoàn tất. Nếu rời bây giờ, ảnh đang xem
              trước sẽ bị mất.
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
