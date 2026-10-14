import "server-only";

import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { profiles, qrCardDesigns, qrCodes, scanEvents } from "@/db/schema";
import {
  toClientQrCardDesign,
  type QrCardDesign,
} from "@/features/qr/qr-card-design";

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
      cardTextStyle: qrCodes.cardTextStyle,
      cardOrientation: qrCodes.cardOrientation,
      cardTagline: qrCodes.cardTagline,
      cardFont: qrCodes.cardFont,
      cardTextColor: qrCodes.cardTextColor,
      publicToken: qrCodes.publicToken,
      status: qrCodes.status,
      profileId: profiles.id,
      profileName: profiles.name,
      profileTitle: profiles.title,
      profileCompany: profiles.company,
      profileLocation: profiles.location,
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
      cardTextStyle: qrCodes.cardTextStyle,
      cardOrientation: qrCodes.cardOrientation,
      cardTagline: qrCodes.cardTagline,
      cardFont: qrCodes.cardFont,
      cardTextColor: qrCodes.cardTextColor,
      publicToken: qrCodes.publicToken,
      status: qrCodes.status,
      profileId: profiles.id,
      profileName: profiles.name,
      profileTitle: profiles.title,
      profileCompany: profiles.company,
      profileLocation: profiles.location,
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

export async function getQrCardDesigns(qrIds: string[]) {
  const result = new Map<string, QrCardDesign[]>();
  if (!qrIds.length) return result;
  const rows = await db
    .select()
    .from(qrCardDesigns)
    .where(inArray(qrCardDesigns.qrCodeId, qrIds))
    .orderBy(asc(qrCardDesigns.createdAt));
  for (const row of rows) {
    const list = result.get(row.qrCodeId) ?? [];
    list.push(toClientQrCardDesign(row.qrCodeId, row));
    result.set(row.qrCodeId, list);
  }
  return result;
}
