import { Fragment, type ReactNode } from "react";

/**
 * Định dạng văn bản tối giản cho mục bài viết hồ sơ:
 * - Dòng trống tách đoạn.
 * - `### Tiêu đề phụ` tạo tiêu đề nhỏ.
 * - `- nội dung` tạo danh sách.
 * - `[chữ](https://...)` tạo liên kết.
 * - `**đậm**`, `''nghiêng''`.
 * - `[1]` trỏ tới nguồn tham khảo số 1.
 * Không bao giờ chèn HTML thô.
 */
export type RichTextBlock =
  | { type: "heading"; text: string }
  | { items: string[]; type: "list" }
  | { text: string; type: "paragraph" };

export type RichTextInline =
  | { text: string; type: "text" }
  | { text: string; type: "bold" }
  | { text: string; type: "italic" }
  | { href: string; text: string; type: "link" }
  | { index: number; type: "citation" };

export function parseRichTextBlocks(source: string): RichTextBlock[] {
  const blocks: RichTextBlock[] = [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => {
    const text = paragraph.join("\n").trim();
    if (text) blocks.push({ text, type: "paragraph" });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ items: list, type: "list" });
    list = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = /^#{2,4}\s+(.+)$/.exec(line.trim());
    const bullet = /^\s*[-•*]\s+(.+)$/.exec(line);
    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ text: heading[1].trim(), type: "heading" });
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1].trim());
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

const inlinePattern =
  /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)|\*\*([^*\n]+)\*\*|''([^'\n]+)''|\[(\d{1,3})\]/g;

export function parseRichTextInline(source: string): RichTextInline[] {
  const tokens: RichTextInline[] = [];
  let last = 0;
  for (const match of source.matchAll(inlinePattern)) {
    const start = match.index ?? 0;
    if (start > last)
      tokens.push({ text: source.slice(last, start), type: "text" });
    if (match[1] && match[2]) {
      tokens.push({ href: match[2], text: match[1], type: "link" });
    } else if (match[3]) {
      tokens.push({ text: match[3], type: "bold" });
    } else if (match[4]) {
      tokens.push({ text: match[4], type: "italic" });
    } else if (match[5]) {
      tokens.push({ index: Number(match[5]), type: "citation" });
    }
    last = start + match[0].length;
  }
  if (last < source.length)
    tokens.push({ text: source.slice(last), type: "text" });
  return tokens;
}

export function plainTextFromRichText(source: string) {
  return parseRichTextInline(source)
    .map((token) =>
      token.type === "citation" ? "" : "text" in token ? token.text : "",
    )
    .join("");
}

function renderInline(
  source: string,
  options: { inert?: boolean; referenceCount: number },
): ReactNode {
  return parseRichTextInline(source).map((token, index) => {
    if (token.type === "text") {
      const lines = token.text.split("\n");
      return (
        <Fragment key={index}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </Fragment>
      );
    }
    if (token.type === "bold") return <strong key={index}>{token.text}</strong>;
    if (token.type === "italic") return <em key={index}>{token.text}</em>;
    if (token.type === "link") {
      if (options.inert)
        return (
          <span className="profile-rich-link" key={index}>
            {token.text}
          </span>
        );
      const external = token.href.startsWith("http");
      return (
        <a
          className="profile-rich-link"
          href={token.href}
          key={index}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {token.text}
        </a>
      );
    }
    if (token.index < 1 || token.index > options.referenceCount)
      return <Fragment key={index}>[{token.index}]</Fragment>;
    return (
      <sup className="profile-citation" key={index}>
        {options.inert ? (
          <span>[{token.index}]</span>
        ) : (
          <a href={`#profile-ref-${token.index}`}>[{token.index}]</a>
        )}
      </sup>
    );
  });
}

export function ProfileRichText({
  inert = false,
  referenceCount = 0,
  text,
}: {
  inert?: boolean;
  referenceCount?: number;
  text: string;
}) {
  const options = { inert, referenceCount };
  return (
    <div className="profile-rich-text">
      {parseRichTextBlocks(text).map((block, index) =>
        block.type === "heading" ? (
          <h3 key={index}>{renderInline(block.text, options)}</h3>
        ) : block.type === "list" ? (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item, options)}</li>
            ))}
          </ul>
        ) : (
          <p key={index}>{renderInline(block.text, options)}</p>
        ),
      )}
    </div>
  );
}

export function ProfileRichInline({
  inert = false,
  referenceCount = 0,
  text,
}: {
  inert?: boolean;
  referenceCount?: number;
  text: string;
}) {
  return <>{renderInline(text, { inert, referenceCount })}</>;
}
