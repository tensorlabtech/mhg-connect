"use server";

import { and, eq, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { adminActions, qrCodes } from "@/db/schema";
import { deleteProfileMedia } from "@/lib/profile-media-storage";
import { requireAdmin } from "@/lib/session";

const createSchema = z.object({
  publicToken: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(
      /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
      "Token chỉ dùng chữ in hoa, số và dấu gạch ngang.",
    ),
});

const actionSchema = z.object({
  expectedStatus: z.enum(["available", "active", "locked"]),
  expectedVersion: z.coerce.number().int().positive(),
  id: z.uuid(),
  operation: z.enum(["lock", "unlock", "reset"]),
});

class InvalidQrTransitionError extends Error {}

export async function createAdminQrAction(formData: FormData) {
  const parsed = createSchema.safeParse({
    publicToken: String(formData.get("publicToken") ?? "")
      .trim()
      .toUpperCase(),
  });
  if (!parsed.success) redirect("/admin?error=invalid-token");

  const session = await requireAdmin();
  const [created] = await db
    .insert(qrCodes)
    .values({ publicToken: parsed.data.publicToken })
    .onConflictDoNothing()
    .returning({ id: qrCodes.id });

  if (!created) redirect("/admin?error=token-exists");

  await db.insert(adminActions).values({
    action: "create",
    adminId: session.user.id,
    qrCodeId: created.id,
  });

  revalidatePath("/admin");
  redirect(`/admin/qr/${created.id}?created=1`);
}

export async function adminQrAction(formData: FormData) {
  const parsed = actionSchema.safeParse({
    expectedStatus: formData.get("expectedStatus"),
    expectedVersion: formData.get("expectedVersion"),
    id: formData.get("id"),
    operation: formData.get("operation"),
  });
  if (!parsed.success) redirect("/admin?error=invalid-action");

  const session = await requireAdmin();
  const next =
    parsed.data.operation === "reset"
      ? {
          activeProfileId: null,
          activatedAt: null,
          cardBackgroundUrl: null,
          ownerId: null,
          status: "available" as const,
          updatedAt: new Date(),
          version: sql`${qrCodes.version} + 1`,
        }
      : {
          status:
            parsed.data.operation === "lock"
              ? ("locked" as const)
              : ("active" as const),
          updatedAt: new Date(),
          version: sql`${qrCodes.version} + 1`,
        };

  let updated: {
    id: string;
    previousBackgroundUrl: string | null;
    publicToken: string;
  };
  try {
    updated = await db.transaction(async (tx) => {
      const [current] =
        parsed.data.operation === "reset"
          ? await tx
              .select({ cardBackgroundUrl: qrCodes.cardBackgroundUrl })
              .from(qrCodes)
              .where(eq(qrCodes.id, parsed.data.id))
              .limit(1)
          : [{ cardBackgroundUrl: null }];
      const expectedStatus =
        parsed.data.operation === "lock"
          ? "active"
          : parsed.data.operation === "unlock"
            ? "locked"
            : parsed.data.expectedStatus;
      const [changed] = await tx
        .update(qrCodes)
        .set(next)
        .where(
          parsed.data.operation === "reset"
            ? and(
                eq(qrCodes.id, parsed.data.id),
                eq(qrCodes.status, expectedStatus),
                eq(qrCodes.version, parsed.data.expectedVersion),
              )
            : and(
                eq(qrCodes.id, parsed.data.id),
                eq(qrCodes.status, expectedStatus),
                eq(qrCodes.version, parsed.data.expectedVersion),
                isNotNull(qrCodes.ownerId),
              ),
        )
        .returning({
          id: qrCodes.id,
          publicToken: qrCodes.publicToken,
        });
      if (!changed) throw new InvalidQrTransitionError();
      await tx.insert(adminActions).values({
        adminId: session.user.id,
        qrCodeId: changed.id,
        action: parsed.data.operation,
      });
      return {
        ...changed,
        previousBackgroundUrl: current?.cardBackgroundUrl ?? null,
      };
    });
  } catch (error) {
    if (error instanceof InvalidQrTransitionError) {
      redirect(`/admin/qr/${parsed.data.id}?error=invalid-transition`);
    }
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/qr/${updated.id}`);
  revalidatePath(`/q/${updated.publicToken}`);
  if (parsed.data.operation === "reset" && updated.previousBackgroundUrl) {
    after(() =>
      deleteProfileMedia(updated.previousBackgroundUrl!).catch((error) =>
        console.error("QR card background cleanup failed", error),
      ),
    );
  }
  redirect(`/admin/qr/${updated.id}?updated=${parsed.data.operation}`);
}
