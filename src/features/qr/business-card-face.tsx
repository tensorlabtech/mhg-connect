import Image from "next/image";
import type { ReactNode } from "react";
import { Globe2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { cn } from "cn";
import {
  MHG_LOGO_URL,
  MHG_CARD_LOGO_URL,
} from "@/features/enterprise/enterprise-branding";
import {
  getQrCardFontOption,
  QR_CARD_DEFAULT_TAGLINE,
  type QrCardFont,
  type QrCardOrientation,
  type QrCardPosition,
} from "./qr-card-layout";
import type {
  DigitalCardFinish,
  DigitalIdentity,
} from "./digital-identity-card";
import { DEFAULT_CARD_BACKGROUND_DIM } from "./qr-card-appearance";
import { avatarCropStyle, type AvatarCrop } from "./qr-avatar-crop";
import "./digital-identity-card.css";

export type CardTextField =
  "name" | "title" | "company" | "phone" | "website" | "location";
export type CardEditSlots = {
  text: (
    field: CardTextField,
    value: string,
    displayValue?: string,
  ) => ReactNode;
  avatar: (content: ReactNode) => ReactNode;
  logo: (content: ReactNode) => ReactNode;
  background: ReactNode;
};

export function BusinessCardFace({
  identity,
  svg,
  logoUrl,
  logoName,
  logoPresentation = "wordmark",
  hideMhgLogo = false,
  finish = "signature",
  orientation = "landscape",
  position = "right",
  backgroundUrl,
  backgroundColor,
  backgroundDim = DEFAULT_CARD_BACKGROUND_DIM,
  avatarCrop,
  textColor,
  font,
  className,
  edit,
}: {
  identity: DigitalIdentity;
  svg: string;
  logoUrl?: string;
  logoName?: string;
  logoPresentation?: "wordmark" | "emblem-header";
  /** Quyền đặc biệt cấp theo cơ quan; chỉ có hiệu lực khi có logo cơ quan. */
  hideMhgLogo?: boolean;
  finish?: DigitalCardFinish;
  orientation?: QrCardOrientation;
  position?: QrCardPosition;
  backgroundUrl?: string | null;
  backgroundColor?: string | null;
  backgroundDim?: number;
  avatarCrop?: AvatarCrop;
  textColor?: string | null;
  font?: QrCardFont | null;
  tagline?: string | null;
  className?: string;
  edit?: CardEditSlots;
}) {
  const field = (key: CardTextField) =>
    edit ? edit.text(key, identity[key] ?? "") : identity[key];
  let website: URL | null = null;
  try {
    if (identity.website) {
      const u = new URL(
        /^https?:\/\//i.test(identity.website)
          ? identity.website
          : `https://${identity.website}`,
      );
      if (["http:", "https:"].includes(u.protocol)) website = u;
    }
  } catch {
    /* Keep malformed legacy links from breaking a card. */
  }
  const customLogo =
    logoUrl &&
    logoUrl !== MHG_LOGO_URL &&
    logoUrl !== MHG_CARD_LOGO_URL &&
    logoUrl !== "/brand/mhg-airpurity-logo.png" ? (
      <span
        className="digital-card-enterprise-logo"
        data-logo-presentation={logoPresentation}
      >
        <Image
          alt={logoName || "Logo doanh nghiệp"}
          src={logoUrl}
          width={685}
          height={110}
          unoptimized
        />
      </span>
    ) : null;
  // Không bao giờ để thẻ trống thương hiệu: thiếu logo cơ quan thì vẫn hiện MHG.
  const showMhgLogo = !(hideMhgLogo && customLogo);
  const avatar = identity.avatarUrl ? (
    <Image
      alt={`Ảnh đại diện ${identity.name}`}
      src={identity.avatarUrl}
      width={180}
      height={180}
      className="digital-card-avatar"
      style={avatarCropStyle(avatarCrop)}
      unoptimized
    />
  ) : null;
  return (
    <div className="business-card-size">
      <section
        className={cn("digital-identity-card", className)}
        data-digital-identity-card
        data-qr-card
        data-card-finish={finish}
        data-card-orientation={orientation}
        data-card-position={position}
        data-card-editing={Boolean(edit)}
        aria-label={`Danh thiếp ${identity.name}`}
        style={{
          fontFamily: getQrCardFontOption(font).family,
          ...(textColor ? { color: textColor } : {}),
          ...(backgroundColor ? { background: backgroundColor } : {}),
        }}
      >
        {backgroundUrl ? (
          <Image
            alt=""
            src={backgroundUrl}
            fill
            unoptimized
            className="digital-card-background"
          />
        ) : null}
        {backgroundUrl ? (
          <div
            className="digital-card-photo-shade"
            aria-hidden="true"
            style={{ opacity: backgroundDim / 100 }}
          />
        ) : null}
        <div className="qr-card-sheen" aria-hidden="true" />
        {edit?.background}
        <header className="digital-card-header">
          <span
            className="digital-card-brand-pair"
            data-fixed-mhg-logo={showMhgLogo ? "" : undefined}
            data-enterprise-only-logo={showMhgLogo ? undefined : ""}
          >
            {showMhgLogo ? (
              <span className="digital-card-logo-plate" data-brand-plate="logo">
                <Image
                  alt="MHG Airpurity, logo cố định"
                  src={MHG_CARD_LOGO_URL}
                  width={1918}
                  height={820}
                  unoptimized
                  className="digital-card-fixed-logo"
                />
              </span>
            ) : null}
            {edit ? edit.logo(customLogo) : customLogo}
          </span>
          <span className="digital-card-platform">
            MHG CONNECT
            <br />
            DIGITAL ID
          </span>
        </header>
        <div className="digital-card-main" data-card-composition>
          <div className="digital-card-identity" data-card-copy>
            {avatar || edit ? (
              <div className="digital-card-avatar-slot">
                {edit ? edit.avatar(avatar) : avatar}
              </div>
            ) : null}
            <div className="digital-card-name-group">
              <h2 data-card-heading>{field("name")}</h2>
              {identity.title || edit ? (
                <p className="digital-card-title">{field("title")}</p>
              ) : null}
            </div>
            {identity.company || edit ? (
              <p className="digital-card-company">{field("company")}</p>
            ) : null}
            <div className="digital-card-contacts">
              {identity.phone || edit ? (
                <span>
                  <Phone aria-hidden="true" />
                  {edit ? (
                    field("phone")
                  ) : (
                    <a href={`tel:${identity.phone?.replace(/\s/g, "")}`}>
                      {identity.phone}
                    </a>
                  )}
                </span>
              ) : null}
              {identity.website || edit ? (
                <span>
                  <Globe2 aria-hidden="true" />
                  {edit ? (
                    edit.text(
                      "website",
                      identity.website ?? "",
                      website?.hostname,
                    )
                  ) : website ? (
                    <a href={website.href} target="_blank" rel="noreferrer">
                      {website.hostname}
                    </a>
                  ) : (
                    identity.website
                  )}
                </span>
              ) : null}
              {identity.location || edit ? (
                <span>
                  <MapPin aria-hidden="true" />
                  {field("location")}
                </span>
              ) : null}
            </div>
          </div>
          <div className="digital-card-qr-group">
            <div
              className="digital-card-qr"
              data-digital-card-qr
              data-card-qr
              role="img"
              aria-label="Mã QR mở hồ sơ"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <span>QUÉT ĐỂ KẾT NỐI</span>
          </div>
        </div>
        <p
          className="digital-card-tagline"
          data-card-tagline
          data-fixed-mhg-tagline
          data-brand-plate="protection"
        >
          <ShieldCheck aria-hidden="true" />
          <span>{QR_CARD_DEFAULT_TAGLINE}</span>
        </p>
      </section>
    </div>
  );
}
