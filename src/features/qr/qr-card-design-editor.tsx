"use client";

import { cn } from "cn";
import {
  Download,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { QrCardTextStyle } from "@/db/schema/product";
import { TextStyleSwatch } from "@/features/qr/qr-card-background-editor";
import type { QrCardDesign } from "@/features/qr/qr-card-design";
import type { QrCardOrientation } from "@/features/qr/qr-card-layout";
import { QrCardLayoutFields } from "@/features/qr/qr-card-layout-fields";
import { QrCardPresetPicker } from "@/features/qr/qr-card-preset-picker";
import type { QrCardPreset } from "@/features/qr/qr-card-presets";
import {
  deleteQrCardDesignAction,
  saveQrCardDesignBackgroundAction,
  updateQrCardDesignAction,
} from "@/features/qr/qr-card-design-actions";
import {
  QrVisualCard,
  qrCardTextStyleOptions,
} from "@/features/qr/qr-visual-card";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

type TextFields = Pick<
  QrCardDesign,
  "description" | "heading" | "location" | "name"
>;

export function QrCardDesignEditor({
  defaults,
  design,
  downloadName,
  onChange,
  onDeleted,
  onPendingChange,
  presets,
  svg,
}: {
  defaults: { description: string; heading: string; location: string | null };
  design: QrCardDesign;
  downloadName: string;
  onChange: (design: QrCardDesign) => void;
  onDeleted: () => void;
  onPendingChange?: (pending: boolean) => void;
  presets: readonly QrCardPreset[];
  svg: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<TextFields>({
    description: design.description,
    heading: design.heading,
    location: design.location,
    name: design.name,
  });
  const [textStyle, setTextStyle] = useState<QrCardTextStyle>(design.textStyle);
  const [orientation, setOrientation] = useState<QrCardOrientation>(
    design.orientation,
  );
  const [tagline, setTagline] = useState(design.tagline);
  const [taglinePreview, setTaglinePreview] = useState(design.tagline);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "uploading" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const savedFields = useRef<TextFields>(fields);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  async function run<T extends { success: boolean }>(
    task: () => Promise<T>,
    nextStatus: "saving" | "uploading" = "saving",
  ) {
    setStatus(nextStatus);
    setError(null);
    onPendingChange?.(true);
    try {
      const result = await task();
      if (!result.success) {
        setStatus("error");
        setError(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "Chưa thể lưu mẫu thẻ.",
        );
        return null;
      }
      setStatus("saved");
      return result;
    } catch {
      setStatus("error");
      setError("Chưa thể lưu mẫu thẻ. Hãy thử lại.");
      return null;
    } finally {
      onPendingChange?.(false);
    }
  }

  async function saveFields() {
    const changed = (Object.keys(fields) as (keyof TextFields)[]).some(
      (key) => (fields[key] ?? "") !== (savedFields.current[key] ?? ""),
    );
    if (!changed) return;
    if (!fields.name?.trim()) {
      setFields((current) => ({ ...current, name: savedFields.current.name }));
      return;
    }
    const result = await run(() =>
      updateQrCardDesignAction({
        description: fields.description ?? "",
        designId: design.id,
        heading: fields.heading ?? "",
        location: fields.location ?? "",
        name: fields.name,
      }),
    );
    if (result && "design" in result) {
      savedFields.current = fields;
      onChange(result.design);
    }
  }

  async function chooseTextStyle(next: QrCardTextStyle) {
    if (next === textStyle) return;
    const previous = textStyle;
    setTextStyle(next);
    const result = await run(() =>
      updateQrCardDesignAction({ designId: design.id, textStyle: next }),
    );
    if (result && "design" in result) onChange(result.design);
    else setTextStyle(previous);
  }

  async function saveLayout(patch: {
    orientation?: QrCardOrientation;
    tagline?: string;
  }) {
    const previous = { orientation, tagline };
    if (patch.orientation) setOrientation(patch.orientation);
    if (patch.tagline !== undefined) setTagline(patch.tagline);
    const result = await run(() =>
      updateQrCardDesignAction({ designId: design.id, ...patch }),
    );
    if (result && "design" in result) onChange(result.design);
    else {
      setOrientation(previous.orientation);
      setTagline(previous.tagline);
      setTaglinePreview(previous.tagline);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      setStatus("error");
      setError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > maxFileSize) {
      setStatus("error");
      setError("Ảnh nền phải nhỏ hơn 5 MB.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    const formData = new FormData();
    formData.set("designId", design.id);
    formData.set("intent", "save");
    formData.set("background", file);
    const result = await run(
      () => saveQrCardDesignBackgroundAction(formData),
      "uploading",
    );
    if (result && "design" in result) onChange(result.design);
    else setPreviewUrl(null);
  }

  async function removeBackground() {
    const formData = new FormData();
    formData.set("designId", design.id);
    formData.set("intent", "remove");
    const result = await run(() => saveQrCardDesignBackgroundAction(formData));
    if (result && "design" in result) {
      setPreviewUrl(null);
      onChange(result.design);
    }
  }

  async function pickPreset(presetId: string) {
    const formData = new FormData();
    formData.set("designId", design.id);
    formData.set("intent", "preset");
    formData.set("presetId", presetId);
    const result = await run(() => saveQrCardDesignBackgroundAction(formData));
    if (result && "design" in result) {
      setPreviewUrl(null);
      setOrientation(result.design.orientation);
      setTextStyle(result.design.textStyle);
      setTagline(result.design.tagline);
      setTaglinePreview(result.design.tagline);
      onChange(result.design);
    }
  }

  async function removeDesign() {
    const result = await run(() =>
      deleteQrCardDesignAction({ designId: design.id }),
    );
    if (result) onDeleted();
  }

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const safeName = `${downloadName}-${fields.name ?? "mau"}`
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/gi, "d")
        .replace(/[^a-zA-Z0-9_-]+/g, "-");
      link.download = `mhg-qr-card-${safeName}-${orientation === "landscape" ? "ngang" : "doc"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (exportError) {
      console.error("QR card export failed", exportError);
      setStatus("error");
      setError("Chưa thể tạo ảnh thẻ. Hãy thử lại sau.");
    } finally {
      setDownloading(false);
    }
  }

  const busy = status === "saving" || status === "uploading";
  const background = previewUrl ?? design.backgroundUrl;

  return (
    <div
      className={cn(
        "grid gap-8 lg:items-start",
        orientation === "landscape"
          ? "lg:grid-cols-[26rem_minmax(15rem,1fr)]"
          : "lg:grid-cols-[18rem_minmax(15rem,1fr)]",
      )}
    >
      <div className="w-full" ref={cardRef}>
        <QrVisualCard
          backgroundUrl={background}
          description={fields.description ?? defaults.description}
          heading={fields.heading || defaults.heading}
          location={
            fields.location === null ? defaults.location : fields.location
          }
          orientation={orientation}
          svg={svg}
          tagline={taglinePreview}
          textStyle={textStyle}
        />
      </div>

      <div className="grid min-w-0 gap-5 self-start">
        <Field>
          <FieldLabel htmlFor={`design-name-${design.id}`}>
            Tên mẫu thẻ
          </FieldLabel>
          <Input
            id={`design-name-${design.id}`}
            maxLength={60}
            onBlur={() => void saveFields()}
            onChange={(event) =>
              setFields((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ví dụ: Thẻ hội nghị"
            value={fields.name}
          />
        </Field>

        <QrCardLayoutFields
          disabled={busy}
          idPrefix={`design-${design.id}`}
          onOrientationChange={(next) => void saveLayout({ orientation: next })}
          onTaglineCommit={(next) => void saveLayout({ tagline: next })}
          onTaglinePreview={setTaglinePreview}
          orientation={orientation}
          tagline={tagline}
        />

        <div aria-hidden="true" className="border-t border-border/60" />
        <fieldset className="grid min-w-0 gap-3">
          <legend className="text-sm font-medium">Nền chữ</legend>
          <div
            aria-label="Nền chữ trên thẻ"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="radiogroup"
          >
            {qrCardTextStyleOptions.map((option) => {
              const selected = option.id === textStyle;
              return (
                <button
                  aria-checked={selected}
                  aria-label={option.label}
                  className={cn(
                    "grid cursor-pointer gap-2 rounded-overlay p-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait",
                    selected
                      ? "bg-secondary ring-1 ring-gold/70"
                      : "bg-secondary/55 hover:bg-secondary",
                  )}
                  disabled={busy}
                  key={option.id}
                  onClick={() => void chooseTextStyle(option.id)}
                  role="radio"
                  title={option.description}
                  type="button"
                >
                  <TextStyleSwatch style={option.id} />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="grid min-w-0 gap-3 border-t border-border/60 pt-5">
          <legend className="sr-only">Chữ trên thẻ</legend>
          <p className="text-sm font-medium">Chữ trên thẻ</p>
          <p className="-mt-1 text-xs leading-5 text-muted-foreground">
            Để trống thì dùng thông tin của hồ sơ đang gắn với mã QR.
          </p>
          <Field>
            <FieldLabel htmlFor={`design-heading-${design.id}`}>
              Tên in trên thẻ
            </FieldLabel>
            <Input
              id={`design-heading-${design.id}`}
              maxLength={80}
              onBlur={() => void saveFields()}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  heading: event.target.value || null,
                }))
              }
              placeholder={defaults.heading}
              value={fields.heading ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`design-description-${design.id}`}>
              Chức danh, đơn vị
            </FieldLabel>
            <Textarea
              className="min-h-0"
              id={`design-description-${design.id}`}
              maxLength={160}
              onBlur={() => void saveFields()}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  description: event.target.value || null,
                }))
              }
              placeholder={defaults.description}
              rows={2}
              value={fields.description ?? ""}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Mỗi dòng một ý, ví dụ dòng 1 chức danh, dòng 2 tên đơn vị.
            </p>
          </Field>
          <Field>
            <FieldLabel htmlFor={`design-location-${design.id}`}>
              Địa điểm
            </FieldLabel>
            <Input
              id={`design-location-${design.id}`}
              maxLength={120}
              onBlur={() => void saveFields()}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  location: event.target.value || null,
                }))
              }
              placeholder={defaults.location ?? "Hà Nội, Việt Nam"}
              value={fields.location ?? ""}
            />
          </Field>
        </fieldset>

        <div className="grid gap-3 border-t border-border/60 pt-5">
          <p className="text-sm font-medium">Ảnh nền thẻ</p>
          <input
            accept="image/jpeg,image/png,image/webp"
            aria-label="Chọn ảnh nền cho mẫu thẻ"
            className="sr-only"
            onChange={handleFile}
            ref={inputRef}
            type="file"
          />
          <QrCardPresetPicker
            disabled={busy}
            onPick={(presetId) => void pickPreset(presetId)}
            presets={presets}
            selectedUrl={design.backgroundUrl}
          />
          <div className="grid min-w-0 gap-2 sm:grid-cols-2">
            <Button
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              {status === "uploading" ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Upload aria-hidden="true" />
              )}
              {status === "uploading"
                ? "Đang lưu ảnh…"
                : background
                  ? "Đổi ảnh nền"
                  : "Tải ảnh nền"}
            </Button>
            <Button
              disabled={downloading || busy}
              onClick={handleDownload}
              type="button"
              variant="secondary"
            >
              {downloading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Download aria-hidden="true" />
              )}
              {downloading ? "Đang tạo ảnh…" : "Tải ảnh thẻ"}
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p
            className={cn(
              "min-w-0 flex-1 text-xs leading-5",
              status === "error" ? "text-destructive" : "text-muted-foreground",
            )}
            role={status === "error" ? "alert" : "status"}
          >
            {status === "saving"
              ? "Đang lưu…"
              : status === "uploading"
                ? "Ảnh đang được lưu."
                : status === "saved"
                  ? "Đã lưu mẫu thẻ."
                  : status === "error"
                    ? error
                    : "Đổi gì là tự lưu."}
          </p>
          <div className="flex items-center gap-1">
            {design.backgroundUrl ? (
              <Button
                className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                disabled={busy}
                onClick={() => void removeBackground()}
                type="button"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" /> Nền mặc định
              </Button>
            ) : null}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="h-auto px-2 text-xs"
                  disabled={busy}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" /> Xoá mẫu
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xoá mẫu “{fields.name}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Mẫu thẻ và ảnh nền riêng của mẫu sẽ bị xoá. Mã QR và các mẫu
                    khác không bị ảnh hưởng.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Giữ lại</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void removeDesign()}
                    type="button"
                    variant="destructive"
                  >
                    Xoá mẫu
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
