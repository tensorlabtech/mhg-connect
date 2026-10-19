"use client";

import {
  ArrowDown,
  ArrowUp,
  Bold,
  Heading,
  ImagePlus,
  Link2,
  List,
  LoaderCircle,
  Plus,
  Quote,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { cn } from "cn";

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
import { Button, IconButton } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  createArticleItemId,
  factKey,
  getArticleBlock,
  getTranslation,
  imageKey,
  moveItem,
  linkKey,
  referenceKey,
  removeArticleBlock,
  sectionKey,
  setTranslation,
  updateArticleBlock,
} from "@/features/profile/profile-article";
import { uploadArticleImageAction } from "@/features/profile/profile-article-actions";
import {
  BlockVisibilityButton,
  InspectorHeading,
} from "@/features/profile/profile-builder-inspector-fields";
import {
  articleLimits,
  normalizeLinkUrl,
} from "@/features/profile/profile-document-schema";
import type {
  ArticleBlock,
  ArticleImageAlign,
  ArticleLinkKind,
  ArticleSection,
  ProfileDocument,
  ProfileLocale,
} from "@/features/profile/profile-document-types";
import { parseVideoEmbed } from "@/features/profile/profile-video";
import { TranslationField } from "@/features/profile/profile-builder-translation-field";
import { profileLocaleLabels } from "@/features/profile/profile-i18n";

type ChangeHandler = (document: ProfileDocument, coalesceKey?: string) => void;

const sectionTemplates = [
  "Xuất thân và giáo dục",
  "Sự nghiệp",
  "Hoạt động",
  "Thành tựu và khen thưởng",
  "Đời tư",
];

const linkKindOptions: { id: ArticleLinkKind; label: string }[] = [
  { id: "news", label: "Báo" },
  { id: "article", label: "Bài viết" },
  { id: "video", label: "Video" },
  { id: "website", label: "Trang web" },
];

const alignOptions: { id: ArticleImageAlign; label: string }[] = [
  { id: "left", label: "Trái" },
  { id: "center", label: "Giữa" },
  { id: "right", label: "Phải" },
];

export function ArticleInspector({
  document,
  locale,
  onBackToList,
  onChange,
}: {
  document: ProfileDocument;
  locale: ProfileLocale;
  onBackToList?: () => void;
  onChange: ChangeHandler;
}) {
  const block = getArticleBlock(document);
  if (!block) return null;

  const update = (
    mutate: (data: ArticleBlock["data"]) => ArticleBlock["data"],
    key?: string,
  ) =>
    onChange(
      updateArticleBlock(document, (current) => ({
        ...current,
        data: mutate(current.data),
      })),
      key,
    );

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8">
      <InspectorHeading
        onBack={onBackToList}
        title="Bài viết"
        visibility={
          <BlockVisibilityButton
            label="Bài viết"
            onChange={(visible) =>
              onChange(
                updateArticleBlock(document, (current) => ({
                  ...current,
                  visible,
                })),
              )
            }
            visible={block.visible}
          />
        }
      />
      {locale === "vi" ? (
        <>
          <FactsEditor block={block} update={update} />
          <SectionsEditor block={block} update={update} />
          <ReferencesEditor block={block} update={update} />
          <ExternalLinksEditor block={block} update={update} />
          <RemoveArticleButton
            onConfirm={() => onChange(removeArticleBlock(document))}
          />
        </>
      ) : (
        <ArticleTranslationEditor
          block={block}
          document={document}
          locale={locale}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function GroupHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function RowTools({
  index,
  label,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  label: string;
  length: number;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <IconButton
        disabled={index === 0}
        onClick={() => onMove(-1)}
        size="icon-sm"
        tooltip={`Đưa ${label} lên`}
        type="button"
        variant="ghost"
      >
        <ArrowUp aria-hidden="true" />
      </IconButton>
      <IconButton
        disabled={index === length - 1}
        onClick={() => onMove(1)}
        size="icon-sm"
        tooltip={`Đưa ${label} xuống`}
        type="button"
        variant="ghost"
      >
        <ArrowDown aria-hidden="true" />
      </IconButton>
      <IconButton
        onClick={onRemove}
        size="icon-sm"
        tooltip={`Xoá ${label}`}
        type="button"
        variant="ghost"
      >
        <Trash2 aria-hidden="true" />
      </IconButton>
    </div>
  );
}

export type Updater = (
  mutate: (data: ArticleBlock["data"]) => ArticleBlock["data"],
  key?: string,
) => void;

function FactsEditor({
  block,
  update,
}: {
  block: ArticleBlock;
  update: Updater;
}) {
  const facts = block.data.facts;
  return (
    <section
      className="grid grid-cols-[minmax(0,1fr)] gap-4"
      aria-label="Hộp thông tin"
    >
      <GroupHeading
        description="Bảng thông tin nhanh bên cạnh ảnh chân dung, ví dụ Sinh, Quê quán, Học vấn, Chức vụ. Dòng thiếu tên hoặc nội dung sẽ tự ẩn."
        title="Hộp thông tin"
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {facts.map((fact, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-lg bg-muted/40 p-2"
            key={fact.id}
          >
            <div className="flex items-center gap-1">
              <Input
                aria-label={`Tên dòng ${index + 1}`}
                className="h-control-sm"
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
                placeholder="Tên dòng, ví dụ Sinh"
                value={fact.label}
              />
              <RowTools
                index={index}
                label="dòng"
                length={facts.length}
                onMove={(offset) =>
                  update((data) => ({
                    ...data,
                    facts: moveItem(data.facts, index, offset),
                  }))
                }
                onRemove={() =>
                  update((data) => ({
                    ...data,
                    facts: data.facts.filter((item) => item.id !== fact.id),
                  }))
                }
              />
            </div>
            <Textarea
              aria-label={`Nội dung dòng ${fact.label || index + 1}`}
              className="min-h-0"
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
              placeholder="Nội dung, có thể chèn [liên kết](https://...)"
              rows={2}
              value={fact.value}
            />
          </div>
        ))}
      </div>
      <Button
        className="w-fit"
        disabled={facts.length >= articleLimits.facts}
        onClick={() =>
          update((data) => ({
            ...data,
            facts: [
              ...data.facts,
              { id: createArticleItemId(), label: "", value: "" },
            ],
          }))
        }
        size="sm"
        type="button"
        variant="secondary"
      >
        <Plus aria-hidden="true" /> Thêm dòng
      </Button>
    </section>
  );
}

function SectionsEditor({
  block,
  update,
}: {
  block: ArticleBlock;
  update: Updater;
}) {
  const sections = block.data.sections;
  const referenceCount = block.data.references.length;
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  function addSection(heading = "") {
    const id = createArticleItemId();
    update((data) => ({
      ...data,
      sections: [...data.sections, { body: "", heading, id, images: [] }],
    }));
    setOpenId(id);
  }

  const usedHeadings = new Set(sections.map((section) => section.heading));
  return (
    <section
      className="grid grid-cols-[minmax(0,1fr)] gap-4"
      aria-label="Các mục bài viết"
    >
      <GroupHeading
        description="Mỗi mục có tiêu đề, đoạn văn có liên kết và ảnh minh hoạ đặt trái, giữa hoặc phải."
        title="Các mục"
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {sections.map((section, index) => (
          <SectionCard
            index={index}
            key={section.id}
            length={sections.length}
            onToggle={() =>
              setOpenId((current) =>
                current === section.id ? null : section.id,
              )
            }
            open={openId === section.id}
            referenceCount={referenceCount}
            section={section}
            update={update}
          />
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
        <Button
          className="w-fit"
          disabled={sections.length >= articleLimits.sections}
          onClick={() => addSection()}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden="true" /> Thêm mục
        </Button>
        <div className="flex flex-wrap gap-1.5">
          {sectionTemplates
            .filter((heading) => !usedHeadings.has(heading))
            .map((heading) => (
              <button
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50"
                disabled={sections.length >= articleLimits.sections}
                key={heading}
                onClick={() => addSection(heading)}
                type="button"
              >
                + {heading}
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}

function SectionCard({
  index,
  length,
  onToggle,
  open,
  referenceCount,
  section,
  update,
}: {
  index: number;
  length: number;
  onToggle: () => void;
  open: boolean;
  referenceCount: number;
  section: ArticleSection;
  update: Updater;
}) {
  const bodyId = useId();
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

  return (
    <div className="rounded-lg bg-muted/40">
      <div className="flex min-h-11 items-center gap-1 pr-1">
        <button
          aria-expanded={open}
          className="min-h-11 min-w-0 flex-1 truncate rounded-md px-3 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring/60"
          onClick={onToggle}
          type="button"
        >
          <span className="mr-2 text-muted-foreground tabular-nums">
            {index + 1}.
          </span>
          {section.heading || "Mục chưa đặt tên"}
        </button>
        <RowTools
          index={index}
          label="mục"
          length={length}
          onMove={(offset) =>
            update((data) => ({
              ...data,
              sections: moveItem(data.sections, index, offset),
            }))
          }
          onRemove={() =>
            update((data) => ({
              ...data,
              sections: data.sections.filter((item) => item.id !== section.id),
            }))
          }
        />
      </div>
      {open ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-3 pt-1 pb-4">
          <Field>
            <FieldLabel htmlFor={`${bodyId}-heading`}>Tiêu đề mục</FieldLabel>
            <Input
              id={`${bodyId}-heading`}
              maxLength={120}
              onChange={(event) =>
                setSection(
                  (current) => ({ ...current, heading: event.target.value }),
                  `section.${section.id}.heading`,
                )
              }
              placeholder="Ví dụ: Sự nghiệp"
              value={section.heading}
            />
          </Field>
          <RichBodyEditor
            id={`${bodyId}-body`}
            onChange={(value) =>
              setSection(
                (current) => ({ ...current, body: value }),
                `section.${section.id}.body`,
              )
            }
            referenceCount={referenceCount}
            value={section.body}
          />
          <SectionImagesEditor section={section} setSection={setSection} />
        </div>
      ) : null}
    </div>
  );
}

export function RichBodyEditor({
  id,
  label = "Nội dung",
  onChange,
  placeholder = "Viết nội dung mục. Dòng trống để sang đoạn mới.",
  referenceCount,
  showSyntaxHelp = true,
  value,
}: {
  id: string;
  label?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  referenceCount: number;
  showSyntaxHelp?: boolean;
  value: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<[number, number]>([value.length, value.length]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  function rememberSelection() {
    const element = textareaRef.current;
    if (!element) return;
    selectionRef.current = [element.selectionStart, element.selectionEnd];
  }

  function replaceSelection(
    build: (selected: string) => { cursorOffset?: number; text: string },
  ) {
    const [start, end] = selectionRef.current;
    const selected = value.slice(start, end);
    const { cursorOffset, text } = build(selected);
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next.slice(0, articleLimits.bodyLength));
    const cursor = start + (cursorOffset ?? text.length);
    requestAnimationFrame(() => {
      const element = textareaRef.current;
      if (!element) return;
      element.focus();
      element.setSelectionRange(cursor, cursor);
      selectionRef.current = [cursor, cursor];
    });
  }

  function prefixLine(prefix: string, placeholder: string) {
    replaceSelection((selected) => {
      const [start] = selectionRef.current;
      const atLineStart = start === 0 || value[start - 1] === "\n";
      const lead = atLineStart ? "" : "\n";
      const content = selected || placeholder;
      return {
        text: `${lead}${content
          .split("\n")
          .map((line) => `${prefix}${line}`)
          .join("\n")}`,
      };
    });
  }

  function openLinkForm() {
    rememberSelection();
    const [start, end] = selectionRef.current;
    setLinkText(value.slice(start, end));
    setLinkUrl("");
    setLinkOpen(true);
  }

  function insertLink() {
    const url = linkUrl.trim();
    if (!url) return;
    const href = /^(https?:\/\/|mailto:|tel:)/i.test(url)
      ? url
      : `https://${url}`;
    let readableHref = href;
    try {
      const decoded = decodeURI(href);
      if (!/[\s()]/.test(decoded)) readableHref = decoded;
    } catch {
      readableHref = href;
    }
    const text = (linkText.trim() || readableHref).replace(/[[\]]/g, "");
    replaceSelection(() => ({ text: `[${text}](${readableHref})` }));
    setLinkOpen(false);
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex flex-wrap items-center gap-1">
        <Popover onOpenChange={setLinkOpen} open={linkOpen}>
          <PopoverTrigger asChild>
            <Button
              onClick={openLinkForm}
              onMouseDown={(event) => event.preventDefault()}
              size="xs"
              type="button"
              variant="secondary"
            >
              <Link2 aria-hidden="true" /> Liên kết
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="grid w-72 gap-3">
            <Field>
              <FieldLabel htmlFor={`${id}-link-text`}>Chữ hiển thị</FieldLabel>
              <Input
                id={`${id}-link-text`}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                value={linkText}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-link-url`}>Đường dẫn</FieldLabel>
              <Input
                autoFocus
                id={`${id}-link-url`}
                inputMode="url"
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    insertLink();
                  }
                }}
                placeholder="https://..."
                value={linkUrl}
              />
            </Field>
            <Button
              disabled={!linkUrl.trim()}
              onClick={insertLink}
              size="sm"
              type="button"
            >
              Chèn liên kết
            </Button>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => {
            rememberSelection();
            replaceSelection((selected) =>
              selected
                ? { text: `**${selected}**` }
                : { cursorOffset: 2, text: "****" },
            );
          }}
          onMouseDown={(event) => event.preventDefault()}
          size="xs"
          type="button"
          variant="secondary"
        >
          <Bold aria-hidden="true" /> Đậm
        </Button>
        <Button
          onClick={() => {
            rememberSelection();
            prefixLine("### ", "Tiêu đề phụ");
          }}
          onMouseDown={(event) => event.preventDefault()}
          size="xs"
          type="button"
          variant="secondary"
        >
          <Heading aria-hidden="true" /> Tiêu đề phụ
        </Button>
        <Button
          onClick={() => {
            rememberSelection();
            prefixLine("- ", "Ý thứ nhất");
          }}
          onMouseDown={(event) => event.preventDefault()}
          size="xs"
          type="button"
          variant="secondary"
        >
          <List aria-hidden="true" /> Danh sách
        </Button>
        {referenceCount ? (
          <Button
            onClick={() => {
              rememberSelection();
              replaceSelection(() => ({ text: `[${referenceCount}]` }));
            }}
            onMouseDown={(event) => event.preventDefault()}
            size="xs"
            title="Chèn số nguồn tham khảo mới nhất. Sửa số để trỏ tới nguồn khác."
            type="button"
            variant="secondary"
          >
            <Quote aria-hidden="true" /> Trích nguồn [{referenceCount}]
          </Button>
        ) : null}
      </div>
      <Textarea
        id={id}
        maxLength={articleLimits.bodyLength}
        onBlur={rememberSelection}
        onChange={(event) => onChange(event.target.value)}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        placeholder={placeholder}
        ref={textareaRef}
        rows={9}
        value={value}
      />
      <p
        className="text-xs leading-5 text-muted-foreground"
        hidden={!showSyntaxHelp}
      >
        Liên kết: [chữ](https://...) · Đậm: **chữ** · Nghiêng:
        &apos;&apos;chữ&apos;&apos; · Trích nguồn: [1] · Tiêu đề phụ: ### · Danh
        sách: -
      </p>
    </Field>
  );
}

export function SectionImagesEditor({
  openPickerSignal = 0,
  section,
  setSection,
}: {
  /** Tăng số này để mở hộp chọn ảnh từ bên ngoài (thanh công cụ nổi). */
  openPickerSignal?: number;
  section: ArticleSection;
  setSection: (
    mutate: (section: ArticleSection) => ArticleSection,
    key?: string,
  ) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pastedUrl, setPastedUrl] = useState("");
  const full = section.images.length >= articleLimits.imagesPerSection;
  const lastSignal = useRef(openPickerSignal);
  useEffect(() => {
    if (openPickerSignal === lastSignal.current) return;
    lastSignal.current = openPickerSignal;
    inputRef.current?.click();
  }, [openPickerSignal]);

  function addImage(url: string) {
    setSection((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          align: current.images.length % 2 ? "left" : "right",
          caption: null,
          id: createArticleItemId(),
          url,
        },
      ],
    }));
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("image", file);
      const result = await uploadArticleImageAction(formData);
      if (result.success) addImage(result.url);
      else setError(result.error);
    } catch {
      setError("Chưa thể tải ảnh lên. Hãy thử lại.");
    } finally {
      setUploading(false);
    }
  }

  function addPastedUrl() {
    const url = pastedUrl.trim();
    if (!/^https:\/\/\S+$/i.test(url)) {
      setError("Liên kết ảnh phải bắt đầu bằng https://");
      return;
    }
    setError(null);
    addImage(url);
    setPastedUrl("");
    setPasteOpen(false);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
      <p className="text-sm font-medium">Ảnh trong mục</p>
      {section.images.map((image, index) => (
        <div
          className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-md bg-background/60 p-2"
          key={image.id}
        >
          <div className="flex items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="size-14 shrink-0 rounded-sm bg-muted object-cover"
              src={image.url}
            />
            <div
              aria-label="Vị trí ảnh"
              className="flex flex-1 flex-wrap gap-1"
              role="radiogroup"
            >
              {alignOptions.map((option) => (
                <button
                  aria-checked={image.align === option.id}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                    image.align === option.id
                      ? "bg-secondary text-foreground ring-1 ring-gold/70"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                  key={option.id}
                  onClick={() =>
                    setSection((current) => ({
                      ...current,
                      images: current.images.map((item) =>
                        item.id === image.id
                          ? { ...item, align: option.id }
                          : item,
                      ),
                    }))
                  }
                  role="radio"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <RowTools
              index={index}
              label="ảnh"
              length={section.images.length}
              onMove={(offset) =>
                setSection((current) => ({
                  ...current,
                  images: moveItem(current.images, index, offset),
                }))
              }
              onRemove={() =>
                setSection((current) => ({
                  ...current,
                  images: current.images.filter((item) => item.id !== image.id),
                }))
              }
            />
          </div>
          <Input
            aria-label="Chú thích ảnh"
            className="h-control-sm"
            maxLength={300}
            onChange={(event) =>
              setSection(
                (current) => ({
                  ...current,
                  images: current.images.map((item) =>
                    item.id === image.id
                      ? { ...item, caption: event.target.value || null }
                      : item,
                  ),
                }),
                `image.${image.id}.caption`,
              )
            }
            placeholder="Chú thích dưới ảnh"
            value={image.caption ?? ""}
          />
        </div>
      ))}
      <input
        accept="image/jpeg,image/png,image/webp"
        aria-label="Chọn ảnh cho mục"
        className="sr-only"
        onChange={handleFile}
        ref={inputRef}
        type="file"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={uploading || full}
          onClick={() => inputRef.current?.click()}
          size="sm"
          type="button"
          variant="secondary"
        >
          {uploading ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {uploading ? "Đang tải ảnh…" : "Tải ảnh lên"}
        </Button>
        <Popover onOpenChange={setPasteOpen} open={pasteOpen}>
          <PopoverTrigger asChild>
            <Button disabled={full} size="sm" type="button" variant="ghost">
              <Link2 aria-hidden="true" /> Dán liên kết ảnh
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="grid w-72 gap-3">
            <Input
              aria-label="Liên kết ảnh"
              autoFocus
              onChange={(event) => setPastedUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPastedUrl();
                }
              }}
              placeholder="https://.../anh.jpg"
              value={pastedUrl}
            />
            <Button onClick={addPastedUrl} size="sm" type="button">
              Thêm ảnh
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <p
        className={cn(
          "text-xs leading-5",
          error ? "text-destructive" : "text-muted-foreground",
        )}
        role={error ? "alert" : undefined}
      >
        {error ??
          `JPG, PNG hoặc WebP, tối đa 5 MB. Tối đa ${articleLimits.imagesPerSection} ảnh mỗi mục.`}
      </p>
    </div>
  );
}

export function ReferencesEditor({
  block,
  update,
}: {
  block: ArticleBlock;
  update: Updater;
}) {
  const references = block.data.references;
  return (
    <section
      className="grid grid-cols-[minmax(0,1fr)] gap-4"
      aria-label="Nguồn tham khảo"
    >
      <GroupHeading
        description="Bài báo, trang web dẫn chứng. Gõ [1], [2]… trong nội dung để trỏ tới nguồn theo số thứ tự."
        title="Nguồn tham khảo"
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {references.map((reference, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-lg bg-muted/40 p-2"
            key={reference.id}
          >
            <div className="flex items-center gap-1">
              <span className="w-7 shrink-0 text-center text-xs font-medium text-muted-foreground tabular-nums">
                [{index + 1}]
              </span>
              <Input
                aria-label={`Tiêu đề nguồn ${index + 1}`}
                className="h-control-sm"
                maxLength={300}
                onChange={(event) =>
                  update(
                    (data) => ({
                      ...data,
                      references: data.references.map((item) =>
                        item.id === reference.id
                          ? { ...item, title: event.target.value }
                          : item,
                      ),
                    }),
                    `ref.${reference.id}.title`,
                  )
                }
                placeholder="Tiêu đề bài viết"
                value={reference.title}
              />
              <RowTools
                index={index}
                label="nguồn"
                length={references.length}
                onMove={(offset) =>
                  update((data) => ({
                    ...data,
                    references: moveItem(data.references, index, offset),
                  }))
                }
                onRemove={() =>
                  update((data) => ({
                    ...data,
                    references: data.references.filter(
                      (item) => item.id !== reference.id,
                    ),
                  }))
                }
              />
            </div>
            <Input
              aria-label={`Đường dẫn nguồn ${index + 1}`}
              className="h-control-sm"
              inputMode="url"
              maxLength={600}
              onChange={(event) =>
                update(
                  (data) => ({
                    ...data,
                    references: data.references.map((item) =>
                      item.id === reference.id
                        ? { ...item, url: event.target.value || null }
                        : item,
                    ),
                  }),
                  `ref.${reference.id}.url`,
                )
              }
              placeholder="https://..."
              value={reference.url ?? ""}
            />
            <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
              <Input
                aria-label={`Tên báo, trang ${index + 1}`}
                className="h-control-sm"
                maxLength={120}
                onChange={(event) =>
                  update(
                    (data) => ({
                      ...data,
                      references: data.references.map((item) =>
                        item.id === reference.id
                          ? { ...item, source: event.target.value || null }
                          : item,
                      ),
                    }),
                    `ref.${reference.id}.source`,
                  )
                }
                placeholder="Tên báo, ví dụ VnExpress"
                value={reference.source ?? ""}
              />
              <Input
                aria-label={`Ngày ${index + 1}`}
                className="h-control-sm"
                maxLength={40}
                onChange={(event) =>
                  update(
                    (data) => ({
                      ...data,
                      references: data.references.map((item) =>
                        item.id === reference.id
                          ? { ...item, date: event.target.value || null }
                          : item,
                      ),
                    }),
                    `ref.${reference.id}.date`,
                  )
                }
                placeholder="12/10/2026"
                value={reference.date ?? ""}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        className="w-fit"
        disabled={references.length >= articleLimits.references}
        onClick={() =>
          update((data) => ({
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
          }))
        }
        size="sm"
        type="button"
        variant="secondary"
      >
        <Plus aria-hidden="true" /> Thêm nguồn
      </Button>
    </section>
  );
}

export function ExternalLinksEditor({
  block,
  update,
}: {
  block: ArticleBlock;
  update: Updater;
}) {
  const links = block.data.links ?? [];
  const setLinks = (
    mutate: (items: typeof links) => typeof links,
    key?: string,
  ) => update((data) => ({ ...data, links: mutate(data.links ?? []) }), key);

  return (
    <section
      className="grid grid-cols-[minmax(0,1fr)] gap-4"
      aria-label="Liên kết ngoài"
    >
      <GroupHeading
        description="Báo, bài viết, video, trang web nói về bạn. Link YouTube hoặc Vimeo chọn loại Video sẽ phát ngay trên trang."
        title="Liên kết ngoài"
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {links.map((link, index) => {
          const embeddable =
            link.kind === "video" && Boolean(parseVideoEmbed(link.url));
          return (
            <div
              className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-lg bg-muted/40 p-2"
              key={link.id}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Liên kết {index + 1}
                </span>
                <RowTools
                  index={index}
                  label="liên kết"
                  length={links.length}
                  onMove={(offset) =>
                    setLinks((items) => moveItem(items, index, offset))
                  }
                  onRemove={() =>
                    setLinks((items) =>
                      items.filter((item) => item.id !== link.id),
                    )
                  }
                />
              </div>
              <div
                aria-label="Loại liên kết"
                className="grid grid-cols-4 gap-1"
                role="radiogroup"
              >
                {linkKindOptions.map((option) => (
                  <button
                    aria-checked={link.kind === option.id}
                    className={cn(
                      "truncate rounded-md px-1 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                      link.kind === option.id
                        ? "bg-secondary text-foreground ring-1 ring-gold/70"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                    key={option.id}
                    onClick={() =>
                      setLinks((items) =>
                        items.map((item) =>
                          item.id === link.id
                            ? { ...item, kind: option.id }
                            : item,
                        ),
                      )
                    }
                    role="radio"
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Input
                aria-label={`Đường dẫn liên kết ${index + 1}`}
                className="h-control-sm"
                inputMode="url"
                maxLength={600}
                onBlur={(event) => {
                  const normalized = normalizeLinkUrl(event.target.value);
                  if (normalized !== link.url)
                    setLinks((items) =>
                      items.map((item) =>
                        item.id === link.id
                          ? { ...item, url: normalized }
                          : item,
                      ),
                    );
                }}
                onChange={(event) => {
                  const url = event.target.value;
                  setLinks(
                    (items) =>
                      items.map((item) =>
                        item.id === link.id
                          ? {
                              ...item,
                              kind:
                                parseVideoEmbed(normalizeLinkUrl(url)) &&
                                item.kind !== "video"
                                  ? "video"
                                  : item.kind,
                              url,
                            }
                          : item,
                      ),
                    `link.${link.id}.url`,
                  );
                }}
                placeholder="https://..."
                value={link.url}
              />
              <Input
                aria-label={`Tiêu đề liên kết ${index + 1}`}
                className="h-control-sm"
                maxLength={300}
                onChange={(event) =>
                  setLinks(
                    (items) =>
                      items.map((item) =>
                        item.id === link.id
                          ? { ...item, title: event.target.value }
                          : item,
                      ),
                    `link.${link.id}.title`,
                  )
                }
                placeholder="Tiêu đề bài báo hoặc video"
                value={link.title}
              />
              <Input
                aria-label={`Nguồn liên kết ${index + 1}`}
                className="h-control-sm"
                maxLength={120}
                onChange={(event) =>
                  setLinks(
                    (items) =>
                      items.map((item) =>
                        item.id === link.id
                          ? { ...item, source: event.target.value || null }
                          : item,
                      ),
                    `link.${link.id}.source`,
                  )
                }
                placeholder="Tên báo hoặc kênh, ví dụ VTV, VnExpress"
                value={link.source ?? ""}
              />
              {link.kind === "video" ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  {embeddable
                    ? "Video sẽ phát ngay trên trang."
                    : "Chưa nhận ra link YouTube/Vimeo: sẽ hiện thành link để bấm mở."}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <Button
        className="w-fit"
        disabled={links.length >= articleLimits.links}
        onClick={() =>
          setLinks((items) => [
            ...items,
            {
              id: createArticleItemId(),
              kind: "news",
              source: null,
              title: "",
              url: "",
            },
          ])
        }
        size="sm"
        type="button"
        variant="secondary"
      >
        <Plus aria-hidden="true" /> Thêm liên kết
      </Button>
    </section>
  );
}

function RemoveArticleButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-fit" size="sm" type="button" variant="destructive">
          <Trash2 aria-hidden="true" /> Xoá toàn bộ bài viết
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá toàn bộ bài viết?</AlertDialogTitle>
          <AlertDialogDescription>
            Hộp thông tin, các mục, ảnh, nguồn và bản dịch của bài viết sẽ bị
            xoá khỏi hồ sơ khi bạn lưu. Có thể bấm Hoàn tác trước khi lưu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Giữ lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            Xoá bài viết
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ArticleTranslationEditor({
  block,
  document,
  locale,
  onChange,
}: {
  block: ArticleBlock;
  document: ProfileDocument;
  locale: Exclude<ProfileLocale, "vi">;
  onChange: ChangeHandler;
}) {
  const label = profileLocaleLabels[locale].long;
  const field = (
    key: string,
    original: string,
    options: { multiline?: boolean; title: string },
  ) => (
    <TranslationField
      key={key}
      multiline={options.multiline}
      onChange={(value) =>
        onChange(setTranslation(document, locale, key, value), key)
      }
      original={original}
      title={options.title}
      value={getTranslation(document, locale, key) ?? ""}
    />
  );
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
      <p className="rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
        Đang nhập bản {label}. Ô để trống sẽ hiện chữ tiếng Việt. Thêm, xoá mục,
        ảnh và đường dẫn ở bản Tiếng Việt.
      </p>
      {block.data.facts.length ? (
        <section className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <h3 className="text-sm font-medium">Hộp thông tin</h3>
          {block.data.facts.map((fact) => (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2" key={fact.id}>
              {field(factKey(fact.id, "label"), fact.label, {
                title: "Tên dòng",
              })}
              {field(factKey(fact.id, "value"), fact.value, {
                multiline: true,
                title: "Nội dung",
              })}
            </div>
          ))}
        </section>
      ) : null}
      {block.data.sections.map((section, index) => (
        <section
          className="grid grid-cols-[minmax(0,1fr)] gap-3"
          key={section.id}
        >
          <h3 className="text-sm font-medium">
            {index + 1}. {section.heading || "Mục chưa đặt tên"}
          </h3>
          {field(sectionKey(section.id, "heading"), section.heading, {
            title: "Tiêu đề mục",
          })}
          {field(sectionKey(section.id, "body"), section.body, {
            multiline: true,
            title: "Nội dung",
          })}
          {section.images.map((image) =>
            field(imageKey(image.id), image.caption ?? "", {
              title: "Chú thích ảnh",
            }),
          )}
        </section>
      ))}
      {(block.data.links ?? []).length ? (
        <section className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <h3 className="text-sm font-medium">Liên kết ngoài</h3>
          {(block.data.links ?? []).map((link, index) => (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2" key={link.id}>
              {field(linkKey(link.id, "title"), link.title, {
                title: `Tiêu đề liên kết ${index + 1}`,
              })}
              {field(linkKey(link.id, "source"), link.source ?? "", {
                title: "Tên báo, kênh",
              })}
            </div>
          ))}
        </section>
      ) : null}
      {block.data.references.length ? (
        <section className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <h3 className="text-sm font-medium">Nguồn tham khảo</h3>
          {block.data.references.map((reference, index) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)] gap-2"
              key={reference.id}
            >
              {field(referenceKey(reference.id, "title"), reference.title, {
                title: `Tiêu đề nguồn [${index + 1}]`,
              })}
              {field(
                referenceKey(reference.id, "source"),
                reference.source ?? "",
                {
                  title: "Tên báo, trang",
                },
              )}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
