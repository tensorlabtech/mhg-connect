import { describe, expect, it } from "vitest";

import {
  groupQrCardPresets,
  isPresetCardBackground,
  qrCardPresetIdPattern,
  type QrCardPreset,
} from "@/features/qr/qr-card-presets";

const preset = (id: string, category: string): QrCardPreset => ({
  backgroundUrl: `/brand/card-backgrounds/${id}.jpg`,
  category,
  id,
  name: id,
  orientation: "portrait",
  tagline: "Bảo vệ khỏi virus, vi khuẩn và nấm",
  textStyle: "dark",
});

describe("qr card presets", () => {
  it("groups presets by category and keeps database order", () => {
    const groups = groupQrCardPresets([
      preset("nano-xanh-doc", "Sticker sản phẩm MHG"),
      preset("dat-nuoc-ha-long-doc", "Đất nước"),
      preset("nano-xanh-ngang", "Sticker sản phẩm MHG"),
    ]);
    expect(groups.map((group) => group.category)).toEqual([
      "Sticker sản phẩm MHG",
      "Đất nước",
    ]);
    expect(groups[0].presets.map((item) => item.id)).toEqual([
      "nano-xanh-doc",
      "nano-xanh-ngang",
    ]);
  });

  it("only treats files in the public sticker folder as preset backgrounds", () => {
    expect(isPresetCardBackground("/brand/card-backgrounds/sen.jpg")).toBe(true);
    expect(isPresetCardBackground("https://cdn.example/a.jpg")).toBe(false);
    expect(isPresetCardBackground(null)).toBe(false);
  });

  it("accepts only slug-like preset ids", () => {
    expect(qrCardPresetIdPattern.test("dat-nuoc-sen-doc")).toBe(true);
    expect(qrCardPresetIdPattern.test("../../etc")).toBe(false);
    expect(qrCardPresetIdPattern.test("A")).toBe(false);
  });
});
