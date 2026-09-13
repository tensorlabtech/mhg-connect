export function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: number | string }>;
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-8 border-y border-border py-8 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-2 font-heading text-4xl tracking-[-0.03em] tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
