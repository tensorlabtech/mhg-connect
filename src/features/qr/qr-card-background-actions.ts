"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { qrCardTextStyles, type QrCardTextStyle } from "@/db/schema/product";
import {
  QR_CARD_TAGLINE_MAX,
  qrCardFonts,
  qrCardOrientations,
  type QrCardFont,
  type QrCardOrientation,
} from "@/features/qr/qr-card-layout";
import { qrCardTextColorInput } from "@/features/qr/qr-card-text-color-input";
import { findActiveQrCardPreset } from "@/features/qr/qr-card-preset-data";
import {
  isPresetCardBackground,
  type QrCardPreset,
} from "@/features/qr/qr-card-presets";
import {
  deleteProfileMedia,
  uploadProfileMedia,
} from "@/lib/profile-media-storage";
import { requireSession } from "@/lib/session";

export type SaveQrCardBackgroundResult = {
  error?: string;
  /** Có khi vừa áp một mẫu sticker: mẫu đổi luôn hướng thẻ, nền chữ và dòng chữ cạnh logo. */
  layout?: Pick<QrCardPreset, "orientation" | "tagline" | "textStyle"> & {
    textColor: null;
  };
  success: boolean;
  url?: string | null;
  version?: number;
};

const inputSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  intent: z.enum(["save", "remove", "preset"]),
  presetId: z.string().max(64).optional(),
  qrId: z.uuid(),
});

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

export async function saveQrCardBackgroundAction(
  _previous: SaveQrCardBackgroundResult,
  formData: FormData,
): Promise<SaveQrCardBackgroundResult> {
  const parsed = inputSchema.safeParse({
    expectedVersion: formData.get("expectedVersion"),
    intent: formData.get("presetId")
      ? "preset"
      : (formData.get("intent") ?? "save"),
    presetId: formData.get("presetId") || undefined,
    qrId: formData.get("qrId"),
  });
  if (!parsed.success) {
    return { error: "Thông tin mã QR không hợp lệ.", success: false };
  }

  const session = await requireSession("/dashboard");
  const [current] = await db
    .select({ backgroundUrl: qrCodes.cardBackgroundUrl })
    .from(qrCodes)
    .where(
      and(
        eq(qrCodes.id, parsed.data.qrId),
        eq(qrCodes.ownerId, session.user.id),
      ),
    )
    .limit(1);
  if (!current) {
    return { error: "Không tìm thấy mã QR.", success: false };
  }

  let uploadedUrl: string | null = null;
  let preset: QrCardPreset | null = null;
  if (parsed.data.intent === "preset") {
    preset = await findActiveQrCardPreset(parsed.data.presetId);
    if (!preset) {
      return { error: "Mẫu sticker này không còn dùng được.", success: false };
    }
    uploadedUrl = preset.backgroundUrl;
  } else if (parsed.data.intent === "save") {
    const file = formData.get("background");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Hãy chọn một ảnh nền trước khi lưu.", success: false };
    }
    if (!acceptedTypes.has(file.type)) {
      return {
        error: "Ảnh nền chỉ hỗ trợ JPG, PNG hoặc WebP.",
        success: false,
      };
    }
    if (file.size > maxFileSize) {
      return { error: "Ảnh nền phải nhỏ hơn 5 MB.", success: false };
    }
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
    .update(qrCodes)
    .set({
      cardBackgroundUrl: uploadedUrl,
      ...(preset
        ? {
            cardOrientation: preset.orientation,
            cardTagline: preset.tagline,
            cardTextStyle: preset.textStyle,
            // Mẫu sticker có nền chữ riêng: trả màu chữ về tự động để chữ luôn đọc được.
            cardTextColor: null,
          }
        : {}),
      updatedAt: new Date(),
      version: sql`${qrCodes.version} + 1`,
    })
    .where(
      and(
        eq(qrCodes.id, parsed.data.qrId),
        eq(qrCodes.ownerId, session.user.id),
        eq(qrCodes.version, parsed.data.expectedVersion),
      ),
    )
    .returning({
      publicToken: qrCodes.publicToken,
      version: qrCodes.version,
    });

  if (!updated) {
    if (uploadedUrl && !isPresetCardBackground(uploadedUrl))
      await deleteProfileMedia(uploadedUrl).catch(() => undefined);
    return {
      error: "Thiết kế thẻ đã được thay đổi ở nơi khác. Hãy tải lại trang.",
      success: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/admin/qr/${parsed.data.qrId}`);
  revalidatePath(`/admin/qr/${parsed.data.qrId}/print`);
  revalidatePath(`/q/${updated.publicToken}`);

  const replacedUrl = current.backgroundUrl;
  if (replacedUrl && replacedUrl !== uploadedUrl) {
    after(() =>
      deleteProfileMedia(replacedUrl).catch((error) =>
        console.error("QR card background cleanup failed", error),
      ),
    );
  }

  return {
    ...(preset
      ? {
          layout: {
            orientation: preset.orientation,
            tagline: preset.tagline,
            textStyle: preset.textStyle,
            textColor: null,
          },
        }
      : {}),
    success: true,
    url: uploadedUrl
      ? isPresetCardBackground(uploadedUrl)
        ? uploadedUrl
        : `/api/qr-card-background/${parsed.data.qrId}?v=${updated.version}`
      : null,
    version: updated.version,
  };
}

const textStyleSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  qrId: z.uuid(),
  textStyle: z.enum(qrCardTextStyles),
});

export type SaveQrCardTextStyleResult = {
  error?: string;
  success: boolean;
  textStyle?: QrCardTextStyle;
  version?: number;
};

export async function saveQrCardTextStyleAction(input: {
  expectedVersion: number;
  qrId: string;
  textStyle: QrCardTextStyle;
}): Promise<SaveQrCardTextStyleResult> {
  const parsed = textStyleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Kiểu nền chữ không hợp lệ.", success: false };
  }

  const session = await requireSession("/dashboard");
  const [updated] = await db
    .update(qrCodes)
    .set({
      cardTextStyle: parsed.data.textStyle,
      updatedAt: new Date(),
      version: sql`${qrCodes.version} + 1`,
    })
    .where(
      and(
        eq(qrCodes.id, parsed.data.qrId),
        eq(qrCodes.ownerId, session.user.id),
        eq(qrCodes.version, parsed.data.expectedVersion),
      ),
    )
    .returning({
      publicToken: qrCodes.publicToken,
      textStyle: qrCodes.cardTextStyle,
      version: qrCodes.version,
    });

  if (!updated) {
    return {
      error: "Thiết kế thẻ đã được thay đổi ở nơi khác. Hãy tải lại trang.",
      success: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/admin/qr/${parsed.data.qrId}`);
  revalidatePath(`/admin/qr/${parsed.data.qrId}/print`);
  revalidatePath(`/q/${updated.publicToken}`);

  return {
    success: true,
    textStyle: updated.textStyle,
    version: updated.version,
  };
}

const layoutSchema = z.object({
  expectedVersion: z.coerce.number().int().positive(),
  font: z.enum(qrCardFonts).optional(),
  orientation: z.enum(qrCardOrientations).optional(),
  qrId: z.uuid(),
  tagline: z.string().trim().max(QR_CARD_TAGLINE_MAX).optional(),
  textColor: qrCardTextColorInput,
});

export type SaveQrCardLayoutResult = {
  error?: string;
  font?: QrCardFont;
  orientation?: QrCardOrientation;
  success: boolean;
  tagline?: string;
  textColor?: string | null;
  version?: number;
};

/** Lưu hướng thẻ (dọc/ngang), dòng chữ cạnh logo, phông chữ và màu chữ của thẻ chính. */
export async function saveQrCardLayoutAction(input: {
  expectedVersion: number;
  font?: QrCardFont;
  orientation?: QrCardOrientation;
  qrId: string;
  tagline?: string;
  textColor?: string | null;
}): Promise<SaveQrCardLayoutResult> {
  const parsed = layoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Thông tin thẻ chưa hợp lệ.", success: false };
  }
  const { expectedVersion, font, orientation, qrId, tagline, textColor } =
    parsed.data;
  const session = await requireSession("/dashboard");
  const [updated] = await db
    .update(qrCodes)
    .set({
      ...(orientation ? { cardOrientation: orientation } : {}),
      ...(tagline !== undefined ? { cardTagline: tagline } : {}),
      ...(font ? { cardFont: font } : {}),
      ...(textColor !== undefined ? { cardTextColor: textColor } : {}),
      updatedAt: new Date(),
      version: sql`${qrCodes.version} + 1`,
    })
    .where(
      and(
        eq(qrCodes.id, qrId),
        eq(qrCodes.ownerId, session.user.id),
        eq(qrCodes.version, expectedVersion),
      ),
    )
    .returning({
      font: qrCodes.cardFont,
      orientation: qrCodes.cardOrientation,
      tagline: qrCodes.cardTagline,
      textColor: qrCodes.cardTextColor,
      version: qrCodes.version,
    });

  if (!updated) {
    return {
      error: "Thiết kế thẻ đã được thay đổi ở nơi khác. Hãy tải lại trang.",
      success: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/admin/qr/${qrId}`);
  revalidatePath(`/admin/qr/${qrId}/print`);

  return {
    font: updated.font,
    orientation: updated.orientation,
    success: true,
    tagline: updated.tagline,
    textColor: updated.textColor,
    version: updated.version,
  };
}
