import type { ReactNode } from "react"

import type { CatalogueComponent, CatalogueGroup } from "@/features/dev/design-system/component-registry"

export function ComponentCard({ children, component }: { children: ReactNode; component: CatalogueComponent }) {
  return (
    <article className="scroll-mt-40" id={component.file}>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{component.name}</h3>
          <code className="mt-1 block truncate text-xs text-muted-foreground">@/components/ui/{component.file}</code>
        </div>
      </header>
      <p className="mt-7 text-xs font-medium text-muted-foreground">Biến thể và trạng thái</p>
      <div className="mt-3 flex max-w-3xl flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4">
        {component.variants.map((variant, index) => (
          <code className="text-xs leading-6 text-muted-foreground" key={variant}>{index > 0 && <span aria-hidden="true" className="hidden sm:inline">· </span>}{variant}</code>
        ))}
      </div>
      <p className="mt-10 text-xs font-medium text-muted-foreground">Mẫu tương tác</p>
      <div className="mt-3 flex min-h-40 min-w-0 flex-wrap items-center gap-4 py-5 sm:py-7">
        {children}
      </div>
    </article>
  )
}

export function ComponentGroup({ children, group }: { children: ReactNode; group: CatalogueGroup }) {
  return (
    <section aria-labelledby={`${group.id}-title`} className="scroll-mt-24" id={group.id}>
      <div className="max-w-3xl">
        <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl" id={`${group.id}-title`}>{group.label}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{group.description}</p>
      </div>
      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-24 xl:grid-cols-2">{children}</div>
    </section>
  )
}
