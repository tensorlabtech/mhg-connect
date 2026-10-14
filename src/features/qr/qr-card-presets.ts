import type { QrCardTextStyle } from "@/db/schema/product";
import type { QrCardOrientation } from "@/features/qr/qr-card-layout";

/** Thư mục ảnh nền mẫu sticker: nằm trong public nên không cần tải lên kho ảnh. */
export const QR_CARD_PRESET_BACKGROUND_PREFIX = "/brand/card-backgrounds/";

/**
 * Mẫu sticker có sẵn (sticker sản phẩm MHG, chủ đề Đất nước…). Danh sách lấy từ bảng
 * `qr_card_presets` trong database, không viết cứng trong code.
 */
export type QrCardPreset = {
  backgroundUrl: string;
  category: string;
  id: string;
  name: string;
  orientation: QrCardOrientation;
  tagline: string;
  textStyle: QrCardTextStyle;
};

export function isPresetCardBackground(url: string | null | undefined) {
  return Boolean(url && url.startsWith(QR_CARD_PRESET_BACKGROUND_PREFIX));
}

/** Gom mẫu theo nhóm (giữ thứ tự đã sắp trong database). */
export function groupQrCardPresets(presets: readonly QrCardPreset[]) {
  const groups: { category: string; presets: QrCardPreset[] }[] = [];
  for (const preset of presets) {
    const group = groups.find((item) => item.category === preset.category);
    if (group) group.presets.push(preset);
    else groups.push({ category: preset.category, presets: [preset] });
  }
  return groups;
}

export const qrCardPresetIdPattern = /^[a-z0-9][a-z0-9-]{1,63}$/;
