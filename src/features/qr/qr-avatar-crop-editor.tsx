"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  avatarCropStyle,
  DEFAULT_AVATAR_CROP,
  moveAvatarCrop,
  normalizeAvatarCrop,
  type AvatarCrop,
} from "./qr-avatar-crop";

export function QrAvatarCropEditor({
  src,
  value,
  disabled,
  onChange,
}: {
  src?: string | null;
  value?: AvatarCrop;
  disabled: boolean;
  onChange: (crop: AvatarCrop) => void;
}) {
  const crop = normalizeAvatarCrop(value);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    crop: AvatarCrop;
    size: number;
    width: number;
    height: number;
  } | null>(null);
  function start(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    const image = event.currentTarget.querySelector("img");
    if (!image?.naturalWidth || !image.naturalHeight) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      crop,
      size: event.currentTarget.getBoundingClientRect().width,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (disabled || !d || d.id !== event.pointerId) return;
    onChange(
      moveAvatarCrop(
        d.crop,
        event.clientX - d.x,
        event.clientY - d.y,
        d.size,
        d.width,
        d.height,
      ),
    );
  }
  if (!src)
    return (
      <p className="text-xs leading-5 text-muted-foreground">
        Hồ sơ chưa có ảnh đại diện. Hãy thêm ảnh trong hồ sơ trước.
      </p>
    );
  return (
    <div className="grid gap-3">
      <div
        role="group"
        aria-label="Kéo để căn ảnh trong vòng tròn"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-avatar-crop-frame
        className="relative mx-auto size-48 touch-none overflow-hidden rounded-full bg-secondary select-none cursor-grab focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:cursor-grabbing"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          const step = event.shiftKey ? 10 : 2;
          const shifts: Record<string, Partial<AvatarCrop>> = {
            ArrowLeft: { x: crop.x + step },
            ArrowRight: { x: crop.x - step },
            ArrowUp: { y: crop.y + step },
            ArrowDown: { y: crop.y - step },
          };
          if (shifts[event.key]) {
            event.preventDefault();
            onChange(normalizeAvatarCrop({ ...crop, ...shifts[event.key] }));
          }
        }}
      >
        <Image
          src={src}
          alt="Căn khung ảnh đại diện từ hồ sơ"
          width={300}
          height={300}
          unoptimized
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={avatarCropStyle(crop)}
        />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Kéo ảnh trong vòng tròn để căn khuôn mặt. Có thể dùng các phím mũi tên.
      </p>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span>Độ phóng ảnh</span>
        <output>{Math.round(crop.zoom * 100)}%</output>
      </div>
      <Slider
        aria-label="Độ phóng ảnh đại diện"
        className="h-control"
        min={1}
        max={3}
        step={0.05}
        value={[crop.zoom]}
        disabled={disabled}
        onValueChange={([zoom]) => onChange({ ...crop, zoom })}
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={disabled}
        onClick={() => onChange({ ...DEFAULT_AVATAR_CROP })}
      >
        Căn giữa, về 100%
      </Button>
    </div>
  );
}
