"use client";

import { Download, Phone, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const defaultLabels = {
  call: "Gọi",
  saveContact: "Lưu liên hệ",
  share: "Chia sẻ",
};

export function PublicProfileActions({
  inert = false,
  labels = defaultLabels,
  phone,
  token,
}: {
  inert?: boolean;
  labels?: { call: string; saveContact: string; share: string };
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
            <Download /> {labels.saveContact}
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
              <Phone /> {labels.call}
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
            <Share2 /> {labels.share}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="profile-actions">
      <Button asChild className="min-w-0 flex-nowrap px-3" size="lg">
        <a
          aria-label={labels.saveContact}
          download
          href={`/q/${encodeURIComponent(token)}/vcard`}
        >
          <Download /> {labels.saveContact}
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
            <Phone /> {labels.call}
          </a>
        </Button>
      ) : null}
      <Button
        className="min-w-0 flex-nowrap px-3"
        onClick={shareProfile}
        size="lg"
        variant="secondary"
      >
        <Share2 /> {labels.share}
      </Button>
    </div>
  );
}
