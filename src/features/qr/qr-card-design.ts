import type { QrCardTextStyle } from "@/db/schema/product";

export type QrCardDesign = {
  backgroundUrl: string | null;
  description: string | null;
  heading: string | null;
  id: string;
  location: string | null;
  name: string;
  textStyle: QrCardTextStyle;
};

type QrCardDesignRow = {
  backgroundUrl: string | null;
  description: string | null;
  heading: string | null;
  id: string;
  location: string | null;
  name: string;
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
      ? `/api/qr-card-background/${qrId}?design=${row.id}&v=${row.updatedAt.getTime()}`
      : null,
    description: row.description,
    heading: row.heading,
    id: row.id,
    location: row.location,
    name: row.name,
    textStyle: row.textStyle,
  };
}
