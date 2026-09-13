import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { profiles, qrCodes } from "@/db/schema";

export async function getOwnedProfile(profileId: string, ownerId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.ownerId, ownerId)))
    .limit(1);
  return profile ?? null;
}

export async function getProfilesForDashboard(ownerId: string) {
  const ownedProfiles = await db
    .select({
      createdAt: profiles.createdAt,
      id: profiles.id,
      name: profiles.name,
      profileLabel: profiles.profileLabel,
    })
    .from(profiles)
    .where(eq(profiles.ownerId, ownerId))
    .orderBy(desc(profiles.updatedAt));

  const profileIds = ownedProfiles.map((profile) => profile.id);
  if (!profileIds.length) return [];
  const linkedCodes = await db
    .select({
      id: qrCodes.id,
      profileId: qrCodes.activeProfileId,
      token: qrCodes.publicToken,
    })
    .from(qrCodes)
    .where(
      and(
        eq(qrCodes.ownerId, ownerId),
        inArray(qrCodes.activeProfileId, profileIds),
      ),
    );
  const byProfile = new Map<string, Array<{ id: string; token: string }>>();
  linkedCodes.forEach((code) => {
    if (!code.profileId) return;
    const current = byProfile.get(code.profileId) ?? [];
    current.push({ id: code.id, token: code.token });
    byProfile.set(code.profileId, current);
  });
  return ownedProfiles.map((profile) => ({
    ...profile,
    linkedQr: byProfile.get(profile.id) ?? [],
  }));
}

export async function getLinkedQr(profileId: string, ownerId: string) {
  return db
    .select({
      id: qrCodes.id,
      token: qrCodes.publicToken,
      status: qrCodes.status,
    })
    .from(qrCodes)
    .where(
      and(eq(qrCodes.activeProfileId, profileId), eq(qrCodes.ownerId, ownerId)),
    );
}
