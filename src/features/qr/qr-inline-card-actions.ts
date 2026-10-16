"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  qrCodes,
  qrCardDesigns,
  qrCardPresets,
  enterprises,
  enterpriseMembers,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import { uploadProfileMedia } from "@/lib/profile-media-storage";
import {
  cardAppearanceInput,
  validateCardImage,
  type QrCardAppearance,
} from "./qr-card-appearance";
import {
  qrCardFonts,
  qrCardOrientations,
  qrCardPositions,
  QR_CARD_TAGLINE_MAX,
  QR_CARD_DEFAULT_TAGLINE,
} from "./qr-card-layout";
import { toClientQrCardDesign, type QrCardDesign } from "./qr-card-design";
import { qrCardTextColorInput } from "./qr-card-text-color-input";
import { isPresetCardBackground } from "./qr-card-presets";
import { nextCardRevision } from "./qr-card-revision";

const schema = z
  .object({
    qrId: z.uuid(),
    designId: z.uuid().optional(),
    expectedVersion: z.number().int().positive().optional(),
    expectedUpdatedAt: z.iso.datetime().optional(),
    expectedEnterpriseUpdatedAt: z.iso.datetime().nullable().optional(),
    appearance: cardAppearanceInput,
    orientation: z.enum(qrCardOrientations),
    position: z.enum(qrCardPositions),
    font: z.enum(qrCardFonts),
    textColor: qrCardTextColorInput,
    tagline: z.string().trim().max(QR_CARD_TAGLINE_MAX),
    removeBackground: z.boolean().default(false),
    presetBackgroundUrl: z.string().max(400).optional(),
  })
  .strict();

export type InlineCardSaveResult =
  | { success: false; error: string }
  | {
      success: true;
      appearance: QrCardAppearance;
      version?: number;
      design?: QrCardDesign;
      backgroundUrl?: string | null;
      logoUrl?: string;
      logoName?: string;
      enterpriseUpdatedAt?: string;
    };

/** Saves card-only copy and media; never updates a published profile. */
export async function saveInlineCardAction(
  form: FormData,
): Promise<InlineCardSaveResult> {
  const session = await requireSession("/dashboard");
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("settings")));
  } catch {
    return { success: false, error: "Thiết kế thẻ chưa hợp lệ." };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return {
      success: false,
      error: "Kiểm tra độ dài nội dung, màu sắc và website trước khi lưu.",
    };
  const input = parsed.data;
  const [owned] = await db
    .select()
    .from(qrCodes)
    .where(
      and(eq(qrCodes.id, input.qrId), eq(qrCodes.ownerId, session.user.id)),
    )
    .limit(1);
  if (!owned)
    return {
      success: false,
      error: "Không tìm thấy mã QR thuộc tài khoản của bạn.",
    };
  const [design] = input.designId
    ? await db
        .select()
        .from(qrCardDesigns)
        .where(
          and(
            eq(qrCardDesigns.id, input.designId),
            eq(qrCardDesigns.qrCodeId, owned.id),
          ),
        )
        .limit(1)
    : [];
  if (input.designId && !design)
    return { success: false, error: "Không tìm thấy mẫu thẻ." };
  if (
    design
      ? input.expectedUpdatedAt !== design.updatedAt.toISOString()
      : input.expectedVersion !== owned.version
  )
    return {
      success: false,
      error: "Thẻ đã thay đổi ở nơi khác. Hãy tải lại trang trước khi lưu.",
    };
  let presetUrl: string | undefined;
  if (input.presetBackgroundUrl) {
    if (!isPresetCardBackground(input.presetBackgroundUrl))
      return { success: false, error: "Ảnh nền có sẵn chưa hợp lệ." };
    const [preset] = await db
      .select()
      .from(qrCardPresets)
      .where(
        and(
          eq(qrCardPresets.backgroundUrl, input.presetBackgroundUrl),
          eq(qrCardPresets.active, true),
        ),
      )
      .limit(1);
    if (!preset)
      return { success: false, error: "Ảnh nền này không còn dùng được." };
    presetUrl = preset.backgroundUrl;
  }

  const files = new Map<string, File>();
  const separateAvatar = form.get("avatar");
  if (separateAvatar instanceof File && separateAvatar.size > 0)
    return {
      success: false,
      error:
        "Ảnh đại diện dùng chung với hồ sơ. Hãy đổi ảnh trong hồ sơ, chỉ căn khung ảnh trên thẻ.",
    };
  for (const key of ["background", "enterpriseLogo"]) {
    const file = form.get(key);
    if (!(file instanceof File) || file.size === 0) continue;
    const error = validateCardImage(
      file.type,
      file.size,
      new Uint8Array(await file.slice(0, 12).arrayBuffer()),
    );
    if (error) return { success: false, error };
    if (key === "enterpriseLogo" && file.size > 2 * 1024 * 1024)
      return { success: false, error: "Logo không vượt quá 2 MB." };
    files.set(key, file);
  }
  const [enterprise] = files.has("enterpriseLogo")
    ? await db
        .select({ company: enterprises })
        .from(enterpriseMembers)
        .innerJoin(
          enterprises,
          eq(enterpriseMembers.enterpriseId, enterprises.id),
        )
        .where(eq(enterpriseMembers.userId, session.user.id))
        .limit(1)
    : [];
  if (
    files.has("enterpriseLogo") &&
    (!enterprise?.company.customLogoEnabled ||
      input.expectedEnterpriseUpdatedAt !==
        enterprise.company.updatedAt.toISOString())
  )
    return {
      success: false,
      error:
        "Doanh nghiệp chưa được cấp quyền thêm logo hoặc nhận diện đã thay đổi. Liên hệ quản trị MHG.",
    };

  const appearance: QrCardAppearance = {
    ...input.appearance,
  };
  let backgroundUrl = input.removeBackground
    ? null
    : design
      ? design.backgroundUrl
      : owned.cardBackgroundUrl;
  if (presetUrl) backgroundUrl = presetUrl;
  let enterpriseLogoUrl: string | undefined;
  try {
    if (files.has("background"))
      backgroundUrl = (
        await uploadProfileMedia(files.get("background")!, "card-background")
      ).url;
    if (files.has("enterpriseLogo"))
      enterpriseLogoUrl = (
        await uploadProfileMedia(files.get("enterpriseLogo")!, "logo")
      ).url;
  } catch {
    return {
      success: false,
      error: "Chưa thể tải ảnh. Thay đổi chưa được lưu; hãy thử lại.",
    };
  }
  // Keep replaced assets intact. A conflict must never delete a user's original file.
  try {
    const result = await db.transaction(async (tx) => {
      const [stillOwned] = await tx
        .select({ id: qrCodes.id })
        .from(qrCodes)
        .where(
          and(eq(qrCodes.id, owned.id), eq(qrCodes.ownerId, session.user.id)),
        )
        .limit(1)
        .for("update");
      if (!stillOwned) throw new Error("ownership changed");
      let savedDesign: QrCardDesign | undefined;
      let version: number | undefined;
      if (design) {
        const [row] = await tx
          .update(qrCardDesigns)
          .set({
            appearance,
            backgroundUrl,
            orientation: input.orientation,
            position: input.position,
            font: input.font,
            textColor: input.textColor,
            tagline: QR_CARD_DEFAULT_TAGLINE,
            updatedAt: nextCardRevision(design.updatedAt),
          })
          .where(
            and(
              eq(qrCardDesigns.id, design.id),
              gte(qrCardDesigns.updatedAt, design.updatedAt),
              lt(
                qrCardDesigns.updatedAt,
                new Date(design.updatedAt.getTime() + 1),
              ),
            ),
          )
          .returning();
        if (!row) throw new Error("conflict");
        savedDesign = toClientQrCardDesign(owned.id, row);
      } else {
        const [row] = await tx
          .update(qrCodes)
          .set({
            cardAppearance: appearance,
            cardBackgroundUrl: backgroundUrl,
            cardOrientation: input.orientation,
            cardPosition: input.position,
            cardFont: input.font,
            cardTextColor: input.textColor,
            cardTagline: QR_CARD_DEFAULT_TAGLINE,
            updatedAt: new Date(),
            version: sql`${qrCodes.version} + 1`,
          })
          .where(
            and(
              eq(qrCodes.id, owned.id),
              eq(qrCodes.ownerId, session.user.id),
              eq(qrCodes.version, input.expectedVersion!),
            ),
          )
          .returning({ version: qrCodes.version });
        if (!row) throw new Error("conflict");
        version = row.version;
      }
      let enterpriseUpdatedAt: string | undefined;
      if (enterprise && enterpriseLogoUrl) {
        const [stillMember] = await tx
          .select({ userId: enterpriseMembers.userId })
          .from(enterpriseMembers)
          .where(
            and(
              eq(enterpriseMembers.userId, session.user.id),
              eq(enterpriseMembers.enterpriseId, enterprise.company.id),
            ),
          )
          .limit(1)
          .for("update");
        if (!stillMember) throw new Error("membership changed");
        const [row] = await tx
          .update(enterprises)
          .set({
            logoUrl: enterpriseLogoUrl,
            updatedAt: nextCardRevision(enterprise.company.updatedAt),
          })
          .where(
            and(
              eq(enterprises.id, enterprise.company.id),
              eq(enterprises.customLogoEnabled, true),
              gte(enterprises.updatedAt, enterprise.company.updatedAt),
              lt(
                enterprises.updatedAt,
                new Date(enterprise.company.updatedAt.getTime() + 1),
              ),
            ),
          )
          .returning();
        if (!row) throw new Error("conflict");
        enterpriseUpdatedAt = row.updatedAt.toISOString();
      }
      return { savedDesign, version, enterpriseUpdatedAt };
    });
    revalidatePath("/dashboard");
    revalidatePath("/admin", "layout");
    revalidatePath(`/q/${owned.publicToken}`);
    const clientBackground = backgroundUrl
      ? isPresetCardBackground(backgroundUrl)
        ? backgroundUrl
        : `/api/qr-card-background/${owned.id}?v=${result.version ?? Date.now()}`
      : null;
    return {
      success: true,
      appearance,
      version: result.version,
      design: result.savedDesign,
      backgroundUrl: clientBackground,
      ...(enterpriseLogoUrl && enterprise
        ? {
            logoUrl: `/api/enterprise-logo/${enterprise.company.id}?v=${new Date(result.enterpriseUpdatedAt!).getTime()}`,
            logoName: enterprise.company.name,
            enterpriseUpdatedAt: result.enterpriseUpdatedAt,
          }
        : {}),
    };
  } catch {
    return {
      success: false,
      error:
        "Chưa lưu được, có thể thẻ hoặc logo vừa thay đổi ở nơi khác. Tải lại trang để kiểm tra.",
    };
  }
}
