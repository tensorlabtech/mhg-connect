import { describe, expect, it } from "vitest";
import { getQrCardFitError } from "./qr-card-fit";

function fixture(
  overlap = false,
  overflow = false,
  hiddenChild = false,
  croppedAvatar = false,
) {
  const box = (left: number, top: number, right: number, bottom: number) => ({
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  });
  const element = (rect: ReturnType<typeof box>, clipped = false) => ({
    getBoundingClientRect: () => rect,
    clientWidth: rect.width,
    scrollWidth: rect.width + (clipped ? 5 : 0),
    clientHeight: rect.height,
    scrollHeight: rect.height,
  });
  const copy = element(box(overlap ? 20 : 45, 35, 95, 90), overflow);
  const card = {
    ...element(box(0, 0, 100, 150)),
    querySelector: (selector: string) =>
      selector === "[data-card-qr]"
        ? element(box(5, 40, 40, 75))
        : selector === "[data-card-copy]"
          ? copy
          : element(box(5, 5, 95, 25)),
    querySelectorAll: () => [
      copy,
      ...(croppedAvatar
        ? [
            {
              ...element(box(-100, -100, 200, 200), true),
              closest: () => ({ className: "digital-card-avatar-slot" }),
              matches: () => true,
            },
          ]
        : []),
      ...(hiddenChild
        ? [{ ...element(box(0, 0, 0, 0)), getClientRects: () => [] }]
        : []),
    ],
  };
  return { querySelector: () => card } as unknown as ParentNode;
}
describe("card export fit gate", () => {
  it("allows image overflow deliberately clipped inside an avatar circle", () =>
    expect(getQrCardFitError(fixture(false, false, false, true))).toBeNull());
  it("ignores editor placeholders hidden during capture", () =>
    expect(getQrCardFitError(fixture(false, false, true))).toBeNull());
  it("accepts disjoint QR/text regions", () =>
    expect(getQrCardFitError(fixture())).toBeNull());
  it("blocks QR overlap", () =>
    expect(getQrCardFitError(fixture(true))).toContain("chồng"));
  it("blocks clipped content", () =>
    expect(getQrCardFitError(fixture(false, true))).toContain("dài hơn"));
  it("ignores surfaces without a card", () =>
    expect(
      getQrCardFitError({ querySelector: () => null } as unknown as ParentNode),
    ).toBeNull());
});
