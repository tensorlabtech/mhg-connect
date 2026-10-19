import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  upload: vi.fn(),
  rows: [] as unknown[][],
  values: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ requireAdmin: mocks.admin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/profile-media-storage", () => ({
  uploadProfileMedia: mocks.upload,
}));
vi.mock("@/db", () => ({
  db: { select: mocks.select, insert: mocks.insert, update: mocks.update },
}));

import {
  createEnterpriseAction,
  saveEnterpriseBrandAction,
  assignEnterpriseMemberAction,
} from "./enterprise-actions";

const id = "0c111111-1111-4111-8111-111111111111";
const date = new Date("2026-10-16T00:00:00Z");
const initial = { success: false };
function form(values: Record<string, string | File> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function brandForm(extra: Record<string, string | File> = {}) {
  return form({
    enterpriseId: id,
    expectedUpdatedAt: date.toISOString(),
    ...extra,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [];
  mocks.admin.mockResolvedValue({ user: { id: "admin", role: "admin" } });
  mocks.select.mockImplementation(() => ({
    from: () => ({
      where: () => ({ limit: async () => mocks.rows.shift() || [] }),
    }),
  }));
  mocks.values.mockImplementation(() => ({
    onConflictDoUpdate: async () => undefined,
  }));
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.patch.mockReturnValue({
    where: () => ({ returning: async () => [{ id }] }),
  });
  mocks.update.mockReturnValue({ set: mocks.patch });
  mocks.upload.mockResolvedValue({ url: "/_uploads/logos/test.png" });
});

describe("enterprise administrator actions", () => {
  it.each([
    createEnterpriseAction,
    saveEnterpriseBrandAction,
    assignEnterpriseMemberAction,
  ])("checks admin before reading or writing", async (action) => {
    mocks.admin.mockRejectedValueOnce(new Error("forbidden"));
    await expect(action(initial, form())).rejects.toThrow("forbidden");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("validates and creates disabled-by-default enterprise", async () => {
    expect(
      (await createEnterpriseAction(initial, form({ name: " " }))).success,
    ).toBe(false);
    expect(
      (
        await createEnterpriseAction(
          initial,
          form({ name: " Doanh nghiệp A " }),
        )
      ).success,
    ).toBe(true);
    expect(mocks.values).toHaveBeenCalledWith({ name: "Doanh nghiệp A" });
  });
  it("rejects enabling without a logo", async () => {
    mocks.rows = [[{ id, logoUrl: null, updatedAt: date }]];
    expect(
      (
        await saveEnterpriseBrandAction(
          initial,
          brandForm({ customLogoEnabled: "on" }),
        )
      ).success,
    ).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects a stale admin tab before uploading", async () => {
    mocks.rows = [
      [{ id, logoUrl: null, updatedAt: new Date(date.getTime() + 1000) }],
    ];
    expect(
      (await saveEnterpriseBrandAction(initial, brandForm())).success,
    ).toBe(false);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects disguised non-raster files", async () => {
    mocks.rows = [[{ id, logoUrl: null, updatedAt: date }]];
    const result = await saveEnterpriseBrandAction(
      initial,
      brandForm({
        logo: new File(["<svg/>"], "logo.png", { type: "image/png" }),
      }),
    );
    expect(result.success).toBe(false);
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("retains stored logo when permission is disabled", async () => {
    mocks.rows = [
      [{ id, logoUrl: "/_uploads/logos/previous.png", updatedAt: date }],
    ];
    expect(
      (await saveEnterpriseBrandAction(initial, brandForm())).success,
    ).toBe(true);
    expect(mocks.patch).toHaveBeenCalledWith(
      expect.objectContaining({
        customLogoEnabled: false,
        logoUrl: "/_uploads/logos/previous.png",
      }),
    );
  });
  it("stores a valid PNG then enables enterprise-wide branding", async () => {
    mocks.rows = [[{ id, logoUrl: null, updatedAt: date }]];
    const logo = new File(
      [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])],
      "logo.png",
      { type: "image/png" },
    );
    expect(
      (
        await saveEnterpriseBrandAction(
          initial,
          brandForm({ customLogoEnabled: "on", logo }),
        )
      ).success,
    ).toBe(true);
    expect(mocks.upload).toHaveBeenCalledWith(logo, "logo");
    expect(mocks.patch).toHaveBeenCalledWith(
      expect.objectContaining({ customLogoEnabled: true }),
    );
  });
  it("does not assign missing accounts", async () => {
    mocks.rows = [[{ id }], []];
    expect(
      (
        await assignEnterpriseMemberAction(
          initial,
          form({ enterpriseId: id, userId: "missing" }),
        )
      ).success,
    ).toBe(false);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("assigns explicit membership, never a company-name match", async () => {
    mocks.rows = [[{ id }], [{ id: "employee" }]];
    expect(
      (
        await assignEnterpriseMemberAction(
          initial,
          form({ enterpriseId: id, userId: "employee" }),
        )
      ).success,
    ).toBe(true);
    expect(mocks.values).toHaveBeenCalledWith({
      enterpriseId: id,
      userId: "employee",
    });
  });
});
