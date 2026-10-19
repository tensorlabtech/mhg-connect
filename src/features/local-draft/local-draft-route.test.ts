import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ read: vi.fn(), host: "localhost:3000" }));
vi.mock("server-only", () => ({}));
vi.mock("node:fs/promises", () => ({ readFile: mocks.read }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: mocks.host }),
}));
import { GET } from "@/app/api/local-draft/[slug]/assets/[name]/route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  mocks.host = "localhost:3000";
});
const request = new Request(
  "http://localhost:3000/api/local-draft/nguyen-van-thanh/assets/portrait-navy.png",
);
const params = {
  params: Promise.resolve({
    slug: "nguyen-van-thanh",
    name: "portrait-navy.png",
  }),
};
describe("private local asset route", () => {
  it("never reads private files in a production process", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await GET(request, params)).status).toBe(404);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("rejects non-loopback hosts in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.host = "example.com";
    expect((await GET(request, params)).status).toBe(404);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("rejects path traversal before reading", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      (
        await GET(request, {
          params: Promise.resolve({ slug: "../private", name: "portrait.png" }),
        })
      ).status,
    ).toBe(404);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("serves allowed development images without caching", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.read.mockResolvedValue(new Uint8Array([1, 2, 3]));
    const response = await GET(request, params);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
  });
});
