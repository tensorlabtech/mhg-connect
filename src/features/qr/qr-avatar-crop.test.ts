import { describe, expect, it } from "vitest";
import {
  avatarCropStyle,
  moveAvatarCrop,
  normalizeAvatarCrop,
} from "./qr-avatar-crop";

describe("card avatar framing", () => {
  it("starts centered at natural cover size", () => {
    expect(normalizeAvatarCrop()).toEqual({ x: 50, y: 50, zoom: 1 });
    expect(avatarCropStyle()).toEqual({
      objectPosition: "50% 50%",
      transformOrigin: "50% 50%",
      transform: "scale(1)",
    });
  });
  it("pans portrait overflow but keeps the covered axis centered", () => {
    expect(
      moveAvatarCrop({ x: 50, y: 50, zoom: 1 }, 20, 30, 200, 400, 800),
    ).toEqual({ x: 50, y: 35, zoom: 1 });
  });
  it("pans both axes after zooming without exposing an empty edge", () => {
    expect(
      moveAvatarCrop({ x: 50, y: 50, zoom: 2 }, 60, 40, 200, 800, 400),
    ).toEqual({ x: 40, y: 30, zoom: 2 });
    expect(
      moveAvatarCrop({ x: 50, y: 50, zoom: 2 }, 9999, -9999, 200, 800, 400),
    ).toEqual({ x: 0, y: 100, zoom: 2 });
  });
  it("clamps unsafe geometry and tolerates unloaded images", () => {
    expect(normalizeAvatarCrop({ x: -100, y: 999, zoom: 0.1 })).toEqual({
      x: 0,
      y: 100,
      zoom: 1,
    });
    expect(normalizeAvatarCrop({ x: Number.NaN, y: 50, zoom: 99 })).toEqual({
      x: 50,
      y: 50,
      zoom: 3,
    });
    expect(moveAvatarCrop({ x: 30, y: 20, zoom: 2 }, 10, 10, 0, 0, 0)).toEqual({
      x: 30,
      y: 20,
      zoom: 2,
    });
  });
});
