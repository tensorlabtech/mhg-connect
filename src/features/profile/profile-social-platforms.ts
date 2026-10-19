import type { SocialProfileField } from "@/features/profile/profile-document-types";

export type SocialPlatform = {
  baseUrl: string;
  field: SocialProfileField;
  group: "content" | "messaging" | "primary";
  iconPath: string;
  label: string;
  maxLength: number;
  placeholder: string;
};

export const socialPlatforms: readonly SocialPlatform[] = [
  {
    baseUrl: "https://zalo.me/",
    field: "zalo",
    group: "primary",
    iconPath: "/icons/social/zalo.svg",
    label: "Zalo",
    maxLength: 80,
    placeholder: "Số điện thoại Zalo…",
  },
  {
    baseUrl: "https://facebook.com/",
    field: "facebook",
    group: "primary",
    iconPath: "/icons/social/facebook.svg",
    label: "Facebook",
    maxLength: 240,
    placeholder: "https://facebook.com/ten-cua-ban…",
  },
  {
    baseUrl: "https://instagram.com/",
    field: "instagram",
    group: "primary",
    iconPath: "/icons/social/instagram.svg",
    label: "Instagram",
    maxLength: 240,
    placeholder: "@ten_instagram…",
  },
  {
    baseUrl: "https://linkedin.com/in/",
    field: "linkedIn",
    group: "primary",
    iconPath: "/icons/social/linkedin.svg",
    label: "LinkedIn",
    maxLength: 240,
    placeholder: "https://linkedin.com/in/ten-cua-ban…",
  },
  {
    baseUrl: "https://tiktok.com/@",
    field: "tiktok",
    group: "content",
    iconPath: "/icons/social/tiktok.svg",
    label: "TikTok",
    maxLength: 240,
    placeholder: "@ten_tiktok…",
  },
  {
    baseUrl: "https://youtube.com/",
    field: "youtube",
    group: "content",
    iconPath: "/icons/social/youtube.svg",
    label: "YouTube",
    maxLength: 240,
    placeholder: "https://youtube.com/@kenh-cua-ban…",
  },
  {
    baseUrl: "https://x.com/",
    field: "x",
    group: "content",
    iconPath: "/icons/social/x.svg",
    label: "X",
    maxLength: 240,
    placeholder: "@ten_x…",
  },
  {
    baseUrl: "https://github.com/",
    field: "github",
    group: "messaging",
    iconPath: "/icons/social/github.svg",
    label: "GitHub",
    maxLength: 240,
    placeholder: "https://github.com/ten-cua-ban…",
  },
  {
    baseUrl: "https://t.me/",
    field: "telegram",
    group: "messaging",
    iconPath: "/icons/social/telegram.svg",
    label: "Telegram",
    maxLength: 80,
    placeholder: "@ten_telegram…",
  },
] as const;

export function getSocialProfileHref(
  platform: SocialPlatform,
  rawValue: string,
) {
  const value = rawValue.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const identifier =
    platform.field === "zalo"
      ? value.replace(/\D/g, "")
      : value.replace(/^@/, "");
  return `${platform.baseUrl}${identifier}`;
}
