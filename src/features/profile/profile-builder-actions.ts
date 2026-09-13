"use server";

import { del, put } from "@vercel/blob";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { profiles, qrCodes } from "@/db/schema";
import type { SaveProfileResult } from "@/features/profile/profile-builder-action-types";
import {
  isValidDocumentVersion,
  replaceDocumentMedia,
  validateDocumentMedia,
  validatePublishDocument,
} from "@/features/profile/profile-builder-server-validation";
import { profileDocumentToFlat } from "@/features/profile/profile-document";
import { getProfileBlock } from "@/features/profile/profile-document";
import { parseProfileDocument } from "@/features/profile/profile-document-schema";
import { runtimeEnv } from "@/lib/runtime-env";
import { requireSession } from "@/lib/session";

class ExpectedBuilderError extends Error {}

async function uploadProfileImage(
  file: FormDataEntryValue | null,
  kind: "avatar" | "background",
) {
  if (!(file instanceof File) || file.size === 0) return null;
  const limit = kind === "avatar" ? 2 : 5;
  const label = kind === "avatar" ? "Ảnh đại diện" : "Ảnh nền";
  if (file.size > limit * 1024 * 1024)
    throw new ExpectedBuilderError(`${label} phải nhỏ hơn ${limit} MB.`);
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
    throw new ExpectedBuilderError(
      `${label} chỉ hỗ trợ JPG, PNG hoặc WebP.`,
    );
  }
  if (!runtimeEnv.blobToken)
    throw new ExpectedBuilderError("Chưa cấu hình kho ảnh cho môi trường này.");
  return put(`${kind === "avatar" ? "avatars" : "backgrounds"}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
    token: runtimeEnv.blobToken,
  });
}

async function findOwnedProfile(profileId: string, ownerId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.ownerId, ownerId)))
    .limit(1);
  return profile ?? null;
}

export async function saveProfileAction(
  formData: FormData,
): Promise<SaveProfileResult> {
  const profileId = String(formData.get("profileId") || "");
  const profileLabel = String(formData.get("profileLabel") || "").trim();
  const qrToken = String(formData.get("qrToken") || "").trim();
  const expectedVersion = Number(formData.get("expectedVersion"));
  if (!profileLabel || profileLabel.length > 120) {
    return { error: "Nhập tên hồ sơ từ 1 đến 120 ký tự.", success: false };
  }
  if (!isValidDocumentVersion(expectedVersion, Boolean(profileId))) {
    return { error: "Phiên bản hồ sơ không hợp lệ.", success: false };
  }
  let rawDocument: unknown;
  try {
    rawDocument = JSON.parse(String(formData.get("document") || ""));
  } catch {
    return { error: "Cấu trúc hồ sơ không hợp lệ.", success: false };
  }
  const validation = validatePublishDocument(rawDocument);
  if (!("document" in validation)) return { ...validation, success: false };
  const session = await requireSession(
    profileId ? `/profiles/${profileId}/edit` : "/profiles/new",
  );
  const previous = profileId
    ? await findOwnedProfile(profileId, session.user.id)
    : null;
  if (profileId && !previous)
    return { error: "Không tìm thấy hồ sơ.", success: false };
  const previousDocument = previous
    ? parseProfileDocument(previous.publishedDocument)
    : null;
  const previousBackground =
    previousDocument?.theme.background.type === "image"
      ? previousDocument.theme.background.imageUrl
      : null;
  const backgroundFile = formData.get("background");
  const hasSelectedBackgroundFile =
    backgroundFile instanceof File && backgroundFile.size > 0;
  const wantsBackgroundImage =
    validation.document.theme.background.type === "image" &&
    hasSelectedBackgroundFile;
  const hasBackgroundUpload =
    wantsBackgroundImage;
  const mediaError = validateDocumentMedia(
    validation.document,
    previous?.avatarUrl ?? null,
    previousBackground,
    hasBackgroundUpload,
  );
  if (mediaError) return { error: mediaError, success: false };

  let uploadedAvatar: Awaited<ReturnType<typeof uploadProfileImage>> = null;
  let uploadedBackground: Awaited<ReturnType<typeof uploadProfileImage>> = null;
  try {
    uploadedAvatar = await uploadProfileImage(formData.get("avatar"), "avatar");
    uploadedBackground = wantsBackgroundImage
      ? await uploadProfileImage(backgroundFile, "background")
      : null;
  } catch (error) {
    if (uploadedAvatar && runtimeEnv.blobToken) {
      await del(uploadedAvatar.url, { token: runtimeEnv.blobToken }).catch(
        () => undefined,
      );
    }
    return {
      error: error instanceof Error ? error.message : "Chưa thể tải ảnh.",
      success: false,
    };
  }
  const document = replaceDocumentMedia(
    validation.document,
    uploadedAvatar?.url ??
      getProfileBlock(validation.document, "identity").data.avatarUrl,
    uploadedBackground?.url,
  );
  const flat = profileDocumentToFlat(document);
  const now = new Date();

  let saved: { id: string; version: number };
  try {
    saved = await db.transaction(async (tx) => {
      let savedProfileId = profileId;
      let version: number;
      if (savedProfileId) {
        const [updated] = await tx
          .update(profiles)
          .set({
            ...flat,
            documentVersion: sql`${profiles.documentVersion} + 1`,
            profileLabel,
            publishedAt: now,
            publishedDocument: document,
            status: "published",
            updatedAt: now,
          })
          .where(
            and(
              eq(profiles.id, savedProfileId),
              eq(profiles.ownerId, session.user.id),
              eq(profiles.documentVersion, expectedVersion),
            ),
          )
          .returning({ id: profiles.id, version: profiles.documentVersion });
        if (!updated) throw new ExpectedBuilderError("VERSION_CONFLICT");
        version = updated.version;
      } else {
        const [created] = await tx
          .insert(profiles)
          .values({
            ...flat,
            documentVersion: 1,
            ownerId: session.user.id,
            profileLabel,
            publishedAt: now,
            publishedDocument: document,
            status: "published",
            updatedAt: now,
          })
          .returning({ id: profiles.id, version: profiles.documentVersion });
        savedProfileId = created.id;
        version = created.version;
      }
      if (qrToken) {
        const [linked] = await tx
          .update(qrCodes)
          .set({
            activeProfileId: savedProfileId,
            updatedAt: now,
            version: sql`${qrCodes.version} + 1`,
          })
          .where(
            and(
              eq(qrCodes.publicToken, qrToken),
              eq(qrCodes.ownerId, session.user.id),
              eq(qrCodes.status, "active"),
              isNull(qrCodes.activeProfileId),
            ),
          )
          .returning({ id: qrCodes.id });
        if (!linked) throw new ExpectedBuilderError("QR_LINK_CONFLICT");
      }
      return { id: savedProfileId, version };
    });
  } catch (error) {
    if (runtimeEnv.blobToken) {
      await Promise.all(
        [uploadedAvatar, uploadedBackground]
          .filter(Boolean)
          .map((uploaded) =>
            del(uploaded!.url, { token: runtimeEnv.blobToken }).catch(
              () => undefined,
            ),
          ),
      );
    }
    if (error instanceof ExpectedBuilderError) {
      return {
        conflict: error.message === "VERSION_CONFLICT",
        error:
          error.message === "QR_LINK_CONFLICT"
            ? "Mã QR không còn chờ liên kết. Hãy tải lại dashboard."
            : "Hồ sơ đã được thay đổi ở phiên khác. Hãy tải lại trang.",
        success: false,
      };
    }
    console.error("Profile save failed", error);
    return { error: "Chưa thể lưu hồ sơ.", success: false };
  }

  const publishedAvatarUrl = getProfileBlock(document, "identity").data
    .avatarUrl;
  if (
    previous?.avatarUrl &&
    previous.avatarUrl !== publishedAvatarUrl &&
    previous.avatarUrl.startsWith("https://") &&
    runtimeEnv.blobToken
  ) {
    await del(previous.avatarUrl, { token: runtimeEnv.blobToken }).catch(
      () => undefined,
    );
  }
  const savedBackground =
    document.theme.background.type === "image"
      ? document.theme.background.imageUrl
      : null;
  if (
    previousBackground &&
    previousBackground !== savedBackground &&
    previousBackground.startsWith("https://") &&
    runtimeEnv.blobToken
  ) {
    await del(previousBackground, { token: runtimeEnv.blobToken }).catch(
      () => undefined,
    );
  }

  let linkedQr: Array<{ token: string }> = [];
  try {
    revalidatePath("/dashboard");
    revalidatePath(`/profiles/${saved.id}/edit`);
    linkedQr = await db
      .select({ token: qrCodes.publicToken })
      .from(qrCodes)
      .where(eq(qrCodes.activeProfileId, saved.id));
    linkedQr.forEach(({ token }) => revalidatePath(`/q/${token}`));
  } catch (error) {
    // Saving is already committed. Cache invalidation/query failures must
    // not turn that success into a false failure or delete its uploaded media.
    console.error("Profile save revalidation failed", error);
  }

  return {
    document,
    profileId: saved.id,
    publicToken: qrToken || linkedQr[0]?.token,
    success: true,
    version: saved.version,
  };
}
