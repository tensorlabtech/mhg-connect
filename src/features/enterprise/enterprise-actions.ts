"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { enterprises, enterpriseMembers, user } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { uploadProfileMedia } from "@/lib/profile-media-storage";
import { validateEnterpriseLogo } from "./enterprise-branding";
import { nextCardRevision } from "@/features/qr/qr-card-revision";

export type EnterpriseActionState = { success: boolean; message?: string };

function refreshBranding() {
  revalidatePath("/admin/enterprises");
  revalidatePath("/dashboard");
  revalidatePath("/admin", "layout");
}

export async function createEnterpriseAction(
  _state: EnterpriseActionState,
  form: FormData,
): Promise<EnterpriseActionState> {
  await requireAdmin();
  const parsed = z.string().trim().min(2).max(120).safeParse(form.get("name"));
  if (!parsed.success)
    return {
      success: false,
      message: "Tên doanh nghiệp cần từ 2 đến 120 ký tự.",
    };
  await db.insert(enterprises).values({ name: parsed.data });
  refreshBranding();
  return {
    success: true,
    message: "Đã thêm doanh nghiệp. Quyền logo riêng mặc định đang tắt.",
  };
}

export async function saveEnterpriseBrandAction(
  _state: EnterpriseActionState,
  form: FormData,
): Promise<EnterpriseActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("enterpriseId"));
  if (!id.success)
    return { success: false, message: "Doanh nghiệp không hợp lệ." };
  const [company] = await db
    .select()
    .from(enterprises)
    .where(eq(enterprises.id, id.data))
    .limit(1);
  if (!company)
    return { success: false, message: "Không tìm thấy doanh nghiệp." };
  const expected = z.iso.datetime().safeParse(form.get("expectedUpdatedAt"));
  if (
    !expected.success ||
    new Date(expected.data).getTime() !== company.updatedAt.getTime()
  )
    return {
      success: false,
      message:
        "Nhận diện đã thay đổi ở nơi khác. Hãy tải lại trang trước khi lưu.",
    };
  const enabled = form.get("customLogoEnabled") === "on";
  const hideMhgLogo = form.get("hideMhgLogo") === "on";
  if (hideMhgLogo && !enabled)
    return {
      success: false,
      message:
        "Chỉ bỏ được logo MHG khi đã bật logo riêng của cơ quan.",
    };
  const file = form.get("logo");
  let logoUrl = company.logoUrl;
  if (file instanceof File && file.size > 0) {
    const error = validateEnterpriseLogo(file.type, file.size);
    if (error) return { success: false, message: error };
    // Verify raster bytes as well as the client-provided MIME type. SVG is never accepted.
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const png =
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71 &&
      bytes[4] === 13 &&
      bytes[5] === 10 &&
      bytes[6] === 26 &&
      bytes[7] === 10;
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    if (!(
      (file.type === "image/png" && png) ||
      (file.type === "image/jpeg" && jpeg) ||
      (file.type === "image/webp" && webp)
    ))
      return {
        success: false,
        message: "Dữ liệu ảnh không khớp định dạng logo.",
      };
    try {
      logoUrl = (await uploadProfileMedia(file, "logo")).url;
    } catch {
      return {
        success: false,
        message:
          "Chưa thể lưu logo vào kho ảnh. Hãy kiểm tra cấu hình và thử lại.",
      };
    }
  }
  if (enabled && !logoUrl)
    return {
      success: false,
      message: "Hãy chọn logo trước khi bật quyền logo riêng.",
    };
  // Preserve replaced assets; no automatic deletion of user files.
  const [updated] = await db
    .update(enterprises)
    .set({ customLogoEnabled: enabled, hideMhgLogo, logoUrl, updatedAt: nextCardRevision(company.updatedAt) })
    .where(
      and(
        eq(enterprises.id, id.data),
        gte(enterprises.updatedAt, company.updatedAt),
        lt(enterprises.updatedAt, new Date(company.updatedAt.getTime() + 1)),
      ),
    )
    .returning({ id: enterprises.id });
  if (!updated)
    return {
      success: false,
      message: "Nhận diện vừa thay đổi ở nơi khác. Hãy tải lại trang.",
    };
  refreshBranding();
  return {
    success: true,
    message: !enabled
      ? "Đã tắt logo riêng; toàn bộ nhân sự trở về logo MHG."
      : hideMhgLogo
        ? "Thẻ của nhân sự được gán chỉ hiện logo cơ quan (đã bỏ logo MHG)."
        : "Logo doanh nghiệp đã áp dụng cho toàn bộ nhân sự được gán.",
  };
}

export async function assignEnterpriseMemberAction(
  _state: EnterpriseActionState,
  form: FormData,
): Promise<EnterpriseActionState> {
  await requireAdmin();
  const parsed = z
    .object({ enterpriseId: z.uuid(), userId: z.string().min(1).max(200) })
    .safeParse({
      enterpriseId: form.get("enterpriseId"),
      userId: form.get("userId"),
    });
  if (!parsed.success)
    return {
      success: false,
      message: "Hãy chọn doanh nghiệp và tài khoản nhân sự.",
    };
  const [company] = await db
    .select({ id: enterprises.id })
    .from(enterprises)
    .where(eq(enterprises.id, parsed.data.enterpriseId))
    .limit(1);
  const [member] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, parsed.data.userId))
    .limit(1);
  if (!company || !member)
    return {
      success: false,
      message: "Doanh nghiệp hoặc tài khoản không còn tồn tại.",
    };
  await db
    .insert(enterpriseMembers)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: enterpriseMembers.userId,
      set: { enterpriseId: parsed.data.enterpriseId },
    });
  refreshBranding();
  return {
    success: true,
    message:
      "Đã cập nhật doanh nghiệp của nhân sự. Tất cả thẻ của tài khoản dùng chung quyền logo này.",
  };
}
