"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { qrCardDesigns, qrCodes } from "@/db/schema";
import { qrCardTextStyles, type QrCardTextStyle } from "@/db/schema/product";
import {
  QR_CARD_DEFAULT_TAGLINE,
  QR_CARD_TAGLINE_MAX,
  qrCardOrientations,
  type QrCardOrientation,
} from "@/features/qr/qr-card-layout";
import {
  toClientQrCardDesign as toClientDesign,
  type QrCardDesign,
} from "@/features/qr/qr-card-design";
import { findActiveQrCardPreset } from "@/features/qr/qr-card-preset-data";
import type { QrCardPreset } from "@/features/qr/qr-card-presets";
import {
  deleteProfileMedia,
  uploadProfileMedia,
} from "@/lib/profile-media-storage";
import { requireSession } from "@/lib/session";

export type { QrCardDesign };

export type QrCardDesignResult =
  { design: QrCardDesign; success: true } | { error: string; success: false };

const maxDesignsPerQr = 12;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable();

const createSchema = z.object({
  copyFrom: z
    .object({
      orientation: z.enum(qrCardOrientations).optional(),
      tagline: z.string().trim().max(QR_CARD_TAGLINE_MAX).optional(),
      textStyle: z.enum(qrCardTextStyles),
    })
    .nullable(),
  name: z.string().trim().min(1).max(60),
  qrId: z.uuid(),
});

const updateSchema = z.object({
  description: optionalText(160).optional(),
  designId: z.uuid(),
  heading: optionalText(80).optional(),
  location: optionalText(120).optional(),
  name: z.string().trim().min(1).max(60).optional(),
  orientation: z.enum(qrCardOrientations).optional(),
  tagline: z.string().trim().max(QR_CARD_TAGLINE_MAX).optional(),
  textStyle: z.enum(qrCardTextStyles).optional(),
});

async function findOwnedQr(qrId: string, ownerId: string) {
  const [qr] = await db
    .select({
      backgroundUrl: qrCodes.cardBackgroundUrl,
      id: qrCodes.id,
      publicToken: qrCodes.publicToken,
    })
    .from(qrCodes)
    .where(and(eq(qrCodes.id, qrId), eq(qrCodes.ownerId, ownerId)))
    .limit(1);
  return qr ?? null;
}

async function findOwnedDesign(designId: string, ownerId: string) {
  const [row] = await db
    .select({ design: qrCardDesigns, publicToken: qrCodes.publicToken })
    .from(qrCardDesigns)
    .innerJoin(qrCodes, eq(qrCardDesigns.qrCodeId, qrCodes.id))
    .where(and(eq(qrCardDesigns.id, designId), eq(qrCodes.ownerId, ownerId)))
    .limit(1);
  return row ?? null;
}

function revalidateCard(qrId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/admin/qr/${qrId}`);
  revalidatePath(`/admin/qr/${qrId}/print`);
}

export async function createQrCardDesignAction(input: {
  copyFrom: {
    orientation?: QrCardOrientation;
    tagline?: string;
    textStyle: QrCardTextStyle;
  } | null;
  name: string;
  qrId: string;
}): Promise<QrCardDesignResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success)
    return { error: "Tên mẫu thẻ chưa hợp lệ.", success: false };
  const session = await requireSession("/dashboard");
  const qr = await findOwnedQr(parsed.data.qrId, session.user.id);
  if (!qr) return { error: "Không tìm thấy mã QR.", success: false };

  const [{ total }] = await db
    .select({ total: count() })
    .from(qrCardDesigns)
    .where(eq(qrCardDesigns.qrCodeId, qr.id));
  if (total >= maxDesignsPerQr) {
    return {
      error: `Mỗi mã QR có tối đa ${maxDesignsPerQr} mẫu thẻ thêm.`,
      success: false,
    };
  }

  // Ảnh nền không chép sang mẫu mới: mỗi mẫu tự giữ ảnh riêng để xoá mẫu không ảnh hưởng mẫu khác.
  const [created] = await db
    .insert(qrCardDesigns)
    .values({
      name: parsed.data.name,
      qrCodeId: qr.id,
      orientation: parsed.data.copyFrom?.orientation ?? "portrait",
      tagline: parsed.data.copyFrom?.tagline ?? QR_CARD_DEFAULT_TAGLINE,
      textStyle: parsed.data.copyFrom?.textStyle ?? "shadow",
    })
    .returning();
  revalidateCard(qr.id);
  return { design: toClientDesign(qr.id, created), success: true };
}

export async function updateQrCardDesignAction(
  input: z.input<typeof updateSchema>,
): Promise<QrCardDesignResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success)
    return { error: "Thông tin mẫu thẻ chưa hợp lệ.", success: false };
  const session = await requireSession("/dashboard");
  const owned = await findOwnedDesign(parsed.data.designId, session.user.id);
  if (!owned) return { error: "Không tìm thấy mẫu thẻ.", success: false };

  const { designId, ...patch } = parsed.data;
  const [updated] = await db
    .update(qrCardDesigns)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(qrCardDesigns.id, designId))
    .returning();
  revalidateCard(updated.qrCodeId);
  return { design: toClientDesign(updated.qrCodeId, updated), success: true };
}

export async function saveQrCardDesignBackgroundAction(
  formData: FormData,
): Promise<QrCardDesignResult> {
  const designId = z.uuid().safeParse(formData.get("designId"));
  const rawIntent = formData.get("intent");
  const intent =
    rawIntent === "remove" || rawIntent === "preset" ? rawIntent : "save";
  if (!designId.success)
    return { error: "Mẫu thẻ không hợp lệ.", success: false };
  const session = await requireSession("/dashboard");
  const owned = await findOwnedDesign(designId.data, session.user.id);
  if (!owned) return { error: "Không tìm thấy mẫu thẻ.", success: false };

  let uploadedUrl: string | null = null;
  let preset: QrCardPreset | null = null;
  if (intent === "preset") {
    preset = await findActiveQrCardPreset(formData.get("presetId"));
    if (!preset)
      return { error: "Mẫu sticker này không còn dùng được.", success: false };
    uploadedUrl = preset.backgroundUrl;
  } else if (intent === "save") {
    const file = formData.get("background");
    if (!(file instanceof File) || file.size === 0)
      return { error: "Hãy chọn một ảnh nền.", success: false };
    if (!acceptedTypes.has(file.type))
      return {
        error: "Ảnh nền chỉ hỗ trợ JPG, PNG hoặc WebP.",
        success: false,
      };
    if (file.size > maxFileSize)
      return { error: "Ảnh nền phải nhỏ hơn 5 MB.", success: false };
    try {
      uploadedUrl = (await uploadProfileMedia(file, "card-background")).url;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Chưa thể tải ảnh nền.",
        success: false,
      };
    }
  }

  const [updated] = await db
    .update(qrCardDesigns)
    .set({
      backgroundUrl: uploadedUrl,
      ...(preset
        ? {
            orientation: preset.orientation,
            tagline: preset.tagline,
            textStyle: preset.textStyle,
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(qrCardDesigns.id, owned.design.id))
    .returning();
  const replaced = owned.design.backgroundUrl;
  if (replaced && replaced !== uploadedUrl) {
    after(() =>
      deleteProfileMedia(replaced).catch((error) =>
        console.error("QR card design background cleanup failed", error),
      ),
    );
  }
  revalidateCard(updated.qrCodeId);
  return { design: toClientDesign(updated.qrCodeId, updated), success: true };
}

export async function deleteQrCardDesignAction(input: {
  designId: string;
}): Promise<{ error?: string; success: boolean }> {
  const designId = z.uuid().safeParse(input.designId);
  if (!designId.success)
    return { error: "Mẫu thẻ không hợp lệ.", success: false };
  const session = await requireSession("/dashboard");
  const owned = await findOwnedDesign(designId.data, session.user.id);
  if (!owned) return { error: "Không tìm thấy mẫu thẻ.", success: false };
  await db.delete(qrCardDesigns).where(eq(qrCardDesigns.id, owned.design.id));
  const background = owned.design.backgroundUrl;
  if (background) {
    after(() =>
      deleteProfileMedia(background).catch((error) =>
        console.error("QR card design background cleanup failed", error),
      ),
    );
  }
  revalidateCard(owned.design.qrCodeId);
  return { success: true };
}
