import type { ReactNode } from "react";
import { cn } from "cn";

export function ProductPage({
  className,
  width = "wide",
  ...props
}: React.ComponentProps<"main"> & {
  width?: "narrow" | "wide";
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-4 py-10 sm:px-8 sm:py-14",
        width === "wide" ? "max-w-7xl" : "max-w-4xl",
        className,
      )}
      {...props}
    />
  );
}

export function ProductPageIntro({
  actions,
  children,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
}) {
  return (
    <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs tracking-[0.14em] text-gold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-heading text-5xl leading-none tracking-[-0.035em] sm:text-6xl",
            eyebrow && "mt-4",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function ProductSectionHeading({
  count,
  title,
}: {
  count?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-heading text-3xl leading-tight">{title}</h2>
      {count ? (
        <span className="shrink-0 text-xs text-muted-foreground">{count}</span>
      ) : null}
    </div>
  );
}

export function ProductSurface({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-surface bg-card p-6 sm:p-8", className)}
      {...props}
    />
  );
}
