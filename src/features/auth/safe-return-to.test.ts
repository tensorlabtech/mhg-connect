import { describe, expect, it } from "vitest";

import { safeReturnTo } from "@/features/auth/safe-return-to";

describe("safeReturnTo", () => {
  it("keeps supported internal destinations", () => {
    expect(safeReturnTo("/dashboard")).toBe("/dashboard");
    expect(safeReturnTo("/admin")).toBe("/admin");
    expect(safeReturnTo("/q/DEMO-NEW?claimed=1")).toBe("/q/DEMO-NEW?claimed=1");
  });

  it("rejects unsupported destinations", () => {
    expect(safeReturnTo("//example.com")).toBe("/dashboard");
    expect(safeReturnTo("https://example.com/q/DEMO-NEW")).toBe("/dashboard");
    expect(safeReturnTo("/dashboard/settings")).toBe("/dashboard");
    expect(safeReturnTo("/%2f%2fexample.com/q/DEMO-NEW")).toBe("/dashboard");
  });

  it("preserves query strings and fragments on supported routes", () => {
    expect(safeReturnTo("/q/DEMO-NEW?source=camera#activate")).toBe(
      "/q/DEMO-NEW?source=camera#activate",
    );
  });
});
