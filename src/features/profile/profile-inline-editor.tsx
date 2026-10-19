"use client";

import { cn } from "cn";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Palette,
  PencilLine,
  Redo2,
  Undo2,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type ComponentProps } from "react";

import { Button, IconButton } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createArticleItemId,
  moveItem,
  updateArticleBlock,
} from "@/features/profile/profile-article";
import { uploadArticleImageAction } from "@/features/profile/profile-article-actions";
import { DocumentInspector } from "@/features/profile/profile-builder-inspector-fields";
import {
  SaveButton,
  SaveError,
  type SaveStatus,
} from "@/features/profile/profile-builder-sidebar";
import { getProfileBlock } from "@/features/profile/profile-document";
import { articleLimits } from "@/features/profile/profile-document-schema";
import {
  profileLocales,
  type ArticleBlock,
  type ArticleImageAlign,
  type ProfileBlock,
  type ProfileDocument,
  type ProfileLocale,
} from "@/features/profile/profile-document-types";
import {
  factPlaceholder,
  sectionBodyPlaceholder,
  suggestedFactLabels,
  suggestedSectionHeadings,
  withFormTemplate,
} from "@/features/profile/profile-form-hints";
import { profileLocaleLabels } from "@/features/profile/profile-i18n";
import type { InlineEditApi } from "@/features/profile/profile-inline-edit";
import {
  readInlineText,
  writeInlineText,
} from "@/features/profile/profile-inline-keys";
import { ProfileMediaPicker } from "@/features/profile/profile-media-picker";
import { PublicProfile } from "@/features/profile/public-profile";

type ChangeHandler = (document: ProfileDocument, coalesceKey?: string) => void;

export type ProfileInlineEditorProps = {
  canRedo: boolean;
  canUndo: boolean;
  document: ProfileDocument;
  hasUnsavedChanges: boolean;
  invalidField: string | null;
  locale: ProfileLocale;
  onBack: () => void;
  onChange: ChangeHandler;
  onLocaleChange: (locale: ProfileLocale) => void;
  onProfileLabelChange: (value: string) => void;
  onRedo: () => void;
  onRetry: () => void;
  onSave: () => void;
  onUndo: () => void;
  previewProfile: ComponentProps<typeof PublicProfile>["profile"];
  profileLabel: string;
  saveError: string | null;
  saving: boolean;
  saveStatus: SaveStatus;
};

/**
 * Trình sửa trực tiếp: hiện đúng trang hồ sơ theo giao diện đang chọn (Wikipedia hay giao diện khác),
 * bấm vào chữ, ảnh, mục nào là sửa ngay chỗ đó; thêm, bớt, sắp xếp bằng các nút nhỏ hiện cạnh từng phần.
 */
export function ProfileInlineEditor(props: ProfileInlineEditorProps) {
  const {
    canRedo,
    canUndo,
    document,
    hasUnsavedChanges,
    invalidField,
    locale,
    onBack,
    onChange,
    onLocaleChange,
    onProfileLabelChange,
    onRedo,
    onRetry,
    onSave,
    onUndo,
    previewProfile,
    profileLabel,
    saveError,
    saving,
    saveStatus,
  } = props;
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [styleOpen, setStyleOpen] = useState(false);
  const [media, setMedia] = useState<"avatar" | "cover" | null>(null);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageTargetRef = useRef<string | null>(null);
  const translating = locale !== "vi";
  const identity = getProfileBlock(document, "identity");

  const changeArticle = (
    mutate: (data: ArticleBlock["data"]) => ArticleBlock["data"],
  ) =>
    onChange(
      updateArticleBlock(withFormTemplate(document), (block) => ({
        ...block,
        data: mutate(block.data),
      })),
    );

  function focusLater(selector: string) {
    requestAnimationFrame(() => {
      const element = globalThis.document.querySelector<HTMLElement>(selector);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
    });
  }

  async function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const sectionId = imageTargetRef.current;
    if (!file || !sectionId) return;
    setUploadError(null);
    setUploadingSectionId(sectionId);
    try {
      const formData = new FormData();
      formData.set("image", file);
      const result = await uploadArticleImageAction(formData);
      if (!result.success) {
        setUploadError(result.error);
        return;
      }
      changeArticle((data) => ({
        ...data,
        sections: data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                images: [
                  ...section.images,
                  {
                    align: (section.images.length % 2
                      ? "left"
                      : "right") as ArticleImageAlign,
                    caption: null,
                    id: createArticleItemId(),
                    url: result.url,
                  },
                ].slice(0, articleLimits.imagesPerSection),
              }
            : section,
        ),
      }));
    } catch {
      setUploadError("Chưa thể tải ảnh lên. Hãy thử lại.");
    } finally {
      setUploadingSectionId(null);
    }
  }

  const api: InlineEditApi = {
    addFact: (label = "") => {
      const id = createArticleItemId();
      changeArticle((data) => ({
        ...data,
        facts: [...data.facts, { id, label, value: "" }].slice(
          0,
          articleLimits.facts,
        ),
      }));
      focusLater(`[data-editable="fact.${id}.${label ? "value" : "label"}"]`);
    },
    addImage: (sectionId) => {
      imageTargetRef.current = sectionId;
      imageInputRef.current?.click();
    },
    addLink: (kind) => {
      const id = createArticleItemId();
      changeArticle((data) => ({
        ...data,
        links: [
          ...(data.links ?? []),
          { id, kind, source: null, title: "", url: "" },
        ].slice(0, articleLimits.links),
      }));
      focusLater(`[data-editable="link.${id}.url"]`);
    },
    addReference: () => {
      const id = createArticleItemId();
      changeArticle((data) => ({
        ...data,
        references: [
          ...data.references,
          { date: null, id, source: null, title: "", url: null },
        ].slice(0, articleLimits.references),
      }));
      focusLater(`[data-editable="ref.${id}.title"]`);
    },
    addSection: (afterId = null, heading = "") => {
      const id = createArticleItemId();
      changeArticle((data) => {
        const sections = [...data.sections];
        const index = afterId
          ? sections.findIndex((section) => section.id === afterId)
          : -1;
        sections.splice(index >= 0 ? index + 1 : sections.length, 0, {
          body: "",
          heading,
          id,
          images: [],
        });
        return { ...data, sections: sections.slice(0, articleLimits.sections) };
      });
      focusLater(`[data-editable="section.${id}.heading"]`);
    },
    disabled: saving || mode !== "edit",
    duplicateSection: (id) =>
      changeArticle((data) => {
        const index = data.sections.findIndex((section) => section.id === id);
        if (index < 0 || data.sections.length >= articleLimits.sections)
          return data;
        const source = data.sections[index];
        const sections = [...data.sections];
        sections.splice(index + 1, 0, {
          ...source,
          id: createArticleItemId(),
          images: source.images.map((image) => ({
            ...image,
            id: createArticleItemId(),
          })),
        });
        return { ...data, sections };
      }),
    factHint: factPlaceholder,
    locale,
    moveSection: (id, offset) =>
      changeArticle((data) => ({
        ...data,
        sections: moveItem(
          data.sections,
          data.sections.findIndex((section) => section.id === id),
          offset,
        ),
      })),
    openMedia: setMedia,
    read: (key) => readInlineText(document, locale, key),
    removeFact: (id) =>
      changeArticle((data) => ({
        ...data,
        facts: data.facts.filter((fact) => fact.id !== id),
      })),
    removeImage: (sectionId, imageId) =>
      changeArticle((data) => ({
        ...data,
        sections: data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                images: section.images.filter((image) => image.id !== imageId),
              }
            : section,
        ),
      })),
    removeLink: (id) =>
      changeArticle((data) => ({
        ...data,
        links: (data.links ?? []).filter((link) => link.id !== id),
      })),
    removeReference: (id) =>
      changeArticle((data) => ({
        ...data,
        references: data.references.filter((reference) => reference.id !== id),
      })),
    removeSection: (id) =>
      changeArticle((data) => ({
        ...data,
        sections: data.sections.filter((section) => section.id !== id),
      })),
    sectionHint: sectionBodyPlaceholder,
    setBlockVisible: (type, visible) =>
      onChange({
        ...document,
        blocks: document.blocks.map((block) =>
          block.type === type ? { ...block, visible } : block,
        ) as ProfileBlock[],
      }),
    setImageAlign: (sectionId, imageId, align) =>
      changeArticle((data) => ({
        ...data,
        sections: data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                images: section.images.map((image) =>
                  image.id === imageId ? { ...image, align } : image,
                ),
              }
            : section,
        ),
      })),
    setLinkKind: (id, kind) =>
      changeArticle((data) => ({
        ...data,
        links: (data.links ?? []).map((link) =>
          link.id === id ? { ...link, kind } : link,
        ),
      })),
    suggestedFacts: suggestedFactLabels,
    suggestedSections: suggestedSectionHeadings,
    translating,
    uploadingSectionId,
    write: (key, value) =>
      onChange(writeInlineText(document, locale, key, value), key),
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-1.5 px-2 sm:gap-2 sm:px-4">
          <IconButton
            disabled={saving}
            onClick={onBack}
            size="icon-lg"
            tooltip="Về dashboard"
            type="button"
            variant="ghost"
          >
            <ArrowLeft aria-hidden="true" />
          </IconButton>
          <input
            aria-label="Tên hồ sơ"
            className="h-10 w-28 min-w-0 truncate rounded-md border-b border-transparent bg-transparent px-1 text-base font-medium outline-none hover:border-border focus-visible:border-gold sm:w-56 lg:w-72"
            maxLength={120}
            onChange={(event) => onProfileLabelChange(event.target.value)}
            placeholder="Tên hồ sơ"
            value={profileLabel}
          />
          <p className="hidden min-w-0 flex-1 items-center justify-center gap-2 truncate text-xs text-muted-foreground xl:flex">
            <MousePointerClick aria-hidden="true" className="size-4 shrink-0" />
            {mode === "edit"
              ? "Bấm vào chữ, ảnh, mục bất kỳ để sửa ngay trên trang"
              : "Đang xem như khách"}
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <div className="hidden md:block">
              <LocaleSwitch
                disabled={saving}
                locale={locale}
                onChange={onLocaleChange}
              />
            </div>
            <IconButton
              className="hidden sm:inline-flex"
              disabled={saving || !canUndo}
              onClick={onUndo}
              size="icon-lg"
              tooltip="Hoàn tác"
              type="button"
              variant="ghost"
            >
              <Undo2 aria-hidden="true" />
            </IconButton>
            <IconButton
              className="hidden sm:inline-flex"
              disabled={saving || !canRedo}
              onClick={onRedo}
              size="icon-lg"
              tooltip="Làm lại"
              type="button"
              variant="ghost"
            >
              <Redo2 aria-hidden="true" />
            </IconButton>
            <IconButton
              onClick={() => setStyleOpen(true)}
              size="icon-lg"
              tooltip="Giao diện, phong cách, ngôn ngữ"
              type="button"
              variant="ghost"
            >
              <Palette aria-hidden="true" />
            </IconButton>
            <IconButton
              aria-pressed={mode === "view"}
              onClick={() => setMode(mode === "edit" ? "view" : "edit")}
              size="icon-lg"
              tooltip={mode === "edit" ? "Xem như khách" : "Quay lại sửa"}
              type="button"
              variant={mode === "view" ? "secondary" : "ghost"}
            >
              {mode === "edit" ? (
                <Eye aria-hidden="true" />
              ) : (
                <PencilLine aria-hidden="true" />
              )}
            </IconButton>
            <SaveButton
              hasUnsavedChanges={hasUnsavedChanges}
              onRetry={onRetry}
              onSave={onSave}
              saving={saving}
              status={saveStatus}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-2 pb-2 md:hidden">
          <LocaleSwitch
            disabled={saving}
            locale={locale}
            onChange={onLocaleChange}
          />
        </div>
      </header>

      {saveError || uploadError || invalidField || translating ? (
        <div className="mx-auto grid max-w-4xl gap-2 px-3 pt-3">
          {saveError ? <SaveError error={saveError} /> : null}
          {uploadError ? (
            <p
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {uploadError}
            </p>
          ) : null}
          {translating ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Đang nhập bản{" "}
              <strong className="text-foreground">
                {profileLocaleLabels[locale].long}
              </strong>
              : bấm vào chữ để dịch, chữ mờ là bản tiếng Việt, ô để trống sẽ
              hiện tiếng Việt.
              {document.languages?.includes(locale as never)
                ? null
                : " Bản này chưa bật cho khách xem (bật trong nút Giao diện)."}
            </p>
          ) : null}
        </div>
      ) : null}

      <input
        accept="image/jpeg,image/png,image/webp"
        aria-label="Chọn ảnh cho mục"
        className="sr-only"
        onChange={handleImageFile}
        ref={imageInputRef}
        tabIndex={-1}
        type="file"
      />

      {mode === "edit" ? (
        <div
          onClickCapture={(event) => {
            // Bấm vào ảnh đại diện để đổi ảnh (nút chồng lên ảnh làm vỡ bố cục một số giao diện).
            if (
              !translating &&
              !saving &&
              event.target instanceof Element &&
              event.target.closest(".profile-avatar")
            ) {
              event.preventDefault();
              event.stopPropagation();
              setMedia("avatar");
            }
          }}
        >
          <PublicProfile
            document={document}
            inlineEdit={api}
            locale={locale}
            onLocaleChange={onLocaleChange}
            profile={previewProfile}
          />
        </div>
      ) : (
        <PublicProfile
          document={document}
          locale={locale}
          onLocaleChange={onLocaleChange}
          profile={previewProfile}
        />
      )}

      {/* Ô chọn ảnh đại diện, ảnh bìa luôn nằm trong form để tệp đã chọn được gửi khi lưu. */}
      <div
        aria-label="Ảnh đại diện và ảnh bìa"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-[60] items-end justify-center bg-black/55 p-3 sm:items-center",
          media ? "flex" : "hidden",
        )}
        onClick={() => setMedia(null)}
        role="dialog"
      >
        <div
          className="grid max-h-[90dvh] w-full max-w-lg gap-4 overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-medium">
              {media === "cover" ? "Ảnh bìa" : "Ảnh đại diện"}
            </p>
            <Button
              onClick={() => setMedia(null)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <X aria-hidden="true" /> Xong
            </Button>
          </div>
          <ProfileMediaPicker
            avatarUrl={identity.data.avatarUrl}
            coverUrl={identity.data.coverUrl}
            onAvatarChange={(avatarUrl) =>
              onChange({
                ...document,
                blocks: document.blocks.map((block) =>
                  block.type === "identity"
                    ? { ...block, data: { ...block.data, avatarUrl } }
                    : block,
                ) as ProfileBlock[],
              })
            }
            onCoverChange={(coverUrl) =>
              onChange({
                ...document,
                blocks: document.blocks.map((block) =>
                  block.type === "identity"
                    ? { ...block, data: { ...block.data, coverUrl } }
                    : block,
                ) as ProfileBlock[],
              })
            }
          />
        </div>
      </div>

      <Sheet onOpenChange={setStyleOpen} open={styleOpen}>
        <SheetContent
          className="w-[min(26rem,calc(100vw-1rem))] overflow-y-auto p-5"
          side="right"
        >
          <SheetHeader className="px-0">
            <SheetTitle>Giao diện hồ sơ</SheetTitle>
          </SheetHeader>
          <fieldset className="min-w-0" disabled={saving}>
            <DocumentInspector
              document={document}
              onChange={onChange}
              onProfileLabelChange={onProfileLabelChange}
              profileLabel={profileLabel}
            />
          </fieldset>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LocaleSwitch({
  disabled,
  locale,
  onChange,
}: {
  disabled: boolean;
  locale: ProfileLocale;
  onChange: (locale: ProfileLocale) => void;
}) {
  return (
    <div
      aria-label="Ngôn ngữ đang nhập"
      className="inline-flex rounded-control bg-muted p-0.5"
      role="radiogroup"
    >
      {profileLocales.map((item) => (
        <button
          aria-checked={item === locale}
          className={cn(
            "h-9 min-w-10 rounded-[calc(var(--radius-control)-2px)] px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50",
            item === locale
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
          disabled={disabled}
          key={item}
          onClick={() => onChange(item)}
          role="radio"
          title={`Nhập bản ${profileLocaleLabels[item].long}`}
          type="button"
        >
          {profileLocaleLabels[item].short}
        </button>
      ))}
    </div>
  );
}
