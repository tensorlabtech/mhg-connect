import type { QrCardOrientation } from "@/features/qr/qr-card-layout";

/** Nền thẻ/sticker có sẵn của MHG, nằm trong thư mục public nên không cần tải lên kho ảnh. */
export const qrCardPresetBackgrounds = [
  {
    id: "nano-xanh-doc",
    label: "Xanh Nano · dọc",
    orientation: "portrait",
    url: "/brand/card-backgrounds/nano-xanh-doc.jpg",
  },
  {
    id: "nano-xanh-ngang",
    label: "Xanh Nano · ngang",
    orientation: "landscape",
    url: "/brand/card-backgrounds/nano-xanh-ngang.jpg",
  },
] as const satisfies readonly {
  id: string;
  label: string;
  orientation: QrCardOrientation;
  url: string;
}[];

export type QrCardPresetId = (typeof qrCardPresetBackgrounds)[number]["id"];
export const qrCardPresetIds = qrCardPresetBackgrounds.map(
  (preset) => preset.id,
) as [QrCardPresetId, ...QrCardPresetId[]];

export function isPresetCardBackground(url: string | null | undefined) {
  return Boolean(url && url.startsWith("/brand/card-backgrounds/"));
}

export function presetBackgroundUrl(id: QrCardPresetId) {
  return qrCardPresetBackgrounds.find((preset) => preset.id === id)!.url;
}
