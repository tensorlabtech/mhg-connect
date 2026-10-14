import { describe, expect, it } from "vitest";

import {
  QR_CARD_DEFAULT_FONT,
  getQrCardFontOption,
  normalizeQrCardTextColor,
  qrCardFontOptions,
  qrCardFonts,
} from "@/features/qr/qr-card-layout";
import { qrCardTextColorInput } from "@/features/qr/qr-card-text-color-input";
import { isDarkCardTextColor } from "@/features/qr/qr-visual-card";

describe("phông chữ và màu chữ trên thẻ QR", () => {
  it("mỗi phông trong danh sách có một lựa chọn hiển thị, phông lạ quay về mặc định", () => {
    expect(qrCardFontOptions.map((option) => option.id)).toEqual([
      ...qrCardFonts,
    ]);
    expect(getQrCardFontOption("oswald").id).toBe("oswald");
    expect(getQrCardFontOption("comic-sans").id).toBe(QR_CARD_DEFAULT_FONT);
    expect(getQrCardFontOption(null).id).toBe(QR_CARD_DEFAULT_FONT);
  });

  it("chỉ nhận màu dạng #rrggbb, đưa về chữ thường", () => {
    expect(normalizeQrCardTextColor(" #F2C75C ")).toBe("#f2c75c");
    expect(normalizeQrCardTextColor("red")).toBeNull();
    expect(normalizeQrCardTextColor("#fff")).toBeNull();
    expect(normalizeQrCardTextColor(undefined)).toBeNull();
    expect(qrCardTextColorInput.parse("#AABBCC")).toBe("#aabbcc");
    expect(qrCardTextColorInput.parse(null)).toBeNull();
    expect(qrCardTextColorInput.safeParse("url(x)").success).toBe(false);
  });

  it("nhận ra màu tối để đổi bóng chữ cho dễ đọc", () => {
    expect(isDarkCardTextColor("#0a0a0a")).toBe(true);
    expect(isDarkCardTextColor("#14532d")).toBe(true);
    expect(isDarkCardTextColor("#ffffff")).toBe(false);
    expect(isDarkCardTextColor("#f2c75c")).toBe(false);
  });
});
