import type { Metadata } from "next"
import { Suspense } from "react"

import DesignSystemPage from "@/features/dev/design-system"
import { guardDevRoute } from "@/features/dev/dev-route-guard"

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
}

export default function DesignSystemRoute() {
  guardDevRoute()
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <DesignSystemPage />
    </Suspense>
  )
}
