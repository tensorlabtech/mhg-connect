import { Card } from "@/components/ui/card";
import {
  getArticleBlock,
  visibleArticleSections,
} from "@/features/profile/profile-article";
import type {
  ArticleBlock,
  ArticleFact,
  ArticleImage,
  ProfileDocument,
  ProfileLocale,
} from "@/features/profile/profile-document-types";
import {
  profileLocaleLabels,
  profileText,
} from "@/features/profile/profile-i18n";
import {
  ProfileRichInline,
  ProfileRichText,
} from "@/features/profile/profile-rich-text";

export function visibleArticleFacts(block: ArticleBlock | null) {
  if (!block || !block.visible) return [] as ArticleFact[];
  return block.data.facts.filter(
    (fact) => fact.label.trim() && fact.value.trim(),
  );
}

export function visibleArticleReferences(block: ArticleBlock | null) {
  if (!block || !block.visible) return [];
  return block.data.references.filter((reference) => reference.title.trim());
}

export function ArticleFactsList({
  className,
  facts,
  inert,
  referenceCount,
}: {
  className: string;
  facts: ArticleFact[];
  inert: boolean;
  referenceCount: number;
}) {
  if (!facts.length) return null;
  return (
    <dl className={className}>
      {facts.map((fact) => (
        <div className="contents" key={fact.id}>
          <dt>{fact.label}</dt>
          <dd>
            <ProfileRichInline
              inert={inert}
              referenceCount={referenceCount}
              text={fact.value}
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ArticleBlockView({
  document,
  inert,
  isWikipedia,
  locale,
  placeholder,
}: {
  document: ProfileDocument;
  inert: boolean;
  isWikipedia: boolean;
  locale: ProfileLocale;
  placeholder?: React.ReactNode;
}) {
  const block = getArticleBlock(document);
  const facts = visibleArticleFacts(block);
  const sections = visibleArticleSections(block);
  const references = visibleArticleReferences(block);
  const referenceCount = references.length;
  if (!facts.length && !sections.length && !references.length)
    return placeholder ?? null;

  return (
    <div className="profile-article" data-profile-section="article">
      {!isWikipedia && facts.length ? (
        <section
          className="profile-section"
          data-profile-section="facts"
          id="profile-facts"
        >
          <h2>{profileText(locale, "facts")}</h2>
          <Card className="profile-section-card profile-facts-card">
            <ArticleFactsList
              className="profile-facts-list"
              facts={facts}
              inert={inert}
              referenceCount={referenceCount}
            />
          </Card>
        </section>
      ) : null}

      {sections.length >= 3 ? (
        <nav
          aria-label={profileText(locale, "contents")}
          className="profile-article-toc"
        >
          <strong>{profileText(locale, "contents")}</strong>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>
                {inert ? (
                  <span>
                    <span className="profile-article-toc-number">
                      {index + 1}
                    </span>
                    {section.heading || "…"}
                  </span>
                ) : (
                  <a href={`#profile-section-${section.id}`}>
                    <span className="profile-article-toc-number">
                      {index + 1}
                    </span>
                    {section.heading || "…"}
                  </a>
                )}
              </li>
            ))}
            {references.length ? (
              <li>
                {inert ? (
                  <span>
                    <span className="profile-article-toc-number">
                      {sections.length + 1}
                    </span>
                    {profileText(locale, "references")}
                  </span>
                ) : (
                  <a href="#profile-references">
                    <span className="profile-article-toc-number">
                      {sections.length + 1}
                    </span>
                    {profileText(locale, "references")}
                  </a>
                )}
              </li>
            ) : null}
          </ol>
        </nav>
      ) : null}

      {sections.map((section) => {
        const sideImages = section.images.filter(
          (image) => image.align !== "center",
        );
        const centerImages = section.images.filter(
          (image) => image.align === "center",
        );
        return (
          <section
            className="profile-section profile-article-section"
            data-profile-section="article-section"
            id={`profile-section-${section.id}`}
            key={section.id}
          >
            {section.heading.trim() ? <h2>{section.heading}</h2> : null}
            <div className="profile-article-body">
              {sideImages.map((image) => (
                <ArticleFigure image={image} key={image.id} />
              ))}
              {section.body.trim() ? (
                <ProfileRichText
                  inert={inert}
                  referenceCount={referenceCount}
                  text={section.body}
                />
              ) : null}
              {centerImages.map((image) => (
                <ArticleFigure image={image} key={image.id} />
              ))}
            </div>
          </section>
        );
      })}

      {references.length ? (
        <section
          className="profile-section profile-article-section"
          data-profile-section="references"
          id="profile-references"
        >
          <h2>{profileText(locale, "references")}</h2>
          <ol className="profile-references">
            {references.map((reference, index) => (
              <li id={`profile-ref-${index + 1}`} key={reference.id}>
                {reference.url && !inert ? (
                  <a
                    href={reference.url}
                    rel="noreferrer"
                    target={
                      reference.url.startsWith("http") ? "_blank" : undefined
                    }
                  >
                    {reference.title}
                  </a>
                ) : (
                  <span className="profile-reference-title">
                    {reference.title}
                  </span>
                )}
                {reference.source ? (
                  <>
                    {". "}
                    <em>{reference.source}</em>
                  </>
                ) : null}
                {reference.date ? <>{`. ${reference.date}`}</> : null}
                {"."}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function ArticleFigure({ image }: { image: ArticleImage }) {
  return (
    <figure className="profile-article-figure" data-align={image.align}>
      {/* Ảnh do chủ hồ sơ tải lên hoặc dán liên kết; giữ <img> để không phụ thuộc cấu hình domain ảnh. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={image.caption ?? ""}
        decoding="async"
        loading="lazy"
        src={image.url}
      />
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}

export function ProfileLanguageSwitcher({
  inert,
  languages,
  locale,
  onChange,
}: {
  inert: boolean;
  languages: ProfileLocale[];
  locale: ProfileLocale;
  onChange?: (locale: ProfileLocale) => void;
}) {
  if (languages.length < 2) return null;
  return (
    <nav
      aria-label={profileText(locale, "language")}
      className="profile-language-switch"
    >
      {languages.map((item) => {
        const label = profileLocaleLabels[item];
        const current = item === locale;
        if (onChange)
          return (
            <button
              aria-pressed={current}
              key={item}
              lang={item}
              onClick={(event) => {
                event.stopPropagation();
                onChange(item);
              }}
              title={label.long}
              type="button"
            >
              {label.short}
            </button>
          );
        if (inert)
          return (
            <span aria-current={current || undefined} key={item} lang={item}>
              {label.short}
            </span>
          );
        return (
          <a
            aria-current={current ? "page" : undefined}
            href={item === "vi" ? "?" : `?lang=${item}`}
            hrefLang={item}
            key={item}
            lang={item}
            title={label.long}
          >
            {label.short}
          </a>
        );
      })}
    </nav>
  );
}
