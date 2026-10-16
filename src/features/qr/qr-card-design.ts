import type { QrCardTextStyle } from "@/db/schema/product";
import type {
  QrCardFont,
  QrCardOrientation,
  QrCardPosition,
} from "@/features/qr/qr-card-layout";
import { isPresetCardBackground } from "@/features/qr/qr-card-presets";
import type { QrCardAppearance } from "./qr-card-appearance";
import { QR_CARD_DEFAULT_TAGLINE } from "./qr-card-layout";

export type QrCardDesign = {
  appearance?: QrCardAppearance;
  updatedAt?: string;
  backgroundUrl: string | null;
  description: string | null;
  font: QrCardFont;
  heading: string | null;
  id: string;
  location: string | null;
  name: string;
  orientation: QrCardOrientation;
  position: QrCardPosition;
  tagline: string;
  textColor: string | null;
  textStyle: QrCardTextStyle;
};

type QrCardDesignRow = {
  appearance?: QrCardAppearance;
  backgroundUrl: string | null;
  description: string | null;
  font: QrCardFont;
  heading: string | null;
  id: string;
  location: string | null;
  name: string;
  orientation: QrCardOrientation;
  position: QrCardPosition;
  tagline: string;
  textColor: string | null;
  textStyle: QrCardTextStyle;
  updatedAt: Date;
};

/** Ảnh nền đi qua route cùng origin để xuất ảnh thẻ (html-to-image) không bị chặn CORS. */
export function toClientQrCardDesign(
  qrId: string,
  row: QrCardDesignRow,
): QrCardDesign {
  return {
    appearance: row.appearance ?? {},
    updatedAt: row.updatedAt.toISOString(),
    backgroundUrl: row.backgroundUrl
      ? isPresetCardBackground(row.backgroundUrl)
        ? row.backgroundUrl
        : `/api/qr-card-background/${qrId}?design=${row.id}&v=${row.updatedAt.getTime()}`
      : null,
    description: row.description,
    font: row.font,
    heading: row.heading,
    id: row.id,
    location: row.location,
    name: row.name,
    orientation: row.orientation,
    position: row.position,
    tagline: QR_CARD_DEFAULT_TAGLINE,
    textColor: row.textColor,
    textStyle: row.textStyle,
  };
}
