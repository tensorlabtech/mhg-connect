export const defaultCoverUrl = "/images/demo-profile-qr-cover.png";

export const avatarPresets = [
  {
    label: "Chân dung Minh Anh",
    url: "/images/demo-profile-nguyen-minh-anh.png",
  },
  {
    label: "Chân dung editorial",
    url: "/images/profile-presets/avatar-editorial.png",
  },
] as const;

export const coverPresets = [
  { label: "Tem QR kim loại", url: defaultCoverUrl },
  {
    label: "Vật liệu đen và ánh kim",
    url: "/images/profile-presets/cover-material.png",
  },
] as const;

export const allowedAvatarPresetUrls = new Set<string>(
  avatarPresets.map(({ url }) => url),
);
export const allowedCoverPresetUrls = new Set<string>(
  coverPresets.map(({ url }) => url),
);
