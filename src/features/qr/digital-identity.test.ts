import { describe, expect, it, vi, afterEach } from "vitest";
import { digitalIdentityFromProfile } from "./digital-identity";
import { defaultProfileVisibility } from "@/db/schema/product";
import { withFlatCardCapture } from "./qr-card-capture";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("public digital card privacy", () => {
  const profile = {
    name: "Người kiểm thử",
    avatarUrl: null,
    coverUrl: null,
    bio: null,
    company: "Công ty riêng",
    contactEmail: null,
    linkedIn: null,
    location: null,
    phone: "0900000000",
    telegram: null,
    template: "minimal" as const,
    title: "Chức danh riêng",
    website: "https://example.com",
    zalo: null,
    visibleFields: { ...defaultProfileVisibility },
  };
  it("only uses contact fields the owner chose to display", () => {
    const card = digitalIdentityFromProfile({
      ...profile,
      visibleFields: {
        ...profile.visibleFields,
        phone: false,
        website: false,
        title: false,
        company: false,
      },
    });
    expect(card.phone).toBeNull();
    expect(card.website).toBeNull();
    expect(card.title).toBeNull();
    expect(card.company).toBeNull();
  });
  it("preserves the allowed published identity", () => {
    expect(digitalIdentityFromProfile(profile).phone).toBe("0900000000");
  });
});

describe("flat image capture", () => {
  it("also finishes if a background tab does not deliver animation frames", async () => {
    vi.useFakeTimers();
    const root = {
      closest: () => null,
      querySelector: () => null,
    } as unknown as HTMLElement;
    vi.stubGlobal("requestAnimationFrame", () => 0);
    const result = withFlatCardCapture(root, async () => "png");
    await vi.advanceTimersByTimeAsync(121);
    await expect(result).resolves.toBe("png");
  });
  function fixture() {
    const attrs = new Map<string, string>();
    const surface = {
      getAttribute: (k: string) => attrs.get(k) ?? null,
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      removeAttribute: (k: string) => attrs.delete(k),
    };
    const root = { closest: () => surface } as unknown as HTMLElement;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      callback(0),
    );
    return { root, attrs };
  }
  it("holds the surface flat while exporting, then restores it", async () => {
    const { root, attrs } = fixture();
    expect(
      await withFlatCardCapture(root, async () => {
        expect(attrs.get("data-card-capture")).toBe("true");
        return "png";
      }),
    ).toBe("png");
    expect(attrs.has("data-card-capture")).toBe(false);
  });
  it("restores the original state even when capture fails", async () => {
    const { root, attrs } = fixture();
    attrs.set("data-card-capture", "previous");
    await expect(
      withFlatCardCapture(root, async () => {
        throw Error("capture failed");
      }),
    ).rejects.toThrow("capture failed");
    expect(attrs.get("data-card-capture")).toBe("previous");
  });
});
