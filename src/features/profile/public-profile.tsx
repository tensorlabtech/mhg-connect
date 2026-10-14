import { ArrowUpRight, Globe2, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PublicProfileActions } from "@/features/profile/public-profile-actions";
import { ProfileLivingSurface } from "@/features/profile/profile-living-surface";
import { defaultCoverUrl } from "@/features/profile/profile-demo-media";
import {
  getArticleBlock,
  hasArticleContent,
  localizeProfileDocument,
} from "@/features/profile/profile-article";
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
  ProfileLocale,
  SocialProfileField,
} from "@/features/profile/profile-document-types";
import { profileHtmlLang, profileText } from "@/features/profile/profile-i18n";
import {
  ArticleBlockView,
  ArticleFactsList,
  ProfileLanguageSwitcher,
  visibleArticleFacts,
  visibleArticleLinks,
  visibleArticleReferences,
} from "@/features/profile/public-profile-article";
import {
  getSocialProfileHref,
  socialPlatforms,
} from "@/features/profile/profile-social-platforms";
import {
  EditableText,
  InlineEditProvider,
  MediaEditButton,
  type InlineEditApi,
} from "@/features/profile/profile-inline-edit";
import {
  BlockVisibilityTools,
  EditableArticleBlockView,
  EditableFactsList,
  HiddenBlockBarFor,
} from "@/features/profile/public-profile-article-edit";
import {
  ProfileWikipediaArticleNavigation,
  PublicProfileWikipediaAttribution,
  WikipediaInfoboxSpacer,
} from "@/features/profile/public-profile-wikipedia-chrome";
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
  inlineEdit,
  locale = "vi",
  onLocaleChange,
  ownerToolbar,
  profile,
  preview = false,
  selection,
  showActions = true,
}: {
  document?: unknown;
  editor?: EditorMode;
  /** Sửa trực tiếp trên trang: bấm vào chữ, ảnh, mục nào là sửa ngay chỗ đó. */
  inlineEdit?: InlineEditApi;
  locale?: ProfileLocale;
  onLocaleChange?: (locale: ProfileLocale) => void;
  ownerToolbar?: React.ReactNode;
  profile: PublicProfileViewModel;
  preview?: boolean;
  selection?: SelectionMode;
  showActions?: boolean;
}) {
  const fallback = createProfileDocument({ ...profile, status: "published" });
  const sourceDocument = persistedDocument
    ? resolveProfileDocument(persistedDocument, {
        ...profile,
        status: "published",
      })
    : fallback;
  const document = localizeProfileDocument(sourceDocument, locale);
  const availableLocales: ProfileLocale[] = [
    "vi",
    ...(sourceDocument.languages ?? []),
  ];
  const inlineEditing = Boolean(inlineEdit);
  const interactive = !(
    preview ||
    Boolean(editor) ||
    Boolean(selection) ||
    inlineEditing
  );
  const isWikipediaTheme = document.theme.themeId === "wikipedia";
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
      inert={!interactive}
      labels={{
        call: profileText(locale, "call"),
        saveContact: profileText(locale, "saveContact"),
        share: profileText(locale, "share"),
      }}
      phone={phone}
      token={profile.publicToken}
    />
  ) : null;
  const identityActions =
    document.theme.themeId === "cinematic" ||
    document.theme.themeId === "studio-light" ||
    document.theme.themeId === "wikipedia"
      ? actions
      : null;
  const showLivingSurface =
    document.theme.themeId === "studio-light" &&
    document.theme.background.type === "style";
  const page = (
    <div
      className={`profile-page ${preview ? "profile-page-preview" : "min-h-dvh"}`}
      data-background={backgroundKey}
      data-editing={Boolean(editor) || undefined}
      data-inline-editing={inlineEditing || undefined}
      data-preview={preview || undefined}
      data-style={document.theme.themeId}
      data-template={document.theme.headerLayout}
      lang={profileHtmlLang(locale)}
      style={backgroundStyle}
    >
      {showLivingSurface ? <ProfileLivingSurface /> : null}
      <main className="profile-shell" id="profile">
        {ownerToolbar}
        <ProfileLanguageSwitcher
          inert={!interactive && !onLocaleChange}
          languages={availableLocales}
          locale={locale}
          onChange={onLocaleChange}
        />
        {isWikipediaTheme && (interactive || inlineEditing) ? (
          <WikipediaInfoboxSpacer />
        ) : null}
        <section className="profile-content" aria-label="Thông tin cá nhân">
          <BlockFrame
            editor={editor}
            hasNestedNavigation={document.theme.themeId === "wikipedia"}
            selection={selection}
            type="identity"
          >
            <IdentityBlockView
              actions={identityActions}
              document={document}
              editor={editor}
              inert={!interactive}
              inlineEditing={inlineEditing}
              locale={locale}
              onNavigate={editor?.onSelect ?? selection?.onSelect}
              showWikipediaInfoboxDetails={
                !editor && !selection && !inlineEditing
              }
            />
          </BlockFrame>
          <div className="profile-inner">
            {identityActions ? null : actions}
            <div className="profile-blocks">
              {document.blocks.slice(1).map((block) =>
                inlineEditing ? (
                  block.type === "article" ? (
                    <EditableArticleBlockView
                      document={document}
                      isWikipedia={isWikipediaTheme}
                      key={block.id}
                      locale={locale}
                    />
                  ) : (
                    <OptionalBlockView
                      document={document}
                      editing={false}
                      inlineEditing
                      key={block.id}
                      locale={locale}
                      preview
                      type={block.type}
                    />
                  )
                ) : block.type === "article" ? (
                  !block.visible && !selection && !editor ? null : (
                    <BlockFrame
                      editor={editor}
                      key={block.id}
                      selection={selection}
                      type="article"
                    >
                      {block.visible ? (
                        <ArticleBlockView
                          document={document}
                          inert={!interactive}
                          isWikipedia={isWikipediaTheme}
                          locale={locale}
                          placeholder={
                            selection || editor ? (
                              <EmptyBlockPlaceholder
                                disabled={(editor ?? selection)?.disabled}
                                label="Bài viết đang trống — bấm để thêm mục, ảnh, nguồn"
                                onSelect={() =>
                                  (editor ?? selection)?.onSelect("article")
                                }
                              />
                            ) : null
                          }
                        />
                      ) : (
                        <HiddenBlockPlaceholder
                          disabled={(editor ?? selection)?.disabled}
                          label={blockLabel.article}
                          onSelect={() =>
                            (editor ?? selection)?.onSelect("article")
                          }
                        />
                      )}
                    </BlockFrame>
                  )
                ) : (document.theme.themeId === "wikipedia" &&
                    block.type === "contact" &&
                    !editor &&
                    !selection) ||
                  (selection && !hasVisibleBlockContent(block)) ? null : (
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
                      locale={locale}
                      preview={preview || Boolean(editor) || Boolean(selection)}
                      type={block.type}
                    />
                  </BlockFrame>
                ),
              )}
            </div>
          </div>
        </section>
        {document.theme.themeId === "wikipedia" ? (
          <PublicProfileWikipediaAttribution />
        ) : null}
      </main>
    </div>
  );
  return inlineEdit ? (
    <InlineEditProvider value={inlineEdit}>{page}</InlineEditProvider>
  ) : (
    page
  );
}

const blockLabel: Record<ProfileBlockType, string> = {
  article: "Bài viết",
  bio: "Giới thiệu",
  contact: "Thông tin liên hệ",
  identity: "Avatar & Cover",
  social: "Mạng xã hội",
};

function BlockFrame({
  children,
  editor,
  hasNestedNavigation = false,
  selection,
  type,
}: {
  children: React.ReactNode;
  editor?: EditorMode;
  hasNestedNavigation?: boolean;
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
        if (
          hasNestedNavigation &&
          event.target instanceof Element &&
          event.target.closest("[data-profile-navigation-link]")
        ) {
          return;
        }
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
      role={selection && !hasNestedNavigation ? "button" : undefined}
      tabIndex={selection && !hasNestedNavigation ? 0 : undefined}
    >
      {children}
    </div>
  );
}

function IdentityBlockView({
  actions,
  document,
  editor,
  inert,
  inlineEditing = false,
  locale,
  onNavigate,
  showWikipediaInfoboxDetails,
}: {
  actions?: React.ReactNode;
  document: ProfileDocument;
  editor?: EditorMode;
  inert: boolean;
  inlineEditing?: boolean;
  locale: ProfileLocale;
  onNavigate?: (type: ProfileBlockType) => void;
  showWikipediaInfoboxDetails: boolean;
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
  const isWikipedia = document.theme.themeId === "wikipedia";
  const contact = getProfileBlock(document, "contact");
  const social = getProfileBlock(document, "social");
  const article = getArticleBlock(document);
  const articleFacts = isWikipedia ? visibleArticleFacts(article) : [];
  const referenceCount = visibleArticleReferences(article).length;
  return (
    <div
      className="profile-identity-block"
      data-has-avatar={Boolean(identity.data.avatarUrl)}
      data-has-cover={Boolean(identity.data.coverUrl)}
      id="profile-identity"
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
          {inlineEditing ? <MediaEditButton kind="cover" /> : null}
        </div>
      ) : null}
      <div className="profile-avatar-wrap">
        {isWikipedia ? (
          <div className="profile-wikipedia-infobox-heading">
            {inlineEditing ? (
              <EditableText
                as="strong"
                k="identity.name"
                label="Họ và tên trong hộp thông tin"
                maxLength={100}
                placeholder="Họ và tên"
              />
            ) : (
              <strong>{name || "Tên của bạn"}</strong>
            )}
          </div>
        ) : null}
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
        {isWikipedia && inlineEditing ? (
          <dl className="profile-wikipedia-infobox-summary">
            <dt>{profileText(locale, "title")}</dt>
            <EditableText
              as="dd"
              k="identity.title"
              label="Chức danh"
              maxLength={120}
              placeholder="Thêm chức danh"
            />
            <dt>{profileText(locale, "company")}</dt>
            <EditableText
              as="dd"
              k="identity.company"
              label="Đơn vị"
              maxLength={120}
              placeholder="Thêm đơn vị"
            />
            <dt>{profileText(locale, "location")}</dt>
            <EditableText
              as="dd"
              k="identity.location"
              label="Địa điểm"
              maxLength={120}
              placeholder="Thêm địa điểm"
            />
          </dl>
        ) : null}
        {isWikipedia &&
        !inlineEditing &&
        ((visibleFields.title && (shownTitle || editor)) ||
          (visibleFields.company && (shownCompany || editor)) ||
          (visibleFields.location && (location || editor))) ? (
          <dl className="profile-wikipedia-infobox-summary">
            {visibleFields.title && (shownTitle || editor) ? (
              <>
                <dt>{profileText(locale, "title")}</dt>
                <dd>
                  {editor ? (
                    <InlineInput
                      ariaLabel="Chức danh"
                      disabled={editor.disabled}
                      maxLength={120}
                      onChange={(value) =>
                        editor.onChange(
                          updateIdentityValue(document, "title", value),
                          "identity.title",
                        )
                      }
                      placeholder="Thêm chức danh"
                      value={title ?? ""}
                    />
                  ) : (
                    shownTitle
                  )}
                </dd>
              </>
            ) : null}
            {visibleFields.company && (shownCompany || editor) ? (
              <>
                <dt>{profileText(locale, "company")}</dt>
                <dd>
                  {editor ? (
                    <InlineInput
                      ariaLabel="Công ty"
                      disabled={editor.disabled}
                      maxLength={120}
                      onChange={(value) =>
                        editor.onChange(
                          updateIdentityValue(document, "company", value),
                          "identity.company",
                        )
                      }
                      placeholder="Thêm công ty"
                      value={company ?? ""}
                    />
                  ) : (
                    shownCompany
                  )}
                </dd>
              </>
            ) : null}
            {visibleFields.location && (location || editor) ? (
              <>
                <dt>{profileText(locale, "location")}</dt>
                <dd>
                  {editor ? (
                    <InlineInput
                      ariaLabel="Địa điểm"
                      disabled={editor.disabled}
                      maxLength={120}
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
                </dd>
              </>
            ) : null}
          </dl>
        ) : null}
        {isWikipedia && inlineEditing ? (
          <EditableFactsList
            className="profile-wikipedia-infobox-summary profile-wikipedia-infobox-facts"
            document={document}
          />
        ) : (
          <ArticleFactsList
            className="profile-wikipedia-infobox-summary profile-wikipedia-infobox-facts"
            facts={articleFacts}
            inert={inert}
            referenceCount={referenceCount}
          />
        )}
        {isWikipedia && showWikipediaInfoboxDetails ? (
          <WikipediaInfoboxContact
            block={contact}
            inert={inert}
            locale={locale}
          />
        ) : null}
        {isWikipedia && actions ? (
          <div className="profile-wikipedia-infobox-actions">{actions}</div>
        ) : null}
      </div>
      <div className="profile-inner profile-identity-copy">
        <div className="profile-heading">
          <h1>
            {inlineEditing ? (
              <EditableText
                k="identity.name"
                label="Họ và tên"
                maxLength={100}
                placeholder="Họ và tên"
              />
            ) : editor ? (
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
          {!isWikipedia && inlineEditing ? (
            <p className="profile-byline">
              <EditableText
                k="identity.title"
                label="Chức danh"
                maxLength={120}
                placeholder="Thêm chức danh"
              />
              <span aria-hidden="true">·</span>
              <EditableText
                as="strong"
                k="identity.company"
                label="Đơn vị"
                maxLength={120}
                placeholder="Thêm đơn vị"
              />
            </p>
          ) : null}
          {!isWikipedia && !inlineEditing ? (
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
          ) : null}
          {!isWikipedia && inlineEditing ? (
            <p className="profile-location">
              <MapPin aria-hidden="true" />
              <EditableText
                k="identity.location"
                label="Địa điểm"
                maxLength={120}
                placeholder="Thêm địa điểm"
              />
            </p>
          ) : null}
          {!isWikipedia &&
          !inlineEditing &&
          visibleFields.location &&
          (location || editor) ? (
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
          {actions && !isWikipedia ? (
            <div className="profile-identity-actions">{actions}</div>
          ) : null}
        </div>
        {isWikipedia ? (
          <ProfileWikipediaArticleNavigation
            hasContact={hasVisibleBlockContent(contact)}
            hasExternalLinks={visibleArticleLinks(article).length > 0}
            hasSocial={hasVisibleBlockContent(social)}
            labels={{
              article: profileText(locale, "article"),
              contact: profileText(locale, "contact"),
              externalLinks: profileText(locale, "externalLinks"),
            }}
            onNavigate={onNavigate}
          />
        ) : null}
      </div>
    </div>
  );
}

function WikipediaInfoboxContact({
  block,
  inert,
  locale,
}: {
  block: ReturnType<typeof getProfileBlock<"contact">>;
  inert: boolean;
  locale: ProfileLocale;
}) {
  if (!block.visible) return null;
  const items = buildContactItems(block, false, locale);
  if (!items.length) return null;
  return (
    <DirectorySection
      items={items}
      preview={inert}
      section="contact"
      title={profileText(locale, "contactDetails")}
    />
  );
}

function OptionalBlockView({
  document,
  editor,
  editing,
  inlineEditing = false,
  locale,
  preview,
  type,
}: {
  document: ProfileDocument;
  editor?: EditorMode;
  editing: boolean;
  inlineEditing?: boolean;
  locale: ProfileLocale;
  preview: boolean;
  type: ProfileBlockType;
}) {
  if (type === "identity" || type === "article") return null;
  const block = getProfileBlock(document, type);
  if (inlineEditing) {
    if (!block.visible) return <HiddenBlockBarFor type={type} />;
    if (block.type === "bio")
      return (
        <section
          className="profile-section profile-edit-item"
          data-profile-section="bio"
          id="profile-bio"
        >
          <BlockVisibilityTools label="giới thiệu" type="bio" />
          <h2>{profileText(locale, "about")}</h2>
          <EditableText
            as="p"
            className="profile-bio profile-bio-block"
            k="bio.text"
            label="Giới thiệu"
            maxLength={700}
            multiline
            placeholder="Hai, ba câu giới thiệu: bạn là ai, đang làm gì, điều muốn người quét mã nhớ về bạn."
          />
        </section>
      );
    // Đang sửa thì hiện đủ các ô (kể cả ô trống) để bấm vào là điền.
    const items =
      block.type === "contact"
        ? buildContactItems(
            {
              ...block,
              data: {
                ...block.data,
                visibleFields: { email: true, phone: true, website: true },
              },
            },
            true,
            locale,
          )
        : buildSocialItems(
            {
              ...block,
              data: {
                ...block.data,
                visibleFields: Object.fromEntries(
                  socialPlatforms.map((platform) => [platform.field, true]),
                ) as typeof block.data.visibleFields,
              },
            },
            true,
          ).filter(
            (item) =>
              item.value ||
              socialPlatforms.find((platform) => platform.field === item.field)
                ?.group === "primary",
          );
    return (
      <DirectorySection
        editablePrefix={block.type}
        items={items}
        preview
        section={block.type}
        title={
          block.type === "contact"
            ? profileText(locale, "contactDetails")
            : profileText(locale, "social")
        }
        tools={
          <BlockVisibilityTools
            label={block.type === "contact" ? "liên hệ" : "mạng xã hội"}
            type={block.type}
          />
        }
      />
    );
  }
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
        <section
          className="profile-section"
          data-profile-section="bio"
          id="profile-bio"
        >
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
      <section
        className="profile-section"
        data-profile-section="bio"
        id="profile-bio"
      >
        <h2>{profileText(locale, "about")}</h2>
        <p className="profile-bio profile-bio-block">{block.data.text}</p>
      </section>
    );
  }
  if (block.type === "contact") {
    const items = buildContactItems(block, editing, locale);
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
        title={profileText(locale, "contactDetails")}
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
      title={
        document.theme.themeId === "wikipedia" &&
        !visibleArticleLinks(getArticleBlock(document)).length
          ? profileText(locale, "externalLinks")
          : profileText(locale, "social")
      }
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
  if (block.type === "article") return hasArticleContent(block);
  if (!block.visible) return false;
  if (block.type === "bio") return Boolean(block.data.text);
  if (block.type === "contact") return buildContactItems(block).length > 0;
  return buildSocialItems(block).length > 0;
}

function buildContactItems(
  block: ReturnType<typeof getProfileBlock<"contact">>,
  editing = false,
  locale: ProfileLocale = "vi",
) {
  const { contactEmail, phone, visibleFields, website } = block.data;
  return [
    visibleFields.phone && (phone || editing)
      ? {
          field: "phone",
          href: phone ? `tel:${phone.replace(/\s/g, "")}` : "",
          icon: Phone,
          label: profileText(locale, "phone"),
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
          label: profileText(locale, "email"),
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
          label: profileText(locale, "website"),
          maxLength: 240,
          placeholder: "Thêm website",
          type: "url" as const,
          value: website ?? "",
        }
      : null,
  ].filter(Boolean) as DirectoryItem[];
}

function buildSocialItems(
  block: Extract<ProfileBlock, { type: "social" }>,
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
  editablePrefix,
  invalidField,
  items,
  onValueChange,
  preview,
  section,
  title,
  tools,
}: {
  disabled?: boolean;
  /** Sửa trực tiếp trên trang: giá trị mỗi dòng thành chữ bấm vào là sửa. */
  editablePrefix?: "contact" | "social";
  tools?: React.ReactNode;
  invalidField?: string | null;
  items: DirectoryItem[];
  onValueChange?: (field: string, value: string) => void;
  preview: boolean;
  section: "contact" | "social";
  title: string;
}) {
  return (
    <section
      className={`profile-section${tools ? " profile-edit-item" : ""}`}
      data-profile-section={section}
      id={`profile-${section}`}
    >
      {tools}
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
                  {editablePrefix ? (
                    <EditableText
                      as="strong"
                      k={`${editablePrefix}.${field}`}
                      label={label}
                      maxLength={maxLength}
                      placeholder={placeholder}
                    />
                  ) : onValueChange ? (
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
                    <strong>{displayDirectoryValue(value)}</strong>
                  )}
                  {!onValueChange && !editablePrefix ? (
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

/** Rút gọn đường dẫn để đọc dễ trên điện thoại: bỏ https://, www. và dấu / cuối. */
function displayDirectoryValue(value: string) {
  if (!/^https?:\/\//i.test(value)) return value;
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
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
