/** Hướng thẻ/sticker QR: dọc (mặc định, như thẻ đeo) hoặc ngang (dán lên bề mặt). */
export const qrCardOrientations = ["portrait", "landscape"] as const;
export type QrCardOrientation = (typeof qrCardOrientations)[number];

/** Dòng chữ mặc định in cạnh logo MHG trên thẻ/sticker; để trống là ẩn. */
export const QR_CARD_DEFAULT_TAGLINE = "Bảo vệ khỏi virus, vi khuẩn và nấm";
export const QR_CARD_TAGLINE_MAX = 80;

export const qrCardOrientationOptions: {
  description: string;
  id: QrCardOrientation;
  label: string;
}[] = [
  { description: "Thẻ đeo, sticker dán dọc", id: "portrait", label: "Dọc" },
  {
    description: "Sticker dán ngang, danh thiếp",
    id: "landscape",
    label: "Ngang",
  },
];
