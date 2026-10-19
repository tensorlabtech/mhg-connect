import {
  createArticleItemId,
  getArticleBlock,
} from "@/features/profile/profile-article";
import type {
  ArticleBlock,
  ProfileBlock,
  ProfileDocument,
} from "@/features/profile/profile-document-types";

/** Gợi ý mờ cho từng dòng hộp thông tin, tra theo tên dòng. */
const factHints: { match: RegExp; placeholder: string }[] = [
  {
    match: /^sinh|năm sinh|ngày sinh/i,
    placeholder: "Ví dụ: 12/05/1980, Nam Định",
  },
  { match: /quê/i, placeholder: "Ví dụ: Nam Định" },
  {
    match: /học vấn|trường|tốt nghiệp/i,
    placeholder: "Ví dụ: Đại học Bách khoa Hà Nội",
  },
  {
    match: /lĩnh vực|chuyên môn/i,
    placeholder: "Ví dụ: Vật liệu xanh, ESG, chuyển đổi số",
  },
  {
    match: /châm ngôn|phương châm|định hướng/i,
    placeholder: "Ví dụ: “Đi chậm mà chắc”",
  },
  {
    match: /chức vụ|đồng thời|vai trò/i,
    placeholder: "Ví dụ: Chủ tịch HĐQT Công ty ABC",
  },
  { match: /web|trang/i, placeholder: "Ví dụ: [congty.vn](https://congty.vn)" },
  {
    match: /giải thưởng|ghi nhận/i,
    placeholder: "Ví dụ: Top 50 Thương hiệu tin cậy (2021)",
  },
];

export function factPlaceholder(label: string) {
  return (
    factHints.find((hint) => hint.match.test(label.trim()))?.placeholder ??
    "Nội dung, có thể chèn [liên kết](https://...)"
  );
}

/** Gợi ý mờ cho nội dung từng mục, tra theo tiêu đề mục. */
const sectionHints: { match: RegExp; placeholder: string }[] = [
  {
    match: /xuất thân|giáo dục|học vấn|tiểu sử/i,
    placeholder:
      "Ví dụ: Sinh năm 1980 tại Nam Định. Năm 2003 tốt nghiệp Đại học Bách khoa Hà Nội ngành Cơ khí, sau đó học thạc sĩ Quản trị kinh doanh…",
  },
  {
    match: /sự nghiệp|công việc|kinh nghiệm/i,
    placeholder:
      "Ví dụ: Năm 2010 sáng lập Công ty ABC. Từ năm 2020 giữ chức Chủ tịch HĐQT, đưa công ty mở rộng sang vật liệu xanh…",
  },
  {
    match: /thành tựu|giải thưởng|khen thưởng|ghi nhận/i,
    placeholder:
      "Ví dụ: Bằng khen của Bộ trưởng Bộ Công Thương (2021). Top 50 Thương hiệu tin cậy…",
  },
  {
    match: /hoạt động|cộng đồng|thiện nguyện|xã hội/i,
    placeholder:
      "Ví dụ: Sáng lập quỹ học bổng cho học sinh vùng cao, tổ chức trao quà Trung thu cho bệnh nhi…",
  },
  {
    match: /quan điểm|triết lý|tầm nhìn/i,
    placeholder:
      "Ví dụ: Ông cho rằng doanh nghiệp nên “đi chậm mà chắc”, đặt chất lượng lên trước tốc độ…",
  },
  {
    match: /đời tư|gia đình|sở thích/i,
    placeholder:
      "Ví dụ: Sở thích, gia đình… Chỉ ghi những điều bạn muốn công khai.",
  },
  {
    match: /báo chí|truyền thông/i,
    placeholder:
      "Ví dụ: Năm 2025 trả lời phỏng vấn VnExpress về thị trường tín chỉ carbon [1]…",
  },
];

export function sectionBodyPlaceholder(heading: string) {
  return (
    sectionHints.find((hint) => hint.match.test(heading))?.placeholder ??
    "Viết vài câu cho mục này. Dòng trống để sang đoạn mới."
  );
}

export const suggestedFactLabels = [
  "Sinh",
  "Quê quán",
  "Học vấn",
  "Lĩnh vực",
  "Châm ngôn",
  "Trang web",
];

export const suggestedSectionHeadings = [
  "Xuất thân và giáo dục",
  "Sự nghiệp",
  "Thành tựu và ghi nhận",
  "Hoạt động cộng đồng",
  "Quan điểm",
  "Đời tư",
];

function createTemplateArticle(): ArticleBlock {
  return {
    data: {
      facts: suggestedFactLabels
        .slice(0, 5)
        .map((label) => ({ id: createArticleItemId(), label, value: "" })),
      links: [],
      references: [],
      sections: suggestedSectionHeadings.slice(0, 4).map((heading) => ({
        body: "",
        heading,
        id: createArticleItemId(),
        images: [],
      })),
    },
    id: "article",
    type: "article",
    visible: true,
  };
}

/**
 * Trình sửa dạng form luôn có sẵn bài viết với đủ các ô gợi ý.
 * Ô nào còn trống thì trang công khai không hiện, nên thêm sẵn không làm đổi trang của khách.
 */
export function withFormTemplate(document: ProfileDocument): ProfileDocument {
  if (getArticleBlock(document)) return document;
  const blocks = [...document.blocks];
  const bioIndex = blocks.findIndex((block) => block.type === "bio");
  blocks.splice(bioIndex >= 0 ? bioIndex + 1 : 1, 0, createTemplateArticle());
  return { ...document, blocks: blocks as ProfileBlock[] };
}
