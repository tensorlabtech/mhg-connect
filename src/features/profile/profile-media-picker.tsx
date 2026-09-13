"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileMediaSelectionDialog } from "@/features/profile/profile-media-selection-dialog";
import {
  avatarPresets,
  coverPresets,
} from "@/features/profile/profile-demo-media";

type ProfileMediaPickerProps = {
  avatarUrl: string | null;
  coverUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  onCoverChange: (url: string) => void;
};

export function ProfileMediaPicker({
  avatarUrl,
  coverUrl,
  onAvatarChange,
  onCoverChange,
}: ProfileMediaPickerProps) {
  const activeCoverUrl = coverUrl || coverPresets[0].url;
  return (
    <div className="grid gap-5">
      <MediaField label="Ảnh đại diện">
        <ProfileMediaSelectionDialog
          activeUrl={avatarUrl}
          kind="avatar"
          onSelect={onAvatarChange}
          presets={avatarPresets}
        >
          <MediaTrigger
            description="Chọn ảnh mẫu cho hồ sơ."
            preview={
              <Avatar className="size-16 bg-background">
                {avatarUrl ? (
                  <AvatarImage alt="Ảnh đại diện đang chọn" src={avatarUrl} />
                ) : null}
                <AvatarFallback>
                  <ImageIcon className="size-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            }
            title={avatarUrl ? "Đổi ảnh đại diện" : "Chọn ảnh đại diện"}
          />
        </ProfileMediaSelectionDialog>
      </MediaField>

      <MediaField label="Ảnh bìa">
        <ProfileMediaSelectionDialog
          activeUrl={activeCoverUrl}
          kind="cover"
          onSelect={(url) => {
            if (url) onCoverChange(url);
          }}
          presets={coverPresets}
        >
          <MediaTrigger
            description="Ảnh ngang dùng cho phong cách Bìa."
            preview={
              <span className="relative block aspect-video w-28 overflow-hidden rounded-md bg-background">
                <Image
                  alt="Ảnh bìa đang chọn"
                  className="object-cover"
                  fill
                  sizes="112px"
                  src={activeCoverUrl}
                />
              </span>
            }
            title="Chọn ảnh bìa"
          />
        </ProfileMediaSelectionDialog>
      </MediaField>
    </div>
  );
}

function MediaField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-medium">{label}</h3>
      {children}
    </section>
  );
}

function MediaTrigger({
  description,
  preview,
  title,
  ...props
}: {
  description: string;
  preview: ReactNode;
  title: string;
} & ComponentProps<"button">) {
  return (
    <button
      className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-overlay bg-secondary p-3 text-left transition-[background-color,transform] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px"
      {...props}
      type="button"
    >
      {preview}
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
