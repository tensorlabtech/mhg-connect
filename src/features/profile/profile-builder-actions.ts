"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

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
import {
  deleteProfileMedia,
  type ProfileMediaKind,
  uploadProfileMedia,
} from "@/lib/profile-media-storage";
import { requireSession } from "@/lib/session";

class ExpectedBuilderError extends Error {}

async function uploadProfileImage(
  file: FormDataEntryValue | null,
  kind: ProfileMediaKind,
) {
  if (!(file instanceof File) || file.size === 0) return null;
  const limit = kind === "avatar" ? 2 : 5;
  const label =
    kind === "avatar"
      ? "Ảnh đại diện"
      : kind === "cover"
        ? "Ảnh bìa"
        : "Ảnh nền";
  if (file.size > limit * 1024 * 1024)
    throw new ExpectedBuilderError(`${label} phải nhỏ hơn ${limit} MB.`);
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
    throw new ExpectedBuilderError(`${label} chỉ hỗ trợ JPG, PNG hoặc WebP.`);
  }
  try {
    return await uploadProfileMedia(file, kind);
  } catch (error) {
    throw new ExpectedBuilderError(
      error instanceof Error ? error.message : "Chưa thể tải ảnh.",
    );
  }
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
  const previousIdentity = previousDocument
    ? getProfileBlock(previousDocument, "identity")
    : null;
  const avatarFile = formData.get("avatar");
  const coverFile = formData.get("cover");
  const backgroundFile = formData.get("background");
  const hasAvatarUpload = avatarFile instanceof File && avatarFile.size > 0;
  const hasCoverUpload = coverFile instanceof File && coverFile.size > 0;
  const hasSelectedBackgroundFile =
    backgroundFile instanceof File && backgroundFile.size > 0;
  const wantsBackgroundImage =
    validation.document.theme.background.type === "image" &&
    hasSelectedBackgroundFile;
  const hasBackgroundUpload = wantsBackgroundImage;
  const mediaError = validateDocumentMedia(
    validation.document,
    previous?.avatarUrl ?? null,
    previousIdentity?.data.coverUrl ?? null,
    previousBackground,
    hasAvatarUpload,
    hasCoverUpload,
    hasBackgroundUpload,
  );
  if (mediaError) return { error: mediaError, success: false };

  let uploadedAvatar: Awaited<ReturnType<typeof uploadProfileImage>> = null;
  let uploadedCover: Awaited<ReturnType<typeof uploadProfileImage>> = null;
  let uploadedBackground: Awaited<ReturnType<typeof uploadProfileImage>> = null;
  try {
    const uploads = await Promise.allSettled([
      uploadProfileImage(avatarFile, "avatar"),
      uploadProfileImage(coverFile, "cover"),
      wantsBackgroundImage
        ? uploadProfileImage(backgroundFile, "background")
        : null,
    ]);
    uploadedAvatar =
      uploads[0].status === "fulfilled" ? uploads[0].value : null;
    uploadedCover = uploads[1].status === "fulfilled" ? uploads[1].value : null;
    uploadedBackground =
      uploads[2].status === "fulfilled" ? uploads[2].value : null;
    const failed = uploads.find((upload) => upload.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
  } catch (error) {
    await Promise.all(
      [uploadedAvatar, uploadedCover, uploadedBackground]
        .filter(Boolean)
        .map((uploaded) =>
          deleteProfileMedia(uploaded!.url).catch(() => undefined),
        ),
    );
    return {
      error: error instanceof Error ? error.message : "Chưa thể tải ảnh.",
      success: false,
    };
  }
  const document = replaceDocumentMedia(
    validation.document,
    uploadedAvatar?.url ??
      getProfileBlock(validation.document, "identity").data.avatarUrl,
    uploadedCover?.url,
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
    await Promise.all(
      [uploadedAvatar, uploadedCover, uploadedBackground]
        .filter(Boolean)
        .map((uploaded) =>
          deleteProfileMedia(uploaded!.url).catch(() => undefined),
        ),
    );
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

  const publishedIdentity = getProfileBlock(document, "identity").data;
  const savedBackground =
    document.theme.background.type === "image"
      ? document.theme.background.imageUrl
      : null;
  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${saved.id}/edit`);
  after(async () => {
    const replacedUrls = [
      previous?.avatarUrl && previous.avatarUrl !== publishedIdentity.avatarUrl
        ? previous.avatarUrl
        : null,
      previousIdentity?.data.coverUrl &&
      previousIdentity.data.coverUrl !== publishedIdentity.coverUrl
        ? previousIdentity.data.coverUrl
        : null,
      previousBackground && previousBackground !== savedBackground
        ? previousBackground
        : null,
    ].filter((url): url is string => Boolean(url?.startsWith("https://")));
    await Promise.all(
      replacedUrls.map((url) =>
        deleteProfileMedia(url).catch((error) =>
          console.error("Profile media cleanup failed", error),
        ),
      ),
    );
    try {
      const linkedQr = await db
        .select({ token: qrCodes.publicToken })
        .from(qrCodes)
        .where(eq(qrCodes.activeProfileId, saved.id));
      linkedQr.forEach(({ token }) => revalidatePath(`/q/${token}`));
    } catch (error) {
      console.error("Profile save revalidation failed", error);
    }
  });

  return {
    document,
    profileId: saved.id,
    publicToken: qrToken || undefined,
    success: true,
    version: saved.version,
  };
}
