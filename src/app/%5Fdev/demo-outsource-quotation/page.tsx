import type { Metadata } from "next"

import OutsourceQuotationPage from "@/features/dev/outsource-quotation/outsource-quotation-page"
import { guardDevRoute } from "@/features/dev/dev-route-guard"

export const metadata: Metadata = {
  title: "Đề xuất & Báo giá",
  robots: { index: false, follow: false },
}

export default function DemoOutsourceQuotationRoute() {
  guardDevRoute()
  return <OutsourceQuotationPage />
}
