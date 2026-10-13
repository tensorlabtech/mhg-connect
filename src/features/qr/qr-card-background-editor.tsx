"use client";

import { cn } from "cn";
import { Download, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { Button } from "@/components/ui/button";
import type { QrCardTextStyle } from "@/db/schema/product";
import {
  saveQrCardBackgroundAction,
  saveQrCardTextStyleAction,
  type SaveQrCardBackgroundResult,
} from "@/features/qr/qr-card-background-actions";
import {
  QrVisualCard,
  qrCardTextStyleOptions,
} from "@/features/qr/qr-visual-card";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
const initialState: SaveQrCardBackgroundResult = { success: false };

export function QrCardBackgroundEditor({
  backgroundUrl,
  description,
  downloadName,
  heading,
  location,
  onPendingChange,
  onUnsavedChange,
  qrId,
  svg,
  textStyle = "shadow",
  version,
}: {
  backgroundUrl: string | null;
  description?: string;
  downloadName: string;
  heading: string;
  location: string | null;
  onPendingChange?: (pending: boolean) => void;
  onUnsavedChange?: (unsaved: boolean) => void;
  qrId: string;
  svg: string;
  textStyle?: QrCardTextStyle;
  version: number;
}) {
  const [liveVersion, setLiveVersion] = useState(version);
  const [savedTextStyle, setSavedTextStyle] =
    useState<QrCardTextStyle>(textStyle);
  const [selectedTextStyle, setSelectedTextStyle] =
    useState<QrCardTextStyle>(textStyle);
  const [textStyleStatus, setTextStyleStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [textStyleError, setTextStyleError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingIntent, setSavingIntent] = useState<"remove" | "save" | null>(
    null,
  );
  const [state, action] = useActionState(handleAction, initialState);

  async function handleAction(
    previous: SaveQrCardBackgroundResult,
    formData: FormData,
  ) {
    const intent = String(formData.get("intent") ?? "save");
    const localPreviewUrl = objectUrlRef.current;
    setIsSaving(true);
    onPendingChange?.(true);
    try {
      const result = await saveQrCardBackgroundAction(previous, formData);
      if (result.version) setLiveVersion(result.version);
      if (result.success) {
        setFileName(null);
        setClientError(null);
        if (inputRef.current) inputRef.current.value = "";

        if (intent === "remove") {
          if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
          objectUrlRef.current = null;
          setPreviewUrl(null);
        } else if (result.url && localPreviewUrl) {
          const uploadedImage = new window.Image();
          uploadedImage.onload = () => {
            if (objectUrlRef.current !== localPreviewUrl) return;
            URL.revokeObjectURL(localPreviewUrl);
            objectUrlRef.current = null;
            setPreviewUrl(null);
          };
          uploadedImage.src = result.url;
        }
      }
      return result;
    } finally {
      setIsSaving(false);
      setSavingIntent(null);
      onPendingChange?.(false);
    }
  }

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    onUnsavedChange?.(Boolean(fileName));
  }, [fileName, onUnsavedChange]);

  function submitSelectedFile() {
    setSavingIntent("save");
    formRef.current?.requestSubmit();
  }

  function applyFile(file: File) {
    if (!acceptedTypes.has(file.type)) {
      setClientError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > maxFileSize) {
      setClientError("Ảnh nền phải nhỏ hơn 5 MB.");
      return;
    }
    if (inputRef.current && inputRef.current.files?.[0] !== file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      inputRef.current.files = transfer.files;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    setFileName(file.name);
    setClientError(null);
    setSavingIntent("save");
    queueMicrotask(() => formRef.current?.requestSubmit());
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) applyFile(file);
  }

  async function handleDownload() {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const safeName = downloadName.replace(/[^a-zA-Z0-9_-]+/g, "-");
      link.download = `mhg-qr-card-${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("QR card export failed", error);
      setDownloadError("Chưa thể tạo ảnh thẻ. Hãy thử lại sau.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function chooseTextStyle(next: QrCardTextStyle) {
    if (next === selectedTextStyle || textStyleStatus === "saving") return;
    const previous = savedTextStyle;
    setSelectedTextStyle(next);
    setTextStyleStatus("saving");
    setTextStyleError(null);
    onPendingChange?.(true);
    try {
      const result = await saveQrCardTextStyleAction({
        expectedVersion: liveVersion,
        qrId,
        textStyle: next,
      });
      if (result.success && result.textStyle && result.version) {
        setSavedTextStyle(result.textStyle);
        setLiveVersion(result.version);
        setTextStyleStatus("saved");
      } else {
        setSelectedTextStyle(previous);
        setTextStyleStatus("error");
        setTextStyleError(result.error ?? "Chưa thể lưu nền chữ.");
      }
    } catch {
      setSelectedTextStyle(previous);
      setTextStyleStatus("error");
      setTextStyleError("Chưa thể lưu nền chữ. Hãy thử lại.");
    } finally {
      onPendingChange?.(false);
    }
  }

  const persistedUrl = state.success ? (state.url ?? null) : backgroundUrl;
  const activeBackground = previewUrl ?? persistedUrl;
  const currentVersion = liveVersion;
  const error = clientError ?? (!state.success ? state.error : undefined);

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(15rem,1fr)] lg:items-start">
      <div className="w-full" ref={cardRef}>
        <QrVisualCard
          backgroundUrl={activeBackground}
          description={description}
          heading={heading}
          location={location}
          svg={svg}
          textStyle={selectedTextStyle}
        />
      </div>

      <form
        action={action}
        className="grid min-w-0 gap-5 self-start"
        ref={formRef}
      >
        <input name="expectedVersion" type="hidden" value={currentVersion} />
        <input name="qrId" type="hidden" value={qrId} />
        <input
          accept="image/jpeg,image/png,image/webp"
          aria-label="Chọn ảnh nền thẻ QR"
          className="sr-only"
          name="background"
          onChange={handleChange}
          ref={inputRef}
          type="file"
        />
        <fieldset className="grid min-w-0 gap-3">
          <legend className="text-sm font-medium">Nền chữ</legend>
          <p className="-mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Giúp tên và chức danh luôn dễ đọc khi ảnh nền nhiều chi tiết.
          </p>
          <div
            aria-label="Nền chữ trên thẻ"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="radiogroup"
          >
            {qrCardTextStyleOptions.map((option) => {
              const selected = option.id === selectedTextStyle;
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
                  disabled={textStyleStatus === "saving"}
                  key={option.id}
                  onClick={() => chooseTextStyle(option.id)}
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
          <p
            className={cn(
              "text-xs leading-5",
              textStyleStatus === "error"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
            role={textStyleStatus === "error" ? "alert" : "status"}
          >
            {textStyleStatus === "saving"
              ? "Đang lưu nền chữ…"
              : textStyleStatus === "saved"
                ? "Đã lưu nền chữ."
                : textStyleStatus === "error"
                  ? textStyleError
                  : "Chọn là lưu ngay."}
          </p>
        </fieldset>

        <div className="max-w-md border-t border-border/60 pt-5">
          <h3 className="text-sm font-medium">Ảnh nền thẻ</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ảnh phủ toàn bộ thẻ. Ảnh ngang sẽ được cắt theo trung tâm để phù hợp
            tỷ lệ badge.
          </p>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          <Button
            disabled={isSaving}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {isSaving && savingIntent === "save" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Upload aria-hidden="true" />
            )}
            {isSaving && savingIntent === "save"
              ? "Đang lưu ảnh…"
              : persistedUrl
                ? "Đổi ảnh nền"
                : "Tải ảnh nền"}
          </Button>
          <Button
            disabled={isDownloading || isSaving}
            onClick={handleDownload}
            type="button"
            variant="secondary"
          >
            {isDownloading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Download aria-hidden="true" />
            )}
            {isDownloading ? "Đang tạo ảnh…" : "Tải ảnh thẻ"}
          </Button>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">
            {isSaving && savingIntent === "save"
              ? "Ảnh đang được lưu tự động."
              : fileName
                ? "Ảnh đang xem trước chưa được lưu."
                : "JPG, PNG hoặc WebP, tối đa 5 MB."}
          </p>
          {persistedUrl ? (
            <Button
              className="h-auto px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
              disabled={isSaving}
              name="intent"
              onClick={() => setSavingIntent("remove")}
              type="submit"
              value="remove"
              variant="ghost"
            >
              {isSaving && savingIntent === "remove" ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <RotateCcw aria-hidden="true" />
              )}
              {isSaving && savingIntent === "remove"
                ? "Đang cập nhật…"
                : "Dùng nền mặc định"}
            </Button>
          ) : null}
        </div>
        {error ? (
          <div className="grid gap-3" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            {fileName ? (
              <Button
                className="w-fit"
                disabled={isSaving}
                onClick={submitSelectedFile}
                size="sm"
                type="button"
                variant="outline"
              >
                Thử lưu lại
              </Button>
            ) : null}
          </div>
        ) : state.success && !fileName ? (
          <p className="text-sm text-success" role="status">
            Ảnh nền đã được lưu.
          </p>
        ) : null}
        {downloadError ? (
          <p className="text-sm text-destructive" role="alert">
            {downloadError}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function TextStyleSwatch({ style }: { style: QrCardTextStyle }) {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-10 items-center justify-center overflow-hidden rounded-[0.35rem] bg-[linear-gradient(135deg,#7aa6c9_0%,#e8d8b8_45%,#4b6b8a_100%)]"
    >
      {style === "band" ? (
        <span className="absolute inset-x-0 h-4 bg-[rgb(10_10_10/0.62)]" />
      ) : null}
      <span
        className={cn(
          "relative text-[0.625rem] font-bold tracking-tight uppercase",
          style === "shadow" &&
            "text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
          style === "band" && "text-white",
          style === "dark" &&
            "rounded-[0.2rem] bg-[rgb(10_10_10/0.78)] px-1.5 py-0.5 text-white",
          style === "light" &&
            "rounded-[0.2rem] bg-[rgb(255_255_255/0.92)] px-1.5 py-0.5 text-[#0a0a0a]",
        )}
      >
        Tên
      </span>
    </span>
  );
}
