"use client";

import { Check, ImagePlus, Palette } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ProfileBackground,
  ProfileBackgroundEffectId,
  ProfileDocument,
} from "@/features/profile/profile-document-types";
import {
  profileBackgroundEffects,
  profileBackgroundImages,
  profileBackgroundPresets,
} from "@/features/profile/profile-style-packs";

type ChangeHandler = (document: ProfileDocument) => void;
type BackgroundLibraryTab = "effects" | "colors" | "images";

export function ProfileBackgroundLibraryDialog({
  document,
  onChange,
}: {
  document: ProfileDocument;
  onChange: ChangeHandler;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<BackgroundLibraryTab>("effects");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const background = document.theme.background;

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );

  function changeBackground(next: ProfileBackground, keepUpload = false) {
    if (!keepUpload) {
      if (inputRef.current) inputRef.current.value = "";
      setObjectUrl(null);
    }
    onChange({
      ...document,
      theme: { ...document.theme, background: next },
    });
  }

  return (
    <section className="grid gap-3" aria-labelledby="profile-background-title">
      <div>
        <h3 className="text-sm font-medium" id="profile-background-title">
          Nền trang
        </h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Chọn hiệu ứng, màu hoặc ảnh phủ toàn bộ hồ sơ.
        </p>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp"
        aria-label="Tải ảnh nền lên"
        className="sr-only"
        name="background"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          const nextUrl = URL.createObjectURL(file);
          setObjectUrl(nextUrl);
          changeBackground(
            { imageUrl: nextUrl, overlay: 0.48, type: "image" },
            true,
          );
        }}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <Dialog
        onOpenChange={(nextOpen) => {
          if (nextOpen) setTab(getBackgroundLibraryTab(background));
          setOpen(nextOpen);
        }}
        open={open}
      >
        <DialogTrigger asChild>
          <button
            className="group grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-secondary/70 p-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px"
            type="button"
          >
            <span className="block aspect-[4/3] overflow-hidden rounded-md">
              <BackgroundPreview background={background} />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm font-medium">
                {getBackgroundLabel(background)}
              </strong>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Mở thư viện nền
              </span>
            </span>
            <Palette aria-hidden="true" className="mr-2 size-4 text-muted-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn nền trang</DialogTitle>
            <DialogDescription>
              Nền thay đổi độc lập, không làm mất bố cục và font của phong cách.
            </DialogDescription>
          </DialogHeader>
          <Tabs
            onValueChange={(value) => setTab(value as BackgroundLibraryTab)}
            value={tab}
          >
            <TabsList className="w-full">
              <TabsTrigger value="effects">Hiệu ứng</TabsTrigger>
              <TabsTrigger value="colors">Màu</TabsTrigger>
              <TabsTrigger value="images">Ảnh</TabsTrigger>
            </TabsList>
            <TabsContent className="pt-3" value="effects">
              <BackgroundGrid>
                {profileBackgroundEffects.map((effect) => (
                  <BackgroundOption
                    active={
                      background.type === "effect" &&
                      background.effectId === effect.id
                    }
                    description={effect.description}
                    key={effect.id}
                    label={effect.label}
                    onClick={() =>
                      changeBackground({ effectId: effect.id, type: "effect" })
                    }
                    preview={<EffectPreview effectId={effect.id} />}
                  />
                ))}
              </BackgroundGrid>
            </TabsContent>
            <TabsContent className="pt-3" value="colors">
              <BackgroundGrid>
                <BackgroundOption
                  active={background.type === "style"}
                  description="Màu mặc định của phong cách"
                  label="Theo phong cách"
                  onClick={() => changeBackground({ type: "style" })}
                  preview={<StyleDefaultPreview />}
                />
                {profileBackgroundPresets.map((preset) => (
                  <BackgroundOption
                    active={
                      background.type === "preset" &&
                      background.presetId === preset.id
                    }
                    description={preset.tone === "light" ? "Nền sáng" : "Nền tối"}
                    key={preset.id}
                    label={preset.label}
                    onClick={() =>
                      changeBackground({ presetId: preset.id, type: "preset" })
                    }
                    preview={<ColorPreview color={preset.color} />}
                  />
                ))}
              </BackgroundGrid>
            </TabsContent>
            <TabsContent className="grid gap-5 pt-3" value="images">
              <BackgroundGrid>
                {profileBackgroundImages.map((image) => (
                  <BackgroundOption
                    active={
                      background.type === "image" &&
                      background.imageUrl === image.url
                    }
                    description="Ảnh có sẵn"
                    key={image.url}
                    label={image.label}
                    onClick={() =>
                      changeBackground({
                        imageUrl: image.url,
                        overlay: 0.48,
                        type: "image",
                      })
                    }
                    preview={<ImagePreview alt="" url={image.url} />}
                  />
                ))}
                <button
                  className="group grid min-w-0 max-w-full gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  <span className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed border-border/80 bg-secondary/60 transition-[background-color,transform] group-hover:-translate-y-0.5 group-hover:bg-muted">
                    <span className="flex size-10 items-center justify-center rounded-full bg-background">
                      <ImagePlus aria-hidden="true" className="size-5" />
                    </span>
                  </span>
                  <span className="w-full min-w-0 overflow-hidden px-0.5">
                    <strong className="block w-full truncate text-sm font-medium">
                      Tải ảnh lên
                    </strong>
                    <span className="mt-0.5 block line-clamp-2 min-h-8 w-full text-xs leading-4 text-muted-foreground">
                      JPG, PNG, WebP · tối đa 5 MB
                    </span>
                  </span>
                </button>
              </BackgroundGrid>
              {background.type === "image" ? (
                <label className="grid gap-2 text-sm" htmlFor="background-overlay">
                  <span className="flex items-center justify-between gap-4">
                    <span>Độ tối ảnh nền</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(background.overlay * 100)}%
                    </span>
                  </span>
                  <input
                    className="h-11 w-full accent-gold"
                    id="background-overlay"
                    max="0.8"
                    min="0.2"
                    onChange={(event) =>
                      changeBackground({
                        ...background,
                        overlay: Number(event.target.value),
                      })
                    }
                    step="0.05"
                    type="range"
                    value={background.overlay}
                  />
                </label>
              ) : null}
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)} type="button">
              Xong
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function BackgroundGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

function BackgroundOption({
  active,
  description,
  label,
  onClick,
  preview,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
  preview: React.ReactNode;
}) {
  return (
    <button
      aria-pressed={active}
      className="group grid min-w-0 max-w-full gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px"
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "relative block aspect-[4/3] overflow-hidden rounded-lg border transition-[border-color,transform] group-hover:-translate-y-0.5",
          active ? "border-gold" : "border-transparent",
        )}
      >
        {preview}
        {active ? (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-gold text-background">
            <Check aria-hidden="true" className="size-3.5" />
          </span>
        ) : null}
      </span>
      <span className="w-full min-w-0 overflow-hidden px-0.5">
        <strong className="block w-full truncate text-sm font-medium">{label}</strong>
        <span className="mt-0.5 block line-clamp-2 min-h-8 w-full text-xs leading-4 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function BackgroundPreview({ background }: { background: ProfileBackground }) {
  if (background.type === "image") {
    return <ImagePreview alt="Nền đang chọn" url={background.imageUrl} />;
  }
  if (background.type === "effect") {
    return <EffectPreview effectId={background.effectId} />;
  }
  if (background.type === "preset") {
    const preset = profileBackgroundPresets.find(
      ({ id }) => id === background.presetId,
    );
    return <ColorPreview color={preset?.color ?? "#111416"} />;
  }
  return <StyleDefaultPreview />;
}

function EffectPreview({ effectId }: { effectId: ProfileBackgroundEffectId }) {
  return (
    <span
      className="profile-background-effect-preview block size-full"
      data-background-effect={effectId}
    />
  );
}

function ColorPreview({ color }: { color: string }) {
  return <span className="block size-full" style={{ backgroundColor: color }} />;
}

function ImagePreview({ alt, url }: { alt: string; url: string }) {
  return (
    <span className="relative block size-full overflow-hidden rounded-lg bg-muted">
      <Image
        alt={alt}
        className="object-cover"
        fill
        sizes="12rem"
        src={url}
        unoptimized={url.startsWith("blob:")}
      />
    </span>
  );
}

function StyleDefaultPreview() {
  return (
    <span className="grid size-full grid-cols-2">
      <span className="bg-[#111416]" />
      <span className="bg-[#f1f2ef]" />
    </span>
  );
}

function getBackgroundLibraryTab(
  background: ProfileBackground,
): BackgroundLibraryTab {
  if (background.type === "effect") return "effects";
  if (background.type === "image") return "images";
  return "colors";
}

function getBackgroundLabel(background: ProfileBackground) {
  if (background.type === "style") return "Theo phong cách";
  if (background.type === "preset") {
    return (
      profileBackgroundPresets.find(({ id }) => id === background.presetId)
        ?.label ?? "Màu"
    );
  }
  if (background.type === "effect") {
    return (
      profileBackgroundEffects.find(({ id }) => id === background.effectId)
        ?.label ?? "Hiệu ứng"
    );
  }
  return (
    profileBackgroundImages.find(({ url }) => url === background.imageUrl)
      ?.label ?? "Ảnh đã tải lên"
  );
}
