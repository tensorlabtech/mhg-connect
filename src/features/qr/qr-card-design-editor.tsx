"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  QrInlineCardEditor,
  type InlineCardEditorProps,
} from "./qr-inline-card-editor";
import {
  updateQrCardDesignAction,
  deleteQrCardDesignAction,
} from "./qr-card-design-actions";
import type { QrCardDesign } from "./qr-card-design";

export function QrCardDesignEditor({
  defaults,
  design,
  onChange,
  onDeleted,
  ...props
}: Omit<InlineCardEditorProps, "heading"> & {
  defaults: { heading: string; description: string; location: string | null };
  design: QrCardDesign;
  onChange: (design: QrCardDesign) => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [name, setName] = useState(design.name);
  async function rename() {
    if (busy || dirty || !name.trim() || name.trim() === design.name) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateQrCardDesignAction({
        designId: design.id,
        name: name.trim(),
      });
      if (result.success) onChange(result.design);
      else setError(result.error);
    } catch {
      setError("Chưa thể đổi tên mẫu.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const result = await deleteQrCardDesignAction({ designId: design.id });
      if (result.success) onDeleted();
      else setError(result.error || "Chưa thể xóa mẫu.");
    } catch {
      setError("Chưa thể xóa mẫu.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex max-w-md items-end gap-2">
        <label className="grid flex-1 gap-2 text-xs">
          Tên mẫu thẻ
          <Input
            value={name}
            maxLength={60}
            disabled={busy || dirty}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={
            busy || dirty || !name.trim() || name.trim() === design.name
          }
          onClick={() => void rename()}
        >
          Đổi tên
        </Button>
      </div>
      <QrInlineCardEditor
        {...props}
        key={design.updatedAt}
        heading={design.heading || defaults.heading}
        description={design.description ?? defaults.description}
        location={design.location ?? defaults.location}
        appearance={design.appearance}
        designId={design.id}
        expectedUpdatedAt={design.updatedAt}
        backgroundUrl={design.backgroundUrl}
        orientation={design.orientation}
        position={design.position}
        font={design.font}
        textColor={design.textColor}
        textStyle={design.textStyle}
        tagline={design.tagline}
        onUnsavedChange={(value) => {
          setDirty(value);
          props.onUnsavedChange?.(value);
        }}
        onSaved={(result) => {
          if (result.design) onChange(result.design);
          props.onSaved?.(result);
        }}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || dirty}
          >
            Xóa mẫu thẻ này
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mẫu thẻ?</AlertDialogTitle>
            <AlertDialogDescription>
              Chỉ xóa mẫu đang chọn. Thẻ chính và hồ sơ vẫn được giữ nguyên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void remove()}
            >
              Xóa mẫu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
