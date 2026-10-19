import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, test } from "vitest";

import { defaultProfileVisibility } from "@/db/schema";
import {
  addArticleBlock,
  collectArticleImageUrls,
  getArticleBlock,
  localizeProfileDocument,
  pruneOrphanTranslations,
  removeArticleBlock,
  resolveProfileLocale,
  setTranslation,
  updateArticleBlock,
} from "@/features/profile/profile-article";
import { createProfileDocument } from "@/features/profile/profile-document";
import { parseProfileDocument } from "@/features/profile/profile-document-schema";
import type { ProfileDocument } from "@/features/profile/profile-document-types";
import {
  parseRichTextBlocks,
  parseRichTextInline,
} from "@/features/profile/profile-rich-text";
import { PublicProfile } from "@/features/profile/public-profile";

const profile = {
  avatarUrl: null,
  bio: "Giới thiệu ngắn",
  company: "MHG",
  contactEmail: "user@example.test",
  coverUrl: null,
  linkedIn: null,
  location: "Hà Nội",
  name: "Nguyễn Minh Anh",
  phone: null,
  status: "published" as const,
  telegram: null,
  template: "cover" as const,
  title: "Kiến trúc sư",
  visibleFields: defaultProfileVisibility,
  website: null,
  zalo: null,
};

function articleDocument(): ProfileDocument {
  const base = addArticleBlock(createProfileDocument(profile));
  return updateArticleBlock(
    {
      ...base,
      languages: ["en"],
      theme: { ...base.theme, themeId: "wikipedia" },
    },
    (block) => ({
      ...block,
      data: {
        facts: [
          {
            id: "fact-born",
            label: "Sinh",
            value:
              "1985, [Hà Nội](https://vi.wikipedia.org/wiki/H%C3%A0_N%E1%BB%99i)",
          },
        ],
        references: [
          {
            date: "12/10/2026",
            id: "ref-one",
            source: "Báo mẫu",
            title: "Bài viết mẫu",
            url: "https://example.test/bai-viet",
          },
        ],
        sections: [
          {
            body: "Đoạn một có [liên kết](https://example.test) và **chữ đậm**.[1]\n\n### Tiêu đề phụ\n- Ý một\n- Ý hai",
            heading: "Sự nghiệp",
            id: "sec-career",
            images: [
              {
                align: "right",
                caption: "Ảnh minh hoạ",
                id: "img-one",
                url: "https://example.test/anh.jpg",
              },
            ],
          },
        ],
      },
    }),
  );
}

describe("profile article document", () => {
  test("old four-block documents still parse", () => {
    expect(parseProfileDocument(createProfileDocument(profile))).not.toBeNull();
  });

  test("article block, languages and translations parse", () => {
    const document = setTranslation(
      articleDocument(),
      "en",
      "section.sec-career.heading",
      "Career",
    );
    const parsed = parseProfileDocument(document);
    expect(parsed).not.toBeNull();
    expect(getArticleBlock(parsed!)?.data.sections[0].heading).toBe(
      "Sự nghiệp",
    );
    expect(parsed!.translations?.en?.["section.sec-career.heading"]).toBe(
      "Career",
    );
  });

  test("rejects two article blocks and non-https images", () => {
    const document = articleDocument();
    const article = getArticleBlock(document)!;
    expect(
      parseProfileDocument({
        ...document,
        blocks: [...document.blocks, article],
      }),
    ).toBeNull();
    const insecure = updateArticleBlock(document, (block) => ({
      ...block,
      data: {
        ...block.data,
        sections: block.data.sections.map((section) => ({
          ...section,
          images: section.images.map((image) => ({
            ...image,
            url: "http://example.test/a.jpg",
          })),
        })),
      },
    }));
    expect(parseProfileDocument(insecure)).toBeNull();
  });

  test("localizes text and falls back to Vietnamese", () => {
    let document = articleDocument();
    document = setTranslation(document, "en", "identity.title", "Architect");
    document = setTranslation(document, "en", "fact.fact-born.label", "Born");
    const english = localizeProfileDocument(document, "en");
    const identity = english.blocks.find((block) => block.type === "identity");
    expect(identity?.type === "identity" && identity.data.title).toBe(
      "Architect",
    );
    const article = getArticleBlock(english)!;
    expect(article.data.facts[0].label).toBe("Born");
    expect(article.data.sections[0].heading).toBe("Sự nghiệp");
  });

  test("only enabled languages are served to visitors", () => {
    const document = articleDocument();
    expect(resolveProfileLocale(document, "en")).toBe("en");
    expect(resolveProfileLocale(document, "zh")).toBe("vi");
    expect(resolveProfileLocale(document, "fr")).toBe("vi");
  });

  test("prunes translations of removed items", () => {
    let document = setTranslation(
      articleDocument(),
      "en",
      "fact.fact-born.label",
      "Born",
    );
    document = setTranslation(document, "en", "fact.gone-item.label", "Old");
    const pruned = pruneOrphanTranslations(document);
    expect(pruned.translations?.en).toEqual({ "fact.fact-born.label": "Born" });
    const removed = removeArticleBlock(document);
    expect(getArticleBlock(removed)).toBeNull();
    expect(removed.translations?.en?.["fact.fact-born.label"]).toBeUndefined();
  });

  test("collects article image urls for cleanup", () => {
    expect(collectArticleImageUrls(articleDocument())).toEqual([
      "https://example.test/anh.jpg",
    ]);
  });
});

describe("rich text", () => {
  test("parses paragraphs, headings and lists", () => {
    expect(parseRichTextBlocks("Một\nhai\n\n### Phụ\n- A\n- B")).toEqual([
      { text: "Một\nhai", type: "paragraph" },
      { text: "Phụ", type: "heading" },
      { items: ["A", "B"], type: "list" },
    ]);
  });

  test("parses links, emphasis and citations without raw html", () => {
    expect(
      parseRichTextInline(
        "Xem [trang](https://example.test), **đậm**, ''nghiêng''[2] <b>x</b>",
      ),
    ).toEqual([
      { text: "Xem ", type: "text" },
      { href: "https://example.test", text: "trang", type: "link" },
      { text: ", ", type: "text" },
      { text: "đậm", type: "bold" },
      { text: ", ", type: "text" },
      { text: "nghiêng", type: "italic" },
      { index: 2, type: "citation" },
      { text: " <b>x</b>", type: "text" },
    ]);
  });

  test("does not turn javascript urls into links", () => {
    const tokens = parseRichTextInline("[x](javascript:alert(1))");
    expect(tokens.every((token) => token.type !== "link")).toBe(true);
  });
});

describe("public profile article rendering", () => {
  test("renders infobox facts, sections, references and language switch", () => {
    const markup = renderToStaticMarkup(
      createElement(PublicProfile, {
        document: articleDocument(),
        profile: { ...profile, publicToken: "DEMO" },
      }),
    );
    expect(markup).toContain("profile-wikipedia-infobox-facts");
    expect(markup).toContain("Sự nghiệp");
    expect(markup).toContain('href="#profile-ref-1"');
    expect(markup).toContain('id="profile-ref-1"');
    expect(markup).toContain('data-align="right"');
    expect(markup).toContain('href="?lang=en"');
    expect(markup).not.toContain("<b>");
  });

  test("renders the English version with translated UI labels", () => {
    const document = setTranslation(
      articleDocument(),
      "en",
      "section.sec-career.heading",
      "Career",
    );
    const markup = renderToStaticMarkup(
      createElement(PublicProfile, {
        document,
        locale: "en",
        profile: { ...profile, publicToken: "DEMO" },
      }),
    );
    expect(markup).toContain("Career");
    expect(markup).toContain("References");
    expect(markup).toContain("Save contact");
    expect(markup).toContain('lang="en"');
  });
});

describe("external links and videos", () => {
  test("recognizes YouTube and Vimeo links", async () => {
    const { parseVideoEmbed } =
      await import("@/features/profile/profile-video");
    expect(
      parseVideoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42")
        ?.embedUrl,
    ).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=42");
    expect(parseVideoEmbed("https://youtu.be/dQw4w9WgXcQ")?.provider).toBe(
      "youtube",
    );
    expect(
      parseVideoEmbed("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.provider,
    ).toBe("youtube");
    expect(parseVideoEmbed("https://vimeo.com/76979871")?.embedUrl).toBe(
      "https://player.vimeo.com/video/76979871",
    );
    expect(parseVideoEmbed("https://example.test/video")).toBeNull();
    expect(parseVideoEmbed("javascript:alert(1)")).toBeNull();
  });

  test("normalizes link urls and drops empty links when parsing", () => {
    const document = updateArticleBlock(articleDocument(), (block) => ({
      ...block,
      data: {
        ...block.data,
        links: [
          {
            id: "link-news",
            kind: "news",
            source: "Báo mẫu",
            title: "Tin",
            url: "example.test/tin",
          },
          {
            id: "link-empty",
            kind: "article",
            source: null,
            title: "",
            url: "  ",
          },
        ],
      },
    }));
    const parsed = parseProfileDocument(document);
    expect(getArticleBlock(parsed!)?.data.links).toEqual([
      {
        id: "link-news",
        kind: "news",
        source: "Báo mẫu",
        title: "Tin",
        url: "https://example.test/tin",
      },
    ]);
  });

  test("renders embedded video and news list on the public page", () => {
    const document = updateArticleBlock(articleDocument(), (block) => ({
      ...block,
      data: {
        ...block.data,
        links: [
          {
            id: "link-video",
            kind: "video",
            source: "Kênh mẫu",
            title: "Video mẫu",
            url: "https://youtu.be/dQw4w9WgXcQ",
          },
          {
            id: "link-news",
            kind: "news",
            source: "Báo mẫu",
            title: "Tin mẫu",
            url: "https://example.test/tin",
          },
        ],
      },
    }));
    const markup = renderToStaticMarkup(
      createElement(PublicProfile, {
        document,
        profile: { ...profile, publicToken: "DEMO" },
      }),
    );
    expect(markup).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(markup).toContain("Tin mẫu");
    expect(markup).toContain('id="profile-external-links"');
  });
});

describe("article image urls", () => {
  test("accepts https and same-site paths but not protocol-relative or http", () => {
    const withImage = (url: string) =>
      parseProfileDocument(
        updateArticleBlock(articleDocument(), (block) => ({
          ...block,
          data: {
            ...block.data,
            sections: [
              {
                body: "",
                heading: "A",
                id: "sec-img",
                images: [{ align: "right", caption: null, id: "img-1", url }],
              },
            ],
          },
        })),
      ) !== null;
    expect(withImage("https://example.com/a.jpg")).toBe(true);
    expect(withImage("/_demo/a.jpg")).toBe(true);
    expect(withImage("//evil.example/a.jpg")).toBe(false);
    expect(withImage("http://example.com/a.jpg")).toBe(false);
  });
});
