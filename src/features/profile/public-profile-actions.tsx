"use client";

import { Download, Phone, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function PublicProfileActions({
  inert = false,
  phone,
  token,
}: {
  inert?: boolean;
  phone: string | null;
  token: string;
}) {
  async function shareProfile() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MHG Connect",
          url: window.location.href,
        });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Chưa thể chia sẻ hồ sơ");
    }
  }

  if (inert) {
    return (
      <div aria-hidden="true" className="profile-actions" data-preview-actions>
        <Button asChild className="min-w-0 flex-nowrap px-3" size="lg">
          <span>
            <Download /> Lưu liên hệ
          </span>
        </Button>
        {phone ? (
          <Button
            asChild
            className="min-w-0 flex-nowrap px-3"
            size="lg"
            variant="secondary"
          >
            <span>
              <Phone /> Gọi
            </span>
          </Button>
        ) : null}
        <Button
          asChild
          className="min-w-0 flex-nowrap px-3"
          size="lg"
          variant="secondary"
        >
          <span>
            <Share2 /> Chia sẻ
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="profile-actions">
      <Button asChild className="min-w-0 flex-nowrap px-3" size="lg">
        <a
          aria-label="Lưu liên hệ"
          download
          href={`/q/${encodeURIComponent(token)}/vcard`}
        >
          <Download /> Lưu liên hệ
        </a>
      </Button>
      {phone ? (
        <Button
          asChild
          className="min-w-0 flex-nowrap px-3"
          size="lg"
          variant="secondary"
        >
          <a href={`tel:${phone.replace(/\s/g, "")}`}>
            <Phone /> Gọi
          </a>
        </Button>
      ) : null}
      <Button
        className="min-w-0 flex-nowrap px-3"
        onClick={shareProfile}
        size="lg"
        variant="secondary"
      >
        <Share2 /> Chia sẻ
      </Button>
    </div>
  );
}
