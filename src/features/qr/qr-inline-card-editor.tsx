"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Download,
  ImagePlus,
  LoaderCircle,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QrVisualCard } from "./qr-visual-card";
import { QrInteractiveSurface } from "./qr-interactive-surface";
import { QrAvatarCropEditor } from "./qr-avatar-crop-editor";
import {
  businessCardTemplates,
  validateCardImage,
  getCardBackgroundPreview,
  DEFAULT_CARD_BACKGROUND_DIM,
  clearCardPersonalContent,
  type QrCardAppearance,
} from "./qr-card-appearance";
import {
  saveInlineCardAction,
  type InlineCardSaveResult,
} from "./qr-inline-card-actions";
import {
  QR_CARD_DEFAULT_TAGLINE,
  qrCardFontOptions,
  qrCardPositionOptions,
  type QrCardFont,
  type QrCardOrientation,
  type QrCardPosition,
} from "./qr-card-layout";
import type { QrCardTextStyle } from "@/db/schema/product";
import type { DigitalIdentity } from "./digital-identity-card";
import type { CardTextField } from "./business-card-face";
import type { QrCardPreset } from "./qr-card-presets";
import { getQrCardFitError } from "./qr-card-fit";
import { withFlatCardCapture } from "./qr-card-capture";
import { downloadCardPng, rasterizeCardSvg } from "./qr-card-download";
import { qrOnlyPng } from "./qr-only-export";

const labels: Record<CardTextField, string> = {
  name: "Tên trên thẻ",
  title: "Chức danh",
  company: "Cơ quan / doanh nghiệp",
  phone: "Điện thoại",
  website: "Website",
  location: "Địa chỉ",
};
const lengths: Record<CardTextField, number> = {
  name: 80,
  title: 160,
  company: 200,
  phone: 40,
  website: 400,
  location: 120,
};
type PendingImage = "background" | "enterpriseLogo";
export type InlineCardEditorProps = {
  qrId?: string;
  designId?: string;
  expectedUpdatedAt?: string;
  version?: number;
  heading: string;
  description?: string;
  location?: string | null;
  identity?: Partial<DigitalIdentity>;
  profileEditHref?: string;
  appearance?: QrCardAppearance | null;
  orientation?: QrCardOrientation;
  position?: QrCardPosition;
  font?: QrCardFont | null;
  tagline?: string | null;
  textColor?: string | null;
  textStyle?: QrCardTextStyle;
  backgroundUrl?: string | null;
  logoUrl?: string;
  logoName?: string;
  canAddLogo?: boolean;
  enterpriseUpdatedAt?: string | null;
  svg: string;
  downloadName?: string;
  preview?: boolean;
  presets?: readonly QrCardPreset[];
  onSaved?: (result: Extract<InlineCardSaveResult, { success: true }>) => void;
  onPendingChange?: (pending: boolean) => void;
  onUnsavedChange?: (dirty: boolean) => void;
};

export function QrInlineCardEditor(props: InlineCardEditorProps) {
  const id = useId();
  const { onPendingChange, onUnsavedChange } = props;
  const initial = {
    appearance: props.appearance ?? {},
    orientation: props.orientation ?? "landscape",
    position: props.position ?? "right",
    font: props.font ?? "be-vietnam",
    textColor: props.textColor ?? null,
    tagline: QR_CARD_DEFAULT_TAGLINE,
    backgroundUrl: props.backgroundUrl ?? null,
  };
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [version, setVersion] = useState(props.version);
  const [revision, setRevision] = useState(props.expectedUpdatedAt);
  const [brand, setBrand] = useState({
    url: props.logoUrl,
    name: props.logoName,
    revision: props.enterpriseUpdatedAt,
  });
  const [files, setFiles] = useState<Partial<Record<PendingImage, File>>>({});
  const [previews, setPreviews] = useState<
    Partial<Record<PendingImage, string>>
  >({});
  const [removedBackground, setRemovedBackground] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMode, setExportMode] = useState<"card" | "qr">("card");
  const [clearOpen, setClearOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const urls = useRef<Partial<Record<PendingImage, string>>>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const dirty =
    JSON.stringify(saved) !== JSON.stringify(draft) ||
    Object.keys(files).length > 0 ||
    removedBackground;
  const disabled = busy || exporting;
  const backgroundPreview = getCardBackgroundPreview(
    removedBackground,
    previews.background,
    draft.backgroundUrl,
  );
  const backgroundVisibility =
    100 - (draft.appearance.backgroundDim ?? DEFAULT_CARD_BACKGROUND_DIM);
  useEffect(() => {
    onPendingChange?.(busy);
  }, [busy, onPendingChange]);
  useEffect(() => {
    onUnsavedChange?.(dirty);
  }, [dirty, onUnsavedChange]);
  useEffect(() => {
    const pending = urls.current;
    return () =>
      Object.values(pending).forEach((url) => URL.revokeObjectURL(url));
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function appearance(patch: Partial<QrCardAppearance>) {
    setDraft((d) => ({ ...d, appearance: { ...d.appearance, ...patch } }));
    setMessage(null);
  }
  function clearFiles() {
    for (const key of Object.keys(urls.current) as PendingImage[]) {
      URL.revokeObjectURL(urls.current[key]!);
      delete urls.current[key];
    }
    setFiles({});
    setPreviews({});
  }
  function discardPendingImage(key: PendingImage) {
    if (urls.current[key]) URL.revokeObjectURL(urls.current[key]!);
    delete urls.current[key];
    setFiles((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setPreviews((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }
  async function chooseImage(key: PendingImage, file?: File) {
    if (!file || disabled) return;
    const issue = validateCardImage(
      file.type,
      file.size,
      new Uint8Array(await file.slice(0, 12).arrayBuffer()),
    );
    if (issue || (key === "enterpriseLogo" && file.size > 2 * 1024 * 1024)) {
      setError(issue || "Logo không vượt quá 2 MB.");
      return;
    }
    if (urls.current[key]) URL.revokeObjectURL(urls.current[key]!);
    const url = URL.createObjectURL(file);
    urls.current[key] = url;
    setFiles((f) => ({ ...f, [key]: file }));
    setPreviews((p) => ({ ...p, [key]: url }));
    if (key === "background") setRemovedBackground(false);
    if (key === "enterpriseLogo") appearance({ showEnterpriseLogo: true });
    setError(null);
    setMessage(null);
  }
  function upload(key: PendingImage) {
    return (
      <Input
        aria-label={
          key === "background" ? "Chọn ảnh nền thẻ" : "Chọn logo doanh nghiệp"
        }
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={disabled || (key === "enterpriseLogo" && !props.canAddLogo)}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void chooseImage(key, f);
        }}
      />
    );
  }
  function colorControls() {
    return (
      <div className="grid grid-cols-[5rem_1fr] items-end gap-3">
        <label className="grid gap-2 text-xs">
          Màu chữ
          <Input
            aria-label="Màu chữ trên thẻ"
            type="color"
            value={
              draft.textColor ??
              (draft.appearance.finish === "ivory" ? "#24251f" : "#fbfaf6")
            }
            disabled={disabled}
            onChange={(e) =>
              setDraft((d) => ({ ...d, textColor: e.target.value }))
            }
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => setDraft((d) => ({ ...d, textColor: null }))}
        >
          Màu tự động
        </Button>
        <label className="col-span-2 grid gap-2 text-xs">
          Phông chữ
          <select
            aria-label="Phông chữ trên thẻ"
            className="h-control rounded-control bg-secondary px-3 text-sm"
            value={draft.font}
            disabled={disabled}
            onChange={(e) =>
              setDraft((d) => ({ ...d, font: e.target.value as QrCardFont }))
            }
          >
            {qrCardFontOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }
  function textEditor(
    field: CardTextField,
    value: string,
    displayValue?: string,
  ) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="digital-card-inline-target"
            aria-label={`Sửa ${labels[field].toLowerCase()}`}
            data-placeholder={`+ ${labels[field]}`}
          >
            {displayValue ?? value}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="max-h-[var(--radix-popover-content-available-height)] max-w-[calc(100vw-2rem)] overflow-y-auto [&>*]:shrink-0"
          onOpenAutoFocus={(e) => {
            if (disabled) e.preventDefault();
          }}
        >
          <label htmlFor={`${id}-${field}`} className="text-sm font-medium">
            {labels[field]}
          </label>
          <Textarea
            id={`${id}-${field}`}
            aria-label={labels[field]}
            value={value}
            maxLength={lengths[field]}
            rows={field === "name" ? 2 : 3}
            disabled={disabled}
            onChange={(e) =>
              appearance({
                copy: { ...draft.appearance.copy, [field]: e.target.value },
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Chỉ đổi chữ trên thẻ, không sửa hồ sơ công khai.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled || !value}
              onClick={() =>
                appearance({ copy: { ...draft.appearance.copy, [field]: "" } })
              }
            >
              <Trash2 /> Xóa khỏi thẻ
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={
                disabled || draft.appearance.copy?.[field] === undefined
              }
              onClick={() => {
                const copy = { ...draft.appearance.copy };
                delete copy[field];
                appearance({ copy });
              }}
            >
              Dùng chữ từ hồ sơ
            </Button>
          </div>
          {colorControls()}
        </PopoverContent>
      </Popover>
    );
  }
  function avatarEditor(content: ReactNode) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="digital-card-inline-avatar"
            aria-label="Sửa ảnh đại diện trên thẻ"
            disabled={disabled}
            data-editor-only={!content ? true : undefined}
          >
            {content || (
              <span className="digital-card-avatar-placeholder">
                <UserRound aria-hidden="true" />
                <Plus aria-hidden="true" />
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={12}
          className="max-h-[var(--radix-popover-content-available-height)] overflow-y-auto [&>*]:shrink-0"
        >
          <p className="font-medium">Căn ảnh đại diện</p>
          <p className="text-xs text-muted-foreground">
            Dùng cùng ảnh với hồ sơ. Chỉ thay đổi khung hiển thị trên thẻ, không
            tạo ảnh riêng.
          </p>
          <QrAvatarCropEditor
            src={props.identity?.avatarUrl}
            value={draft.appearance.avatarCrop}
            disabled={disabled || draft.appearance.showAvatar === false}
            onChange={(avatarCrop) => appearance({ avatarCrop })}
          />
          {props.profileEditHref && !props.preview ? (
            <>
              {dirty ? (
                <p className="text-xs text-muted-foreground">
                  Lưu hoặc hủy thay đổi trên thẻ trước khi mở hồ sơ.
                </p>
              ) : null}
              <Button asChild type="button" variant="secondary" size="sm">
                <a
                  href={props.profileEditHref}
                  aria-disabled={dirty}
                  onClick={(event) => {
                    if (dirty || disabled) {
                      event.preventDefault();
                      setError(
                        "Lưu hoặc hủy thay đổi trên thẻ trước khi đổi ảnh trong hồ sơ.",
                      );
                    }
                  }}
                >
                  Đổi ảnh trong hồ sơ
                </a>
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() =>
              appearance({ showAvatar: draft.appearance.showAvatar === false })
            }
          >
            {draft.appearance.showAvatar === false
              ? "Thêm lại ảnh hồ sơ"
              : "Xóa ảnh khỏi thẻ"}
          </Button>
        </PopoverContent>
      </Popover>
    );
  }
  function logoEditor(content: ReactNode) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="digital-card-add-logo"
            disabled={disabled}
            aria-label="Thêm hoặc sửa logo doanh nghiệp"
            data-editor-only={!content ? true : undefined}
          >
            {content || (
              <>
                <Plus aria-hidden="true" /> Logo
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="font-medium">Logo doanh nghiệp bổ sung</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Logo MHG Airpurity luôn giữ cố định, không thể thay thế.
          </p>
          {props.canAddLogo ? (
            <>
              {upload("enterpriseLogo")}
              <p className="text-xs leading-5 text-muted-foreground">
                Tối đa 2 MB. Khi lưu, logo mới áp dụng cho toàn bộ nhân sự trong
                doanh nghiệp.
              </p>
            </>
          ) : (
            <p className="text-xs leading-5 text-muted-foreground">
              Quản trị MHG cần bật quyền logo cho doanh nghiệp trước khi bạn tải
              logo mới.
            </p>
          )}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={draft.appearance.showEnterpriseLogo !== false}
              disabled={disabled}
              onChange={(e) => {
                appearance({ showEnterpriseLogo: e.target.checked });
                if (!e.target.checked) discardPendingImage("enterpriseLogo");
              }}
            />
            Hiện logo doanh nghiệp trên thẻ này
          </label>
        </PopoverContent>
      </Popover>
    );
  }
  function backgroundEditor(trigger: ReactNode) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          collisionPadding={12}
          className="max-h-[var(--radix-popover-content-available-height)] overflow-y-auto [&>*]:shrink-0"
        >
          <p className="font-medium">Nền danh thiếp</p>
          {upload("background")}
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span>Độ rõ ảnh nền</span>
              <output>{backgroundVisibility}%</output>
            </div>
            <Slider
              aria-label="Độ rõ ảnh nền"
              className="h-control"
              min={0}
              max={100}
              step={1}
              value={[backgroundVisibility]}
              disabled={disabled || !backgroundPreview}
              onValueChange={([value]) =>
                appearance({ backgroundDim: 100 - value })
              }
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {backgroundPreview
                ? "Kéo sang phải để ảnh rõ hơn. Chọn màu chữ tương phản khi nền sáng hoặc nhiều chi tiết."
                : "Chọn ảnh nền để chỉnh độ rõ. Chữ, logo và QR giữ nguyên độ đậm."}
            </p>
          </div>
          <label className="grid gap-2 text-xs">
            Màu nền
            <Input
              aria-label="Màu nền thẻ"
              type="color"
              disabled={disabled}
              value={draft.appearance.backgroundColor ?? "#20231e"}
              onChange={(e) => {
                appearance({ backgroundColor: e.target.value });
                setRemovedBackground(true);
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => {
                setRemovedBackground(true);
                discardPendingImage("background");
              }}
            >
              Xóa ảnh nền khỏi thẻ
            </Button>
            <Button
              size="sm"
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => appearance({ backgroundColor: null })}
            >
              Màu theo mẫu
            </Button>
          </div>
          {props.presets?.length ? (
            <label className="grid gap-2 text-xs">
              Ảnh nền có sẵn
              <select
                aria-label="Chọn nền có sẵn"
                className="h-control rounded-control bg-secondary px-3 text-sm"
                value=""
                disabled={disabled}
                onChange={(e) => {
                  const preset = props.presets?.find(
                    (p) => p.id === e.target.value,
                  );
                  if (preset) {
                    setDraft((d) => ({
                      ...d,
                      backgroundUrl: preset.backgroundUrl,
                    }));
                    setRemovedBackground(false);
                  }
                }}
              >
                <option value="">Chọn ảnh…</option>
                {props.presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  }
  async function save() {
    if (disabled || !props.qrId || props.preview || !cardRef.current) return;
    const issue = getQrCardFitError(cardRef.current);
    if (issue) {
      setError(issue);
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { avatarUrl: _storedAvatar, ...editableAppearance } =
        draft.appearance;
      void _storedAvatar;
      const form = new FormData();
      form.set(
        "settings",
        JSON.stringify({
          qrId: props.qrId,
          designId: props.designId,
          expectedVersion: version,
          expectedUpdatedAt: revision,
          expectedEnterpriseUpdatedAt: brand.revision,
          appearance: editableAppearance,
          orientation: draft.orientation,
          position: draft.position,
          font: draft.font,
          textColor: draft.textColor,
          tagline: draft.tagline,
          removeBackground: removedBackground,
          presetBackgroundUrl:
            !removedBackground &&
            !files.background &&
            draft.backgroundUrl !== saved.backgroundUrl
              ? (draft.backgroundUrl ?? undefined)
              : undefined,
        }),
      );
      for (const key of Object.keys(files) as PendingImage[])
        if (key !== "background" || !removedBackground)
          form.set(key, files[key]!);
      const result = await saveInlineCardAction(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const next = {
        ...draft,
        appearance: result.appearance,
        backgroundUrl:
          result.design?.backgroundUrl ??
          result.backgroundUrl ??
          (removedBackground ? null : draft.backgroundUrl),
      };
      setDraft(next);
      setSaved(next);
      setRemovedBackground(false);
      if (result.version) setVersion(result.version);
      if (result.design?.updatedAt) setRevision(result.design.updatedAt);
      if (result.logoUrl)
        setBrand({
          url: result.logoUrl,
          name: result.logoName,
          revision: result.enterpriseUpdatedAt,
        });
      clearFiles();
      setMessage("Đã lưu thẻ. Hồ sơ công khai không thay đổi.");
      props.onSaved?.(result);
    } catch {
      setError("Chưa thể lưu thẻ. Thay đổi vẫn được giữ để bạn thử lại.");
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    if (!cardRef.current || disabled) return;
    setExporting(true);
    setError(null);
    try {
      const target = cardRef.current;
      await document.fonts.ready;
      const data =
        exportMode === "qr"
          ? await qrOnlyPng(props.svg)
          : await withFlatCardCapture(target, async () => {
              const issue = getQrCardFitError(target);
              if (issue) throw new Error(issue);
              const { toSvg } = await import("html-to-image");
              const svg = await toSvg(target, {
                // Appending a cache-buster breaks pending blob: image previews.
                cacheBust: false,
                includeQueryParams: true,
                style: { margin: "0" },
                filter: (node) =>
                  !(
                    node instanceof HTMLElement &&
                    node.hasAttribute("data-editor-only")
                  ),
              });
              return rasterizeCardSvg(
                svg,
                target.clientWidth * 3,
                target.clientHeight * 3,
              );
            });
      await downloadCardPng(
        data,
        `mhg-${exportMode === "qr" ? "qr" : "danh-thiep"}-${(props.downloadName || "xem-thu").replace(/[^a-z0-9_-]/gi, "-")}.png`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể tạo ảnh thẻ.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <section
      className="min-w-0 space-y-4"
      aria-label="Chỉnh trực tiếp danh thiếp"
    >
      <p className="text-xs leading-5 text-muted-foreground">
        Bấm vào chữ, ảnh hoặc dấu + Logo ngay trên thẻ để sửa. Bấm vùng trống để
        đổi nền.
      </p>
      <div
        className={
          draft.orientation === "portrait"
            ? "mx-auto w-full max-w-sm"
            : "mx-auto w-full max-w-2xl"
        }
      >
        <div ref={cardRef}>
          <QrInteractiveSurface label={`Thiết kế danh thiếp ${props.heading}`}>
            <QrVisualCard
              heading={props.heading}
              description={props.description}
              location={props.location}
              identity={props.identity}
              appearance={{
                ...draft.appearance,
              }}
              orientation={draft.orientation}
              position={draft.position}
              font={draft.font}
              tagline={draft.tagline}
              textColor={draft.textColor}
              textStyle={props.textStyle}
              backgroundUrl={backgroundPreview}
              logoUrl={previews.enterpriseLogo ?? brand.url}
              logoName={brand.name}
              svg={props.svg}
              edit={{
                text: textEditor,
                avatar: avatarEditor,
                logo: logoEditor,
                background: backgroundEditor(
                  <button
                    type="button"
                    className="digital-card-background-trigger"
                    aria-label="Sửa nền thẻ"
                    disabled={disabled}
                    data-editor-only
                  />,
                ),
              }}
            />
          </QrInteractiveSurface>
        </div>
      </div>
      <div
        className="grid grid-cols-3 gap-2 sm:grid-cols-6"
        aria-label="Mẫu danh thiếp"
      >
        {businessCardTemplates.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={
              draft.orientation === t.orientation &&
              draft.position === t.position &&
              (draft.appearance.finish ?? "signature") === t.finish
            }
            className="grid gap-2 rounded-overlay p-2 text-left text-xs ring-1 ring-transparent hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-secondary aria-pressed:ring-gold/70 disabled:opacity-50"
            disabled={disabled}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                orientation: t.orientation,
                position: t.position,
                textColor: null,
                appearance: {
                  ...d.appearance,
                  finish: t.finish,
                  backgroundColor: null,
                },
              }));
              setMessage(null);
            }}
          >
            <span
              aria-hidden="true"
              className={`relative mx-auto block h-14 ${t.orientation === "portrait" ? "w-9" : "w-full"} overflow-hidden rounded-md border border-current/20 ${t.finish === "ivory" ? "bg-[#eeece2] text-[#24251f]" : t.finish === "foil" ? "bg-[linear-gradient(130deg,#71613a,#20231e)] text-[#fbfaf6]" : "bg-[#20231e] text-[#fbfaf6]"}`}
            >
              <span
                className={`absolute size-3 rounded-full bg-current/40 ${t.position === "left" ? "top-2 right-2" : "top-2 left-2"}`}
              />
              <span
                className={`absolute size-4 bg-current/75 ${t.orientation === "portrait" ? (t.position === "top" ? "top-2 left-1/2 -translate-x-1/2" : "bottom-2 left-1/2 -translate-x-1/2") : t.position === "left" ? "top-2 left-2" : "top-2 right-2"}`}
              />
              <span className="absolute bottom-2 left-2 h-0.5 w-1/2 bg-current/60" />
            </span>
            {t.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {backgroundEditor(
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
          >
            <ImagePlus />
            Nền
          </Button>,
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
            >
              <Palette />
              Chữ và bố cục
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {colorControls()}
            <label className="grid gap-2 text-xs">
              Vị trí QR
              <select
                aria-label="Vị trí QR trên danh thiếp"
                className="h-control rounded-control bg-secondary px-3 text-sm"
                value={draft.position}
                disabled={disabled}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    position: e.target.value as QrCardPosition,
                  }))
                }
              >
                {qrCardPositionOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-2 text-xs">
              <p className="font-medium">Dòng bảo vệ cố định của MHG</p>
              <p className="font-semibold">{QR_CARD_DEFAULT_TAGLINE}</p>
              <p className="leading-5">
                Luôn hiển thị trên thẻ, không thể sửa hoặc ẩn.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        <Popover open={clearOpen} onOpenChange={setClearOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
            >
              <Trash2 /> Xóa nội dung trên thẻ
            </Button>
          </PopoverTrigger>
          <PopoverContent
            collisionPadding={12}
            className="max-h-[var(--radix-popover-content-available-height)] overflow-y-auto [&>*]:shrink-0"
          >
            <p className="font-medium">Làm trống phần cá nhân?</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Bỏ tên, chức danh, liên hệ, ảnh đại diện, ảnh nền và logo bổ sung
              khỏi thẻ này. Không xóa hồ sơ hay ảnh gốc. Logo MHG, câu bảo vệ và
              QR vẫn giữ nguyên.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => {
                appearance(clearCardPersonalContent(draft.appearance));
                clearFiles();
                setRemovedBackground(true);
                setError(null);
                setClearOpen(false);
              }}
            >
              <Trash2 /> Xóa phần cá nhân khỏi thẻ
            </Button>
            <p className="text-xs text-muted-foreground">
              Có thể Hủy thay đổi trước khi lưu.
            </p>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !dirty}
          onClick={() => {
            setDraft(saved);
            clearFiles();
            setRemovedBackground(false);
            setError(null);
            setMessage(null);
          }}
        >
          <RotateCcw />
          Hủy thay đổi
        </Button>
        <label className="flex items-center gap-2 text-xs">
          Tải xuống
          <select
            aria-label="Nội dung tải xuống"
            value={exportMode}
            disabled={disabled}
            className="h-control-sm rounded-control bg-secondary px-3 text-sm"
            onChange={(e) => setExportMode(e.target.value as "card" | "qr")}
          >
            <option value="card">Danh thiếp đầy đủ</option>
            <option value="qr">Chỉ mã QR</option>
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => void download()}
        >
          {exporting ? <LoaderCircle className="animate-spin" /> : <Download />}
          {exportMode === "qr" ? "Tải QR PNG" : "Tải PNG"}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={disabled || !dirty || props.preview || !props.qrId}
          onClick={() => void save()}
        >
          {busy ? <LoaderCircle className="animate-spin" /> : <Save />}Lưu thẻ
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground" role="status">
        {props.preview
          ? "Bản thử: chưa ghi vào dữ liệu khách hàng. Bạn vẫn có thể chỉnh và xuất ảnh."
          : (message ??
            (files.enterpriseLogo
              ? "Logo mới sẽ áp dụng cho toàn bộ nhân sự của doanh nghiệp khi bấm Lưu thẻ."
              : dirty
                ? "Có thay đổi chưa lưu. Chỉ bấm Lưu thẻ mới ghi lại."
                : "Chữ và ảnh chỉnh ở đây chỉ thuộc danh thiếp, không tự đổi hồ sơ công khai."))}
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
