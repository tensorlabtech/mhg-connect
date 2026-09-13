import type { ReactNode } from "react";
import { cn } from "cn";

export function DashboardBentoLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,2.28fr)] lg:gap-6">
      <aside className="grid gap-3 lg:sticky lg:top-6">{sidebar}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function DashboardBentoSidebarCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-surface bg-card p-5 sm:p-6", className)}>
      {children}
    </section>
  );
}

export function DashboardMetricGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-3">{children}</dl>
  );
}

export function DashboardMetric({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className={cn("rounded-surface bg-card p-5 sm:p-6", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-3 text-4xl font-medium tracking-[-0.03em] tabular-nums sm:text-5xl">
        {value}
      </dd>
    </div>
  );
}
