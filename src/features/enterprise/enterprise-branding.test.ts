import { describe, expect, it } from "vitest";
import {
  resolveEnterpriseLogo,
  validateEnterpriseLogo,
} from "./enterprise-branding";

describe("enterprise branding policy", () => {
  it("defaults to MHG without an enabled enterprise", () => {
    expect(resolveEnterpriseLogo(null).url).toBe(
      "/brand/mhg-airpurity-transparent-v1.png",
    );
    expect(
      resolveEnterpriseLogo({
        name: "A",
        customLogoEnabled: false,
        logoUrl: "/_uploads/logos/a.png",
      }).custom,
    ).toBe(false);
  });
  it("inherits the enabled enterprise logo for every member", () => {
    expect(
      resolveEnterpriseLogo({
        name: "A",
        customLogoEnabled: true,
        logoUrl: "/_uploads/logos/a.png",
      }),
    ).toEqual({ url: "/_uploads/logos/a.png", name: "A", custom: true });
  });
  it("falls back when no logo exists", () => {
    expect(
      resolveEnterpriseLogo({
        name: "A",
        customLogoEnabled: true,
        logoUrl: null,
      }).custom,
    ).toBe(false);
  });
  it("rejects unsafe and oversize uploads", () => {
    expect(validateEnterpriseLogo("image/svg+xml", 50)).not.toBeNull();
    expect(
      validateEnterpriseLogo("image/png", 2 * 1024 * 1024 + 1),
    ).not.toBeNull();
    expect(validateEnterpriseLogo("image/png", 0)).not.toBeNull();
    for (const type of ["image/png", "image/jpeg", "image/webp"])
      expect(validateEnterpriseLogo(type, 1024)).toBeNull();
  });
});
