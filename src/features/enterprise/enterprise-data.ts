import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enterpriseMembers, enterprises, user } from "@/db/schema";
import { resolveEnterpriseLogo } from "./enterprise-branding";
import { requireAdmin } from "@/lib/session";

export async function getEnterpriseBrand(
  ownerId?: string | null,
  publicLogo = false,
) {
  if (!ownerId)
    return {
      ...resolveEnterpriseLogo(null),
      hideMhgLogo: false,
      canAddLogo: false,
      enterpriseUpdatedAt: null,
    };
  const [row] = await db
    .select({
      id: enterprises.id,
      updatedAt: enterprises.updatedAt,
      name: enterprises.name,
      logoUrl: enterprises.logoUrl,
      customLogoEnabled: enterprises.customLogoEnabled,
      hideMhgLogo: enterprises.hideMhgLogo,
    })
    .from(enterpriseMembers)
    .innerJoin(enterprises, eq(enterpriseMembers.enterpriseId, enterprises.id))
    .where(eq(enterpriseMembers.userId, ownerId))
    .limit(1);
  const brand = resolveEnterpriseLogo(row);
  const resolved =
    brand.custom && row && !publicLogo
      ? {
          ...brand,
          url: `/api/enterprise-logo/${row.id}?v=${row.updatedAt.getTime()}`,
        }
      : brand;
  return {
    ...resolved,
    // Chỉ bỏ logo MHG khi cơ quan đã có logo riêng đang bật; mặc định luôn giữ MHG.
    hideMhgLogo: Boolean(brand.custom && row?.hideMhgLogo),
    canAddLogo: row?.customLogoEnabled ?? false,
    enterpriseUpdatedAt: row?.updatedAt.toISOString() ?? null,
  };
}

/** Caller must pass requireAdmin before exposing account membership information. */
export async function getEnterpriseAdministration() {
  await requireAdmin();
  const [companies, members] = await Promise.all([
    db.select().from(enterprises).orderBy(asc(enterprises.name)),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        enterpriseId: enterpriseMembers.enterpriseId,
      })
      .from(user)
      .leftJoin(enterpriseMembers, eq(user.id, enterpriseMembers.userId))
      .orderBy(asc(user.name)),
  ]);
  return { companies, members };
}
