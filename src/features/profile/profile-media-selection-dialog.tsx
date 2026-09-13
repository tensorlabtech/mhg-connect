"use client";

import { Check, ImageIcon } from "lucide-react";
import Image from "next/image";
import type { ReactElement } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MediaPreset = {
  label: string;
  url: string;
};

type MediaSelectionDialogProps = {
  activeUrl: string | null;
  children: ReactElement;
  onSelect: (url: string | null) => void;
  presets: readonly MediaPreset[];
};

export function ProfileMediaSelectionDialog({
  activeUrl,
  children,
  kind,
  onSelect,
  presets,
}: MediaSelectionDialogProps & { kind: "avatar" | "cover" }) {
  const isAvatar = kind === "avatar";
  const title = isAvatar ? "Ảnh đại diện" : "Ảnh bìa";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Chức năng Upload thật sẽ hoạt động trong tương lai.
          </DialogDescription>
        </DialogHeader>
        <div
          className={`grid gap-3 ${isAvatar ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2"}`}
        >
          {isAvatar ? (
            <PresetButton
              active={!activeUrl}
              label="Dùng chữ viết tắt"
              onClick={() => onSelect(null)}
              square
            />
          ) : null}
          {presets.map((preset) => (
            <PresetButton
              active={activeUrl === preset.url}
              image={preset.url}
              key={preset.url}
              label={preset.label}
              onClick={() => onSelect(preset.url)}
              square={isAvatar}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PresetButton({
  active,
  image,
  label,
  onClick,
  square = false,
}: {
  active: boolean;
  image?: string;
  label: string;
  onClick: () => void;
  square?: boolean;
}) {
  return (
    <button
      aria-pressed={active}
      className={`relative min-h-11 overflow-hidden rounded-lg border text-left transition-[border-color,transform] focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px ${active ? "border-gold" : "border-border hover:border-muted-foreground"}`}
      onClick={onClick}
      type="button"
    >
      <div
        className={`relative bg-secondary ${square ? "aspect-square" : "aspect-[3/1]"}`}
      >
        {image ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="240px"
            src={image}
          />
        ) : (
          <ImageIcon className="absolute inset-0 m-auto size-6 text-muted-foreground" />
        )}
      </div>
      <span className="block truncate px-3 py-2 text-xs">{label}</span>
      {active ? (
        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-gold text-background">
          <Check aria-hidden="true" className="size-3" />
        </span>
      ) : null}
    </button>
  );
}
