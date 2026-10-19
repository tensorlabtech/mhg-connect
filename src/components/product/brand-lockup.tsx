import { cn } from "cn";
import Image from "next/image";
import { MHG_LOGO_URL } from "@/features/enterprise/enterprise-branding";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      alt="MHG Airpurity"
      src={MHG_LOGO_URL}
      width={1918}
      height={820}
      unoptimized
      className={cn("h-11 w-28 shrink-0 object-contain", className)}
    />
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
