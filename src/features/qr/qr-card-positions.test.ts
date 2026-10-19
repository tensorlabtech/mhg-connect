import { describe, expect, it } from "vitest";
import { qrCardPositions, normalizeQrCardPosition } from "./qr-card-layout";

describe("QR position contract", () => {
  it("supports four explicit layouts", () => {
    expect(qrCardPositions).toEqual(["left", "right", "top", "bottom"]);
  });
  it("uses a safe default for legacy or invalid data", () => {
    for (const value of [null, undefined, "overlay", {}, ""]) {
      expect(normalizeQrCardPosition(value)).toBe("bottom");
    }
    for (const value of qrCardPositions)
      expect(normalizeQrCardPosition(value)).toBe(value);
  });
});
