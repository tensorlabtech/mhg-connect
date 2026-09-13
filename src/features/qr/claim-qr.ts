"use server";

import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { profiles, qrClaimRateLimits, qrCodes } from "@/db/schema";
import { requireSession } from "@/lib/session";

const claimSchema = z.object({
  token: z.string().trim().min(1).max(160),
  profileId: z.union([z.literal("new"), z.uuid()]).default("new"),
});

export async function claimQrAction(formData: FormData) {
  const parsed = claimSchema.safeParse({
    token: formData.get("token"),
    profileId: formData.get("profileId") || "new",
  });

  if (!parsed.success) {
    redirect("/?error=invalid-token");
  }

  const session = await requireSession(`/q/${parsed.data.token}`);
  const now = Date.now();
  const bucketStart = new Date(Math.floor(now / 60_000) * 60_000);
  const [rateLimit] = await db
    .insert(qrClaimRateLimits)
    .values({ userId: session.user.id, bucketStart })
    .onConflictDoUpdate({
      target: [qrClaimRateLimits.userId, qrClaimRateLimits.bucketStart],
      set: { attempts: sql`${qrClaimRateLimits.attempts} + 1` },
    })
    .returning({ attempts: qrClaimRateLimits.attempts });

  after(async () => {
    await db
      .delete(qrClaimRateLimits)
      .where(lt(qrClaimRateLimits.bucketStart, new Date(now - 86_400_000)))
      .catch(() => undefined);
  });

  if (rateLimit.attempts > 10) {
    redirect(`/q/${parsed.data.token}?error=rate-limit`);
  }
  const selectedProfileId =
    parsed.data.profileId === "new" ? null : parsed.data.profileId;

  if (selectedProfileId) {
    const [ownedProfile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(profiles.id, selectedProfileId),
          eq(profiles.ownerId, session.user.id),
          eq(profiles.status, "published"),
        ),
      )
      .limit(1);

    if (!ownedProfile) {
      redirect(`/q/${parsed.data.token}?error=profile-owner`);
    }
  }

  const [claimed] = await db
    .update(qrCodes)
    .set({
      ownerId: session.user.id,
      activeProfileId: selectedProfileId,
      status: "active",
      activatedAt: new Date(),
      updatedAt: new Date(),
      version: sql`${qrCodes.version} + 1`,
    })
    .where(
      and(
        eq(qrCodes.publicToken, parsed.data.token),
        eq(qrCodes.status, "available"),
        isNull(qrCodes.ownerId),
      ),
    )
    .returning({ id: qrCodes.id });

  if (!claimed) {
    redirect(`/q/${parsed.data.token}?error=claim-conflict`);
  }

  redirect(
    selectedProfileId
      ? `/profiles/${selectedProfileId}/edit?linked=${encodeURIComponent(parsed.data.token)}`
      : `/profiles/new?qr=${encodeURIComponent(parsed.data.token)}`,
  );
}
