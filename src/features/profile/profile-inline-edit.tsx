"use client";

import { cn } from "cn";
import {
  Bold,
  Camera,
  Link2,
  List,
  Plus,
  Quote,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { articleLimits } from "@/features/profile/profile-document-schema";
import type {
  ArticleImageAlign,
  ArticleLinkKind,
  ProfileLocale,
} from "@/features/profile/profile-document-types";
import {
  ProfileRichInline,
  ProfileRichText,
} from "@/features/profile/profile-rich-text";
import type { InlineKey } from "@/features/profile/profile-inline-keys";

/** Mọi thao tác sửa ngay trên trang hồ sơ: chữ, mục, ảnh, nguồn, liên kết. */
export type InlineEditApi = {
  addFact: (label?: string) => void;
  addImage: (sectionId: string) => void;
  addLink: (kind: ArticleLinkKind) => void;
  addReference: () => void;
  addSection: (afterId?: string | null, heading?: string) => void;
  disabled: boolean;
  duplicateSection: (id: string) => void;
  factHint: (label: string) => string;
  locale: ProfileLocale;
  moveSection: (id: string, offset: -1 | 1) => void;
  openMedia: (kind: "avatar" | "cover") => void;
  read: (key: InlineKey) => { original: string; value: string };
  removeFact: (id: string) => void;
  removeImage: (sectionId: string, imageId: string) => void;
  removeLink: (id: string) => void;
  removeReference: (id: string) => void;
  removeSection: (id: string) => void;
  sectionHint: (heading: string) => string;
  setBlockVisible: (
    type: "article" | "bio" | "contact" | "social",
    visible: boolean,
  ) => void;
  setImageAlign: (
    sectionId: string,
    imageId: string,
    align: ArticleImageAlign,
  ) => void;
  setLinkKind: (id: string, kind: ArticleLinkKind) => void;
  suggestedFacts: string[];
  suggestedSections: string[];
  translating: boolean;
  uploadingSectionId: string | null;
  write: (key: InlineKey, value: string) => void;
};

const InlineEditContext = createContext<InlineEditApi | null>(null);

export function InlineEditProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: InlineEditApi;
}) {
  return (
    <InlineEditContext.Provider value={value}>
      {children}
    </InlineEditContext.Provider>
  );
}

export function useInlineEdit() {
  const api = useContext(InlineEditContext);
  if (!api) throw new Error("useInlineEdit cần InlineEditProvider");
  return api;
}

/**
 * Chữ sửa được ngay tại chỗ: giữ nguyên phông, cỡ, màu của giao diện đang dùng.
 * Ô trống hiện chữ gợi ý mờ; đang dịch thì chữ mờ là bản tiếng Việt.
 */
export function EditableText({
  as = "span",
  autoFocus = false,
  className,
  k,
  label,
  maxLength = 300,
  multiline = false,
  onDone,
  placeholder,
  readOnly = false,
}: {
  autoFocus?: boolean;
  onDone?: () => void;
  as?:
    "dd" | "dt" | "em" | "figcaption" | "h1" | "h2" | "p" | "span" | "strong";
  className?: string;
  k: InlineKey;
  label: string;
  maxLength?: number;
  multiline?: boolean;
  placeholder: string;
  readOnly?: boolean;
}) {
  const api = useInlineEdit();
  const { original, value } = api.read(k);
  const ref = useRef<HTMLSpanElement>(null);
  const [initial] = useState(value);
  const locked = readOnly || api.disabled;

  // Đồng bộ khi chữ đổi từ bên ngoài (hoàn tác, đổi ngôn ngữ), không đụng khi đang gõ để không nhảy con trỏ.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || globalThis.document.activeElement === element) return;
    if (element.innerText !== value) element.innerText = value;
  }, [value]);

  useEffect(() => {
    const element = ref.current;
    if (!autoFocus || !element) return;
    element.focus();
    const range = globalThis.document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = globalThis.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [autoFocus]);

  const Tag = as as "span";
  return (
    <Tag
      aria-label={label}
      aria-multiline={multiline || undefined}
      className={cn("profile-editable", multiline && "is-multiline", className)}
      contentEditable={locked ? false : "plaintext-only"}
      data-editable={k}
      data-placeholder={api.translating && original ? original : placeholder}
      onBlur={(event) => {
        const text = event.currentTarget.innerText.replace(/\n+$/, "");
        if (text !== value) api.write(k, text.slice(0, maxLength));
        if (!text) event.currentTarget.innerText = "";
        onDone?.();
      }}
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => {
        const text = event.currentTarget.innerText;
        api.write(
          k,
          (multiline ? text : text.replace(/\n/g, " ")).slice(0, maxLength),
        );
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" || (!multiline && event.key === "Enter")) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      ref={ref}
      role="textbox"
      spellCheck
      suppressContentEditableWarning
      tabIndex={locked ? -1 : 0}
    >
      {initial}
    </Tag>
  );
}

/**
 * Một dòng có liên kết, chữ đậm, [1]: lúc xem hiện đẹp như trang công khai, bấm vào mới hiện chữ gốc để sửa.
 */
export function EditableRichInline({
  k,
  label,
  maxLength = 400,
  placeholder,
  referenceCount,
}: {
  k: InlineKey;
  label: string;
  maxLength?: number;
  placeholder: string;
  referenceCount: number;
}) {
  const api = useInlineEdit();
  const { value } = api.read(k);
  const [editing, setEditing] = useState(false);
  const hasMarkup = /\[[^\]]*\]\(|\*\*|''|\[\d+\]/.test(value);
  if (editing || !value.trim() || !hasMarkup)
    return (
      <EditableText
        autoFocus={editing}
        k={k}
        label={label}
        maxLength={maxLength}
        multiline
        onDone={() => setEditing(false)}
        placeholder={placeholder}
      />
    );
  return (
    <span
      aria-label={label}
      className="profile-editable"
      data-editable={k}
      onClick={(event) => {
        event.stopPropagation();
        if (!api.disabled) setEditing(true);
      }}
      onFocus={() => {
        if (!api.disabled) setEditing(true);
      }}
      role="button"
      tabIndex={api.disabled ? -1 : 0}
    >
      <ProfileRichInline inert referenceCount={referenceCount} text={value} />
    </span>
  );
}

/**
 * Nội dung một mục: bình thường hiện đúng như trang công khai (chữ đậm, liên kết, [1]);
 * bấm vào thì mở ô gõ ngay tại chỗ, kèm vài nút định dạng.
 */
export function EditableRichBody({
  k,
  placeholder,
  referenceCount,
}: {
  k: InlineKey;
  placeholder: string;
  referenceCount: number;
}) {
  const api = useInlineEdit();
  const { original, value } = api.read(k);
  const [editing, setEditing] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selection = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  function remember() {
    const element = textareaRef.current;
    if (element)
      selection.current = [element.selectionStart, element.selectionEnd];
  }

  function replace(build: (selected: string) => string) {
    const [start, end] = selection.current;
    const text = build(value.slice(start, end));
    api.write(
      k,
      (value.slice(0, start) + text + value.slice(end)).slice(
        0,
        articleLimits.bodyLength,
      ),
    );
    requestAnimationFrame(() => {
      const element = textareaRef.current;
      if (!element) return;
      element.focus();
      const cursor = start + text.length;
      element.setSelectionRange(cursor, cursor);
      selection.current = [cursor, cursor];
    });
  }

  if (!editing)
    return (
      <div
        aria-label="Sửa nội dung mục"
        className="profile-editable-rich"
        data-editable={k}
        data-empty={!value.trim() || undefined}
        onClick={(event) => {
          event.stopPropagation();
          if (!api.disabled) setEditing(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !api.disabled) {
            event.preventDefault();
            setEditing(true);
          }
        }}
        role="button"
        tabIndex={api.disabled ? -1 : 0}
      >
        {value.trim() ? (
          <ProfileRichText inert referenceCount={referenceCount} text={value} />
        ) : (
          <p className="profile-editable-hint">
            {api.translating && original.trim() ? original : placeholder}
          </p>
        )}
      </div>
    );

  return (
    <div
      className="profile-editable-rich is-editing"
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node)) {
          setEditing(false);
          setLinkOpen(false);
        }
      }}
      onClick={(event) => event.stopPropagation()}
      ref={wrapperRef}
    >
      {api.translating ? null : (
        <div
          className="profile-edit-format"
          role="toolbar"
          aria-label="Định dạng"
        >
          <FormatButton
            icon={Bold}
            label="Đậm"
            onClick={() =>
              replace((selected) => `**${selected || "chữ đậm"}**`)
            }
          />
          <FormatButton
            icon={Link2}
            label="Liên kết"
            onClick={() => {
              setLinkUrl("");
              setLinkOpen((open) => !open);
            }}
          />
          <FormatButton
            icon={List}
            label="Danh sách"
            onClick={() =>
              replace(
                (selected) =>
                  `\n${(selected || "Ý thứ nhất")
                    .split("\n")
                    .map((line) => `- ${line}`)
                    .join("\n")}`,
              )
            }
          />
          {referenceCount ? (
            <FormatButton
              icon={Quote}
              label={`Trích nguồn [${referenceCount}]`}
              onClick={() => replace(() => `[${referenceCount}]`)}
            />
          ) : null}
          {linkOpen ? (
            <span className="profile-edit-link-form">
              <input
                aria-label="Đường dẫn"
                autoFocus
                inputMode="url"
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  const url = linkUrl.trim();
                  if (!url) return;
                  const href = /^(https?:|mailto:|tel:)/i.test(url)
                    ? url
                    : `https://${url}`;
                  replace(
                    (selected) =>
                      `[${(selected || url).replace(/[[\]]/g, "")}](${href})`,
                  );
                  setLinkOpen(false);
                }}
                placeholder="Dán đường dẫn rồi Enter"
                value={linkUrl}
              />
            </span>
          ) : null}
        </div>
      )}
      <textarea
        aria-label="Nội dung mục"
        className="profile-editable-textarea"
        maxLength={articleLimits.bodyLength}
        onChange={(event) => api.write(k, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") event.currentTarget.blur();
        }}
        onKeyUp={remember}
        onMouseUp={remember}
        onSelect={remember}
        placeholder={
          api.translating && original.trim() ? original : placeholder
        }
        ref={textareaRef}
        value={value}
      />
      {api.translating ? null : (
        <p className="profile-edit-help">
          Bôi chữ rồi bấm Đậm hoặc Liên kết. Dòng trống để sang đoạn mới. Bấm ra
          ngoài để xem như khách.
        </p>
      )}
    </div>
  );
}

function FormatButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="profile-edit-format-button"
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      <Icon aria-hidden="true" />
      {label}
    </button>
  );
}

/** Thanh nút nhỏ hiện khi rê chuột hoặc chọn một phần (mục, ảnh, dòng). */
export function EditTools({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      className={cn("profile-edit-tools", className)}
      onClick={(event) => event.stopPropagation()}
      role="toolbar"
    >
      {children}
    </div>
  );
}

export function ToolButton({
  danger = false,
  disabled,
  icon: Icon,
  label,
  onClick,
  pressed,
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className="profile-edit-tool"
      data-danger={danger || undefined}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" />
    </button>
  );
}

/** Nút "+ Thêm …" nét đứt, kèm các gợi ý bấm nhanh. */
export function AddButton({
  chips = [],
  disabled,
  label,
  onClick,
}: {
  chips?: { label: string; onClick: () => void }[];
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      className="profile-edit-add"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="profile-edit-add-button"
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        <Plus aria-hidden="true" />
        {label}
      </button>
      {chips.map((chip) => (
        <button
          className="profile-edit-chip"
          disabled={disabled}
          key={chip.label}
          onClick={chip.onClick}
          type="button"
        >
          + {chip.label}
        </button>
      ))}
    </div>
  );
}

/** Nút đổi ảnh đại diện / ảnh bìa đặt chồng lên ảnh. */
export function MediaEditButton({
  className,
  kind,
}: {
  className?: string;
  kind: "avatar" | "cover";
}) {
  const api = useInlineEdit();
  if (api.translating) return null;
  return (
    <button
      className={cn("profile-edit-media", className)}
      data-media={kind}
      disabled={api.disabled}
      onClick={(event) => {
        event.stopPropagation();
        api.openMedia(kind);
      }}
      type="button"
    >
      <Camera aria-hidden="true" />
      {kind === "avatar" ? "Đổi ảnh" : "Đổi ảnh bìa"}
    </button>
  );
}
