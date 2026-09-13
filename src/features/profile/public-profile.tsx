import { ArrowUpRight, Globe2, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PublicProfileActions } from "@/features/profile/public-profile-actions";
import { ProfileLivingSurface } from "@/features/profile/profile-living-surface";
import { defaultCoverUrl } from "@/features/profile/profile-demo-media";
import {
  createProfileDocument,
  getProfileBlock,
  profileDocumentToFlat,
  resolveProfileDocument,
} from "@/features/profile/profile-document";
import type {
  ProfileBlock,
  ProfileBlockType,
  ProfileDocument,
  SocialProfileField,
} from "@/features/profile/profile-document-types";
import {
  getSocialProfileHref,
  socialPlatforms,
} from "@/features/profile/profile-social-platforms";
import {
  normalizeExternalUrl,
  type PublicProfileViewModel,
} from "@/features/profile/profile-view-model";

type EditorMode = {
  disabled: boolean;
  invalidField: string | null;
  onChange: (document: ProfileDocument, coalesceKey?: string) => void;
  onFocus: (type: ProfileBlockType) => void;
  onSelect: (type: ProfileBlockType) => void;
  selectedBlock: ProfileBlockType | "document";
};

type SelectionMode = {
  disabled: boolean;
  onSelect: (type: ProfileBlockType) => void;
  selectedBlock: ProfileBlockType | "document";
};

export function PublicProfile({
  document: persistedDocument,
  editor,
  ownerToolbar,
  profile,
  preview = false,
  selection,
  showActions = true,
}: {
  document?: unknown;
  editor?: EditorMode;
  ownerToolbar?: React.ReactNode;
  profile: PublicProfileViewModel;
  preview?: boolean;
  selection?: SelectionMode;
  showActions?: boolean;
}) {
  const fallback = createProfileDocument({ ...profile, status: "published" });
  const document = persistedDocument
    ? resolveProfileDocument(persistedDocument, {
        ...profile,
        status: "published",
      })
    : fallback;
  const flat = profileDocumentToFlat(document);
  const phone =
    flat.visibleFields.phone && flat.phone?.trim() ? flat.phone.trim() : null;
  const customBackground =
    document.theme.background.type === "image"
      ? document.theme.background.imageUrl
      : null;
  const backgroundKey =
    document.theme.background.type === "preset"
      ? document.theme.background.presetId
      : document.theme.background.type === "effect"
        ? `effect-${document.theme.background.effectId}`
        : document.theme.background.type;
  const backgroundStyle = customBackground
    ? ({
        "--profile-background-image": `url(${JSON.stringify(customBackground)})`,
        "--profile-background-overlay": `${Math.round(
          (document.theme.background.type === "image"
            ? document.theme.background.overlay
            : 0.56) * 100,
        )}%`,
      } as CSSProperties)
    : undefined;
  const actions = showActions ? (
    <PublicProfileActions
      inert={preview || Boolean(editor) || Boolean(selection)}
      phone={phone}
      token={profile.publicToken}
    />
  ) : null;
  const identityActions =
    document.theme.themeId === "cinematic" ||
    document.theme.themeId === "studio-light"
      ? actions
      : null;
  const showLivingSurface =
    document.theme.themeId === "studio-light" &&
    document.theme.background.type === "style";

  return (
    <div
      className={`profile-page ${preview ? "profile-page-preview" : "min-h-dvh"}`}
      data-background={backgroundKey}
      data-preview={preview || undefined}
      data-style={document.theme.themeId}
      data-template={document.theme.headerLayout}
      style={backgroundStyle}
    >
      {showLivingSurface ? <ProfileLivingSurface /> : null}
      <main className="profile-shell" id="profile">
        {ownerToolbar}
        <section className="profile-content" aria-label="Thông tin cá nhân">
          <BlockFrame editor={editor} selection={selection} type="identity">
            <IdentityBlockView
              actions={identityActions}
              document={document}
              editor={editor}
            />
          </BlockFrame>
          <div className="profile-inner">
            {identityActions ? null : actions}
            <div className="profile-blocks">
              {document.blocks.slice(1).map((block) =>
                selection && !hasVisibleBlockContent(block) ? null : (
                  <BlockFrame
                    editor={editor}
                    key={block.id}
                    selection={selection}
                    type={block.type}
                  >
                    <OptionalBlockView
                      document={document}
                      editor={editor}
                      editing={Boolean(editor)}
                      preview={preview || Boolean(editor) || Boolean(selection)}
                      type={block.type}
                    />
                  </BlockFrame>
                ),
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const blockLabel: Record<ProfileBlockType, string> = {
  bio: "Giới thiệu",
  contact: "Thông tin liên hệ",
  identity: "Avatar & Cover",
  social: "Mạng xã hội",
};

function BlockFrame({
  children,
  editor,
  selection,
  type,
}: {
  children: React.ReactNode;
  editor?: EditorMode;
  selection?: SelectionMode;
  type: ProfileBlockType;
}) {
  const interaction = editor ?? selection;
  if (!interaction) return children;
  return (
    <div
      aria-label={`Chỉnh sửa ${blockLabel[type]}`}
      className="profile-editor-block"
      data-profile-block={type}
      onClickCapture={(event) => {
        if (selection) event.preventDefault();
        if (!interaction.disabled) interaction.onSelect(type);
      }}
      onFocusCapture={() => editor?.onFocus(type)}
      onKeyDown={(event) => {
        if (selection && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          if (!selection.disabled) selection.onSelect(type);
        }
      }}
      role={selection ? "button" : undefined}
      tabIndex={selection ? 0 : undefined}
    >
      {children}
    </div>
  );
}

function IdentityBlockView({
  actions,
  document,
  editor,
}: {
  actions?: React.ReactNode;
  document: ProfileDocument;
  editor?: EditorMode;
}) {
  const identity = getProfileBlock(document, "identity");
  const { company, location, name, title, visibleFields } = identity.data;
  const coverUrl =
    identity.data.coverUrl ||
    (document.theme.themeId === "cinematic"
      ? "/images/profile-presets/cover-material.png"
      : defaultCoverUrl);
  const shownTitle = visibleFields.title ? title : null;
  const shownCompany = visibleFields.company ? company : null;
  return (
    <div
      className="profile-identity-block"
      data-has-avatar={Boolean(identity.data.avatarUrl)}
      data-has-cover={Boolean(identity.data.coverUrl)}
    >
      {document.theme.headerLayout === "cover" ? (
        <div className="profile-cover relative">
          <Image
            alt="Bìa hồ sơ MHG Connect"
            fill
            loading="eager"
            sizes="(max-width: 704px) calc(100vw - 2rem), 896px"
            src={coverUrl}
          />
        </div>
      ) : null}
      <div className="profile-avatar-wrap">
        <Avatar className="profile-avatar">
          {identity.data.avatarUrl ? (
            <AvatarImage
              alt={`Chân dung ${name || "người dùng"}`}
              src={identity.data.avatarUrl}
            />
          ) : null}
          <AvatarFallback className="font-heading text-3xl">
            {(name || "MH").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="profile-inner profile-identity-copy">
        <div className="profile-heading">
          <h1>
            {editor ? (
              <InlineInput
                ariaLabel="Họ và tên"
                aria-describedby={
                  editor.invalidField === "name"
                    ? "profile-builder-publish-error"
                    : undefined
                }
                aria-invalid={editor.invalidField === "name" || undefined}
                className="profile-inline-name"
                disabled={editor.disabled}
                maxLength={100}
                onChange={(value) =>
                  editor.onChange(
                    updateIdentityValue(document, "name", value),
                    "identity.name",
                  )
                }
                placeholder="Tên của bạn"
                value={name}
              />
            ) : (
              name || "Tên của bạn"
            )}
          </h1>
          <p className="profile-byline">
            {visibleFields.title ? (
              editor ? (
                <InlineInput
                  ariaLabel="Chức danh"
                  disabled={editor.disabled}
                  maxLength={120}
                  size={Math.min(Math.max((title ?? "").length, 14), 42)}
                  onChange={(value) =>
                    editor.onChange(
                      updateIdentityValue(document, "title", value),
                      "identity.title",
                    )
                  }
                  placeholder="Thêm chức danh"
                  value={title ?? ""}
                />
              ) : shownTitle ? (
                <span>{shownTitle}</span>
              ) : null
            ) : null}
            {(
              editor
                ? visibleFields.title && visibleFields.company
                : Boolean(shownTitle && shownCompany)
            ) ? (
              <span aria-hidden="true">·</span>
            ) : null}
            {visibleFields.company ? (
              editor ? (
                <InlineInput
                  ariaLabel="Công ty"
                  className="profile-inline-accent"
                  disabled={editor.disabled}
                  maxLength={120}
                  size={Math.min(Math.max((company ?? "").length, 8), 32)}
                  onChange={(value) =>
                    editor.onChange(
                      updateIdentityValue(document, "company", value),
                      "identity.company",
                    )
                  }
                  placeholder="Thêm công ty"
                  value={company ?? ""}
                />
              ) : shownCompany ? (
                <strong>{shownCompany}</strong>
              ) : null
            ) : null}
          </p>
          {visibleFields.location && (location || editor) ? (
            <p className="profile-location">
              <MapPin aria-hidden="true" />
              {editor ? (
                <InlineInput
                  ariaLabel="Địa điểm"
                  disabled={editor.disabled}
                  maxLength={120}
                  size={Math.min(Math.max((location ?? "").length, 14), 36)}
                  onChange={(value) =>
                    editor.onChange(
                      updateIdentityValue(document, "location", value),
                      "identity.location",
                    )
                  }
                  placeholder="Thêm địa điểm"
                  value={location ?? ""}
                />
              ) : (
                location
              )}
            </p>
          ) : null}
          {actions ? (
            <div className="profile-identity-actions">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OptionalBlockView({
  document,
  editor,
  editing,
  preview,
  type,
}: {
  document: ProfileDocument;
  editor?: EditorMode;
  editing: boolean;
  preview: boolean;
  type: ProfileBlockType;
}) {
  if (type === "identity") return null;
  const block = getProfileBlock(document, type);
  if (!block.visible)
    return editing ? (
      <HiddenBlockPlaceholder
        disabled={editor?.disabled}
        label={blockLabel[type]}
        onSelect={() => editor?.onSelect(type)}
      />
    ) : null;
  if (block.type === "bio") {
    if (editing) {
      return (
        <section className="profile-section" data-profile-section="bio">
          <h2>Giới thiệu</h2>
          <InlineTextarea
            ariaLabel="Giới thiệu"
            className="profile-bio profile-bio-block"
            disabled={editor?.disabled}
            maxLength={700}
            onChange={(value) =>
              editor?.onChange(updateBioValue(document, value), "bio.text")
            }
            placeholder="Chia sẻ ngắn về bạn"
            value={block.data.text ?? ""}
          />
        </section>
      );
    }
    if (!block.data.text) return null;
    return (
      <section className="profile-section" data-profile-section="bio">
        <h2>Giới thiệu</h2>
        <p className="profile-bio profile-bio-block">{block.data.text}</p>
      </section>
    );
  }
  if (block.type === "contact") {
    const items = buildContactItems(block, editing);
    return items.length ? (
      <DirectorySection
        items={items}
        disabled={editor?.disabled}
        invalidField={editor?.invalidField}
        onValueChange={
          editor
            ? (field, value) =>
                editor.onChange(
                  updateContactValue(document, field as ContactField, value),
                  `contact.${field}`,
                )
            : undefined
        }
        preview={preview}
        section="contact"
        title="Thông tin liên hệ"
      />
    ) : editing ? (
      <EmptyBlockPlaceholder
        disabled={editor?.disabled}
        label="Thêm điện thoại, email hoặc website"
        onSelect={() => editor?.onSelect(type)}
      />
    ) : null;
  }
  const items = buildSocialItems(block, editing);
  return items.length ? (
    <DirectorySection
      items={items}
      disabled={editor?.disabled}
      onValueChange={
        editor
          ? (field, value) =>
              editor.onChange(
                updateSocialValue(document, field as SocialProfileField, value),
                `social.${field}`,
              )
          : undefined
      }
      preview={preview}
      section="social"
      title="Mạng xã hội"
    />
  ) : editing ? (
    <EmptyBlockPlaceholder
      disabled={editor?.disabled}
      label="Thêm Zalo, LinkedIn hoặc Telegram"
      onSelect={() => editor?.onSelect(type)}
    />
  ) : null;
}

function HiddenBlockPlaceholder({
  disabled,
  label,
  onSelect,
}: {
  disabled?: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      className="profile-editor-placeholder w-full"
      data-hidden-block
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      type="button"
    >
      {label} đang ẩn
    </button>
  );
}

function EmptyBlockPlaceholder({
  disabled,
  label,
  onSelect,
}: {
  disabled?: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      className="profile-editor-placeholder w-full"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      type="button"
    >
      {label}
    </button>
  );
}

type DirectoryItem = {
  brandIcon?: string;
  field: string;
  href: string;
  icon?: typeof Phone;
  label: string;
  maxLength: number;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
};

type ContactField = "contactEmail" | "phone" | "website";

function hasVisibleBlockContent(block: ProfileBlock) {
  if (block.type === "identity") return true;
  if (!block.visible) return false;
  if (block.type === "bio") return Boolean(block.data.text);
  if (block.type === "contact") return buildContactItems(block).length > 0;
  return buildSocialItems(block).length > 0;
}

function buildContactItems(
  block: ReturnType<typeof getProfileBlock<"contact">>,
  editing = false,
) {
  const { contactEmail, phone, visibleFields, website } = block.data;
  return [
    visibleFields.phone && (phone || editing)
      ? {
          field: "phone",
          href: phone ? `tel:${phone.replace(/\s/g, "")}` : "",
          icon: Phone,
          label: "Điện thoại",
          maxLength: 40,
          placeholder: "Thêm số điện thoại",
          type: "tel" as const,
          value: phone ?? "",
        }
      : null,
    visibleFields.email && (contactEmail || editing)
      ? {
          field: "contactEmail",
          href: contactEmail ? `mailto:${contactEmail}` : "",
          icon: Mail,
          label: "Email",
          maxLength: 254,
          placeholder: "Thêm email",
          type: "email" as const,
          value: contactEmail ?? "",
        }
      : null,
    visibleFields.website && (website || editing)
      ? {
          field: "website",
          href: website ? normalizeExternalUrl(website) : "",
          icon: Globe2,
          label: "Website",
          maxLength: 240,
          placeholder: "Thêm website",
          type: "url" as const,
          value: website ?? "",
        }
      : null,
  ].filter(Boolean) as DirectoryItem[];
}

function buildSocialItems(
  block: ReturnType<typeof getProfileBlock<"social">>,
  editing = false,
) {
  return socialPlatforms.flatMap((platform) => {
    const value = block.data[platform.field];
    if (!block.data.visibleFields[platform.field] || (!value && !editing)) {
      return [];
    }
    return [
      {
        brandIcon: platform.iconPath,
        field: platform.field,
        href: value ? getSocialProfileHref(platform, value) : "",
        label: platform.label,
        maxLength: platform.maxLength,
        placeholder: `Thêm ${platform.label}`,
        value: value ?? "",
      },
    ];
  });
}

function DirectorySection({
  disabled,
  invalidField,
  items,
  onValueChange,
  preview,
  section,
  title,
}: {
  disabled?: boolean;
  invalidField?: string | null;
  items: DirectoryItem[];
  onValueChange?: (field: string, value: string) => void;
  preview: boolean;
  section: "contact" | "social";
  title: string;
}) {
  return (
    <section className="profile-section" data-profile-section={section}>
      <h2>{title}</h2>
      <Card className="profile-section-card profile-directory-card">
        <div className="profile-directory-list">
          {items.map(
            ({
              brandIcon,
              field,
              href,
              icon: Icon,
              label,
              maxLength,
              placeholder,
              type,
              value,
            }) => {
              const content = (
                <>
                  {brandIcon ? (
                    <span
                      aria-hidden="true"
                      className="profile-directory-leading-icon profile-social-brand-icon"
                      style={{
                        WebkitMaskImage: `url(${brandIcon})`,
                        maskImage: `url(${brandIcon})`,
                      }}
                    />
                  ) : Icon ? (
                    <Icon
                      aria-hidden="true"
                      className="profile-directory-leading-icon"
                    />
                  ) : null}
                  <span className="profile-directory-label">{label}</span>
                  {onValueChange ? (
                    <InlineInput
                      ariaLabel={label}
                      aria-describedby={
                        invalidField === field
                          ? "profile-builder-publish-error"
                          : undefined
                      }
                      aria-invalid={invalidField === field || undefined}
                      disabled={disabled}
                      maxLength={maxLength}
                      onChange={(next) => onValueChange(field, next)}
                      placeholder={placeholder}
                      type={type}
                      value={value}
                    />
                  ) : (
                    <strong>{value}</strong>
                  )}
                  {!onValueChange ? (
                    <ArrowUpRight
                      aria-hidden="true"
                      className="profile-directory-arrow"
                    />
                  ) : null}
                </>
              );
              return preview ? (
                <div className="profile-directory-item" key={label}>
                  {content}
                </div>
              ) : (
                <a
                  className="profile-directory-item"
                  href={href}
                  key={label}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  target={href.startsWith("http") ? "_blank" : undefined}
                >
                  {content}
                </a>
              );
            },
          )}
        </div>
      </Card>
    </section>
  );
}

function InlineInput({
  ariaLabel,
  className = "",
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange"> & {
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      {...props}
      aria-label={ariaLabel}
      className={`profile-inline-field ${className}`}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onClick={(event) => event.stopPropagation()}
    />
  );
}

function InlineTextarea({
  ariaLabel,
  className = "",
  onChange,
  ...props
}: Omit<React.ComponentProps<"textarea">, "onChange"> & {
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      {...props}
      aria-label={ariaLabel}
      className={`profile-inline-field profile-inline-textarea ${className}`}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.currentTarget.blur();
      }}
      onClick={(event) => event.stopPropagation()}
      rows={3}
    />
  );
}

function updateIdentityValue(
  document: ProfileDocument,
  field: "company" | "location" | "name" | "title",
  value: string,
) {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "identity"
        ? {
            ...block,
            data: {
              ...block.data,
              [field]: value || (field === "name" ? "" : null),
            },
          }
        : block,
    ),
  } as ProfileDocument;
}

function updateBioValue(document: ProfileDocument, value: string) {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "bio"
        ? { ...block, data: { text: value || null } }
        : block,
    ),
  } as ProfileDocument;
}

function updateContactValue(
  document: ProfileDocument,
  field: ContactField,
  value: string,
) {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "contact"
        ? { ...block, data: { ...block.data, [field]: value || null } }
        : block,
    ),
  } as ProfileDocument;
}

function updateSocialValue(
  document: ProfileDocument,
  field: SocialProfileField,
  value: string,
) {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "social"
        ? { ...block, data: { ...block.data, [field]: value || null } }
        : block,
    ),
  } as ProfileDocument;
}
