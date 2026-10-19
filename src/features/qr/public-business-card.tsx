import type { qrCodes } from "@/db/schema";
import type { DigitalIdentity } from "./digital-identity-card";
import { QrInteractiveSurface } from "./qr-interactive-surface";
import { QrVisualCard } from "./qr-visual-card";

type QrCardRow = Pick<
  typeof qrCodes.$inferSelect,
  | "cardAppearance"
  | "cardBackgroundUrl"
  | "cardFont"
  | "cardOrientation"
  | "cardPosition"
  | "cardTagline"
  | "cardTextColor"
  | "cardTextStyle"
>;

/**
 * Danh thiếp 3D trên trang hồ sơ công khai: dùng đúng thiết kế thẻ chính đã lưu ở dashboard
 * (nền, khổ, bố cục, bề mặt, phông, chữ trên thẻ), chỉ khác là chỉ xem, không sửa.
 */
export function PublicBusinessCard({
  qr,
  identity,
  svg,
  logoUrl,
  logoName,
}: {
  qr: QrCardRow;
  identity: DigitalIdentity;
  svg: string;
  logoUrl?: string;
  logoName?: string;
}) {
  const portrait = qr.cardOrientation === "portrait";
  return (
    <div
      className={portrait ? "mx-auto w-full max-w-sm" : "mx-auto w-full"}
      data-public-business-card
    >
      <QrInteractiveSurface label={`Danh thiếp 3D ${identity.name}`}>
        <QrVisualCard
          heading={identity.name}
          identity={identity}
          location={identity.location}
          appearance={qr.cardAppearance}
          // Trang công khai không cần proxy cùng origin (chỉ dùng khi xuất ảnh), nên dùng thẳng ảnh nền đã lưu.
          backgroundUrl={qr.cardBackgroundUrl}
          font={qr.cardFont}
          orientation={qr.cardOrientation}
          position={qr.cardPosition}
          tagline={qr.cardTagline}
          textColor={qr.cardTextColor}
          textStyle={qr.cardTextStyle}
          logoUrl={logoUrl}
          logoName={logoName}
          svg={svg}
        />
      </QrInteractiveSurface>
    </div>
  );
}
