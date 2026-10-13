import type { QrCardTextStyle } from "@/db/schema/product";
import type { QrCardOrientation } from "@/features/qr/qr-card-layout";
import { isPresetCardBackground } from "@/features/qr/qr-card-presets";

export type QrCardDesign = {
  backgroundUrl: string | null;
  description: string | null;
  heading: string | null;
  id: string;
  location: string | null;
  name: string;
  orientation: QrCardOrientation;
  tagline: string;
  textStyle: QrCardTextStyle;
};

type QrCardDesignRow = {
  backgroundUrl: string | null;
  description: string | null;
  heading: string | null;
  id: string;
  location: string | null;
  name: string;
  orientation: QrCardOrientation;
  tagline: string;
  textStyle: QrCardTextStyle;
  updatedAt: Date;
};

/** Ảnh nền đi qua route cùng origin để xuất ảnh thẻ (html-to-image) không bị chặn CORS. */
export function toClientQrCardDesign(
  qrId: string,
  row: QrCardDesignRow,
): QrCardDesign {
  return {
    backgroundUrl: row.backgroundUrl
      ? isPresetCardBackground(row.backgroundUrl)
        ? row.backgroundUrl
        : `/api/qr-card-background/${qrId}?design=${row.id}&v=${row.updatedAt.getTime()}`
      : null,
    description: row.description,
    heading: row.heading,
    id: row.id,
    location: row.location,
    name: row.name,
    orientation: row.orientation,
    tagline: row.tagline,
    textStyle: row.textStyle,
  };
}
