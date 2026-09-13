"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { profiles, qrCodes } from "@/db/schema";
import { requireSession } from "@/lib/session";

const assignmentSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  profileId: z.uuid(),
  qrId: z.uuid(),
});

export async function assignProfileToQrAction(formData: FormData) {
  const parsed = assignmentSchema.safeParse({
    expectedVersion: formData.get("expectedVersion"),
    profileId: formData.get("profileId"),
    qrId: formData.get("qrId"),
  });
  if (!parsed.success) redirect("/dashboard?error=invalid-assignment");

  const session = await requireSession(`/dashboard/qr/${parsed.data.qrId}`);
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(
        eq(profiles.id, parsed.data.profileId),
        eq(profiles.ownerId, session.user.id),
        eq(profiles.status, "published"),
      ),
    )
    .limit(1);

  if (!profile) {
    redirect(`/dashboard/qr/${parsed.data.qrId}?error=profile-unavailable`);
  }

  const [updated] = await db
    .update(qrCodes)
    .set({
      activeProfileId: profile.id,
      updatedAt: new Date(),
      version: sql`${qrCodes.version} + 1`,
    })
    .where(
      and(
        eq(qrCodes.id, parsed.data.qrId),
        eq(qrCodes.ownerId, session.user.id),
        eq(qrCodes.status, "active"),
        eq(qrCodes.version, parsed.data.expectedVersion),
      ),
    )
    .returning({ publicToken: qrCodes.publicToken });

  if (!updated) {
    redirect(`/dashboard/qr/${parsed.data.qrId}?error=assignment-conflict`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/qr/${parsed.data.qrId}`);
  revalidatePath(`/profiles/${profile.id}/edit`);
  revalidatePath(`/q/${updated.publicToken}`);
  redirect(`/dashboard/qr/${parsed.data.qrId}?updated=profile`);
}
