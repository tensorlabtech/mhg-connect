import { z } from "zod";
import type { DigitalIdentity } from "./digital-identity-card";

export const DEFAULT_CARD_BACKGROUND_DIM = 40;

export function getCardBackgroundPreview(
  hidden: boolean,
  pending?: string,
  saved?: string | null,
) {
  return hidden ? null : (pending ?? saved ?? null);
}

export const businessCardTemplates = [
  {
    id: "classic",
    name: "Kinh điển",
    finish: "signature",
    orientation: "landscape",
    position: "right",
  },
  {
    id: "editorial",
    name: "Đối xứng",
    finish: "signature",
    orientation: "landscape",
    position: "left",
  },
  {
    id: "pearl",
    name: "Ngọc trai",
    finish: "ivory",
    orientation: "landscape",
    position: "right",
  },
  {
    id: "foil",
    name: "Ánh kim",
    finish: "foil",
    orientation: "landscape",
    position: "right",
  },
  {
    id: "portrait",
    name: "Chân dung",
    finish: "signature",
    orientation: "portrait",
    position: "bottom",
  },
  {
    id: "gallery",
    name: "Tinh giản",
    finish: "ivory",
    orientation: "portrait",
    position: "top",
  },
] as const;

const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable();
const text = (max: number) => z.string().trim().max(max).optional();
const website = z
  .string()
  .trim()
  .max(400)
  .refine((value) => {
    if (!value) return true;
    try {
      if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:/i.test(value))
        return false;
      const url = new URL(
        /^https?:\/\//i.test(value) ? value : `https://${value}`,
      );
      return (
        ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname)
      );
    } catch {
      return false;
    }
  }, "Website chưa hợp lệ.")
  .optional();

/** Only editable card settings; the fixed MHG logo and stored file URLs are not client inputs. */
export const cardAppearanceInput = z
  .object({
    finish: z.enum(["signature", "ivory", "foil"]).optional(),
    backgroundColor: color.optional(),
    backgroundDim: z.number().int().min(0).max(100).optional(),
    showAvatar: z.boolean().optional(),
    avatarCrop: z
      .object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        zoom: z.number().min(1).max(3),
      })
      .strict()
      .optional(),
    showEnterpriseLogo: z.boolean().optional(),
    copy: z
      .object({
        name: text(80),
        title: text(160),
        company: text(200),
        phone: text(40),
        website,
        location: text(120),
      })
      .strict()
      .optional(),
  })
  .strict();

export type QrCardAppearance = z.infer<typeof cardAppearanceInput> & {
  /** Legacy only. Never used as an alternative to the linked profile photo. */
  avatarUrl?: string | null;
};

/** Card-only overrides. Original profile text and media remain untouched. */
export function clearCardPersonalContent(
  appearance: QrCardAppearance,
): QrCardAppearance {
  const { avatarUrl: _legacyAvatar, ...settings } = appearance;
  void _legacyAvatar;
  return {
    ...settings,
    showAvatar: false,
    showEnterpriseLogo: false,
    copy: {
      name: "",
      title: "",
      company: "",
      phone: "",
      website: "",
      location: "",
    },
  };
}

export function resolveCardIdentity(
  identity: DigitalIdentity,
  appearance?: QrCardAppearance | null,
): DigitalIdentity {
  return {
    ...identity,
    ...appearance?.copy,
    avatarUrl: appearance?.showAvatar === false ? null : identity.avatarUrl,
  };
}

export function validateCardImage(
  type: string,
  size: number,
  bytes: Uint8Array,
) {
  if (size <= 0 || size > 5 * 1024 * 1024)
    return "Ảnh phải có dữ liệu và không vượt quá 5 MB.";
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return (type === "image/png" && png) ||
    (type === "image/jpeg" && jpeg) ||
    (type === "image/webp" && webp)
    ? null
    : "Chỉ nhận ảnh PNG, JPG hoặc WebP có dữ liệu đúng định dạng.";
}
