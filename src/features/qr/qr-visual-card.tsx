import { cn } from "cn";
import { MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";

import type { QrCardTextStyle } from "@/db/schema/product";
import {
  QR_CARD_DEFAULT_TAGLINE,
  getQrCardFontOption,
  normalizeQrCardTextColor,
  type QrCardFont,
  type QrCardOrientation,
} from "@/features/qr/qr-card-layout";

export const qrCardTextStyleOptions: {
  description: string;
  id: QrCardTextStyle;
  label: string;
}[] = [
  { description: "Chữ trắng có bóng nhẹ", id: "shadow", label: "Bóng chữ" },
  { description: "Dải tối ngang thẻ", id: "band", label: "Dải tối" },
  { description: "Khung tối ôm chữ", id: "dark", label: "Khung tối" },
  { description: "Khung sáng, chữ đen", id: "light", label: "Khung sáng" },
];

const headingBoxClass: Record<QrCardTextStyle, string> = {
  band: "",
  dark: "w-fit rounded-[1.6cqw] bg-[rgb(10_10_10/0.8)] px-[3.2cqw] pt-[3cqw] pb-[1.9cqw]",
  light:
    "w-fit rounded-[1.6cqw] bg-[rgb(255_255_255/0.93)] px-[3.2cqw] pt-[3cqw] pb-[1.9cqw] text-[#0a0a0a]",
  shadow: "",
};

const detailPanelClass: Record<QrCardTextStyle, string> = {
  band: "",
  dark: "self-stretch justify-center rounded-[1.6cqw] bg-[rgb(10_10_10/0.8)] px-[3cqw] py-[2.4cqw]",
  light:
    "self-stretch justify-center rounded-[1.6cqw] bg-[rgb(255_255_255/0.93)] px-[3cqw] py-[2.4cqw] text-[#0a0a0a]",
  shadow: "",
};

const landscapeHeadingBoxClass: Record<QrCardTextStyle, string> = {
  band: "",
  dark: "w-fit rounded-[1cqw] bg-[rgb(10_10_10/0.8)] px-[2cqw] pt-[1.9cqw] pb-[1.2cqw]",
  light:
    "w-fit rounded-[1cqw] bg-[rgb(255_255_255/0.93)] px-[2cqw] pt-[1.9cqw] pb-[1.2cqw] text-[#0a0a0a]",
  shadow: "",
};

const landscapeDetailClass: Record<QrCardTextStyle, string> = {
  band: "",
  dark: "rounded-[1cqw] bg-[rgb(10_10_10/0.8)] px-[2cqw] py-[1.5cqw]",
  light:
    "rounded-[1cqw] bg-[rgb(255_255_255/0.93)] px-[2cqw] py-[1.5cqw] text-[#0a0a0a]",
  shadow: "",
};

/** Màu tối (độ sáng thấp) cần bóng chữ sáng thay vì bóng đen. */
export function isDarkCardTextColor(color: string) {
  const value = Number.parseInt(color.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
}

/** Tách "Chức danh · Công ty" thành từng dòng để tên đơn vị không bị ngắt giữa chừng. */
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
  headingClassName,
  location,
  orientation = "portrait",
  svg,
  tagline = QR_CARD_DEFAULT_TAGLINE,
  textColor,
  textStyle = "shadow",
}: {
  backgroundUrl?: string | null;
  className?: string;
  description?: string;
  /** Phông chữ in trên thẻ; mặc định Be Vietnam Pro. */
  font?: QrCardFont | null;
  heading: string;
  headingClassName?: string;
  location?: string | null;
  orientation?: QrCardOrientation;
  svg: string;
  /** Dòng chữ cạnh logo; chuỗi rỗng là ẩn. */
  tagline?: string | null;
  /** Màu chữ tên, chức danh, địa điểm (#rrggbb); null là tự động theo nền chữ. */
  textColor?: string | null;
  textStyle?: QrCardTextStyle;
}) {
  const landscape = orientation === "landscape";
  const fontOption = getQrCardFontOption(font);
  const color = normalizeQrCardTextColor(textColor);
  const darkCustomColor = color ? isDarkCardTextColor(color) : false;
  const shadowText = textStyle === "shadow" || textStyle === "band";
  const colorStyle = color ? { color } : undefined;
  const descriptionLines = splitCardDescription(description);
  const taglineText = (tagline ?? "").trim();
  const hasDetails = descriptionLines.length > 0 || Boolean(location);

  const background = (
    <>
      {backgroundUrl ? (
        <Image
          alt=""
          className="object-cover object-center"
          fill
          sizes="(max-width: 768px) 90vw, 560px"
          src={backgroundUrl}
          unoptimized
        />
      ) : (
        <QrCardMatrixMotif landscape={landscape} />
      )}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0",
          landscape
            ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.12)_58%,transparent_72%)]"
            : "bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,transparent_24%,transparent_55%,rgba(0,0,0,0.62)_100%)]",
        )}
      />
    </>
  );

  const topBar = (
    <div
      className={cn(
        "absolute flex items-center",
        landscape
          ? "inset-x-[3cqw] top-[3cqw] gap-[1.6cqw]"
          : "inset-x-[3.5cqw] top-[3.5cqw] gap-[2cqw]",
      )}
    >
      <Image
        alt="MHG Environment & Energy"
        className={cn(
          "h-auto shrink-0 object-contain object-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]",
          landscape ? "w-[12.5cqw]" : "w-[18cqw]",
        )}
        height={1123}
        src="/brand/mhg-environment-energy-logo.png"
        unoptimized
        width={3248}
      />
      {taglineText ? (
        <p
          className={cn(
            "flex min-w-0 items-center rounded-full font-bold tracking-[-0.01em] text-balance",
            landscape
              ? "gap-[0.8cqw] px-[1.6cqw] py-[0.75cqw] text-[2.6cqw] leading-[1.25]"
              : "gap-[1.2cqw] px-[2.4cqw] py-[1.2cqw] text-[3.6cqw] leading-[1.25]",
            textStyle === "light"
              ? "bg-[rgb(255_255_255/0.94)] text-[#14532d]"
              : "bg-[rgb(10_10_10/0.62)] text-white",
          )}
          data-card-tagline
          // Dòng cam kết sản phẩm luôn in phông mặc định cho dễ đọc, kể cả khi tên dùng chữ viết tay.
          style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}
        >
          <ShieldCheck
            aria-hidden="true"
            className={cn(
              "shrink-0",
              landscape ? "size-[3cqw]" : "size-[4.4cqw]",
              textStyle === "light" ? "text-[#15803d]" : "text-[#86efac]",
            )}
          />
          <span>{taglineText}</span>
        </p>
      ) : null}
    </div>
  );

  const qr = (
    <div
      aria-label={`Mã QR mở ${heading}`}
      className={cn(
        "shrink-0 overflow-hidden bg-white [&_svg]:size-full",
        landscape
          ? "size-[27cqw] rounded-[1.1cqw] p-[0.6cqw]"
          : "size-[37cqw] rounded-[1.6cqw] p-[0.8cqw]",
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
    />
  );

  const details = hasDetails ? (
    <div
      className={cn(
        "flex min-w-0 flex-col items-start text-left",
        landscape ? "gap-[0.8cqw]" : "flex-1 gap-[1.2cqw] pb-[0.5cqw]",
        shadowText &&
          (darkCustomColor
            ? "[text-shadow:0_0_2px_rgb(255_255_255/0.9),0_1px_2px_rgb(255_255_255/0.75)]"
            : "[text-shadow:0_0_1px_rgb(0_0_0/0.95),0_1px_1px_rgb(0_0_0/0.95)]"),
        landscape
          ? landscapeDetailClass[textStyle]
          : detailPanelClass[textStyle],
      )}
    >
      {descriptionLines.length ? (
        <p
          className={cn(
            "grid leading-[1.42] font-semibold",
            landscape ? "text-[2.7cqw]" : "text-[4.2cqw]",
            textStyle === "light" ? "text-[#0a0a0a]" : "text-white",
          )}
          style={colorStyle}
        >
          {descriptionLines.map((line, index) => (
            <span className="line-clamp-2" key={index}>
              {line}
            </span>
          ))}
        </p>
      ) : null}
      {location ? (
        <p
          className={cn(
            "flex min-w-0 items-center leading-[1.42] font-medium",
            landscape
              ? "gap-[0.7cqw] text-[2.3cqw]"
              : "gap-[1cqw] text-[3.55cqw]",
            textStyle === "light" ? "text-[#0a0a0a]/80" : "text-white/90",
          )}
          style={color ? { color, opacity: 0.9 } : undefined}
        >
          <MapPin
            aria-hidden="true"
            className={cn(
              "shrink-0",
              landscape ? "size-[2.9cqw]" : "size-[4.5cqw]",
            )}
          />
          <span className="line-clamp-2">{location}</span>
        </p>
      ) : null}
    </div>
  ) : null;

  const headingNode = (
    <h3
      className={cn(
        "max-w-full font-bold break-words",
        fontOption.uppercase ? "uppercase" : "normal-case",
        font === "manrope" || !font || font === "be-vietnam"
          ? "tracking-[-0.025em]"
          : "tracking-normal",
        landscape
          ? "text-[6.2cqw] leading-[1.2]"
          : "py-[1cqw] text-[9.5cqw] leading-[1.2] text-balance",
        shadowText &&
          (darkCustomColor
            ? "[text-shadow:0_0_3px_rgb(255_255_255/0.85)]"
            : "[text-shadow:0_1px_3px_rgb(0_0_0/0.45)]"),
        landscape
          ? landscapeHeadingBoxClass[textStyle]
          : headingBoxClass[textStyle],
        headingClassName,
      )}
      style={colorStyle}
    >
      {heading}
    </h3>
  );

  return (
    <section
      aria-label={`Thẻ QR: ${heading}`}
      className={cn(
        "relative isolate w-full text-white select-none [container-type:inline-size]",
        landscape ? "aspect-[85.6/53.98]" : "aspect-[53.98/85.6]",
        className,
      )}
      data-card-font={fontOption.id}
      data-card-orientation={orientation}
      style={{ fontFamily: fontOption.family }}
    >
      <div
        className={cn(
          "absolute inset-0 overflow-hidden bg-[var(--qr-card-photo-fallback)]",
          landscape ? "rounded-[3.8cqw]" : "rounded-[6cqw]",
        )}
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "linear-gradient(white, black)",
        }}
      >
        {background}

        {landscape ? (
          <>
            <div
              className={cn(
                "absolute top-[14cqw] bottom-[3cqw] left-[3cqw] flex min-w-0 flex-col items-start justify-center gap-[1.8cqw] right-[33cqw]",
                textStyle === "band" &&
                  "-ml-[3cqw] rounded-r-[1.2cqw] bg-[rgb(10_10_10/0.62)] py-[2.2cqw] pr-[2.4cqw] pl-[3cqw]",
              )}
              data-card-text-style={textStyle}
            >
              {headingNode}
              {details}
            </div>
            <div className="absolute right-[3cqw] bottom-[3cqw]">{qr}</div>
          </>
        ) : (
          <>
            <div
              className={cn(
                "absolute top-1/2 flex min-w-0 -translate-y-1/2 items-center justify-center text-center",
                textStyle === "band"
                  ? "inset-x-0 bg-[rgb(10_10_10/0.62)] px-[3.5cqw] py-[2.5cqw]"
                  : "inset-x-[3.5cqw]",
              )}
              data-card-text-style={textStyle}
            >
              {headingNode}
            </div>

            {textStyle === "band" ? (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[48cqw] bg-[rgb(10_10_10/0.62)]"
              />
            ) : null}

            <div className="absolute inset-x-[3.5cqw] bottom-[3.5cqw] flex items-end gap-[3cqw]">
              {qr}
              {details}
            </div>
          </>
        )}

        {topBar}
      </div>
    </section>
  );
}

function QrCardMatrixMotif({ landscape }: { landscape: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/50",
        landscape ? "left-[38%] size-[30cqw]" : "left-1/2 size-[52cqw]",
      )}
      fill="currentColor"
      viewBox="0 0 96 96"
    >
      <rect height="28" rx="6" width="28" x="4" y="4" />
      <rect
        height="12"
        rx="3"
        width="12"
        x="12"
        y="12"
        fill="var(--gold-deep)"
      />
      <rect height="28" rx="6" width="28" x="40" y="4" />
      <rect
        height="12"
        rx="3"
        width="12"
        x="48"
        y="12"
        fill="var(--gold-deep)"
      />
      <rect height="12" rx="3" width="12" x="4" y="40" />
      <rect height="12" rx="3" width="12" x="20" y="40" />
      <rect height="12" rx="3" width="12" x="36" y="40" />
      <rect height="12" rx="3" width="12" x="52" y="40" />
      <rect height="12" rx="3" width="12" x="68" y="40" />
      <rect height="12" rx="3" width="12" x="20" y="56" />
      <rect height="12" rx="3" width="12" x="52" y="56" />
      <rect height="12" rx="3" width="12" x="68" y="56" />
    </svg>
  );
}
