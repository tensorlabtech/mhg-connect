/** Hướng thẻ/sticker QR: dọc (mặc định, như thẻ đeo) hoặc ngang (dán lên bề mặt). */
export const qrCardOrientations = ["portrait", "landscape"] as const;
export type QrCardOrientation = (typeof qrCardOrientations)[number];

export const qrCardPositions = ["left", "right", "top", "bottom"] as const;
export type QrCardPosition = (typeof qrCardPositions)[number];
export const qrCardPositionOptions: { id: QrCardPosition; label: string }[] = [
  { id: "left", label: "QR bên trái" },
  { id: "right", label: "QR bên phải" },
  { id: "top", label: "QR phía trên" },
  { id: "bottom", label: "QR phía dưới" },
];

export function normalizeQrCardPosition(value: unknown): QrCardPosition {
  return qrCardPositions.includes(value as QrCardPosition)
    ? (value as QrCardPosition)
    : "bottom";
}

/** Required MHG brand line. Card templates cannot edit or hide it. */
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

/** Phông chữ in trên thẻ; mọi phông đều có đủ dấu tiếng Việt. */
export const qrCardFonts = [
  "be-vietnam",
  "manrope",
  "oswald",
  "playfair",
  "lora",
  "dancing",
] as const;
export type QrCardFont = (typeof qrCardFonts)[number];
export const QR_CARD_DEFAULT_FONT: QrCardFont = "be-vietnam";

export const qrCardFontOptions: {
  description: string;
  family: string;
  id: QrCardFont;
  label: string;
  /** Phông chữ viết tay không viết hoa toàn bộ tên. */
  uppercase: boolean;
}[] = [
  {
    description: "Rõ ràng",
    family: '"Be Vietnam Pro", system-ui, sans-serif',
    id: "be-vietnam",
    label: "Be Vietnam",
    uppercase: true,
  },
  {
    description: "Hiện đại",
    family: '"Manrope Variable", "Be Vietnam Pro", sans-serif',
    id: "manrope",
    label: "Manrope",
    uppercase: true,
  },
  {
    description: "Cao, đậm",
    family: '"Oswald Variable", "Be Vietnam Pro", sans-serif',
    id: "oswald",
    label: "Oswald",
    uppercase: true,
  },
  {
    description: "Sang trọng",
    family: '"Playfair Display Variable", Georgia, serif',
    id: "playfair",
    label: "Playfair",
    uppercase: true,
  },
  {
    description: "Mềm mại",
    family: '"Lora Variable", Georgia, serif',
    id: "lora",
    label: "Lora",
    uppercase: true,
  },
  {
    description: "Bay bướm",
    family: '"Dancing Script Variable", cursive',
    id: "dancing",
    label: "Viết tay",
    uppercase: false,
  },
];

export function getQrCardFontOption(font: string | null | undefined) {
  return (
    qrCardFontOptions.find((option) => option.id === font) ??
    qrCardFontOptions[0]
  );
}

/** Màu chữ: null là tự động (trắng trên nền tối, đen trên khung sáng). */
export const qrCardTextColorPattern = /^#[0-9a-f]{6}$/;

export const qrCardTextColorSwatches: { label: string; value: string }[] = [
  { label: "Trắng", value: "#ffffff" },
  { label: "Đen", value: "#0a0a0a" },
  { label: "Vàng kim", value: "#f2c75c" },
  { label: "Kem", value: "#fdf3d7" },
  { label: "Xanh lá MHG", value: "#86efac" },
  { label: "Xanh rêu", value: "#14532d" },
  { label: "Đỏ son", value: "#b91c1c" },
  { label: "Xanh navy", value: "#1e3a8a" },
];

/** Chuẩn hoá màu người dùng nhập về dạng #rrggbb chữ thường; sai định dạng trả null. */
export function normalizeQrCardTextColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const color = value.trim().toLowerCase();
  return qrCardTextColorPattern.test(color) ? color : null;
}
