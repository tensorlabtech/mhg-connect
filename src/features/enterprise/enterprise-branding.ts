export const MHG_LOGO_URL = "/brand/mhg-airpurity-transparent-v1.png";
export const MHG_CARD_LOGO_URL = "/brand/mhg-airpurity-card-contrast-v2.png";

export type EnterpriseBrand = {
  name: string;
  customLogoEnabled: boolean;
  logoUrl: string | null;
};

export function resolveEnterpriseLogo(enterprise?: EnterpriseBrand | null) {
  if (enterprise?.customLogoEnabled && enterprise.logoUrl) {
    return { url: enterprise.logoUrl, name: enterprise.name, custom: true };
  }
  return { url: MHG_LOGO_URL, name: "MHG Airpurity", custom: false };
}

export function validateEnterpriseLogo(type: string, size: number) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(type))
    return "Logo chỉ hỗ trợ PNG, JPG hoặc WebP.";
  if (size <= 0 || size > 2 * 1024 * 1024)
    return "Logo phải có dữ liệu và không vượt quá 2 MB.";
  return null;
}
