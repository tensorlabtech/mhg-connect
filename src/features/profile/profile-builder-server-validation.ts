import { z } from "zod";

import {
  allowedAvatarPresetUrls,
  allowedCoverPresetUrls,
  defaultCoverUrl,
} from "@/features/profile/profile-demo-media";
import { getProfileBlock } from "@/features/profile/profile-document";
import { profileDocumentSchema } from "@/features/profile/profile-document-schema";
import type { ProfileDocument } from "@/features/profile/profile-document-types";
import { profileBackgroundImages } from "@/features/profile/profile-style-packs";

const emailSchema = z.email();

export function isValidDocumentVersion(value: number, profileExists: boolean) {
  return Number.isInteger(value) && value >= (profileExists ? 1 : 0);
}

export function validateDraftDocument(value: unknown) {
  return profileDocumentSchema.safeParse(value);
}

export function validatePublishDocument(
  value: unknown,
): { document: ProfileDocument } | { error: string; field: string } {
  const parsed = profileDocumentSchema.safeParse(value);
  if (!parsed.success) {
    return { error: "Cấu trúc hồ sơ không hợp lệ.", field: "document" };
  }
  const document = parsed.data as ProfileDocument;
  const identity = getProfileBlock(document, "identity");
  const contact = getProfileBlock(document, "contact");
  if (identity.data.name.trim().length < 2) {
    return {
      error: "Nhập họ và tên có ít nhất 2 ký tự trước khi lưu.",
      field: "name",
    };
  }
  if (
    contact.visible &&
    contact.data.visibleFields.email &&
    contact.data.contactEmail &&
    !emailSchema.safeParse(contact.data.contactEmail).success
  ) {
    return { error: "Email liên hệ chưa hợp lệ.", field: "contactEmail" };
  }
  return { document };
}

export function validateDocumentMedia(
  document: ProfileDocument,
  previousAvatarUrl: string | null,
  previousBackgroundUrl: string | null = null,
  hasBackgroundUpload = false,
) {
  const identity = getProfileBlock(document, "identity");
  const avatarAllowed =
    !identity.data.avatarUrl ||
    identity.data.avatarUrl === previousAvatarUrl ||
    allowedAvatarPresetUrls.has(identity.data.avatarUrl);
  const coverUrl = identity.data.coverUrl || defaultCoverUrl;
  if (!avatarAllowed) return "Ảnh đại diện không hợp lệ.";
  if (!allowedCoverPresetUrls.has(coverUrl)) return "Ảnh bìa không hợp lệ.";
  const background = document.theme.background;
  const isBundledBackground =
    background.type === "image" &&
    profileBackgroundImages.some(({ url }) => url === background.imageUrl);
  if (
    background.type === "image" &&
    !isBundledBackground &&
    !hasBackgroundUpload &&
    background.imageUrl !== previousBackgroundUrl
  ) {
    return "Ảnh nền không hợp lệ.";
  }
  return null;
}

export function replaceDocumentMedia(
  document: ProfileDocument,
  avatarUrl: string | null,
  backgroundUrl?: string,
) {
  const blocks = document.blocks.map((block) =>
    block.type === "identity"
      ? {
          ...block,
          data: {
            ...block.data,
            avatarUrl,
            coverUrl: block.data.coverUrl || defaultCoverUrl,
          },
        }
      : block,
  );
  return {
    ...document,
    blocks,
    theme:
      document.theme.background.type === "image" && backgroundUrl
        ? {
            ...document.theme,
            background: {
              ...document.theme.background,
              imageUrl: backgroundUrl,
            },
          }
        : document.theme,
  } as ProfileDocument;
}
