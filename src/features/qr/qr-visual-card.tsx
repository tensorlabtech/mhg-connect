import { cn } from "cn";
import Image from "next/image";

import { BrandLockup } from "@/components/product/brand-lockup";

export function QrVisualCard({
  backgroundUrl,
  className,
  description,
  heading,
  headingClassName,
  svg,
}: {
  backgroundUrl?: string | null;
  className?: string;
  description?: string;
  heading: string;
  headingClassName?: string;
  svg: string;
}) {
  return (
    <section
      aria-label={`Thẻ QR: ${heading}`}
      className={cn(
        "relative isolate aspect-[85.6/53.98] w-full [container-type:inline-size]",
        backgroundUrl ? "text-white" : "text-background",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[3.7cqw]",
          backgroundUrl ? "bg-background" : "bg-gold-deep",
        )}
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "linear-gradient(white, black)",
        }}
      >
        {backgroundUrl ? (
          <>
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              src={backgroundUrl}
              unoptimized
            />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,4,4,0.82)_0%,rgba(4,4,4,0.56)_55%,rgba(4,4,4,0.32)_100%)]" />
          </>
        ) : (
          <QrCardMatrixMotif />
        )}
      </div>
      <div className="absolute inset-0 z-10 grid grid-cols-[minmax(0,1fr)_27cqw] gap-[4.5cqw] p-[5cqw]">
        <div className="flex min-w-0 flex-col">
          <BrandLockup
            className={cn(
              "gap-[2cqw] text-[3.05cqw] leading-none tracking-[0.14em] [&_svg]:size-[5.5cqw]",
              backgroundUrl
                ? "text-white [&_path]:stroke-gold [&_svg]:text-white"
                : "text-background [&_path]:stroke-gold-deep [&_svg]:text-background",
            )}
          />
          <div className="mt-auto min-w-0">
            <h3
              className={cn(
                "line-clamp-2 text-[6cqw] leading-[1.05] font-semibold text-balance",
                headingClassName,
              )}
            >
              {heading}
            </h3>
            {description ? (
              <p className="mt-[1.8cqw] line-clamp-2 text-[3.15cqw] leading-[1.25]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div
          aria-label={`Mã QR mở ${heading}`}
          className="size-[27cqw] self-end overflow-hidden rounded-[1.6cqw] bg-white p-[2.7cqw] [&_svg]:size-full"
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
        />
      </div>
    </section>
  );
}

function QrCardMatrixMotif() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute top-[5cqw] right-[5cqw] size-[24cqw] text-gold/45"
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
