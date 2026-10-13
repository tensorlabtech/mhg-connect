export const requiredProfileBlockTypes = [
  "identity",
  "bio",
  "contact",
  "social",
] as const;
export const profileBlockTypes = [
  ...requiredProfileBlockTypes,
  "article",
] as const;

export type ProfileBlockType = (typeof profileBlockTypes)[number];
export type RequiredProfileBlockType =
  (typeof requiredProfileBlockTypes)[number];

export const profileLocales = ["vi", "en", "zh"] as const;
export type ProfileLocale = (typeof profileLocales)[number];
export const profileExtraLocales = ["en", "zh"] as const;
export type ProfileExtraLocale = (typeof profileExtraLocales)[number];
/** Bản dịch theo khóa ổn định, ví dụ `identity.title`, `section.<id>.body`. */
export type ProfileTranslations = Partial<
  Record<ProfileExtraLocale, Record<string, string>>
>;
export type ProfileHeaderLayout = "cover" | "minimal";
export const profileStyleIds = [
  "signature-dark",
  "studio-light",
  "minimal-mono",
  "wikipedia",
  "creator-bold",
  "cinematic",
] as const;
export type ProfileStyleId = (typeof profileStyleIds)[number];
export const profileBackgroundPresetIds = [
  "ink",
  "paper",
  "cobalt",
  "forest",
  "wine",
] as const;
export type ProfileBackgroundPresetId =
  (typeof profileBackgroundPresetIds)[number];
export const profileBackgroundEffectIds = [
  "aurora",
  "halo",
  "spotlight",
] as const;
export type ProfileBackgroundEffectId =
  (typeof profileBackgroundEffectIds)[number];
export type ProfileBackground =
  | { type: "style" }
  | { presetId: ProfileBackgroundPresetId; type: "preset" }
  | { effectId: ProfileBackgroundEffectId; type: "effect" }
  | { imageUrl: string; overlay: number; type: "image" };
export const socialProfileFields = [
  "facebook",
  "github",
  "instagram",
  "linkedIn",
  "telegram",
  "tiktok",
  "x",
  "youtube",
  "zalo",
] as const;
export type SocialProfileField = (typeof socialProfileFields)[number];

export type IdentityBlock = {
  data: {
    avatarUrl: string | null;
    company: string | null;
    coverUrl: string | null;
    location: string | null;
    name: string;
    title: string | null;
    visibleFields: {
      company: boolean;
      location: boolean;
      title: boolean;
    };
  };
  id: "identity";
  locked: true;
  type: "identity";
  visible: true;
};

export type BioBlock = {
  data: { text: string | null };
  id: "bio";
  type: "bio";
  visible: boolean;
};

export type ContactBlock = {
  data: {
    contactEmail: string | null;
    phone: string | null;
    visibleFields: { email: boolean; phone: boolean; website: boolean };
    website: string | null;
  };
  id: "contact";
  type: "contact";
  visible: boolean;
};

export type SocialBlock = {
  data: Record<SocialProfileField, string | null> & {
    visibleFields: Record<SocialProfileField, boolean>;
  };
  id: "social";
  type: "social";
  visible: boolean;
};

export type ArticleFact = { id: string; label: string; value: string };
export const articleImageAligns = ["right", "left", "center"] as const;
export type ArticleImageAlign = (typeof articleImageAligns)[number];
export type ArticleImage = {
  align: ArticleImageAlign;
  caption: string | null;
  id: string;
  url: string;
};
export type ArticleSection = {
  body: string;
  heading: string;
  id: string;
  images: ArticleImage[];
};
export type ArticleReference = {
  date: string | null;
  id: string;
  source: string | null;
  title: string;
  url: string | null;
};

export const articleLinkKinds = [
  "news",
  "article",
  "video",
  "website",
] as const;
export type ArticleLinkKind = (typeof articleLinkKinds)[number];
export type ArticleLink = {
  id: string;
  kind: ArticleLinkKind;
  source: string | null;
  title: string;
  url: string;
};

export type ArticleBlock = {
  data: {
    facts: ArticleFact[];
    links?: ArticleLink[];
    references: ArticleReference[];
    sections: ArticleSection[];
  };
  id: "article";
  type: "article";
  visible: boolean;
};

export type ProfileBlock =
  IdentityBlock | BioBlock | ContactBlock | SocialBlock | ArticleBlock;

export type ProfileDocument = {
  blocks: ProfileBlock[];
  /** Ngôn ngữ bổ sung hiển thị cho khách (tiếng Việt luôn có). */
  languages?: ProfileExtraLocale[];
  schemaVersion: 1;
  theme: {
    background: ProfileBackground;
    headerLayout: ProfileHeaderLayout;
    themeId: ProfileStyleId;
  };
  translations?: ProfileTranslations;
};
