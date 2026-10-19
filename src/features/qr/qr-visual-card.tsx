import type { QrCardTextStyle } from "@/db/schema/product";
import type {
  QrCardFont,
  QrCardOrientation,
  QrCardPosition,
} from "./qr-card-layout";
import { QR_CARD_DEFAULT_TAGLINE } from "./qr-card-layout";
import {
  resolveCardIdentity,
  type QrCardAppearance,
} from "./qr-card-appearance";
import type { DigitalIdentity } from "./digital-identity-card";
import { BusinessCardFace, type CardEditSlots } from "./business-card-face";

/** Retained for older callers; new editing uses the curated business-card templates. */
export const qrCardTextStyleOptions: {
  id: QrCardTextStyle;
  label: string;
  description: string;
}[] = [
  { id: "shadow", label: "Hắc kim", description: "Danh thiếp tối" },
  { id: "band", label: "Hắc kim", description: "Danh thiếp tối" },
  { id: "dark", label: "Hắc kim", description: "Danh thiếp tối" },
  { id: "light", label: "Ngọc trai", description: "Danh thiếp sáng" },
];

export function isDarkCardTextColor(color: string) {
  const value = Number.parseInt(color.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
}

export function splitCardDescription(description?: string) {
  return (description ?? "")
    .split(/\s+·\s+|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function QrVisualCard({
  backgroundUrl,
  className,
  description,
  font,
  heading,
  location,
  orientation = "landscape",
  position = "right",
  logoUrl,
  logoName,
  logoPresentation,
  svg,
  tagline = QR_CARD_DEFAULT_TAGLINE,
  textColor,
  textStyle = "shadow",
  identity,
  appearance,
  edit,
}: {
  backgroundUrl?: string | null;
  className?: string;
  description?: string;
  font?: QrCardFont | null;
  heading: string;
  headingClassName?: string;
  location?: string | null;
  orientation?: QrCardOrientation;
  position?: QrCardPosition;
  logoUrl?: string;
  logoName?: string;
  logoPresentation?: "wordmark" | "emblem-header";
  svg: string;
  tagline?: string | null;
  textColor?: string | null;
  textStyle?: QrCardTextStyle;
  identity?: Partial<DigitalIdentity>;
  appearance?: QrCardAppearance | null;
  edit?: CardEditSlots;
}) {
  const [title, company] = splitCardDescription(description);
  const resolved = resolveCardIdentity(
    { name: heading, title, company, location, ...identity },
    appearance,
  );
  return (
    <BusinessCardFace
      identity={resolved}
      avatarCrop={appearance?.avatarCrop}
      svg={svg}
      logoUrl={appearance?.showEnterpriseLogo === false ? undefined : logoUrl}
      logoName={logoName}
      logoPresentation={logoPresentation}
      orientation={orientation}
      position={position}
      backgroundUrl={backgroundUrl}
      backgroundColor={appearance?.backgroundColor}
      backgroundDim={appearance?.backgroundDim}
      finish={
        appearance?.finish ?? (textStyle === "light" ? "ivory" : "signature")
      }
      textColor={textColor}
      font={font}
      tagline={tagline}
      className={className}
      edit={edit}
    />
  );
}
