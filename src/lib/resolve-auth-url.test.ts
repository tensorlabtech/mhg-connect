import { describe, expect, it } from "vitest";

import {
  resolveAuthUrl,
  resolvePreviewBranchUrl,
} from "@/lib/resolve-auth-url";

describe("resolvePreviewBranchUrl", () => {
  it("trusts only the configured Preview branch alias", () => {
    expect(
      resolvePreviewBranchUrl({
        VERCEL_ENV: "preview",
        VERCEL_BRANCH_URL: "mhg-git-test-deploy-team.vercel.app",
      }),
    ).toBe("https://mhg-git-test-deploy-team.vercel.app");
  });
  it.each(["production", "development", undefined])(
    "ignores the alias outside Preview (%s)",
    (environment) => {
      expect(
        resolvePreviewBranchUrl({
          VERCEL_ENV: environment,
          VERCEL_BRANCH_URL: "branch.vercel.app",
        }),
      ).toBeUndefined();
    },
  );
  it("allows Preview without a branch alias", () => {
    expect(resolvePreviewBranchUrl({ VERCEL_ENV: "preview" })).toBeUndefined();
  });
  it.each([
    "evil.example.com",
    "https://branch.vercel.app",
    "user@branch.vercel.app",
    "branch.vercel.app/path",
  ])("rejects invalid branch alias %s", (hostname) => {
    expect(() =>
      resolvePreviewBranchUrl({
        VERCEL_ENV: "preview",
        VERCEL_BRANCH_URL: hostname,
      }),
    ).toThrow("VERCEL_BRANCH_URL must be a deployment hostname");
  });
});

describe("resolveAuthUrl", () => {
  it.each([
    "mhg-connect-abc-team.vercel.app",
    "mhg-connect-def-team.vercel.app",
  ])(
    "uses the individual Preview deployment %s instead of a fixed production URL",
    (hostname) => {
      expect(
        resolveAuthUrl({
          VERCEL_ENV: "preview",
          VERCEL_URL: hostname,
          BETTER_AUTH_URL: "https://mhg.example.com",
        }),
      ).toBe(`https://${hostname}`);
    },
  );

  it("does not require a fixed URL in Preview", () => {
    expect(
      resolveAuthUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "preview.vercel.app",
      }),
    ).toBe("https://preview.vercel.app");
  });

  it.each(["production", "development", undefined])(
    "preserves the configured URL outside Preview (%s)",
    (environment) => {
      expect(
        resolveAuthUrl({
          VERCEL_ENV: environment,
          VERCEL_URL: "preview.vercel.app",
          BETTER_AUTH_URL: "https://mhg.example.com",
        }),
      ).toBe("https://mhg.example.com");
    },
  );

  it("keeps a missing production URL missing instead of using a deployment URL", () => {
    expect(
      resolveAuthUrl({
        VERCEL_ENV: "production",
        VERCEL_URL: "preview.vercel.app",
      }),
    ).toBeUndefined();
  });

  it.each([
    undefined,
    "",
    "vercel.app",
    "attacker.example.com",
    "app.vercel.app.evil.com",
    "https://app.vercel.app",
    "user@app.vercel.app",
    "app.vercel.app/path",
    "app.vercel.app:443",
    "app.vercel.app?x=1",
    "app.vercel.app#fragment",
    "app.vercel.app\\path",
    " app.vercel.app",
    "app.vercel.app\n",
    "-app.vercel.app",
    "app-.vercel.app",
    "app_name.vercel.app",
    `${"a".repeat(64)}.vercel.app`,
  ])("rejects missing or invalid Preview host %s", (hostname) => {
    expect(() =>
      resolveAuthUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: hostname,
        BETTER_AUTH_URL: "https://mhg.example.com",
      }),
    ).toThrow("VERCEL_URL must be a deployment hostname");
  });
});
