import type {
  ProfileBackgroundEffectId,
  ProfileBackgroundPresetId,
  ProfileDocument,
  ProfileHeaderLayout,
  ProfileStyleId,
} from "@/features/profile/profile-document-types";

export type ProfileStylePack = {
  description: string;
  headerLayout: ProfileHeaderLayout;
  id: ProfileStyleId;
  label: string;
  thumbnailUrl: string;
  tone: "dark" | "light";
};

export const profileStylePacks: readonly ProfileStylePack[] = [
  {
    description: "Serif lớn, căn giữa và nền tối sang trọng.",
    headerLayout: "cover",
    id: "signature-dark",
    label: "Chữ ký đêm",
    thumbnailUrl: "/images/profile-style-thumbnails/signature-dark.webp",
    tone: "dark",
  },
  {
    description: "Nền ánh sáng chuyển động, bố cục sáng và giàu chiều sâu.",
    headerLayout: "minimal",
    id: "studio-light",
    label: "Dòng sáng",
    thumbnailUrl: "/images/profile-style-thumbnails/studio-light.webp",
    tone: "light",
  },
  {
    description: "Đơn sắc, gọn và ưu tiên nội dung hơn trang trí.",
    headerLayout: "minimal",
    id: "minimal-mono",
    label: "Tối giản",
    thumbnailUrl: "/images/profile-style-thumbnails/minimal-mono.webp",
    tone: "light",
  },
  {
    description: "Bố cục tra cứu tối giản với bài viết và hộp thông tin.",
    headerLayout: "minimal",
    id: "wikipedia",
    label: "Bách khoa",
    thumbnailUrl: "/images/profile-style-thumbnails/wikipedia.svg",
    tone: "light",
  },
  {
    description: "Grid bất đối xứng, chữ lớn và điểm nhấn đỏ hiện đại.",
    headerLayout: "cover",
    id: "creator-bold",
    label: "Lưới biên tập",
    thumbnailUrl: "/images/profile-style-thumbnails/creator-bold.webp",
    tone: "light",
  },
  {
    description: "Split-screen tối, chân dung lớn và dữ liệu theo lớp.",
    headerLayout: "cover",
    id: "cinematic",
    label: "Điện ảnh",
    thumbnailUrl: "/images/profile-style-thumbnails/cinematic.webp",
    tone: "dark",
  },
] as const;

export const profileBackgroundPresets: ReadonlyArray<{
  color: string;
  id: ProfileBackgroundPresetId;
  label: string;
  tone: "dark" | "light";
}> = [
  { color: "#111416", id: "ink", label: "Mực", tone: "dark" },
  { color: "#f1f2ef", id: "paper", label: "Giấy", tone: "light" },
  { color: "#2447c6", id: "cobalt", label: "Cobalt", tone: "dark" },
  { color: "#304b3c", id: "forest", label: "Rừng", tone: "dark" },
  { color: "#7d3445", id: "wine", label: "Đỏ rượu", tone: "dark" },
] as const;

export const profileBackgroundEffects: ReadonlyArray<{
  description: string;
  id: ProfileBackgroundEffectId;
  label: string;
}> = [
  {
    description: "Các dải sáng mềm giao nhau trên nền tối.",
    id: "aurora",
    label: "Aurora",
  },
  {
    description: "Quầng sáng gold tập trung sau nội dung chính.",
    id: "halo",
    label: "Halo",
  },
  {
    description: "Ánh sáng lệch tâm như trong studio.",
    id: "spotlight",
    label: "Spotlight",
  },
] as const;

export const profileBackgroundImages = [
  {
    label: "Chất liệu gold",
    url: "/images/profile-presets/cover-material.png",
  },
  {
    label: "QR kim loại",
    url: "/images/demo-profile-qr-cover.png",
  },
  {
    label: "Chân dung",
    url: "/images/demo-profile-nguyen-minh-anh.png",
  },
] as const;

export function getProfileStylePack(styleId: ProfileStyleId) {
  return (
    profileStylePacks.find((style) => style.id === styleId) ??
    profileStylePacks[0]
  );
}

export function applyProfileStyle(
  document: ProfileDocument,
  styleId: ProfileStyleId,
): ProfileDocument {
  const style = getProfileStylePack(styleId);
  return {
    ...document,
    theme: {
      background: { type: "style" },
      headerLayout: style.headerLayout,
      themeId: style.id,
    },
  };
}
