import { cn } from "cn";
import { MapPin } from "lucide-react";
import Image from "next/image";

import type { QrCardTextStyle } from "@/db/schema/product";

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
  heading,
  headingClassName,
  location,
  svg,
  textStyle = "shadow",
}: {
  backgroundUrl?: string | null;
  className?: string;
  description?: string;
  heading: string;
  headingClassName?: string;
  location?: string | null;
  svg: string;
  textStyle?: QrCardTextStyle;
}) {
  const shadowText = textStyle === "shadow" || textStyle === "band";
  const descriptionLines = splitCardDescription(description);
  return (
    <section
      aria-label={`Thẻ QR: ${heading}`}
      className={cn(
        "relative isolate aspect-[53.98/85.6] w-full text-white select-none [container-type:inline-size]",
        className,
      )}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[6cqw] bg-[var(--qr-card-photo-fallback)]"
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "linear-gradient(white, black)",
        }}
      >
        {backgroundUrl ? (
          <Image
            alt=""
            className="object-cover object-center"
            fill
            sizes="(max-width: 768px) 80vw, 360px"
            src={backgroundUrl}
            unoptimized
          />
        ) : (
          <QrCardMatrixMotif />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,transparent_24%,transparent_55%,rgba(0,0,0,0.62)_100%)]"
        />

        <Image
          alt="MHG Environment & Energy"
          className="absolute top-[3.5cqw] left-[3.5cqw] h-auto w-[18cqw] object-contain object-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]"
          height={1123}
          src="/brand/mhg-environment-energy-logo.png"
          unoptimized
          width={3248}
        />

        <div
          className={cn(
            "absolute top-1/2 flex min-w-0 -translate-y-1/2 items-center justify-center text-center",
            textStyle === "band"
              ? "inset-x-0 bg-[rgb(10_10_10/0.62)] px-[3.5cqw] py-[2.5cqw]"
              : "inset-x-[3.5cqw]",
          )}
          data-card-text-style={textStyle}
        >
          <h3
            className={cn(
              "max-w-full py-[1cqw] text-[9.5cqw] leading-[1.2] font-bold tracking-[-0.025em] break-words text-balance uppercase",
              shadowText && "[text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
              headingBoxClass[textStyle],
              headingClassName,
            )}
          >
            {heading}
          </h3>
        </div>

        {textStyle === "band" ? (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[48cqw] bg-[rgb(10_10_10/0.62)]"
          />
        ) : null}

        <div className="absolute inset-x-[3.5cqw] bottom-[3.5cqw] flex items-end gap-[3cqw]">
          <div
            aria-label={`Mã QR mở ${heading}`}
            className="size-[37cqw] shrink-0 overflow-hidden rounded-[1.6cqw] bg-white p-[0.8cqw] [&_svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svg }}
            role="img"
          />

          {descriptionLines.length || location ? (
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col items-start gap-[1.2cqw] pb-[0.5cqw] text-left",
                shadowText &&
                  "[text-shadow:0_0_1px_rgb(0_0_0/0.95),0_1px_1px_rgb(0_0_0/0.95)]",
                detailPanelClass[textStyle],
              )}
            >
              {descriptionLines.length ? (
                <p
                  className={cn(
                    "grid text-[4.2cqw] leading-[1.42] font-semibold",
                    textStyle === "light" ? "text-[#0a0a0a]" : "text-white",
                  )}
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
                    "flex min-w-0 items-center gap-[1cqw] text-[3.55cqw] leading-[1.42] font-medium",
                    textStyle === "light"
                      ? "text-[#0a0a0a]/80"
                      : "text-white/90",
                  )}
                >
                  <MapPin
                    aria-hidden="true"
                    className="size-[4.5cqw] shrink-0"
                  />
                  <span className="line-clamp-2">{location}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function QrCardMatrixMotif() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 size-[52cqw] -translate-x-1/2 -translate-y-1/2 text-gold/50"
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
