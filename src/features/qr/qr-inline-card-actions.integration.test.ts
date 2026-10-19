import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
const actor = vi.hoisted(() => ({ id: "", authenticated: true }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => {
    if (!actor.authenticated) throw new Error("Unauthorized");
    return { user: { id: actor.id } };
  }),
  requireAdmin: vi.fn(async () => ({ user: { id: actor.id, role: "admin" } })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
import { db, closeDatabase } from "@/db";
import {
  user,
  qrCodes,
  qrCardDesigns,
  profiles,
  enterprises,
  enterpriseMembers,
} from "@/db/schema";
import { saveInlineCardAction } from "./qr-inline-card-actions";
import { getEnterpriseBrand } from "@/features/enterprise/enterprise-data";
import { MHG_LOGO_URL } from "@/features/enterprise/enterprise-branding";
import {
  createQrCardDesignAction,
  updateQrCardDesignAction,
} from "./qr-card-design-actions";
import { saveQrCardLayoutAction } from "./qr-card-background-actions";
import { QR_CARD_DEFAULT_TAGLINE } from "./qr-card-layout";
import { adminQrAction } from "@/features/admin/qr-admin-actions";
import { getOwnedQr } from "./qr-data";
import {
  resolveCardIdentity,
  clearCardPersonalContent,
} from "./qr-card-appearance";

const enabled = process.env.ALLOW_DATABASE_TESTS === "true";
const url = new URL(
  process.env.DATABASE_URL || "postgres://localhost/disabled",
);
if (
  enabled &&
  (!["localhost", "127.0.0.1"].includes(url.hostname) ||
    !/^\/mhg_cards_qa_/.test(url.pathname))
)
  throw new Error("Only the dedicated local card QA database is allowed");
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
  "base64",
);
describe.skipIf(!enabled)(
  "inline card persistence on dedicated local PostgreSQL",
  () => {
    let qrId: string, otherId: string, designId: string;
    const firstUser = crypto.randomUUID(),
      secondUser = crypto.randomUUID();
    beforeAll(async () => {
      actor.id = firstUser;
      await db.insert(user).values([
        {
          id: firstUser,
          name: "Inline QA owner",
          email: `inline-${firstUser}@example.invalid`,
        },
        {
          id: secondUser,
          name: "Inline QA other",
          email: `inline-${secondUser}@example.invalid`,
        },
      ]);
      const rows = await db
        .insert(qrCodes)
        .values([
          {
            publicToken: `QA-INLINE-${firstUser}`,
            ownerId: firstUser,
            status: "active",
          },
          {
            publicToken: `QA-INLINE-${secondUser}`,
            ownerId: secondUser,
            status: "active",
          },
        ])
        .returning();
      qrId = rows[0].id;
      otherId = rows[1].id;
      const [design] = await db
        .insert(qrCardDesigns)
        .values({ qrCodeId: qrId, name: "Mẫu kiểm thử" })
        .returning();
      designId = design.id;
    });
    afterAll(async () => {
      await closeDatabase();
    });
    async function form(extra: Record<string, unknown> = {}) {
      const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.id, qrId));
      const data = new FormData();
      data.set(
        "settings",
        JSON.stringify({
          qrId,
          expectedVersion: qr.version,
          appearance: {
            finish: "ivory",
            backgroundDim: 37,
            avatarCrop: { x: 42, y: 61, zoom: 1.7 },
            copy: { name: "Tên trên danh thiếp", title: "Chức danh riêng" },
          },
          orientation: "landscape",
          position: "right",
          font: "be-vietnam",
          textColor: null,
          tagline: "",
          ...extra,
        }),
      );
      return data;
    }
    it("saves and reads back card-only settings without creating or changing a profile", async () => {
      const result = await saveInlineCardAction(await form());
      expect(result.success).toBe(true);
      const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.id, qrId));
      expect(qr.cardAppearance.copy?.name).toBe("Tên trên danh thiếp");
      expect(qr.cardAppearance.backgroundDim).toBe(37);
      expect(qr.cardTagline).toBe(QR_CARD_DEFAULT_TAGLINE);
      expect(qr.cardAppearance.avatarCrop).toEqual({ x: 42, y: 61, zoom: 1.7 });
      expect(qr.cardOrientation).toBe("landscape");
      expect(qr.cardPosition).toBe("right");
      expect(
        await db.select().from(profiles).where(eq(profiles.ownerId, firstUser)),
      ).toHaveLength(0);
    });
    it("enforces the fixed brand line for inline, legacy layout and saved-design actions", async () => {
      expect(
        (
          await saveInlineCardAction(
            await form({ tagline: "Nội dung giả mạo" }),
          )
        ).success,
      ).toBe(true);
      const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.id, qrId));
      expect(qr.cardTagline).toBe(QR_CARD_DEFAULT_TAGLINE);
      const legacy = await saveQrCardLayoutAction({
        qrId,
        expectedVersion: qr.version,
        tagline: "",
      });
      expect(legacy.success).toBe(true);
      expect(legacy.tagline).toBe(QR_CARD_DEFAULT_TAGLINE);
      const edited = await updateQrCardDesignAction({
        designId,
        tagline: "Nội dung khác",
      });
      expect(edited.success).toBe(true);
      if (edited.success)
        expect(edited.design.tagline).toBe(QR_CARD_DEFAULT_TAGLINE);
      const copy = await createQrCardDesignAction({
        qrId,
        name: "Dòng bảo vệ cố định",
        copyFrom: { textStyle: "shadow", tagline: "" },
      });
      expect(copy.success).toBe(true);
      if (copy.success)
        expect(copy.design.tagline).toBe(QR_CARD_DEFAULT_TAGLINE);
    });
    it("rejects a stale version without modifying the saved copy", async () => {
      const result = await saveInlineCardAction(
        await form({ expectedVersion: 1 }),
      );
      expect(result.success).toBe(false);
    });
    it("rejects forged fixed-logo settings and invalid raster bytes", async () => {
      expect(
        (
          await saveInlineCardAction(
            await form({ appearance: { fixedLogo: false } }),
          )
        ).success,
      ).toBe(false);
      const data = await form();
      data.set(
        "avatar",
        new File(["<svg>"], "fake.png", { type: "image/png" }),
      );
      expect((await saveInlineCardAction(data)).success).toBe(false);
    });
    it("requires authentication and ownership of both QR and design", async () => {
      actor.authenticated = false;
      await expect(saveInlineCardAction(await form())).rejects.toThrow(
        "Unauthorized",
      );
      actor.authenticated = true;
      expect(
        (await saveInlineCardAction(await form({ qrId: otherId }))).success,
      ).toBe(false);
      expect(
        (
          await saveInlineCardAction(
            await form({
              designId: crypto.randomUUID(),
              expectedUpdatedAt: new Date().toISOString(),
            }),
          )
        ).success,
      ).toBe(false);
    });
    it("rejects invalid photo dimming without changing the saved version", async () => {
      const [before] = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.id, qrId));
      const result = await saveInlineCardAction(
        await form({ appearance: { backgroundDim: 101 } }),
      );
      expect(result.success).toBe(false);
      const [after] = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.id, qrId));
      expect(after.version).toBe(before.version);
      expect(after.cardAppearance).toEqual(before.cardAppearance);
    });
    it("saves a design with its own revision, rejecting subsequent stale writes", async () => {
      const [design] = await db
        .select()
        .from(qrCardDesigns)
        .where(eq(qrCardDesigns.id, designId));
      const data = await form({
        designId,
        expectedUpdatedAt: design.updatedAt.toISOString(),
      });
      const first = await saveInlineCardAction(data);
      expect(first.success).toBe(true);
      if (first.success) {
        expect(first.design?.appearance?.finish).toBe("ivory");
        expect(first.design?.appearance?.backgroundDim).toBe(37);
        expect(first.design?.appearance?.avatarCrop).toEqual({
          x: 42,
          y: 61,
          zoom: 1.7,
        });
      }
      expect((await saveInlineCardAction(data)).success).toBe(false);
    });
    it("rejects separate avatar uploads and reads a changed photo from the linked profile", async () => {
      const [profile] = await db
        .insert(profiles)
        .values({
          ownerId: firstUser,
          name: "Shared avatar profile",
          avatarUrl: "/_uploads/avatars/shared-v1.png",
          status: "published",
        })
        .returning();
      await db
        .update(qrCodes)
        .set({ activeProfileId: profile.id })
        .where(eq(qrCodes.id, qrId));
      const data = await form();
      data.set("avatar", new File([png], "avatar.png", { type: "image/png" }));
      const result = await saveInlineCardAction(data);
      expect(result.success).toBe(false);
      const [before] = (await getOwnedQr(firstUser)).filter(
        (row) => row.id === qrId,
      );
      expect(before.profileAvatarUrl).toBe(profile.avatarUrl);
      await db
        .update(profiles)
        .set({ avatarUrl: "/_uploads/avatars/shared-v2.png" })
        .where(eq(profiles.id, profile.id));
      const [after] = (await getOwnedQr(firstUser)).filter(
        (row) => row.id === qrId,
      );
      expect(after.profileAvatarUrl).toBe("/_uploads/avatars/shared-v2.png");
      expect(
        resolveCardIdentity(
          { name: profile.name, avatarUrl: after.profileAvatarUrl },
          { ...after.cardAppearance, avatarUrl: "/legacy-card.png" },
        ).avatarUrl,
      ).toBe(after.profileAvatarUrl);
      const saved = await saveInlineCardAction(await form());
      expect(saved.success).toBe(true);
      if (saved.success) expect(saved.appearance.avatarUrl).toBeUndefined();
    });
    it("persists an empty card while preserving the linked profile and mandatory brand line", async () => {
      const [before] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.ownerId, firstUser));
      const appearance = clearCardPersonalContent({ finish: "ivory" });
      const result = await saveInlineCardAction(
        await form({ appearance, removeBackground: true }),
      );
      expect(result.success).toBe(true);
      const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.id, qrId));
      expect(qr.cardAppearance).toEqual(appearance);
      expect(qr.cardBackgroundUrl).toBeNull();
      expect(qr.cardTagline).toBe(QR_CARD_DEFAULT_TAGLINE);
      const [after] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, before.id));
      expect(after).toEqual(before);
      expect(
        resolveCardIdentity(
          { name: after.name, avatarUrl: after.avatarUrl },
          qr.cardAppearance,
        ).name,
      ).toBe("");
      const savedDesign = await db
        .select()
        .from(qrCardDesigns)
        .where(eq(qrCardDesigns.id, designId));
      expect(savedDesign).toHaveLength(1);
    });
    it("copies a saved format only from a design owned under the same QR", async () => {
      const copy = await createQrCardDesignAction({
        qrId,
        name: "Bản sao hợp lệ",
        copyFrom: { sourceDesignId: designId, textStyle: "shadow" },
      });
      expect(copy.success).toBe(true);
      if (copy.success) expect(copy.design.appearance?.finish).toBe("ivory");
      const denied = await createQrCardDesignAction({
        qrId,
        name: "Nguồn không tồn tại",
        copyFrom: { sourceDesignId: crypto.randomUUID(), textStyle: "shadow" },
      });
      expect(denied.success).toBe(false);
    });
    it("denies a logo without enterprise permission, then applies an allowed logo to both staff", async () => {
      const denied = await form();
      denied.set(
        "enterpriseLogo",
        new File([png], "logo.png", { type: "image/png" }),
      );
      expect((await saveInlineCardAction(denied)).success).toBe(false);
      const [enterprise] = await db
        .insert(enterprises)
        .values({ name: "QA enterprise only", customLogoEnabled: true })
        .returning();
      await db.insert(enterpriseMembers).values([
        { enterpriseId: enterprise.id, userId: firstUser },
        { enterpriseId: enterprise.id, userId: secondUser },
      ]);
      const allowed = await form({
        expectedEnterpriseUpdatedAt: enterprise.updatedAt.toISOString(),
      });
      allowed.set(
        "enterpriseLogo",
        new File([png], "logo.png", { type: "image/png" }),
      );
      expect((await saveInlineCardAction(allowed)).success).toBe(true);
      const a = await getEnterpriseBrand(firstUser),
        b = await getEnterpriseBrand(secondUser);
      expect(a.custom).toBe(true);
      expect(a.url).toBe(b.url);
      expect(MHG_LOGO_URL).toContain("transparent");
    });
    it("clears private card copy and avatar on QR ownership reset", async () => {
      const [prior] = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.id, qrId));
      expect(prior.cardAppearance.copy?.name).toBeTruthy();
      const data = new FormData();
      data.set("id", qrId);
      data.set("operation", "reset");
      data.set("expectedStatus", prior.status);
      data.set("expectedVersion", String(prior.version));
      await expect(adminQrAction(data)).rejects.toThrow("NEXT_REDIRECT:");
      const [reset] = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.id, qrId));
      expect(reset.cardAppearance).toEqual({});
      expect(reset.ownerId).toBeNull();
      expect(reset.status).toBe("available");
      expect(
        await db
          .select()
          .from(qrCardDesigns)
          .where(eq(qrCardDesigns.qrCodeId, qrId)),
      ).toHaveLength(0);
    });
  },
);
