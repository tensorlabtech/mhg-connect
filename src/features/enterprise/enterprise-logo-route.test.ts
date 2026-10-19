import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  select: vi.fn(),
  managed: vi.fn(),
  fetch: vi.fn(),
  rows: [] as unknown[][],
}));
vi.mock("@/lib/session", () => ({ getSession: mocks.session }));
vi.mock("@/lib/profile-media-storage", () => ({
  isManagedProfileMediaUrl: mocks.managed,
}));
vi.mock("@/db", () => ({ db: { select: mocks.select } }));
import { GET } from "@/app/api/enterprise-logo/[id]/route";
const id = "0c111111-1111-4111-8111-111111111111";
const request = new Request(`http://localhost:3000/api/enterprise-logo/${id}`);
const params = { params: Promise.resolve({ id }) };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [];
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.session.mockResolvedValue({ user: { id: "admin", role: "admin" } });
  mocks.select.mockImplementation(() => ({
    from: () => ({
      where: () => ({ limit: async () => mocks.rows.shift() || [] }),
    }),
  }));
  mocks.managed.mockReturnValue(true);
});

describe("enterprise logo same-origin proxy", () => {
  it("requires authentication", async () => {
    mocks.session.mockResolvedValue(null);
    expect((await GET(request, params)).status).toBe(401);
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("does not reveal another enterprise to non-members", async () => {
    mocks.session.mockResolvedValue({ user: { id: "stranger", role: "user" } });
    expect((await GET(request, params)).status).toBe(404);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("does not serve a disabled enterprise logo", async () => {
    mocks.rows = [
      [{ customLogoEnabled: false, logoUrl: "/_uploads/logos/x.png" }],
    ];
    expect((await GET(request, params)).status).toBe(404);
  });
  it("rejects arbitrary URLs before fetching", async () => {
    mocks.rows = [
      [{ customLogoEnabled: true, logoUrl: "http://internal.invalid/private" }],
    ];
    mocks.managed.mockReturnValue(false);
    expect((await GET(request, params)).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("serves a managed raster image privately with redirects disabled", async () => {
    mocks.rows = [
      [{ customLogoEnabled: true, logoUrl: "/_uploads/logos/x.png" }],
    ];
    mocks.fetch.mockResolvedValue(
      new Response(new Uint8Array([137, 80, 78, 71]), {
        headers: { "Content-Type": "image/png" },
      }),
    );
    const response = await GET(request, params);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mocks.fetch).toHaveBeenCalledWith(
      new URL("http://localhost:3000/_uploads/logos/x.png"),
      expect.objectContaining({ redirect: "error" }),
    );
  });
});
