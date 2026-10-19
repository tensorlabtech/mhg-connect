import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getCardMotion, getTiltFromOrientation } from "./qr-card-motion";
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

describe("phone tilt", () => {
  it("maps device tilt around the starting pose to the same 0..1 space as the mouse", () => {
    expect(getTiltFromOrientation(0, 0)).toEqual({ x: 0.5, y: 0.5 });
    expect(getTiltFromOrientation(20, -20)).toEqual({ x: 0, y: 1 });
    expect(getTiltFromOrientation(90, 90)).toEqual({ x: 1, y: 1 });
    expect(getTiltFromOrientation(Number.NaN, 10)).toEqual({ x: 0.75, y: 0.5 });
  });
  it("keeps the 3D card on phones instead of switching it off for touch screens", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/features/qr/qr-interactive-surface.css"),
      "utf8",
    );
    expect(css).not.toMatch(/\(prefers-reduced-motion: reduce\),\s*\(pointer: coarse\)/);
    expect(css).toMatch(/@media \(pointer: coarse\) and \(prefers-reduced-motion: no-preference\)/);
    expect(css).toMatch(/@keyframes qr-card-sway/);
  });
});
