import { describe, expect, it } from "vitest";
import { releaseBranch, verifyReadiness, type ReadinessIdentity } from "./release-readiness";

const identity: ReadinessIdentity = {
  environment: "preview", branch: "feature/profile-theme", commit: "a".repeat(40), journal: "b".repeat(64),
};
const marker = { ...identity, readyAt: "2026-10-19T08:00:00.000Z" };

describe("release readiness identity", () => {
  it("accepts the exact commit, environment, branch and migration fingerprint", () => {
    expect(() => verifyReadiness(marker, identity)).not.toThrow();
  });
  it.each(["environment", "branch", "commit", "journal"] as const)("rejects another %s", field => {
    const different = { ...marker, [field]: "other" };
    expect(() => verifyReadiness(different, identity)).toThrow("does not match");
  });
  it("rejects a missing marker and invalid timestamp", () => {
    expect(() => verifyReadiness(null, identity)).toThrow("pending");
    expect(() => verifyReadiness({ ...marker, readyAt: "invalid" }, identity)).toThrow("timestamp");
  });
  it("keeps Preview branches scoped independently", () => {
    const otherBranch = { ...identity, branch: "feature/another-profile" };
    expect(() => verifyReadiness(marker, otherBranch)).toThrow("branch");
    expect(() => verifyReadiness({ ...marker, ...otherBranch }, otherBranch)).not.toThrow();
  });
  it.each([
    { ...identity, environment: "development" }, { ...identity, commit: "short" },
    { ...identity, journal: "short" }, { ...identity, branch: "bad..branch" },
  ])("rejects incomplete release identity %j", expected => {
    expect(() => verifyReadiness(marker, expected)).toThrow();
  });
});

describe("release readiness branch selection", () => {
  it("prefers the explicit release branch and supports GitHub fallback", () => {
    expect(releaseBranch({ RELEASE_BRANCH: "release/2026.10", GITHUB_REF_NAME: "main" })).toBe("release/2026.10");
    expect(releaseBranch({ GITHUB_REF_NAME: "main" })).toBe("main");
  });
  it.each(["", "../main", "feature//new", "main\n", "foo.lock", "foo/.hidden", "branch/", "-main", "branch."])("rejects invalid branch %j", branch => {
    expect(() => releaseBranch({ RELEASE_BRANCH: branch })).toThrow("safe Git branch");
  });
  it("requires an explicit branch", () => {
    expect(() => releaseBranch({})).toThrow();
  });
});
