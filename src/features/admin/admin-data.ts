import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, qrCodes, scanEvents, user } from "@/db/schema";

export async function getAdminQrList() {
  return db
    .select({
      id: qrCodes.id,
      cardBackgroundUrl: qrCodes.cardBackgroundUrl,
      cardTextStyle: qrCodes.cardTextStyle,
      cardOrientation: qrCodes.cardOrientation,
      cardTagline: qrCodes.cardTagline,
      cardFont: qrCodes.cardFont,
      cardTextColor: qrCodes.cardTextColor,
      publicToken: qrCodes.publicToken,
      status: qrCodes.status,
      ownerEmail: user.email,
      profileName: profiles.name,
      profileTitle: profiles.title,
      profileCompany: profiles.company,
      profileLocation: profiles.location,
      scanCount: count(scanEvents.id),
      createdAt: qrCodes.createdAt,
      activatedAt: qrCodes.activatedAt,
      version: qrCodes.version,
    })
    .from(qrCodes)
    .leftJoin(user, eq(qrCodes.ownerId, user.id))
    .leftJoin(profiles, eq(qrCodes.activeProfileId, profiles.id))
    .leftJoin(scanEvents, eq(qrCodes.id, scanEvents.qrCodeId))
    .groupBy(qrCodes.id, user.id, profiles.id)
    .orderBy(desc(qrCodes.updatedAt));
}

export async function getAdminQrDetail(id: string) {
  const list = await getAdminQrList();
  return list.find((item) => item.id === id) ?? null;
}
