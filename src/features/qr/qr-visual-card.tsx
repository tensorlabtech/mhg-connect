import { cn } from "cn";
import { MapPin } from "lucide-react";
import Image from "next/image";

export function QrVisualCard({
  backgroundUrl,
  className,
  description,
  heading,
  headingClassName,
  location,
  svg,
}: {
  backgroundUrl?: string | null;
  className?: string;
  description?: string;
  heading: string;
  headingClassName?: string;
  location?: string | null;
  svg: string;
}) {
  return (
    <section
      aria-label={`Thẻ QR: ${heading}`}
      className={cn(
        "relative isolate aspect-[53.98/85.6] w-full text-white [container-type:inline-size]",
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

        <div className="absolute inset-x-[3.5cqw] top-1/2 flex min-w-0 -translate-y-1/2 items-center justify-center text-center">
          <h3
            className={cn(
              "max-w-full py-[1cqw] text-[9.5cqw] leading-[1.08] font-bold tracking-[-0.025em] break-words text-balance uppercase [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
              headingClassName,
            )}
          >
            {heading}
          </h3>
        </div>

        <div className="absolute inset-x-[3.5cqw] bottom-[3.5cqw] flex items-end gap-[3cqw]">
          <div
            aria-label={`Mã QR mở ${heading}`}
            className="size-[37cqw] shrink-0 overflow-hidden rounded-[1.6cqw] bg-white p-[0.8cqw] [&_svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svg }}
            role="img"
          />

          {description || location ? (
            <div className="flex min-w-0 flex-1 flex-col items-start gap-[1.5cqw] pb-[0.5cqw] text-left [text-shadow:0_0_1px_rgb(0_0_0/0.95),0_1px_1px_rgb(0_0_0/0.95)]">
              {description ? (
                <p className="line-clamp-3 text-[4.35cqw] leading-[1.16] font-semibold text-white">
                  {description}
                </p>
              ) : null}
              {location ? (
                <p className="flex min-w-0 items-center gap-[1cqw] text-[3.55cqw] leading-[1.22] font-medium text-white/90">
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
