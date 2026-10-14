"use client";

import { cn } from "cn";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  ListPlus,
  Plus,
  Quote,
  Redo2,
  Trash2,
  Undo2,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Button, IconButton } from "@/components/ui/button";
import {
  createArticleItemId,
  factKey,
  getArticleBlock,
  getTranslation,
  imageKey,
  linkKey,
  moveItem,
  referenceKey,
  sectionKey,
  setTranslation,
  updateArticleBlock,
} from "@/features/profile/profile-article";
import {
  ExternalLinksEditor,
  ReferencesEditor,
  RichBodyEditor,
  SectionImagesEditor,
  type Updater,
} from "@/features/profile/profile-builder-article-inspector";
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
  type ArticleLinkKind,
  type ArticleSection,
  type ProfileBlock,
  type ProfileBlockType,
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
import { ProfileMediaPicker } from "@/features/profile/profile-media-picker";
import { socialPlatforms } from "@/features/profile/profile-social-platforms";
import { PublicProfile } from "@/features/profile/public-profile";

type ChangeHandler = (document: ProfileDocument, coalesceKey?: string) => void;
type CardId =
  | "bio"
  | "contact"
  | "facts"
  | "identity"
  | "links"
  | "references"
  | "social"
  | `section:${string}`;

export type ProfileFormEditorProps = {
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

function updateBlock<T extends ProfileBlockType>(
  document: ProfileDocument,
  type: T,
  update: (block: Extract<ProfileBlock, { type: T }>) => ProfileBlock,
) {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === type
        ? update(block as Extract<ProfileBlock, { type: T }>)
        : block,
    ),
  } as ProfileDocument;
}

/**
 * Trình sửa hồ sơ dạng thẻ (giống Google Forms): mỗi phần là một thẻ, bấm vào là sửa tại chỗ,
 * thanh công cụ nổi bên cạnh thẻ đang chọn để thêm mục, ảnh, dòng thông tin, nguồn, liên kết.
 */
export function ProfileFormEditor(props: ProfileFormEditorProps) {
  const {
    canRedo,
    canUndo,
    document: rawDocument,
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
  const document = rawDocument;
  const article = getArticleBlock(document) ?? emptyArticle;
  const translating = locale !== "vi";
  const [tab, setTab] = useState<"content" | "style">("content");
  const [active, setActive] = useState<CardId>("identity");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageRequest, setImageRequest] = useState<{
    count: number;
    sectionId: string;
  } | null>(null);
  const [toolbarTop, setToolbarTop] = useState(0);
  const [seenInvalidField, setSeenInvalidField] = useState(invalidField);
  const columnRef = useRef<HTMLDivElement>(null);

  // Lỗi lưu (thiếu tên, email sai) luôn đưa về tab Nội dung để ô lỗi hiện ra.
  if (invalidField !== seenInvalidField) {
    setSeenInvalidField(invalidField);
    if (invalidField) {
      setTab("content");
      setActive(invalidField === "contactEmail" ? "contact" : "identity");
    }
  }

  // Thanh công cụ nổi đi theo thẻ đang chọn (máy tính).
  useEffect(() => {
    const column = columnRef.current;
    if (!column || tab !== "content") return;
    const card = column.querySelector<HTMLElement>(
      `[data-form-card="${CSS.escape(active)}"]`,
    );
    const observer = new ResizeObserver(() =>
      setToolbarTop(card ? card.offsetTop : 0),
    );
    observer.observe(column);
    if (card) observer.observe(card);
    return () => observer.disconnect();
  }, [active, tab]);

  const updateArticle: Updater = (mutate, key) =>
    onChange(
      updateArticleBlock(withFormTemplate(document), (block) => ({
        ...block,
        data: mutate(block.data),
      })),
      key,
    );

  function focusLater(selector: string) {
    requestAnimationFrame(() => {
      const matches =
        globalThis.document.querySelectorAll<HTMLElement>(selector);
      const element = matches[matches.length - 1];
      element?.focus();
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function addSection(heading = "") {
    if (article.data.sections.length >= articleLimits.sections) return null;
    const id = createArticleItemId();
    const activeSection = active.startsWith("section:")
      ? active.slice("section:".length)
      : null;
    updateArticle((data) => {
      const sections = [...data.sections];
      const index = activeSection
        ? sections.findIndex((section) => section.id === activeSection)
        : -1;
      sections.splice(index >= 0 ? index + 1 : sections.length, 0, {
        body: "",
        heading,
        id,
        images: [],
      });
      return { ...data, sections };
    });
    setActive(`section:${id}`);
    focusLater(heading ? `#section-body-${id}` : `#section-heading-${id}`);
    return id;
  }

  function addImage() {
    const current = active.startsWith("section:")
      ? active.slice("section:".length)
      : null;
    const sectionId = current ?? addSection("");
    if (!sectionId) return;
    setActive(`section:${sectionId}`);
    setImageRequest((previous) => ({
      count: (previous?.count ?? 0) + 1,
      sectionId,
    }));
  }

  function addFact(label = "") {
    if (article.data.facts.length >= articleLimits.facts) return;
    const id = createArticleItemId();
    updateArticle((data) => ({
      ...data,
      facts: [...data.facts, { id, label, value: "" }],
    }));
    setActive("facts");
    focusLater(label ? `#fact-value-${id}` : `#fact-label-${id}`);
  }

  function addReference() {
    if (article.data.references.length >= articleLimits.references) return;
    updateArticle((data) => ({
      ...data,
      references: [
        ...data.references,
        {
          date: null,
          id: createArticleItemId(),
          source: null,
          title: "",
          url: null,
        },
      ],
    }));
    setActive("references");
    focusLater('[data-form-card="references"] [aria-label^="Tiêu đề nguồn"]');
  }

  function addLink(kind: ArticleLinkKind) {
    if ((article.data.links ?? []).length >= articleLimits.links) return;
    updateArticle((data) => ({
      ...data,
      links: [
        ...(data.links ?? []),
        { id: createArticleItemId(), kind, source: null, title: "", url: "" },
      ],
    }));
    setActive("links");
  }

  const cardProps = (id: CardId) => ({
    active: active === id,
    id,
    onActivate: () => setActive(id),
  });

  return (
    <div className="min-h-dvh bg-muted/30 pb-28 lg:pb-16">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-5">
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
            className="h-10 min-w-0 flex-1 truncate rounded-md border-b border-transparent bg-transparent px-1 text-lg font-medium outline-none hover:border-border focus-visible:border-gold sm:max-w-80"
            maxLength={120}
            onChange={(event) => onProfileLabelChange(event.target.value)}
            placeholder="Tên hồ sơ"
            value={profileLabel}
          />
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <div className="hidden sm:block">
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
              onClick={() => setPreviewOpen(true)}
              size="icon-lg"
              tooltip="Xem trước trang"
              type="button"
              variant="ghost"
            >
              <Eye aria-hidden="true" />
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
        <nav
          aria-label="Phần chỉnh sửa"
          className="mx-auto flex max-w-6xl items-center justify-center gap-6 px-3"
        >
          {(
            [
              ["content", "Nội dung"],
              ["style", "Giao diện"],
            ] as const
          ).map(([id, label]) => (
            <button
              aria-current={tab === id ? "page" : undefined}
              className={cn(
                "relative h-11 px-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                tab === id
                  ? "text-gold after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-gold"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={id}
              onClick={() => setTab(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto w-full max-w-3xl px-3 pt-6 sm:px-5">
        <div className="mb-4 flex justify-end sm:hidden">
          <LocaleSwitch
            disabled={saving}
            locale={locale}
            onChange={onLocaleChange}
          />
        </div>
        {saveError ? <SaveError error={saveError} /> : null}

        {tab === "style" ? (
          <FormCard
            active
            description="Phong cách trang, nền, ngôn ngữ cho khách xem và tên hồ sơ trong dashboard."
            id="identity"
            onActivate={() => undefined}
            title="Giao diện hồ sơ"
          >
            <fieldset className="min-w-0" disabled={saving}>
              <DocumentInspector
                document={document}
                onChange={onChange}
                onProfileLabelChange={onProfileLabelChange}
                profileLabel={profileLabel}
              />
            </fieldset>
          </FormCard>
        ) : null}

        {/* Thẻ nội dung luôn được giữ trong cây để ô chọn ảnh đại diện và ảnh bìa không mất tệp đã chọn. */}
        <fieldset
          className="relative grid min-w-0 gap-4"
          disabled={saving}
          hidden={tab !== "content"}
          ref={columnRef as never}
        >
          {translating ? (
            <p className="rounded-xl bg-card p-4 text-sm leading-6 text-muted-foreground ring-1 ring-border/60">
              Đang nhập bản{" "}
              <strong className="text-foreground">
                {profileLocaleLabels[locale].long}
              </strong>
              . Chữ mờ trong mỗi ô là bản tiếng Việt; ô để trống sẽ hiện tiếng
              Việt. Ảnh, số điện thoại, đường dẫn dùng chung cho mọi ngôn ngữ.
              {document.languages?.includes(locale as never)
                ? null
                : " Bản này chưa bật cho khách xem: bật ở tab Giao diện."}
            </p>
          ) : null}

          <IdentityCard
            {...cardProps("identity")}
            document={document}
            invalid={invalidField === "name"}
            locale={locale}
            onChange={onChange}
          />
          <BioCard
            {...cardProps("bio")}
            document={document}
            locale={locale}
            onChange={onChange}
          />
          <FactsCard
            {...cardProps("facts")}
            article={article}
            document={document}
            locale={locale}
            onAddFact={addFact}
            onChange={onChange}
            update={updateArticle}
          />
          {article.data.sections.map((section, index) => (
            <SectionCard
              {...cardProps(`section:${section.id}`)}
              document={document}
              imageRequest={
                imageRequest?.sectionId === section.id ? imageRequest.count : 0
              }
              index={index}
              key={section.id}
              length={article.data.sections.length}
              locale={locale}
              onChange={onChange}
              referenceCount={article.data.references.length}
              section={section}
              update={updateArticle}
            />
          ))}
          {!translating ? (
            <AddSectionStrip
              disabled={article.data.sections.length >= articleLimits.sections}
              onAdd={addSection}
              usedHeadings={article.data.sections.map((item) => item.heading)}
            />
          ) : null}
          <FormCard
            {...cardProps("references")}
            title={translating ? "Nguồn tham khảo" : undefined}
          >
            {translating ? (
              <TranslationList
                document={document}
                items={article.data.references.flatMap((reference, index) => [
                  {
                    key: referenceKey(reference.id, "title"),
                    label: `Tiêu đề nguồn [${index + 1}]`,
                    original: reference.title,
                  },
                  {
                    key: referenceKey(reference.id, "source"),
                    label: "Tên báo, trang",
                    original: reference.source ?? "",
                  },
                ])}
                locale={locale}
                onChange={onChange}
              />
            ) : active !== "references" && article.data.references.length ? (
              <CompactList
                items={article.data.references.map(
                  (reference, index) =>
                    `[${index + 1}] ${reference.title || reference.url || "Nguồn chưa đặt tên"}${reference.source ? ` · ${reference.source}` : ""}`,
                )}
                onOpen={() => setActive("references")}
                title="Nguồn tham khảo"
              />
            ) : (
              <ReferencesEditor block={article} update={updateArticle} />
            )}
          </FormCard>
          <FormCard
            {...cardProps("links")}
            title={translating ? "Liên kết ngoài" : undefined}
          >
            {translating ? (
              <TranslationList
                document={document}
                items={(article.data.links ?? []).flatMap((link, index) => [
                  {
                    key: linkKey(link.id, "title"),
                    label: `Tiêu đề liên kết ${index + 1}`,
                    original: link.title,
                  },
                  {
                    key: linkKey(link.id, "source"),
                    label: "Tên báo, kênh",
                    original: link.source ?? "",
                  },
                ])}
                locale={locale}
                onChange={onChange}
              />
            ) : active !== "links" && (article.data.links ?? []).length ? (
              <CompactList
                items={(article.data.links ?? []).map(
                  (link) =>
                    `${link.kind === "video" ? "▶ " : ""}${link.title || link.url || "Liên kết chưa đặt tên"}${link.source ? ` · ${link.source}` : ""}`,
                )}
                onOpen={() => setActive("links")}
                title="Liên kết ngoài"
              />
            ) : (
              <ExternalLinksEditor block={article} update={updateArticle} />
            )}
          </FormCard>
          <ContactCard
            {...cardProps("contact")}
            document={document}
            invalid={invalidField === "contactEmail"}
            onChange={onChange}
            translating={translating}
          />
          <SocialCard
            {...cardProps("social")}
            document={document}
            onChange={onChange}
            translating={translating}
          />

          {!translating ? (
            <FloatingToolbar
              onAddFact={() => addFact()}
              onAddImage={addImage}
              onAddLink={addLink}
              onAddReference={addReference}
              onAddSection={() => addSection()}
              top={toolbarTop}
            />
          ) : null}
        </fieldset>
      </div>

      {previewOpen ? (
        <div
          aria-label="Xem trước trang công khai"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-background"
          role="dialog"
        >
          <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/60 bg-background/95 px-3 backdrop-blur-sm sm:px-5">
            <p className="text-sm font-medium">Xem trước trang công khai</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Ô còn trống không hiện với khách.
            </p>
            <Button
              autoFocus
              className="ml-auto"
              onClick={() => setPreviewOpen(false)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <X aria-hidden="true" /> Đóng
            </Button>
          </div>
          <PublicProfile
            document={document}
            locale={locale}
            onLocaleChange={onLocaleChange}
            profile={previewProfile}
          />
        </div>
      ) : null}
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

function FormCard({
  accent = false,
  actions,
  active,
  children,
  description,
  footer,
  id,
  muted = false,
  onActivate,
  title,
}: {
  accent?: boolean;
  actions?: ReactNode;
  active: boolean;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  id: CardId;
  muted?: boolean;
  onActivate: () => void;
  title?: string;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "relative min-w-0 overflow-hidden rounded-xl bg-card ring-1 ring-border/60 transition-shadow",
        accent && "border-t-[6px] border-gold",
        active && "shadow-[0_8px_28px_rgb(0_0_0/0.28)] ring-gold/35",
        muted && "opacity-60",
      )}
      data-form-card={id}
      onFocusCapture={onActivate}
      onPointerDown={onActivate}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5 bg-gold transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 p-5 sm:p-6">
        {title || actions ? (
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid min-w-0 flex-1 gap-1">
              {title ? (
                <h2 className="text-base font-medium">{title}</h2>
              ) : null}
              {description ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        ) : null}
        {children}
      </div>
      {footer ? (
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 border-t border-border/60 px-3 py-2 sm:px-4">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

/** Ô nhập phẳng kiểu Google Forms: chỉ có gạch chân, sáng lên khi đang gõ. */
function LineInput({
  className,
  label,
  ...props
}: ComponentProps<"input"> & { label?: string }) {
  const id = useId();
  return (
    <div className="grid min-w-0 gap-1">
      {label ? (
        <label
          className="text-xs text-muted-foreground"
          htmlFor={props.id ?? id}
        >
          {label}
        </label>
      ) : null}
      <input
        autoComplete="off"
        id={props.id ?? id}
        {...props}
        className={cn(
          "h-11 w-full min-w-0 border-0 border-b border-border/70 bg-transparent px-0 text-base outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/40 focus-visible:border-b-2 focus-visible:border-gold aria-invalid:border-destructive md:text-sm",
          className,
        )}
      />
    </div>
  );
}

function LineTextarea({
  className,
  label,
  ...props
}: ComponentProps<"textarea"> & { label?: string }) {
  const id = useId();
  return (
    <div className="grid min-w-0 gap-1">
      {label ? (
        <label
          className="text-xs text-muted-foreground"
          htmlFor={props.id ?? id}
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={props.id ?? id}
        rows={2}
        {...props}
        className={cn(
          "min-h-11 w-full min-w-0 resize-none border-0 border-b border-border/70 bg-transparent px-0 py-2.5 text-base leading-7 outline-none transition-colors [field-sizing:content] placeholder:text-muted-foreground/70 hover:border-foreground/40 focus-visible:border-b-2 focus-visible:border-gold md:text-sm md:leading-6",
          className,
        )}
      />
    </div>
  );
}

/** Ô dịch: chữ mờ là bản tiếng Việt, để trống thì trang hiện tiếng Việt. */
function TranslationInput({
  document,
  k,
  label,
  locale,
  multiline = false,
  onChange,
  original,
  className,
}: {
  className?: string;
  document: ProfileDocument;
  k: string;
  label: string;
  locale: ProfileLocale;
  multiline?: boolean;
  onChange: ChangeHandler;
  original: string;
}) {
  if (locale === "vi") return null;
  const props = {
    "aria-label": label,
    className,
    label,
    maxLength: multiline ? articleLimits.translationLength : 300,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(setTranslation(document, locale, k, event.target.value), k),
    placeholder: original.trim() || "(chưa có bản tiếng Việt)",
    value: getTranslation(document, locale, k) ?? "",
  };
  return multiline ? <LineTextarea {...props} /> : <LineInput {...props} />;
}

function TranslationList({
  document,
  items,
  locale,
  onChange,
}: {
  document: ProfileDocument;
  items: {
    key: string;
    label: string;
    multiline?: boolean;
    original: string;
  }[];
  locale: ProfileLocale;
  onChange: ChangeHandler;
}) {
  if (!items.length)
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có nội dung tiếng Việt để dịch.
      </p>
    );
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <TranslationInput
          document={document}
          k={item.key}
          key={item.key}
          label={item.label}
          locale={locale}
          multiline={item.multiline}
          onChange={onChange}
          original={item.original}
        />
      ))}
    </div>
  );
}

function VisibilityToggle({
  label,
  onChange,
  visible,
}: {
  label: string;
  onChange: (visible: boolean) => void;
  visible: boolean;
}) {
  return (
    <IconButton
      aria-pressed={!visible}
      onClick={() => onChange(!visible)}
      size="icon-lg"
      tooltip={visible ? `Ẩn ${label} trên trang` : `Hiện ${label} trên trang`}
      type="button"
      variant="ghost"
    >
      {visible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
    </IconButton>
  );
}

const emptyArticle: ArticleBlock = {
  data: { facts: [], links: [], references: [], sections: [] },
  id: "article",
  type: "article",
  visible: true,
};

type CardBase = { active: boolean; id: CardId; onActivate: () => void };

function IdentityCard({
  document,
  invalid,
  locale,
  onChange,
  ...card
}: CardBase & {
  document: ProfileDocument;
  invalid: boolean;
  locale: ProfileLocale;
  onChange: ChangeHandler;
}) {
  const block = getProfileBlock(document, "identity");
  const setData = (patch: Partial<typeof block.data>, key?: string) =>
    onChange(
      updateBlock(document, "identity", (current) => ({
        ...current,
        data: { ...current.data, ...patch },
      })),
      key,
    );
  const translating = locale !== "vi";
  return (
    <FormCard {...card} accent>
      {translating ? (
        <TranslationList
          document={document}
          items={[
            {
              key: "identity.name",
              label: "Họ và tên",
              original: block.data.name,
            },
            {
              key: "identity.title",
              label: "Chức danh",
              original: block.data.title ?? "",
            },
            {
              key: "identity.company",
              label: "Đơn vị",
              original: block.data.company ?? "",
            },
            {
              key: "identity.location",
              label: "Địa điểm",
              original: block.data.location ?? "",
            },
          ]}
          locale={locale}
          onChange={onChange}
        />
      ) : (
        <div className="grid gap-4">
          <input
            aria-invalid={invalid || undefined}
            aria-label="Họ và tên"
            autoComplete="off"
            className="h-14 w-full min-w-0 border-0 border-b border-border/70 bg-transparent px-0 font-heading text-3xl leading-tight outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-foreground/40 focus-visible:border-b-2 focus-visible:border-gold aria-invalid:border-destructive sm:text-4xl"
            maxLength={100}
            onChange={(event) =>
              setData({ name: event.target.value }, "identity.name")
            }
            placeholder="Họ và tên, ví dụ Trần Công Hòa"
            value={block.data.name}
          />
          {invalid ? (
            <p className="text-sm text-destructive" role="alert">
              Vui lòng nhập họ và tên.
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <LineInput
              label="Chức danh"
              maxLength={120}
              onChange={(event) =>
                setData({ title: event.target.value || null }, "identity.title")
              }
              placeholder="Ví dụ: Chủ tịch Hội đồng quản trị"
              value={block.data.title ?? ""}
            />
            <LineInput
              label="Đơn vị"
              maxLength={120}
              onChange={(event) =>
                setData(
                  { company: event.target.value || null },
                  "identity.company",
                )
              }
              placeholder="Ví dụ: Tập đoàn Mai Hoa (MaiHoa Group)"
              value={block.data.company ?? ""}
            />
          </div>
          <LineInput
            label="Địa điểm"
            maxLength={120}
            onChange={(event) =>
              setData(
                { location: event.target.value || null },
                "identity.location",
              )
            }
            placeholder="Ví dụ: Hà Nội, Việt Nam"
            value={block.data.location ?? ""}
          />
        </div>
      )}
      {/* Ô chọn ảnh luôn nằm trong form (kể cả khi đang dịch) để tệp ảnh đã chọn được gửi khi lưu. */}
      <div hidden={translating}>
        <ProfileMediaPicker
          avatarUrl={block.data.avatarUrl}
          coverUrl={block.data.coverUrl}
          onAvatarChange={(avatarUrl) => setData({ avatarUrl })}
          onCoverChange={(coverUrl) => setData({ coverUrl })}
        />
      </div>
    </FormCard>
  );
}

function BioCard({
  document,
  locale,
  onChange,
  ...card
}: CardBase & {
  document: ProfileDocument;
  locale: ProfileLocale;
  onChange: ChangeHandler;
}) {
  const block = getProfileBlock(document, "bio");
  return (
    <FormCard
      {...card}
      actions={
        locale === "vi" ? (
          <VisibilityToggle
            label="phần giới thiệu"
            onChange={(visible) =>
              onChange(
                updateBlock(document, "bio", (current) => ({
                  ...current,
                  visible,
                })),
              )
            }
            visible={block.visible}
          />
        ) : null
      }
      description="Đoạn mở đầu ngay dưới tên, người quét mã đọc đầu tiên."
      muted={!block.visible}
      title="Giới thiệu"
    >
      {locale === "vi" ? (
        <LineTextarea
          aria-label="Giới thiệu"
          maxLength={700}
          onChange={(event) =>
            onChange(
              updateBlock(document, "bio", (current) => ({
                ...current,
                data: { text: event.target.value || null },
              })),
              "bio.text",
            )
          }
          placeholder="Hai, ba câu: bạn là ai, đang làm gì, điều muốn người khác nhớ. Ví dụ: Chủ tịch HĐQT Tập đoàn Mai Hoa, 20 năm phát triển vật liệu xanh cho gia đình Việt…"
          rows={3}
          value={block.data.text ?? ""}
        />
      ) : (
        <TranslationInput
          document={document}
          k="bio.text"
          label="Giới thiệu"
          locale={locale}
          multiline
          onChange={onChange}
          original={block.data.text ?? ""}
        />
      )}
    </FormCard>
  );
}

function FactsCard({
  article,
  document,
  locale,
  onAddFact,
  onChange,
  update,
  ...card
}: CardBase & {
  article: ArticleBlock;
  document: ProfileDocument;
  locale: ProfileLocale;
  onAddFact: (label?: string) => void;
  onChange: ChangeHandler;
  update: Updater;
}) {
  const facts = article.data.facts;
  const used = new Set(facts.map((fact) => fact.label.trim().toLowerCase()));
  const suggestions = suggestedFactLabels.filter(
    (label) => !used.has(label.toLowerCase()),
  );
  if (locale !== "vi")
    return (
      <FormCard {...card} title="Hộp thông tin">
        <TranslationList
          document={document}
          items={facts.flatMap((fact) => [
            {
              key: factKey(fact.id, "label"),
              label: "Tên dòng",
              original: fact.label,
            },
            {
              key: factKey(fact.id, "value"),
              label: fact.label || "Nội dung",
              original: fact.value,
            },
          ])}
          locale={locale}
          onChange={onChange}
        />
      </FormCard>
    );
  return (
    <FormCard
      {...card}
      description="Bảng tóm tắt cạnh ảnh chân dung. Dòng nào để trống sẽ không hiện."
      title="Hộp thông tin"
    >
      <div className="grid gap-1">
        {facts.map((fact, index) => (
          <div
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-0 sm:grid-cols-[11rem_minmax(0,1fr)_auto]"
            key={fact.id}
          >
            <div className="col-start-1 row-start-1 min-w-0">
              <LineInput
                aria-label={`Tên dòng ${index + 1}`}
                className="font-medium"
                id={`fact-label-${fact.id}`}
                maxLength={60}
                onChange={(event) =>
                  update(
                    (data) => ({
                      ...data,
                      facts: data.facts.map((item) =>
                        item.id === fact.id
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    }),
                    `fact.${fact.id}.label`,
                  )
                }
                placeholder="Tên dòng"
                value={fact.label}
              />
            </div>
            <div className="col-span-2 col-start-1 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              <LineTextarea
                aria-label={`Nội dung ${fact.label || `dòng ${index + 1}`}`}
                rows={1}
                id={`fact-value-${fact.id}`}
                maxLength={400}
                onChange={(event) =>
                  update(
                    (data) => ({
                      ...data,
                      facts: data.facts.map((item) =>
                        item.id === fact.id
                          ? { ...item, value: event.target.value }
                          : item,
                      ),
                    }),
                    `fact.${fact.id}.value`,
                  )
                }
                placeholder={factPlaceholder(fact.label)}
                value={fact.value}
              />
            </div>
            <IconButton
              className="col-start-2 row-start-1 mb-1 sm:col-start-3"
              onClick={() =>
                update((data) => ({
                  ...data,
                  facts: data.facts.filter((item) => item.id !== fact.id),
                }))
              }
              size="icon-sm"
              tooltip={`Xoá dòng ${fact.label || index + 1}`}
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" />
            </IconButton>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={facts.length >= articleLimits.facts}
          onClick={() => onAddFact()}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden="true" /> Thêm dòng
        </Button>
        {suggestions.map((label) => (
          <SuggestionChip
            disabled={facts.length >= articleLimits.facts}
            key={label}
            label={label}
            onClick={() => onAddFact(label)}
          />
        ))}
      </div>
    </FormCard>
  );
}

function SuggestionChip({
  disabled,
  label,
  onClick,
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="min-h-9 rounded-full border border-dashed border-border px-3 text-xs text-muted-foreground transition-colors hover:border-gold/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      + {label}
    </button>
  );
}

function SectionCard({
  document,
  imageRequest,
  index,
  length,
  locale,
  onChange,
  referenceCount,
  section,
  update,
  ...card
}: CardBase & {
  document: ProfileDocument;
  imageRequest: number;
  index: number;
  length: number;
  locale: ProfileLocale;
  onChange: ChangeHandler;
  referenceCount: number;
  section: ArticleSection;
  update: Updater;
}) {
  const setSection = (
    mutate: (section: ArticleSection) => ArticleSection,
    key?: string,
  ) =>
    update(
      (data) => ({
        ...data,
        sections: data.sections.map((item) =>
          item.id === section.id ? mutate(item) : item,
        ),
      }),
      key,
    );
  const filled = Boolean(section.body.trim() || section.images.length);
  const label = `Mục ${index + 1}`;

  if (locale !== "vi")
    return (
      <FormCard {...card} title={section.heading || label}>
        <TranslationList
          document={document}
          items={[
            {
              key: sectionKey(section.id, "heading"),
              label: "Tiêu đề mục",
              original: section.heading,
            },
            {
              key: sectionKey(section.id, "body"),
              label: "Nội dung",
              multiline: true,
              original: section.body,
            },
            ...section.images.map((image, imageIndex) => ({
              key: imageKey(image.id),
              label: `Chú thích ảnh ${imageIndex + 1}`,
              original: image.caption ?? "",
            })),
          ]}
          locale={locale}
          onChange={onChange}
        />
      </FormCard>
    );

  const footer = (
    <>
      {!filled ? (
        <span className="mr-auto pl-1 text-xs text-muted-foreground">
          Chưa có nội dung nên chưa hiện trên trang
        </span>
      ) : null}
      <IconButton
        disabled={index === 0}
        onClick={() =>
          update((data) => ({
            ...data,
            sections: moveItem(data.sections, index, -1),
          }))
        }
        size="icon-lg"
        tooltip="Đưa mục lên"
        type="button"
        variant="ghost"
      >
        <ArrowUp aria-hidden="true" />
      </IconButton>
      <IconButton
        disabled={index === length - 1}
        onClick={() =>
          update((data) => ({
            ...data,
            sections: moveItem(data.sections, index, 1),
          }))
        }
        size="icon-lg"
        tooltip="Đưa mục xuống"
        type="button"
        variant="ghost"
      >
        <ArrowDown aria-hidden="true" />
      </IconButton>
      <IconButton
        disabled={length >= articleLimits.sections}
        onClick={() =>
          update((data) => {
            const sections = [...data.sections];
            sections.splice(index + 1, 0, {
              ...section,
              id: createArticleItemId(),
              images: section.images.map((image) => ({
                ...image,
                id: createArticleItemId(),
              })),
            });
            return { ...data, sections };
          })
        }
        size="icon-lg"
        tooltip="Nhân bản mục"
        type="button"
        variant="ghost"
      >
        <Copy aria-hidden="true" />
      </IconButton>
      <IconButton
        onClick={() =>
          update((data) => ({
            ...data,
            sections: data.sections.filter((item) => item.id !== section.id),
          }))
        }
        size="icon-lg"
        tooltip="Xoá mục (bấm Hoàn tác nếu xoá nhầm)"
        type="button"
        variant="ghost"
      >
        <Trash2 aria-hidden="true" />
      </IconButton>
    </>
  );

  return (
    <FormCard {...card} footer={card.active ? footer : undefined}>
      <input
        aria-label={`Tiêu đề ${label.toLowerCase()}`}
        autoComplete="off"
        className="h-12 w-full min-w-0 border-0 border-b border-border/70 bg-transparent px-0 font-heading text-2xl outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-foreground/40 focus-visible:border-b-2 focus-visible:border-gold"
        id={`section-heading-${section.id}`}
        maxLength={120}
        onChange={(event) =>
          setSection(
            (current) => ({ ...current, heading: event.target.value }),
            `section.${section.id}.heading`,
          )
        }
        placeholder="Tiêu đề mục, ví dụ Sự nghiệp"
        value={section.heading}
      />
      {card.active ? (
        <>
          <RichBodyEditor
            id={`section-body-${section.id}`}
            label="Nội dung"
            onChange={(value) =>
              setSection(
                (current) => ({ ...current, body: value }),
                `section.${section.id}.body`,
              )
            }
            placeholder={sectionBodyPlaceholder(section.heading)}
            referenceCount={referenceCount}
            value={section.body}
          />
          <SectionImagesEditor
            openPickerSignal={imageRequest}
            section={section}
            setSection={setSection}
          />
        </>
      ) : (
        <button
          className="grid min-w-0 cursor-text gap-3 text-left"
          onClick={card.onActivate}
          type="button"
        >
          <span
            className={cn(
              "line-clamp-3 text-sm leading-6 whitespace-pre-line",
              section.body.trim()
                ? "text-foreground/85"
                : "text-muted-foreground/70",
            )}
          >
            {plainPreview(section.body) ||
              sectionBodyPlaceholder(section.heading)}
          </span>
          {section.images.length ? (
            <span className="flex flex-wrap gap-2">
              {section.images.map((image) => (
                <Image
                  alt=""
                  className="size-14 rounded-md object-cover"
                  height={56}
                  key={image.id}
                  src={image.url}
                  unoptimized
                  width={56}
                />
              ))}
            </span>
          ) : null}
        </button>
      )}
    </FormCard>
  );
}

/** Bỏ ký hiệu định dạng (**đậm**, [liên kết](...), [1], ###) khi xem gọn một mục. */
function plainPreview(body: string) {
  return body
    .replace(/\[([^\]]+)\]\((?:https?:|mailto:|tel:)[^)]*\)/g, "$1")
    .replace(/\[\d+\]/g, "")
    .replace(/\*\*|''/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^-\s+/gm, "• ")
    .trim();
}

/** Thẻ đang không chọn chỉ hiện danh sách gọn; bấm vào để mở phần sửa đầy đủ. */
function CompactList({
  items,
  onOpen,
  title,
}: {
  items: string[];
  onOpen: () => void;
  title: string;
}) {
  const shown = items.slice(0, 6);
  return (
    <button
      className="grid min-w-0 cursor-pointer gap-3 text-left"
      onClick={onOpen}
      type="button"
    >
      <span className="text-base font-medium">
        {title}{" "}
        <span className="text-sm font-normal text-muted-foreground tabular-nums">
          ({items.length})
        </span>
      </span>
      <span className="grid min-w-0 gap-1.5">
        {shown.map((item, index) => (
          <span
            className="truncate text-sm leading-6 text-foreground/80"
            key={index}
          >
            {item}
          </span>
        ))}
        {items.length > shown.length ? (
          <span className="text-sm text-muted-foreground">
            và {items.length - shown.length} mục nữa
          </span>
        ) : null}
      </span>
      <span className="text-xs text-gold">Bấm để sửa, thêm hoặc sắp xếp</span>
    </button>
  );
}

function AddSectionStrip({
  disabled,
  onAdd,
  usedHeadings,
}: {
  disabled: boolean;
  onAdd: (heading?: string) => void;
  usedHeadings: string[];
}) {
  const used = new Set(usedHeadings.map((heading) => heading.trim()));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border/80 p-3">
      <Button
        disabled={disabled}
        onClick={() => onAdd()}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Plus aria-hidden="true" /> Thêm mục
      </Button>
      {suggestedSectionHeadings
        .filter((heading) => !used.has(heading))
        .map((heading) => (
          <SuggestionChip
            disabled={disabled}
            key={heading}
            label={heading}
            onClick={() => onAdd(heading)}
          />
        ))}
    </div>
  );
}

function ContactCard({
  document,
  invalid,
  onChange,
  translating,
  ...card
}: CardBase & {
  document: ProfileDocument;
  invalid: boolean;
  onChange: ChangeHandler;
  translating: boolean;
}) {
  const block = getProfileBlock(document, "contact");
  const set = (patch: Partial<typeof block.data>, key: string) =>
    onChange(
      updateBlock(document, "contact", (current) => ({
        ...current,
        data: { ...current.data, ...patch },
      })),
      key,
    );
  return (
    <FormCard
      {...card}
      actions={
        <VisibilityToggle
          label="thông tin liên hệ"
          onChange={(visible) =>
            onChange(
              updateBlock(document, "contact", (current) => ({
                ...current,
                visible,
              })),
            )
          }
          visible={block.visible}
        />
      }
      description={
        translating
          ? "Dùng chung cho mọi ngôn ngữ."
          : "Hiện ở nút Gọi, Lưu liên hệ và trong hộp thông tin."
      }
      muted={!block.visible}
      title="Liên hệ"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <LineInput
          aria-label="Điện thoại"
          inputMode="tel"
          label="Điện thoại"
          maxLength={40}
          onChange={(event) =>
            set({ phone: event.target.value || null }, "contact.phone")
          }
          placeholder="Ví dụ: +84 912 345 678"
          type="tel"
          value={block.data.phone ?? ""}
        />
        <div className="grid gap-1">
          <LineInput
            aria-invalid={invalid || undefined}
            aria-label="Email"
            label="Email"
            maxLength={254}
            onChange={(event) =>
              set(
                { contactEmail: event.target.value || null },
                "contact.contactEmail",
              )
            }
            placeholder="Ví dụ: ten@congty.vn"
            type="email"
            value={block.data.contactEmail ?? ""}
          />
          {invalid ? (
            <p className="text-sm text-destructive" role="alert">
              Vui lòng nhập email hợp lệ.
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <LineInput
            aria-label="Website"
            inputMode="url"
            label="Website"
            maxLength={240}
            onChange={(event) =>
              set({ website: event.target.value || null }, "contact.website")
            }
            placeholder="Ví dụ: https://congty.vn"
            type="url"
            value={block.data.website ?? ""}
          />
        </div>
      </div>
    </FormCard>
  );
}

function SocialCard({
  document,
  onChange,
  translating,
  ...card
}: CardBase & {
  document: ProfileDocument;
  onChange: ChangeHandler;
  translating: boolean;
}) {
  const block = getProfileBlock(document, "social");
  const [showAll, setShowAll] = useState(false);
  const shown = socialPlatforms.filter(
    (platform) =>
      showAll ||
      platform.group === "primary" ||
      Boolean(block.data[platform.field]),
  );
  return (
    <FormCard
      {...card}
      actions={
        <VisibilityToggle
          label="mạng xã hội"
          onChange={(visible) =>
            onChange(
              updateBlock(document, "social", (current) => ({
                ...current,
                visible,
              })),
            )
          }
          visible={block.visible}
        />
      }
      description={
        translating
          ? "Dùng chung cho mọi ngôn ngữ."
          : "Điền trang nào thì trang đó hiện thành nút bấm."
      }
      muted={!block.visible}
      title="Mạng xã hội"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((platform) => (
          <div className="flex min-w-0 items-end gap-3" key={platform.field}>
            <Image
              alt=""
              className="mb-3 size-5 shrink-0"
              height={20}
              src={platform.iconPath}
              unoptimized
              width={20}
            />
            <div className="min-w-0 flex-1">
              <LineInput
                aria-label={platform.label}
                label={platform.label}
                maxLength={platform.maxLength}
                onChange={(event) =>
                  onChange(
                    updateBlock(document, "social", (current) => ({
                      ...current,
                      data: {
                        ...current.data,
                        [platform.field]: event.target.value || null,
                      },
                    })),
                    `social.${platform.field}`,
                  )
                }
                placeholder={platform.placeholder}
                value={block.data[platform.field] ?? ""}
              />
            </div>
          </div>
        ))}
      </div>
      {!showAll && shown.length < socialPlatforms.length ? (
        <Button
          className="w-fit"
          onClick={() => setShowAll(true)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Plus aria-hidden="true" /> Thêm mạng khác (
          {socialPlatforms.length - shown.length})
        </Button>
      ) : null}
    </FormCard>
  );
}

function FloatingToolbar({
  onAddFact,
  onAddImage,
  onAddLink,
  onAddReference,
  onAddSection,
  top,
}: {
  onAddFact: () => void;
  onAddImage: () => void;
  onAddLink: (kind: ArticleLinkKind) => void;
  onAddReference: () => void;
  onAddSection: () => void;
  top: number;
}) {
  const tools = [
    { icon: Plus, label: "Thêm mục", onClick: onAddSection },
    { icon: ImagePlus, label: "Thêm ảnh", onClick: onAddImage },
    { icon: ListPlus, label: "Thêm dòng thông tin", onClick: onAddFact },
    { icon: Quote, label: "Thêm nguồn tham khảo", onClick: onAddReference },
    {
      icon: Link2,
      label: "Thêm liên kết bài báo",
      onClick: () => onAddLink("news"),
    },
    { icon: Video, label: "Thêm video", onClick: () => onAddLink("video") },
  ];
  return (
    <div
      aria-label="Thêm vào hồ sơ"
      className="fixed inset-x-0 bottom-3 z-30 mx-auto flex w-fit items-center gap-0.5 rounded-full bg-card p-1 shadow-[0_8px_28px_rgb(0_0_0/0.35)] ring-1 ring-border/70 lg:absolute lg:inset-x-auto lg:bottom-auto lg:left-[calc(100%+0.75rem)] lg:mx-0 lg:flex-col lg:rounded-xl lg:transition-[top] lg:duration-200 lg:[top:var(--toolbar-top)]"
      role="toolbar"
      style={{ "--toolbar-top": `${top}px` } as CSSProperties}
    >
      {tools.map(({ icon: Icon, label, onClick }) => (
        <IconButton
          key={label}
          onClick={onClick}
          onPointerDown={(event) => event.preventDefault()}
          size="icon-lg"
          tooltip={label}
          type="button"
          variant="ghost"
        >
          <Icon aria-hidden="true" />
        </IconButton>
      ))}
    </div>
  );
}
