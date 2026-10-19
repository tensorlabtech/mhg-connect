import { describe, expect, it, vi } from "vitest";
import { buildGateConfig, runBuildGate, transientDatabaseError, verifyRemoteHead } from "./build-after-migration";

const commit = "a".repeat(40);
const environment = {
  VERCEL: "1", VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_SHA: commit,
  VERCEL_GIT_COMMIT_REF: "feature/readiness",
  DATABASE_URL: "postgresql://test:test@example-pooler.neon.tech/mhg_connect_preview?sslmode=require",
};

describe("native deployment configuration", () => {
  it("accepts the expected pooled Preview database for read-only checks", () => {
    expect(buildGateConfig(environment).expectedName).toBe("mhg_connect_preview");
  });
  it.each([
    { VERCEL: undefined }, { VERCEL_ENV: "development" }, { VERCEL_GIT_COMMIT_SHA: "short" },
    { VERCEL_GIT_COMMIT_REF: undefined }, { DATABASE_URL: undefined },
    { DATABASE_URL: "postgresql://test:test@example.neon.tech/neondb?sslmode=require" },
    { DATABASE_URL: "postgresql://test:test@example.neon.tech/mhg_connect_preview?sslmode=disable" },
    { VERCEL_ENV: "production" },
  ])("fails closed for invalid configuration %j", (overrides) => {
    expect(() => buildGateConfig({ ...environment, ...overrides })).toThrow();
  });
  it("requires a fresh exact source branch", () => {
    expect(() => verifyRemoteHead(`${commit}\trefs/heads/feature/readiness`, "feature/readiness", commit)).not.toThrow();
    expect(() => verifyRemoteHead(`${"b".repeat(40)}\trefs/heads/feature/readiness`, "feature/readiness", commit)).toThrow("superseded");
    expect(() => verifyRemoteHead("", "feature/readiness", commit)).toThrow();
  });
});

function runtime(checks: boolean[]) {
  let now = 0;
  return {
    ready: vi.fn().mockImplementation(async () => checks.shift() ?? false),
    assertHead: vi.fn().mockResolvedValue(undefined),
    build: vi.fn().mockResolvedValue(undefined),
    now: () => now,
    sleep: vi.fn().mockImplementation(async (ms: number) => { now += ms; }),
  };
}

describe("database release build gate", () => {
  it("waits until readiness then rechecks after the real build callback", async () => {
    const control = runtime([false, false, true, true]);
    await runBuildGate(control, 100, 10);
    expect(control.sleep).toHaveBeenCalledTimes(2);
    expect(control.build).toHaveBeenCalledTimes(1);
    expect(control.assertHead).toHaveBeenCalledTimes(2);
    expect(control.ready.mock.invocationCallOrder[3]).toBeGreaterThan(control.build.mock.invocationCallOrder[0]);
  });
  it("times out without building if no exact marker appears", async () => {
    const control = runtime([false]);
    await expect(runBuildGate(control, 25, 10)).rejects.toThrow("Timed out");
    expect(control.build).not.toHaveBeenCalled();
    expect(control.sleep).toHaveBeenLastCalledWith(5);
  });
  it("rejects a build that lost its marker during compilation", async () => {
    const control = runtime([true, false]);
    await expect(runBuildGate(control)).rejects.toThrow("changed during");
  });
  it("stops immediately when the child build fails", async () => {
    const control = runtime([true, true]);
    control.build.mockRejectedValue(new Error("compiler failure"));
    await expect(runBuildGate(control)).rejects.toThrow("compiler failure");
    expect(control.ready).toHaveBeenCalledTimes(1);
  });
  it("does not build a superseded source commit", async () => {
    const control = runtime([true, true]);
    control.assertHead.mockRejectedValue(new Error("branch moved"));
    await expect(runBuildGate(control)).rejects.toThrow("branch moved");
    expect(control.build).not.toHaveBeenCalled();
  });
  it("fails a completed build if the source branch changed", async () => {
    const control = runtime([true, true]);
    control.assertHead.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("branch moved"));
    await expect(runBuildGate(control)).rejects.toThrow("branch moved");
    expect(control.build).toHaveBeenCalledTimes(1);
  });
  it("propagates ledger errors instead of waiting them away", async () => {
    const control = runtime([]);
    control.ready.mockRejectedValue(new Error("ledger diverges"));
    await expect(runBuildGate(control)).rejects.toThrow("ledger diverges");
    expect(control.build).not.toHaveBeenCalled();
  });
  it("only retries transient connection errors", () => {
    expect(transientDatabaseError({ code: "ECONNRESET" })).toBe(true);
    expect(transientDatabaseError({ code: "57P03" })).toBe(true);
    expect(transientDatabaseError({ code: "28P01" })).toBe(false);
    expect(transientDatabaseError(new Error("ledger mismatch"))).toBe(false);
  });
});
