import { cn } from "cn";

import { BrandLockup } from "@/components/product/brand-lockup";

export function QrVisualCard({
  className,
  compact = false,
  description,
  heading,
  headingClassName,
  svg,
}: {
  className?: string;
  compact?: boolean;
  description?: string;
  heading: string;
  headingClassName?: string;
  svg: string;
}) {
  return (
    <section
      aria-label={`Thẻ QR: ${heading}`}
      className={cn(
        "relative grid overflow-hidden rounded-md bg-gold-deep text-background",
        compact
          ? "min-h-56 grid-cols-[minmax(0,1fr)_6rem] gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_6rem] sm:gap-4"
          : "min-h-64 grid-cols-[minmax(0,1fr)_7rem] gap-4 p-6 sm:grid-cols-[minmax(0,1fr)_8rem] sm:gap-6",
        className,
      )}
    >
      <QrCardMatrixMotif />
      <div className="relative z-10 flex min-w-0 flex-col">
        <BrandLockup className="text-background [&_path]:stroke-gold-deep [&_svg]:size-5 [&_svg]:text-background" />
        <div className="mt-auto pt-8">
          <h3
            className={cn(
              "text-2xl leading-tight font-semibold text-balance",
              headingClassName,
            )}
          >
            {heading}
          </h3>
          {description ? <p className="mt-2 text-sm">{description}</p> : null}
        </div>
      </div>
      <div
        aria-label={`Mã QR mở ${heading}`}
        className={cn(
          "relative z-10 self-end overflow-hidden rounded-lg bg-white [&_svg]:size-full",
          compact ? "size-24 p-2.5 sm:size-24" : "size-28 p-3 sm:size-32",
        )}
        dangerouslySetInnerHTML={{ __html: svg }}
        role="img"
      />
    </section>
  );
}

function QrCardMatrixMotif() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute top-6 right-6 size-24 text-gold/45"
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
