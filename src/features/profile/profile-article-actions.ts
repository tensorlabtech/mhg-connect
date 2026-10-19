"use server";

import {
  isManagedProfileMediaUrl,
  uploadProfileMedia,
} from "@/lib/profile-media-storage";
import { requireSession } from "@/lib/session";

export type UploadArticleImageResult =
  { success: true; url: string } | { error: string; success: false };

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

export async function uploadArticleImageAction(
  formData: FormData,
): Promise<UploadArticleImageResult> {
  await requireSession("/dashboard");
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Hãy chọn một ảnh.", success: false };
  }
  if (!acceptedTypes.has(file.type)) {
    return { error: "Ảnh chỉ hỗ trợ JPG, PNG hoặc WebP.", success: false };
  }
  if (file.size > maxFileSize) {
    return { error: "Ảnh phải nhỏ hơn 5 MB.", success: false };
  }
  try {
    const uploaded = await uploadProfileMedia(file, "article");
    if (!isManagedProfileMediaUrl(uploaded.url)) {
      return { error: "Kho ảnh trả về địa chỉ không hợp lệ.", success: false };
    }
    return { success: true, url: uploaded.url };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Chưa thể tải ảnh lên.",
      success: false,
    };
  }
}
