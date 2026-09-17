import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { profiles, qrCodes, scanEvents } from "@/db/schema";

export async function getQrByToken(publicToken: string) {
  const [result] = await db
    .select({ qr: qrCodes, profile: profiles })
    .from(qrCodes)
    .leftJoin(profiles, eq(qrCodes.activeProfileId, profiles.id))
    .where(eq(qrCodes.publicToken, publicToken))
    .limit(1);

  return result ?? null;
}

export async function getOwnedProfiles(ownerId: string) {
  return db
    .select({
      id: profiles.id,
      name: profiles.name,
      profileLabel: profiles.profileLabel,
      status: profiles.status,
      linkedQrCount: count(qrCodes.id),
    })
    .from(profiles)
    .leftJoin(
      qrCodes,
      and(
        eq(qrCodes.activeProfileId, profiles.id),
        eq(qrCodes.ownerId, ownerId),
      ),
    )
    .where(and(eq(profiles.ownerId, ownerId), eq(profiles.status, "published")))
    .groupBy(
      profiles.id,
      profiles.name,
      profiles.profileLabel,
      profiles.status,
      profiles.updatedAt,
    )
    .orderBy(desc(profiles.updatedAt));
}

export async function recordScan(qrCodeId: string, userAgent: string | null) {
  const normalized = userAgent?.toLowerCase() ?? "";
  const deviceType = /mobile|android|iphone|ipad/.test(normalized)
    ? "mobile"
    : "desktop";

  await db.insert(scanEvents).values({ qrCodeId, deviceType });
}

export async function getOwnedQr(ownerId: string) {
  return db
    .select({
      id: qrCodes.id,
      activatedAt: qrCodes.activatedAt,
      cardBackgroundUrl: qrCodes.cardBackgroundUrl,
      publicToken: qrCodes.publicToken,
      status: qrCodes.status,
      profileId: profiles.id,
      profileName: profiles.name,
      profileTitle: profiles.title,
      profileCompany: profiles.company,
      profileStatus: profiles.status,
      version: qrCodes.version,
      scanCount: count(scanEvents.id),
    })
    .from(qrCodes)
    .leftJoin(profiles, eq(qrCodes.activeProfileId, profiles.id))
    .leftJoin(scanEvents, eq(qrCodes.id, scanEvents.qrCodeId))
    .where(eq(qrCodes.ownerId, ownerId))
    .groupBy(qrCodes.id, profiles.id)
    .orderBy(desc(qrCodes.updatedAt));
}

export async function getOwnedQrById(ownerId: string, id: string) {
  const [qr] = await db
    .select({
      id: qrCodes.id,
      activatedAt: qrCodes.activatedAt,
      cardBackgroundUrl: qrCodes.cardBackgroundUrl,
      publicToken: qrCodes.publicToken,
      status: qrCodes.status,
      profileId: profiles.id,
      profileName: profiles.name,
      profileTitle: profiles.title,
      profileCompany: profiles.company,
      version: qrCodes.version,
      scanCount: count(scanEvents.id),
    })
    .from(qrCodes)
    .leftJoin(profiles, eq(qrCodes.activeProfileId, profiles.id))
    .leftJoin(scanEvents, eq(qrCodes.id, scanEvents.qrCodeId))
    .where(and(eq(qrCodes.ownerId, ownerId), eq(qrCodes.id, id)))
    .groupBy(qrCodes.id, profiles.id)
    .limit(1);

  return qr ?? null;
}

export async function getPublishedProfilesForQrAssignment(ownerId: string) {
  return db
    .select({
      id: profiles.id,
      name: profiles.name,
      profileLabel: profiles.profileLabel,
      title: profiles.title,
      company: profiles.company,
      linkedQrCount: count(qrCodes.id),
    })
    .from(profiles)
    .leftJoin(
      qrCodes,
      and(
        eq(qrCodes.activeProfileId, profiles.id),
        eq(qrCodes.ownerId, ownerId),
      ),
    )
    .where(and(eq(profiles.ownerId, ownerId), eq(profiles.status, "published")))
    .groupBy(
      profiles.id,
      profiles.name,
      profiles.profileLabel,
      profiles.title,
      profiles.company,
      profiles.updatedAt,
    )
    .orderBy(desc(profiles.updatedAt));
}

export async function findOwnedQrWithoutProfile(
  ownerId: string,
  publicToken: string,
) {
  const [qr] = await db
    .select()
    .from(qrCodes)
    .where(
      and(
        eq(qrCodes.ownerId, ownerId),
        eq(qrCodes.publicToken, publicToken),
        eq(qrCodes.status, "active"),
        sql`${qrCodes.activeProfileId} is null`,
      ),
    )
    .limit(1);

  return qr ?? null;
}
