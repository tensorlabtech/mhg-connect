import { componentCount, utilityCount } from "@/features/dev/design-system/component-registry"

export function CatalogueHeader({ visibleComponents }: { visibleComponents: number }) {
  return (
    <section className="pb-16 lg:pb-24">
      <p className="text-sm text-muted-foreground">/_dev/design-system</p>
      <h1 className="mt-6 max-w-5xl font-heading text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">Hệ thống giao diện sản phẩm</h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
        Catalogue kiểm thử cho {componentCount} component shadcn và {utilityCount} hook responsive. Mỗi API có metadata và mẫu tương tác tại chỗ.
      </p>
      <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 text-sm">
        <div><dt className="text-muted-foreground">Đang hiển thị</dt><dd className="mt-1 font-medium text-foreground">{visibleComponents} mục</dd></div>
        <div><dt className="text-muted-foreground">Thành phần</dt><dd className="mt-1 font-medium text-foreground">{componentCount} component · {utilityCount} hook</dd></div>
        <div><dt className="text-muted-foreground">Nền tảng</dt><dd className="mt-1 font-medium text-foreground">Nova · Radix · Tailwind v4</dd></div>
      </dl>
    </section>
  )
}
