import { cn } from "cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
      fill="none"
      viewBox="0 0 32 32"
    >
      <rect fill="currentColor" height="32" rx="6" width="32" />
      <path
        d="M8 22.5v-13l8 8 8-8v13"
        stroke="#0a0a0a"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-sm font-semibold tracking-[0.14em] text-gold uppercase",
        className,
      )}
    >
      <BrandMark />
      <span>MHG Connect</span>
    </span>
  );
}
