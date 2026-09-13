import { lazy, Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

const previewGroups = {
  "actions-inputs": lazy(() => import("@/features/dev/design-system/previews/actions-inputs-preview").then((module) => ({ default: module.ActionsInputsPreview }))),
  "layout-content": lazy(() => import("@/features/dev/design-system/previews/layout-content-preview").then((module) => ({ default: module.LayoutContentPreview }))),
  navigation: lazy(() => import("@/features/dev/design-system/previews/navigation-preview").then((module) => ({ default: module.NavigationPreview }))),
  "overlays-menus": lazy(() => import("@/features/dev/design-system/previews/overlays-menus-preview").then((module) => ({ default: module.OverlaysMenusPreview }))),
  "feedback-data": lazy(() => import("@/features/dev/design-system/previews/feedback-data-preview").then((module) => ({ default: module.FeedbackDataPreview }))),
  "messaging-files": lazy(() => import("@/features/dev/design-system/previews/messaging-files-preview").then((module) => ({ default: module.MessagingFilesPreview }))),
  utilities: lazy(() => import("@/features/dev/design-system/previews/utilities-preview").then((module) => ({ default: module.UtilitiesPreview }))),
}

type PreviewGroup = keyof typeof previewGroups

export function ComponentPreview({ file, group }: { file: string; group: string }) {
  const Preview = previewGroups[group as PreviewGroup] ?? previewGroups.utilities

  return (
    <Suspense fallback={<PreviewFallback />}>
      <Preview file={file} />
    </Suspense>
  )
}

function PreviewFallback() {
  return (
    <div aria-label="Đang tải mẫu tương tác" className="grid min-h-40 w-full content-center gap-2" role="status">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  )
}
