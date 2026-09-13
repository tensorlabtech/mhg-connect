"use client"

import { Download, Phone, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { profile, vCardHref } from "@/features/dev/demo-profile/demo-profile-data"

export function DemoProfileActions() {
  async function shareProfile() {
    const shareData = {
      title: `${profile.name} | ${profile.company}`,
      text: `${profile.name}, ${profile.role} tại ${profile.company}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      toast.success("Đã sao chép liên kết")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error("Chưa thể chia sẻ hồ sơ")
    }
  }

  return (
    <div className="profile-actions">
      <Button asChild size="lg">
        <a download="nguyen-minh-anh.vcf" href={vCardHref}>
          <Download aria-hidden="true" />
          Lưu
        </a>
      </Button>
      <Button asChild size="lg" variant="secondary">
        <a href={profile.phoneHref}>
          <Phone aria-hidden="true" />
          Gọi
        </a>
      </Button>
      <Button onClick={shareProfile} size="lg" variant="secondary">
        <Share2 aria-hidden="true" />
        Chia sẻ
      </Button>
    </div>
  )
}
