import {
  getArticleBlock,
  getTranslation,
  setTranslation,
  updateArticleBlock,
} from "@/features/profile/profile-article";
import type {
  ArticleBlock,
  ProfileBlock,
  ProfileDocument,
  ProfileLocale,
  SocialProfileField,
} from "@/features/profile/profile-document-types";

/**
 * Khoá của từng chữ sửa được ngay trên trang. Trùng với khoá bản dịch
 * (identity.title, section.<id>.body…) nên cùng một khoá dùng được cho mọi ngôn ngữ.
 * Các khoá contact.*, social.*, ref.<id>.url|date, link.<id>.url là dữ liệu dùng chung, không dịch.
 */
export type InlineKey = string;

const sharedPrefixes = ["contact.", "social."];

export function isSharedKey(key: InlineKey) {
  return (
    sharedPrefixes.some((prefix) => key.startsWith(prefix)) ||
    /^ref\.[^.]+\.(url|date)$/.test(key) ||
    /^link\.[^.]+\.url$/.test(key)
  );
}

function parseItemKey(key: string) {
  const match = /^(fact|section|image|ref|link)\.([^.]+)\.(\w+)$/.exec(key);
  return match
    ? { field: match[3], id: match[2], kind: match[1] as ItemKind }
    : null;
}
type ItemKind = "fact" | "image" | "link" | "ref" | "section";

/** Chữ gốc (tiếng Việt) của một khoá. */
export function readBaseText(document: ProfileDocument, key: InlineKey) {
  for (const block of document.blocks) {
    if (block.type === "identity" && key.startsWith("identity.")) {
      const field = key.slice("identity.".length) as
        "company" | "location" | "name" | "title";
      return block.data[field] ?? "";
    }
    if (block.type === "bio" && key === "bio.text")
      return block.data.text ?? "";
    if (block.type === "contact" && key.startsWith("contact.")) {
      const field = key.slice("contact.".length) as
        "contactEmail" | "phone" | "website";
      return block.data[field] ?? "";
    }
    if (block.type === "social" && key.startsWith("social.")) {
      return (
        block.data[key.slice("social.".length) as SocialProfileField] ?? ""
      );
    }
  }
  const item = parseItemKey(key);
  const article = getArticleBlock(document);
  if (!item || !article) return "";
  const data = article.data;
  if (item.kind === "fact") {
    const fact = data.facts.find((entry) => entry.id === item.id);
    return fact ? (fact[item.field as "label" | "value"] ?? "") : "";
  }
  if (item.kind === "section") {
    const section = data.sections.find((entry) => entry.id === item.id);
    return section ? (section[item.field as "body" | "heading"] ?? "") : "";
  }
  if (item.kind === "image") {
    for (const section of data.sections) {
      const image = section.images.find((entry) => entry.id === item.id);
      if (image) return image.caption ?? "";
    }
    return "";
  }
  if (item.kind === "ref") {
    const reference = data.references.find((entry) => entry.id === item.id);
    return reference
      ? (reference[item.field as "date" | "source" | "title" | "url"] ?? "")
      : "";
  }
  const link = (data.links ?? []).find((entry) => entry.id === item.id);
  return link ? (link[item.field as "source" | "title" | "url"] ?? "") : "";
}

function patchArticle(
  document: ProfileDocument,
  mutate: (data: ArticleBlock["data"]) => ArticleBlock["data"],
) {
  return updateArticleBlock(document, (block) => ({
    ...block,
    data: mutate(block.data),
  }));
}

/** Ghi chữ gốc (tiếng Việt) vào đúng chỗ trong tài liệu. */
export function writeBaseText(
  document: ProfileDocument,
  key: InlineKey,
  raw: string,
): ProfileDocument {
  const value = raw;
  const nullable = value.trim() ? value : null;
  if (
    key.startsWith("identity.") ||
    key === "bio.text" ||
    key.startsWith("contact.") ||
    key.startsWith("social.")
  ) {
    return {
      ...document,
      blocks: document.blocks.map((block) => {
        if (block.type === "identity" && key.startsWith("identity.")) {
          const field = key.slice("identity.".length);
          return {
            ...block,
            data: {
              ...block.data,
              [field]: field === "name" ? value : nullable,
            },
          };
        }
        if (block.type === "bio" && key === "bio.text")
          return { ...block, data: { text: nullable } };
        if (block.type === "contact" && key.startsWith("contact."))
          return {
            ...block,
            data: { ...block.data, [key.slice("contact.".length)]: nullable },
          };
        if (block.type === "social" && key.startsWith("social."))
          return {
            ...block,
            data: { ...block.data, [key.slice("social.".length)]: nullable },
          };
        return block;
      }) as ProfileBlock[],
    };
  }
  const item = parseItemKey(key);
  if (!item) return document;
  return patchArticle(document, (data) => {
    if (item.kind === "fact")
      return {
        ...data,
        facts: data.facts.map((fact) =>
          fact.id === item.id ? { ...fact, [item.field]: value } : fact,
        ),
      };
    if (item.kind === "section")
      return {
        ...data,
        sections: data.sections.map((section) =>
          section.id === item.id
            ? { ...section, [item.field]: value }
            : section,
        ),
      };
    if (item.kind === "image")
      return {
        ...data,
        sections: data.sections.map((section) => ({
          ...section,
          images: section.images.map((image) =>
            image.id === item.id ? { ...image, caption: nullable } : image,
          ),
        })),
      };
    if (item.kind === "ref")
      return {
        ...data,
        references: data.references.map((reference) =>
          reference.id === item.id
            ? {
                ...reference,
                [item.field]: item.field === "title" ? value : nullable,
              }
            : reference,
        ),
      };
    return {
      ...data,
      links: (data.links ?? []).map((link) =>
        link.id === item.id
          ? {
              ...link,
              [item.field]: item.field === "source" ? nullable : value,
            }
          : link,
      ),
    };
  });
}

/** Chữ đang hiện ở ngôn ngữ đang sửa và chữ gốc tiếng Việt để làm gợi ý. */
export function readInlineText(
  document: ProfileDocument,
  locale: ProfileLocale,
  key: InlineKey,
) {
  const original = readBaseText(document, key);
  if (locale === "vi" || isSharedKey(key)) return { original, value: original };
  return { original, value: getTranslation(document, locale, key) ?? "" };
}

export function writeInlineText(
  document: ProfileDocument,
  locale: ProfileLocale,
  key: InlineKey,
  value: string,
) {
  if (locale === "vi" || isSharedKey(key))
    return writeBaseText(document, key, value);
  return setTranslation(document, locale, key, value);
}
