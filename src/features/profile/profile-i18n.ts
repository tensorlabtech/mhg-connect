import type { ProfileLocale } from "@/features/profile/profile-document-types";

export const profileLocaleLabels: Record<
  ProfileLocale,
  { long: string; short: string }
> = {
  en: { long: "English", short: "EN" },
  vi: { long: "Tiếng Việt", short: "VI" },
  zh: { long: "中文", short: "中文" },
};

const strings = {
  about: { en: "About", vi: "Giới thiệu", zh: "简介" },
  article: { en: "Article", vi: "Bài viết", zh: "条目" },
  call: { en: "Call", vi: "Gọi", zh: "拨打" },
  company: { en: "Organization", vi: "Đơn vị", zh: "单位" },
  contact: { en: "Contact", vi: "Liên hệ", zh: "联系" },
  contactDetails: {
    en: "Contact details",
    vi: "Thông tin liên hệ",
    zh: "联系方式",
  },
  contents: { en: "Contents", vi: "Mục lục", zh: "目录" },
  email: { en: "Email", vi: "Email", zh: "电子邮件" },
  externalLinks: { en: "External links", vi: "Liên kết ngoài", zh: "外部链接" },
  facts: { en: "Key facts", vi: "Thông tin cơ bản", zh: "基本信息" },
  language: { en: "Language", vi: "Ngôn ngữ", zh: "语言" },
  location: { en: "Location", vi: "Địa điểm", zh: "地点" },
  phone: { en: "Phone", vi: "Điện thoại", zh: "电话" },
  references: { en: "References", vi: "Tham khảo", zh: "参考资料" },
  retrieved: { en: "Retrieved", vi: "Truy cập", zh: "访问于" },
  saveContact: { en: "Save contact", vi: "Lưu liên hệ", zh: "保存联系人" },
  share: { en: "Share", vi: "Chia sẻ", zh: "分享" },
  social: { en: "Social media", vi: "Mạng xã hội", zh: "社交媒体" },
  title: { en: "Position", vi: "Chức danh", zh: "职务" },
  website: { en: "Website", vi: "Website", zh: "网站" },
} as const;

export type ProfileStringKey = keyof typeof strings;

export function profileText(locale: ProfileLocale, key: ProfileStringKey) {
  return strings[key][locale] ?? strings[key].vi;
}

export function profileHtmlLang(locale: ProfileLocale) {
  return locale === "zh" ? "zh-Hans" : locale;
}
