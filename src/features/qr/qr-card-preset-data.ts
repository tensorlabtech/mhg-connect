import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { qrCardPresets } from "@/db/schema";
import {
  qrCardPresetIdPattern,
  type QrCardPreset,
} from "@/features/qr/qr-card-presets";

const columns = {
  backgroundUrl: qrCardPresets.backgroundUrl,
  category: qrCardPresets.category,
  id: qrCardPresets.id,
  name: qrCardPresets.name,
  orientation: qrCardPresets.orientation,
  tagline: qrCardPresets.tagline,
  textStyle: qrCardPresets.textStyle,
};

/** Các mẫu sticker đang bật, theo thứ tự hiển thị. */
export const getQrCardPresets = cache(async (): Promise<QrCardPreset[]> =>
  db
    .select(columns)
    .from(qrCardPresets)
    .where(eq(qrCardPresets.active, true))
    .orderBy(asc(qrCardPresets.sortOrder), asc(qrCardPresets.name)),
);

/** Tìm một mẫu đang bật theo mã; trả null nếu mã sai hoặc mẫu đã tắt. */
export async function findActiveQrCardPreset(
  id: unknown,
): Promise<QrCardPreset | null> {
  if (typeof id !== "string" || !qrCardPresetIdPattern.test(id)) return null;
  const [preset] = await db
    .select(columns)
    .from(qrCardPresets)
    .where(and(eq(qrCardPresets.id, id), eq(qrCardPresets.active, true)))
    .limit(1);
  return preset ?? null;
}
