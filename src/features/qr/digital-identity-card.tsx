import { BusinessCardFace } from "./business-card-face";
import { QrInteractiveSurface } from "./qr-interactive-surface";

export type DigitalCardFinish = "signature" | "ivory" | "foil";
export type DigitalIdentity = {
  name: string;
  title?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
};

export function DigitalIdentityCard(
  props: Parameters<typeof BusinessCardFace>[0],
) {
  return (
    <QrInteractiveSurface label={`Danh thiếp 3D ${props.identity.name}`}>
      <BusinessCardFace {...props} />
    </QrInteractiveSurface>
  );
}
