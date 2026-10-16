import { describe, expect, it } from "vitest";
import { canReadLocalDraft, isSafeDraftAsset } from "./local-draft-policy";
describe("unpublished local draft boundary", () => {
  it("only opens on a development loopback host", () => {
    expect(canReadLocalDraft("development", "localhost:3000")).toBe(true);
    expect(canReadLocalDraft("development", "127.0.0.1:3000")).toBe(true);
    expect(canReadLocalDraft("production", "localhost:3000")).toBe(false);
    expect(canReadLocalDraft("development", "example.com")).toBe(false);
    expect(canReadLocalDraft("development", "localhost.attacker.com")).toBe(
      false,
    );
  });
  it("never interprets file paths as an asset name", () => {
    for (const name of [
      "../secret.png",
      "/etc/passwd",
      "a.svg",
      "x.html",
      "a%2fp.png",
    ])
      expect(isSafeDraftAsset(name)).toBe(false);
    expect(isSafeDraftAsset("portrait-navy.png")).toBe(true);
  });
});
