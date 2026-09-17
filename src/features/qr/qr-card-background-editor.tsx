"use client";

import { Download, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  saveQrCardBackgroundAction,
  type SaveQrCardBackgroundResult,
} from "@/features/qr/qr-card-background-actions";
import { QrVisualCard } from "@/features/qr/qr-visual-card";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
const initialState: SaveQrCardBackgroundResult = { success: false };

export function QrCardBackgroundEditor({
  backgroundUrl,
  description,
  downloadName,
  heading,
  onPendingChange,
  onUnsavedChange,
  qrId,
  svg,
  version,
}: {
  backgroundUrl: string | null;
  description?: string;
  downloadName: string;
  heading: string;
  onPendingChange?: (pending: boolean) => void;
  onUnsavedChange?: (unsaved: boolean) => void;
  qrId: string;
  svg: string;
  version: number;
}) {
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

  const persistedUrl = state.success ? (state.url ?? null) : backgroundUrl;
  const activeBackground = previewUrl ?? persistedUrl;
  const currentVersion = state.version ?? version;
  const error = clientError ?? (!state.success ? state.error : undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.7fr)] lg:items-start">
      <div ref={cardRef}>
        <QrVisualCard
          backgroundUrl={activeBackground}
          description={description}
          heading={heading}
          svg={svg}
        />
      </div>

      <form
        action={action}
        className="grid min-w-0 gap-5 overflow-hidden"
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
        <div className="max-w-sm">
          <h3 className="text-sm font-medium">Ảnh nền thẻ</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ảnh ngang dùng khi chia sẻ hoặc in. Hệ thống tự phủ lớp tương phản
            để mã luôn dễ quét.
          </p>
        </div>
        <div className="grid min-w-0 gap-2">
          <Button
            className="w-full"
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
            className="w-full"
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
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
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
