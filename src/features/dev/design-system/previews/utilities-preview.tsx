import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/components/ui/use-mobile"

export function UtilitiesPreview() {
  const isMobile = useIsMobile()
  return <Badge variant="secondary">Viewport hiện tại: {isMobile ? "mobile" : "desktop"}</Badge>
}
