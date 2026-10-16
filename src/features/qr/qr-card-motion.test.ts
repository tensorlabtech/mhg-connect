import { describe, expect, it } from "vitest";
import { getCardMotion } from "./qr-card-motion";
describe("card motion math", () => {
  it("is neutral at the center", () =>
    expect(getCardMotion(0.5, 0.5)).toEqual({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
    }));
  it("limits tilt even when pointer coordinates overshoot", () => {
    expect(getCardMotion(5, -2)).toEqual({
      rotateX: 4.5,
      rotateY: 6,
      glareX: 100,
      glareY: 0,
    });
  });
  it("does not propagate non-finite values", () => {
    expect(getCardMotion(NaN, Infinity)).toEqual(getCardMotion(0.5, 0.5));
  });
});
