import { describe, expect, it } from "vitest";
import {
  cardAppearanceInput,
  resolveCardIdentity,
  businessCardTemplates,
  validateCardImage,
  getCardBackgroundPreview,
  clearCardPersonalContent,
} from "./qr-card-appearance";

describe("business card appearance", () => {
  it("clears every personal item without changing the profile or other appearance settings", () => {
    const profile = {
      name: "Nguyễn Văn Thanh",
      title: "Trưởng ban",
      avatarUrl: "/profile.png",
    };
    const original = {
      finish: "foil" as const,
      backgroundDim: 20,
      copy: { name: "Tên riêng" },
      avatarCrop: { x: 20, y: 60, zoom: 2 },
    };
    const cleared = clearCardPersonalContent(original);
    expect(cardAppearanceInput.safeParse(cleared).success).toBe(true);
    expect(cleared.copy).toEqual({
      name: "",
      title: "",
      company: "",
      phone: "",
      website: "",
      location: "",
    });
    expect(cleared.showAvatar).toBe(false);
    expect(cleared.showEnterpriseLogo).toBe(false);
    expect(cleared.finish).toBe("foil");
    expect(cleared.avatarCrop).toEqual(original.avatarCrop);
    expect(original.copy.name).toBe("Tên riêng");
    const result = resolveCardIdentity(profile, cleared);
    expect(result.name).toBe("");
    expect(result.title).toBe("");
    expect(result.avatarUrl).toBeNull();
    expect(profile.avatarUrl).toBe("/profile.png");
    expect(profile.name).toBe("Nguyễn Văn Thanh");
  });
  it("allows blank names as a card-only choice", () => {
    expect(cardAppearanceInput.safeParse({ copy: { name: "" } }).success).toBe(
      true,
    );
  });
  it("always uses the current profile photo rather than a legacy card upload", () => {
    const legacy = { avatarUrl: "/old-card-photo.png" };
    expect(
      resolveCardIdentity(
        { name: "Hồ sơ", avatarUrl: "/profile-v2.png" },
        legacy,
      ).avatarUrl,
    ).toBe("/profile-v2.png");
    expect(
      resolveCardIdentity({ name: "Hồ sơ", avatarUrl: null }, legacy).avatarUrl,
    ).toBeNull();
  });
  it("accepts only bounded avatar framing, never a replacement image URL", () => {
    expect(
      cardAppearanceInput.safeParse({ avatarCrop: { x: 0, y: 100, zoom: 3 } })
        .success,
    ).toBe(true);
    for (const avatarCrop of [
      { x: -1, y: 50, zoom: 1 },
      { x: 50, y: 101, zoom: 1 },
      { x: 50, y: 50, zoom: 0.9 },
      { x: 50, y: 50, zoom: 4 },
      { x: 50, y: 50, zoom: 1, url: "/other.png" },
    ])
      expect(cardAppearanceInput.safeParse({ avatarCrop }).success).toBe(false);
  });
  it("accepts background dimming from zero to one hundred and rejects invalid values", () => {
    for (const backgroundDim of [0, 40, 100]) {
      const parsed = cardAppearanceInput.safeParse({ backgroundDim });
      expect(parsed.success).toBe(true);
      if (parsed.success) expect(parsed.data).toEqual({ backgroundDim });
    }
    for (const backgroundDim of [-1, 101, 1.5, "40", null, Number.NaN])
      expect(cardAppearanceInput.safeParse({ backgroundDim }).success).toBe(
        false,
      );
    expect(cardAppearanceInput.safeParse({}).success).toBe(true);
  });
  it("lets an explicit color/hidden background override a pending photo without deleting it", () => {
    expect(
      getCardBackgroundPreview(true, "blob:pending", "/old.png"),
    ).toBeNull();
    expect(getCardBackgroundPreview(false, "blob:pending", "/old.png")).toBe(
      "blob:pending",
    );
    expect(getCardBackgroundPreview(false, undefined, "/old.png")).toBe(
      "/old.png",
    );
  });
  it("offers distinct curated business-card formats", () => {
    expect(businessCardTemplates.length).toBeGreaterThanOrEqual(6);
    expect(
      new Set(
        businessCardTemplates.map(
          (t) => `${t.finish}/${t.position}/${t.orientation}`,
        ),
      ).size,
    ).toBe(businessCardTemplates.length);
  });
  it("merges card-only copy without changing the source profile", () => {
    const profile = {
      name: "Tên hồ sơ",
      title: "Chức danh",
      phone: "0900000000",
    };
    const result = resolveCardIdentity(profile, {
      copy: { name: "Tên trên thẻ", phone: "" },
    });
    expect(result.name).toBe("Tên trên thẻ");
    expect(result.phone).toBe("");
    expect(profile.name).toBe("Tên hồ sơ");
    expect(result.title).toBe("Chức danh");
  });
  it("rejects unsafe URLs, invalid colors, oversized text and unknown options", () => {
    for (const value of [
      { finish: "glass" },
      { backgroundColor: "url(x)" },
      { copy: { name: "a".repeat(81) } },
      { copy: { website: "javascript:alert(1)" } },
      { fixedLogo: false },
      { avatarUrl: "https://attacker.test/a.png" },
    ])
      expect(cardAppearanceInput.safeParse(value).success).toBe(false);
  });
  it("accepts Vietnamese text and blank optional contact fields", () => {
    expect(
      cardAppearanceInput.safeParse({
        finish: "ivory",
        copy: {
          name: "TS. Nguyễn Văn Thanh",
          website: "",
          company: "Ủy ban Trung ương",
        },
      }).success,
    ).toBe(true);
  });
  it("validates raster bytes, declared format and size", () => {
    expect(
      validateCardImage(
        "image/png",
        12,
        new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      ),
    ).toBeNull();
    expect(
      validateCardImage("image/png", 12, new TextEncoder().encode("<svg>")),
    ).toBeTruthy();
    expect(
      validateCardImage("image/svg+xml", 12, new TextEncoder().encode("<svg>")),
    ).toBeTruthy();
    expect(
      validateCardImage("image/png", 6 * 1024 * 1024, new Uint8Array()),
    ).toBeTruthy();
  });
});
