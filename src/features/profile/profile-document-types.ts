export const profileBlockTypes = [
  "identity",
  "bio",
  "contact",
  "social",
] as const;

export type ProfileBlockType = (typeof profileBlockTypes)[number];
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

export type ProfileBlock =
  IdentityBlock | BioBlock | ContactBlock | SocialBlock;

export type ProfileDocument = {
  blocks: ProfileBlock[];
  schemaVersion: 1;
  theme: {
    background: ProfileBackground;
    headerLayout: ProfileHeaderLayout;
    themeId: ProfileStyleId;
  };
};
