import { randomUUID } from "node:crypto";

import { and, eq, inArray, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, db } from "@/db";
import {
  profiles,
  qrClaimRateLimits,
  qrCodes,
  user,
} from "@/db/schema";

const runtimeEnvironment = globalThis.process?.["env"];
const allowDatabaseTests =
  runtimeEnvironment?.["ALLOW_DATABASE_TESTS"] === "true";
const describeDatabase = allowDatabaseTests ? describe : describe.skip;

describeDatabase("product database invariants", () => {
  const runId = randomUUID();
  const ownerAId = `integration-owner-a-${runId}`;
  const ownerBId = `integration-owner-b-${runId}`;
  const createdQrIds: string[] = [];
  const createdProfileIds: string[] = [];

  beforeAll(async () => {
    if (!runtimeEnvironment?.["DATABASE_URL"]) {
      throw new Error(
        "DATABASE_URL is required for database integration tests.",
      );
    }

    await db.insert(user).values([
      {
        id: ownerAId,
        name: "Integration owner A",
        email: `owner-a-${runId}@example.test`,
      },
      {
        id: ownerBId,
        name: "Integration owner B",
        email: `owner-b-${runId}@example.test`,
      },
    ]);
  });

  afterAll(async () => {
    if (createdQrIds.length > 0) {
      await db.delete(qrCodes).where(inArray(qrCodes.id, createdQrIds));
    }
    if (createdProfileIds.length > 0) {
      await db.delete(profiles).where(inArray(profiles.id, createdProfileIds));
    }
    await db.delete(user).where(inArray(user.id, [ownerAId, ownerBId]));
    await closeDatabase();
  });

  test("only one concurrent conditional claim can win", async () => {
    const [qr] = await db
      .insert(qrCodes)
      .values({ publicToken: `INTEGRATION-CLAIM-${runId}` })
      .returning({ id: qrCodes.id });
    createdQrIds.push(qr.id);

    const claim = (ownerId: string) =>
      db
        .update(qrCodes)
        .set({
          status: "active",
          ownerId,
          activatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(qrCodes.id, qr.id), eq(qrCodes.status, "available")))
        .returning({ ownerId: qrCodes.ownerId });

    const [claimA, claimB] = await Promise.all([
      claim(ownerAId),
      claim(ownerBId),
    ]);

    expect(claimA.length + claimB.length).toBe(1);
  });

  test("concurrent rate-limit increments are atomic per user window", async () => {
    const bucketStart = new Date(Math.floor(Date.now() / 60_000) * 60_000);
    const increment = () =>
      db
        .insert(qrClaimRateLimits)
        .values({ userId: ownerAId, bucketStart })
        .onConflictDoUpdate({
          target: [qrClaimRateLimits.userId, qrClaimRateLimits.bucketStart],
          set: { attempts: sql`${qrClaimRateLimits.attempts} + 1` },
        });

    await Promise.all(Array.from({ length: 12 }, increment));

    const [bucket] = await db
      .select({ attempts: qrClaimRateLimits.attempts })
      .from(qrClaimRateLimits)
      .where(
        and(
          eq(qrClaimRateLimits.userId, ownerAId),
          eq(qrClaimRateLimits.bucketStart, bucketStart),
        ),
      );
    expect(bucket.attempts).toBe(12);
  });

  test("a QR cannot reference a profile owned by another user", async () => {
    const [profile] = await db
      .insert(profiles)
      .values({ ownerId: ownerBId, name: "Owner B profile" })
      .returning({ id: profiles.id });
    createdProfileIds.push(profile.id);

    await expect(
      db.insert(qrCodes).values({
        publicToken: `INTEGRATION-OWNER-${runId}`,
        status: "active",
        ownerId: ownerAId,
        activeProfileId: profile.id,
        activatedAt: new Date(),
      }),
    ).rejects.toThrow();
  });

  test("resetting a QR preserves its former profile", async () => {
    const [profile] = await db
      .insert(profiles)
      .values({ ownerId: ownerAId, name: "Persistent profile" })
      .returning({ id: profiles.id });
    createdProfileIds.push(profile.id);

    const [qr] = await db
      .insert(qrCodes)
      .values({
        publicToken: `INTEGRATION-RESET-${runId}`,
        status: "active",
        ownerId: ownerAId,
        activeProfileId: profile.id,
        activatedAt: new Date(),
      })
      .returning({ id: qrCodes.id });
    createdQrIds.push(qr.id);

    await db
      .update(qrCodes)
      .set({
        status: "available",
        ownerId: null,
        activeProfileId: null,
        activatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.id, qr.id));

    const [persistedProfile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, profile.id));

    expect(persistedProfile?.id).toBe(profile.id);
  });

  test("a stale admin version cannot reset a newly claimed QR", async () => {
    const [qr] = await db
      .insert(qrCodes)
      .values({ publicToken: `INTEGRATION-VERSION-${runId}` })
      .returning({ id: qrCodes.id, version: qrCodes.version });
    createdQrIds.push(qr.id);

    const [firstClaim] = await db
      .update(qrCodes)
      .set({
        status: "active",
        ownerId: ownerAId,
        activatedAt: new Date(),
        version: sql`${qrCodes.version} + 1`,
      })
      .where(eq(qrCodes.id, qr.id))
      .returning({ version: qrCodes.version });

    await db
      .update(qrCodes)
      .set({
        status: "available",
        ownerId: null,
        activatedAt: null,
        version: sql`${qrCodes.version} + 1`,
      })
      .where(eq(qrCodes.id, qr.id));
    await db
      .update(qrCodes)
      .set({
        status: "active",
        ownerId: ownerBId,
        activatedAt: new Date(),
        version: sql`${qrCodes.version} + 1`,
      })
      .where(eq(qrCodes.id, qr.id));

    const staleReset = await db
      .update(qrCodes)
      .set({ status: "available", ownerId: null })
      .where(
        and(
          eq(qrCodes.id, qr.id),
          eq(qrCodes.status, "active"),
          eq(qrCodes.version, firstClaim.version),
        ),
      )
      .returning({ id: qrCodes.id });
    const [current] = await db
      .select({ ownerId: qrCodes.ownerId })
      .from(qrCodes)
      .where(eq(qrCodes.id, qr.id));

    expect(staleReset).toHaveLength(0);
    expect(current.ownerId).toBe(ownerBId);
  });

  test("a stale manual save cannot overwrite a newer profile", async () => {
    const [profile] = await db
      .insert(profiles)
      .values({ ownerId: ownerAId, name: "Versioned profile" })
      .returning({ id: profiles.id, version: profiles.documentVersion });
    createdProfileIds.push(profile.id);
    await db
      .update(profiles)
      .set({ documentVersion: sql`${profiles.documentVersion} + 1` })
      .where(eq(profiles.id, profile.id));
    const staleWrite = await db
      .update(profiles)
      .set({ name: "Stale overwrite" })
      .where(
        and(
          eq(profiles.id, profile.id),
          eq(profiles.documentVersion, profile.version),
        ),
      )
      .returning({ id: profiles.id });
    expect(staleWrite).toHaveLength(0);
  });
});
