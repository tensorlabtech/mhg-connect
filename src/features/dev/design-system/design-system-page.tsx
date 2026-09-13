"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CatalogueHeader } from "@/features/dev/design-system/design-system-header"
import { ComponentCard, ComponentGroup } from "@/features/dev/design-system/catalogue-components"
import { componentGroups } from "@/features/dev/design-system/component-registry"
import { Foundations } from "@/features/dev/design-system/foundations"
import { ComponentPreview } from "@/features/dev/design-system/preview-router"

export default function DesignSystemPage() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState("foundations-title")
  const query = searchParams.get("q") ?? ""
  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi")
    if (!normalized) return componentGroups
    return componentGroups.map((group) => ({
      ...group,
      components: group.components.filter((component) =>
        [component.name, component.file, ...component.variants].join(" ").toLocaleLowerCase("vi").includes(normalized)
      ),
    })).filter((group) => group.components.length > 0)
  }, [query])
  const visibleComponents = filteredGroups.reduce((sum, group) => sum + group.components.length, 0)
  const updateQuery = useCallback((value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    if (value) nextSearchParams.set("q", value)
    else nextSearchParams.delete("q")

    const queryString = nextSearchParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.content = "#0a0a0a"
    })
  }, [])

  useLayoutEffect(() => {
    let cancelled = false
    let userInteracted = false
    let settleTimer: number | undefined
    const previousScrollRestoration = window.history.scrollRestoration

    window.history.scrollRestoration = "manual"

    function scrollToCurrentHash() {
      const rawHash = window.location.hash.slice(1)
      let targetId = rawHash

      try {
        targetId = decodeURIComponent(rawHash)
      } catch {
        // Keep malformed fragments harmless and let the raw ID lookup fail normally.
      }

      const target = document.getElementById(targetId)
      if (!target) return
      requestAnimationFrame(() => requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant" })))
    }

    function markUserInteraction() {
      userInteracted = true
      if (settleTimer) window.clearTimeout(settleTimer)
    }

    function alignScrollWithUrl() {
      if (window.location.hash) {
        scrollToCurrentHash()
        return
      }

      window.scrollTo({ behavior: "instant", left: 0, top: 0 })
    }

    alignScrollWithUrl()

    void document.fonts.ready.then(() => {
      if (cancelled || userInteracted) return
      alignScrollWithUrl()
      settleTimer = window.setTimeout(() => {
        if (!userInteracted) alignScrollWithUrl()
      }, 500)
    })
    window.addEventListener("hashchange", alignScrollWithUrl)
    window.addEventListener("keydown", markUserInteraction)
    window.addEventListener("pointerdown", markUserInteraction)
    window.addEventListener("touchstart", markUserInteraction, { passive: true })
    window.addEventListener("wheel", markUserInteraction, { passive: true })

    return () => {
      cancelled = true
      if (settleTimer) window.clearTimeout(settleTimer)
      window.history.scrollRestoration = previousScrollRestoration
      window.removeEventListener("hashchange", alignScrollWithUrl)
      window.removeEventListener("keydown", markUserInteraction)
      window.removeEventListener("pointerdown", markUserInteraction)
      window.removeEventListener("touchstart", markUserInteraction)
      window.removeEventListener("wheel", markUserInteraction)
    }
  }, [])

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        document.querySelector<HTMLInputElement>("#component-search")?.focus()
      }

      if (event.key === "Escape" && document.activeElement?.id === "component-search" && query) {
        updateQuery("")
      }
    }

    window.addEventListener("keydown", handleSearchShortcut)
    return () => window.removeEventListener("keydown", handleSearchShortcut)
  }, [query, updateQuery])

  useEffect(() => {
    let animationFrame: number | undefined
    const sectionIds = ["foundations-title", ...filteredGroups.map((group) => group.id)]

    function updateActiveSection() {
      const activationLine = Math.min(window.innerHeight * 0.3, 240)
      const currentSection = sectionIds.reduce((current, id) => {
        const section = document.getElementById(id)
        return section && section.getBoundingClientRect().top <= activationLine ? id : current
      }, sectionIds[0])

      setActiveSection(currentSection)
      animationFrame = undefined
    }

    function scheduleUpdate() {
      if (animationFrame === undefined) animationFrame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [filteredGroups])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a className="fixed left-3 top-3 z-50 -translate-y-20 border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring" href="#main-content">
        Bỏ qua đến nội dung chính
      </a>
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]" id="top">
        <aside className="no-scrollbar min-w-0 p-6 lg:sticky lg:top-4 lg:m-4 lg:h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto lg:rounded-surface lg:bg-sidebar">
          <div className="flex min-h-11 items-center gap-3">
            <a className="text-sm font-semibold" href="#top">MHG Connect</a>
            <Badge variant="secondary">Nội bộ</Badge>
          </div>
          <label className="mt-6 block text-sm font-medium" htmlFor="component-search">Tìm thành phần</label>
          <div className="relative mt-2">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input autoComplete="off" className="pl-10" id="component-search" name="component-search" onChange={(event) => updateQuery(event.target.value)} placeholder="Tên, tệp hoặc biến thể…" size="lg" type="search" value={query} />
          </div>
          <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">{visibleComponents} mục phù hợp</p>
          <nav aria-label="Mục lục design system" className="mt-5 flex flex-wrap gap-x-4 lg:block lg:space-y-5">
            <a aria-current={activeSection === "foundations-title" ? "location" : undefined} className={`relative flex min-h-11 shrink-0 items-center pl-4 text-sm font-medium transition-colors before:absolute before:left-0 before:size-1.5 before:rounded-full before:bg-gold before:transition-opacity hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeSection === "foundations-title" ? "text-foreground before:opacity-100" : "text-muted-foreground before:opacity-0"}`} href="#foundations-title">Nền tảng</a>
            {filteredGroups.map((group) => <div className="shrink-0" key={group.id}><a aria-current={activeSection === group.id ? "location" : undefined} className={`relative flex min-h-11 items-center pl-4 text-sm font-medium transition-colors before:absolute before:left-0 before:size-1.5 before:rounded-full before:bg-gold before:transition-opacity hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeSection === group.id ? "text-foreground before:opacity-100" : "text-muted-foreground before:opacity-0"}`} href={`#${group.id}`}>{group.label}</a><div className="hidden lg:grid">{group.components.map((component) => <a className="flex min-h-11 items-center truncate pl-4 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`#${component.file}`} key={component.file}>{component.name}</a>)}</div></div>)}
          </nav>
        </aside>
        <main className="min-w-0 scroll-mt-24 px-4 py-12 sm:px-8 lg:px-12 lg:py-16 xl:px-16" id="main-content" tabIndex={-1}>
          <CatalogueHeader visibleComponents={visibleComponents} />
          <Foundations />
          <div className="mt-8 space-y-32 lg:mt-16">
            {filteredGroups.map((group) => <ComponentGroup group={group} key={group.id}>{group.components.map((component) => <ComponentCard component={component} key={component.file}><ComponentPreview file={component.file} group={group.id} /></ComponentCard>)}</ComponentGroup>)}
          </div>
          {!filteredGroups.length && <p className="rounded-surface bg-card p-8 text-center text-sm text-muted-foreground">Không tìm thấy thành phần cho “{query}”.</p>}
        </main>
      </div>
    </div>
  )
}
