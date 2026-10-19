import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const deploymentEnv = {
  NODE_ENV: "test" as const,
  VERCEL: "1",
  DATABASE_URL: "postgres://test:test@localhost/mhg_test",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
  B2_S3_ENDPOINT: "https://s3.us-west-004.backblazeb2.com",
  B2_REGION: "us-west-004",
  B2_BUCKET_NAME: "test-bucket",
  B2_KEY_ID: "test-key",
  B2_APPLICATION_KEY: "test-application-key",
};

function validate(overrides: Record<string, string>) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/validate-deployment-env.ts", "--strict"],
    {
      cwd: process.cwd(),
      env: { ...deploymentEnv, ...overrides },
      encoding: "utf8",
    },
  );
}

describe("deployment environment validation", () => {
  it("accepts Preview without BETTER_AUTH_URL", () => {
    const result = validate({
      VERCEL_ENV: "preview",
      VERCEL_URL: "preview.vercel.app",
    });
    expect(result.status, result.stderr).toBe(0);
  });

  it("requires an explicit production URL", () => {
    const result = validate({
      VERCEL_ENV: "production",
      VERCEL_URL: "production.vercel.app",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Missing deployment variables: BETTER_AUTH_URL",
    );
  });

  it("accepts an explicit HTTPS production URL", () => {
    const result = validate({
      VERCEL_ENV: "production",
      BETTER_AUTH_URL: "https://mhg.example.com",
    });
    expect(result.status, result.stderr).toBe(0);
  });

  it("rejects an HTTP production URL", () => {
    const result = validate({
      VERCEL_ENV: "production",
      BETTER_AUTH_URL: "http://mhg.example.com",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("BETTER_AUTH_URL must use HTTPS");
  });

  it.each([
    [{ VERCEL_URL: "" }, "VERCEL_URL must be a deployment hostname"],
    [
      { BETTER_AUTH_SECRET: "short" },
      "BETTER_AUTH_SECRET must contain at least 32 characters",
    ],
    [
      { B2_S3_ENDPOINT: "https://storage.example.com" },
      "B2_S3_ENDPOINT must be a Backblaze HTTPS S3 endpoint",
    ],
    [{ B2_BUCKET_NAME: "" }, "Missing deployment variables: B2_BUCKET_NAME"],
  ])("retains Preview validation for %j", (overrides, message) => {
    const result = validate({
      VERCEL_ENV: "preview",
      VERCEL_URL: "preview.vercel.app",
      ...overrides,
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(message);
  });
});
