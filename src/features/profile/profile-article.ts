import type {
  ArticleBlock,
  ArticleImage,
  ArticleSection,
  ProfileBlock,
  ProfileDocument,
  ProfileExtraLocale,
  ProfileLocale,
} from "@/features/profile/profile-document-types";
import {
  profileExtraLocales,
  profileLocales,
} from "@/features/profile/profile-document-types";

export function createArticleItemId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return random.replace(/[^a-z0-9-]/gi, "").slice(0, 12);
}

export function createArticleBlock(): ArticleBlock {
  return {
    data: {
      facts: [
        { id: createArticleItemId(), label: "Sinh", value: "" },
        { id: createArticleItemId(), label: "Quê quán", value: "" },
        { id: createArticleItemId(), label: "Học vấn", value: "" },
      ],
      references: [],
      sections: [
        {
          body: "",
          heading: "Xuất thân và giáo dục",
          id: createArticleItemId(),
          images: [],
        },
        {
          body: "",
          heading: "Sự nghiệp",
          id: createArticleItemId(),
          images: [],
        },
      ],
    },
    id: "article",
    type: "article",
    visible: true,
  };
}

export function getArticleBlock(document: ProfileDocument) {
  return (
    (document.blocks.find((block) => block.type === "article") as
      ArticleBlock | undefined) ?? null
  );
}

export function addArticleBlock(document: ProfileDocument): ProfileDocument {
  if (getArticleBlock(document)) return document;
  const blocks = [...document.blocks];
  const bioIndex = blocks.findIndex((block) => block.type === "bio");
  blocks.splice(bioIndex >= 0 ? bioIndex + 1 : 1, 0, createArticleBlock());
  return { ...document, blocks };
}

export function removeArticleBlock(document: ProfileDocument): ProfileDocument {
  const article = getArticleBlock(document);
  if (!article) return document;
  const keys = new Set(articleTranslationKeys(article));
  return {
    ...document,
    blocks: document.blocks.filter((block) => block.type !== "article"),
    translations: pruneTranslations(document, (key) => keys.has(key)),
  };
}

export function updateArticleBlock(
  document: ProfileDocument,
  update: (block: ArticleBlock) => ArticleBlock,
): ProfileDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.type === "article" ? update(block) : block,
    ) as ProfileBlock[],
  };
}

export function articleTranslationKeys(article: ArticleBlock) {
  return [
    ...article.data.facts.flatMap((fact) => [
      factKey(fact.id, "label"),
      factKey(fact.id, "value"),
    ]),
    ...article.data.sections.flatMap((section) => [
      sectionKey(section.id, "heading"),
      sectionKey(section.id, "body"),
      ...section.images.map((image) => imageKey(image.id)),
    ]),
    ...article.data.references.flatMap((reference) => [
      referenceKey(reference.id, "title"),
      referenceKey(reference.id, "source"),
    ]),
    ...(article.data.links ?? []).flatMap((link) => [
      linkKey(link.id, "title"),
      linkKey(link.id, "source"),
    ]),
  ];
}

function pruneTranslations(
  document: ProfileDocument,
  shouldRemove: (key: string) => boolean,
) {
  if (!document.translations) return document.translations;
  return Object.fromEntries(
    Object.entries(document.translations).map(([locale, values]) => [
      locale,
      Object.fromEntries(
        Object.entries(values ?? {}).filter(([key]) => !shouldRemove(key)),
      ),
    ]),
  ) as ProfileDocument["translations"];
}

/** Xoá bản dịch của các mục không còn tồn tại trong tài liệu. */
export function pruneOrphanTranslations(
  document: ProfileDocument,
): ProfileDocument {
  if (!document.translations) return document;
  const article = getArticleBlock(document);
  const valid = new Set([
    ...baseTranslationKeys,
    ...(article ? articleTranslationKeys(article) : []),
  ]);
  const translations = pruneTranslations(document, (key) => !valid.has(key));
  const cleaned = Object.fromEntries(
    Object.entries(translations ?? {})
      .map(([locale, values]) => [
        locale,
        Object.fromEntries(
          Object.entries(values ?? {}).filter(([, value]) => value.trim()),
        ),
      ])
      .filter(([, values]) => Object.keys(values).length),
  );
  return {
    ...document,
    translations: Object.keys(cleaned).length
      ? (cleaned as ProfileDocument["translations"])
      : undefined,
  };
}

export const baseTranslationKeys = [
  "identity.name",
  "identity.title",
  "identity.company",
  "identity.location",
  "bio.text",
] as const;

export const factKey = (id: string, field: "label" | "value") =>
  `fact.${id}.${field}`;
export const sectionKey = (id: string, field: "body" | "heading") =>
  `section.${id}.${field}`;
export const imageKey = (id: string) => `image.${id}.caption`;
export const referenceKey = (id: string, field: "source" | "title") =>
  `ref.${id}.${field}`;
export const linkKey = (id: string, field: "source" | "title") =>
  `link.${id}.${field}`;

export function isProfileLocale(value: unknown): value is ProfileLocale {
  return (
    typeof value === "string" &&
    (profileLocales as readonly string[]).includes(value)
  );
}

export function isProfileExtraLocale(
  value: unknown,
): value is ProfileExtraLocale {
  return (
    typeof value === "string" &&
    (profileExtraLocales as readonly string[]).includes(value)
  );
}

export function getTranslation(
  document: ProfileDocument,
  locale: ProfileLocale,
  key: string,
) {
  if (locale === "vi") return undefined;
  return document.translations?.[locale]?.[key];
}

export function setTranslation(
  document: ProfileDocument,
  locale: ProfileExtraLocale,
  key: string,
  value: string,
): ProfileDocument {
  const current = { ...(document.translations?.[locale] ?? {}) };
  if (value) current[key] = value;
  else delete current[key];
  return {
    ...document,
    translations: { ...(document.translations ?? {}), [locale]: current },
  };
}

/** Trả về tài liệu đã thay chữ theo ngôn ngữ; chỗ chưa dịch giữ tiếng Việt. */
export function localizeProfileDocument(
  document: ProfileDocument,
  locale: ProfileLocale,
): ProfileDocument {
  if (locale === "vi") return document;
  const values = document.translations?.[locale];
  if (!values || !Object.keys(values).length) return document;
  const pick = (key: string, fallback: string) => {
    const translated = values[key]?.trim();
    return translated ? translated : fallback;
  };
  const pickNullable = (key: string, fallback: string | null) => {
    const translated = values[key]?.trim();
    return translated ? translated : fallback;
  };
  return {
    ...document,
    blocks: document.blocks.map((block) => {
      if (block.type === "identity") {
        return {
          ...block,
          data: {
            ...block.data,
            company: pickNullable("identity.company", block.data.company),
            location: pickNullable("identity.location", block.data.location),
            name: pick("identity.name", block.data.name),
            title: pickNullable("identity.title", block.data.title),
          },
        };
      }
      if (block.type === "bio") {
        return {
          ...block,
          data: { text: pickNullable("bio.text", block.data.text) },
        };
      }
      if (block.type === "article") {
        return {
          ...block,
          data: {
            links: block.data.links?.map((link) => ({
              ...link,
              source: pickNullable(linkKey(link.id, "source"), link.source),
              title: pick(linkKey(link.id, "title"), link.title),
            })),
            facts: block.data.facts.map((fact) => ({
              ...fact,
              label: pick(factKey(fact.id, "label"), fact.label),
              value: pick(factKey(fact.id, "value"), fact.value),
            })),
            references: block.data.references.map((reference) => ({
              ...reference,
              source: pickNullable(
                referenceKey(reference.id, "source"),
                reference.source,
              ),
              title: pick(referenceKey(reference.id, "title"), reference.title),
            })),
            sections: block.data.sections.map((section) => ({
              ...section,
              body: pick(sectionKey(section.id, "body"), section.body),
              heading: pick(sectionKey(section.id, "heading"), section.heading),
              images: section.images.map((image) => ({
                ...image,
                caption: pickNullable(imageKey(image.id), image.caption),
              })),
            })),
          },
        };
      }
      return block;
    }) as ProfileBlock[],
  };
}

export function resolveProfileLocale(
  document: ProfileDocument,
  requested: unknown,
): ProfileLocale {
  if (!isProfileExtraLocale(requested)) return "vi";
  return document.languages?.includes(requested) ? requested : "vi";
}

export function collectArticleImageUrls(document: ProfileDocument | null) {
  const article = document ? getArticleBlock(document) : null;
  if (!article) return [];
  return article.data.sections.flatMap((section) =>
    section.images.map((image) => image.url),
  );
}

/** Mục chỉ hiện cho khách khi đã có nội dung hoặc ảnh; tiêu đề gợi ý còn trống thì ẩn. */
export function isFilledArticleSection(section: ArticleSection) {
  return Boolean(section.body.trim() || section.images.length);
}

export function hasArticleContent(block: ArticleBlock | null) {
  if (!block || !block.visible) return false;
  return (
    block.data.facts.some((fact) => fact.label.trim() && fact.value.trim()) ||
    block.data.sections.some(isFilledArticleSection) ||
    block.data.references.some((reference) => reference.title.trim()) ||
    (block.data.links ?? []).some((link) => link.url.trim())
  );
}

export function visibleArticleSections(block: ArticleBlock | null) {
  if (!block || !block.visible) return [] as ArticleSection[];
  return block.data.sections.filter(isFilledArticleSection);
}

export function moveItem<T>(items: T[], index: number, offset: -1 | 1) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export type { ArticleImage };
