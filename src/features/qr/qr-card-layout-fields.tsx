"use client";

import { cn } from "cn";

import {
  QR_CARD_DEFAULT_TAGLINE,
  qrCardOrientationOptions,
  qrCardPositionOptions,
  type QrCardPosition,
  type QrCardOrientation,
} from "@/features/qr/qr-card-layout";

/** Chọn hướng thẻ (dọc/ngang) và dòng chữ cạnh logo; dùng chung cho thẻ chính và mẫu thẻ. */
export function QrCardLayoutFields({
  disabled,
  onOrientationChange,
  orientation,
  position = "bottom",
  onPositionChange,
}: {
  disabled?: boolean;
  idPrefix: string;
  onOrientationChange: (next: QrCardOrientation) => void;
  onTaglineCommit: (next: string) => void;
  onTaglinePreview?: (draft: string) => void;
  orientation: QrCardOrientation;
  position?: QrCardPosition;
  onPositionChange?: (next: QrCardPosition) => void;
  tagline: string;
}) {
  return (
    <div className="grid min-w-0 gap-5">
      <fieldset className="grid min-w-0 gap-3">
        <legend className="text-sm font-medium">Hướng thẻ</legend>
        <div
          aria-label="Hướng thẻ"
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
        >
          {qrCardOrientationOptions.map((option) => {
            const selected = option.id === orientation;
            return (
              <button
                aria-checked={selected}
                aria-label={option.label}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-overlay p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait",
                  selected
                    ? "bg-secondary ring-1 ring-gold/70"
                    : "bg-secondary/55 hover:bg-secondary",
                )}
                disabled={disabled}
                key={option.id}
                onClick={() => {
                  if (!selected) onOrientationChange(option.id);
                }}
                role="radio"
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center"
                >
                  <span
                    className={cn(
                      "rounded-[0.25rem] border-2 border-current bg-[linear-gradient(135deg,#7aa6c9_0%,#e8d8b8_50%,#4b6b8a_100%)] text-gold/80",
                      option.id === "portrait" ? "h-10 w-6" : "h-6 w-10",
                    )}
                  />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs leading-4 text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid min-w-0 gap-3">
        <legend className="text-sm font-medium">Bố cục QR và chữ</legend>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="Vị trí mã QR"
        >
          {qrCardPositionOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-pressed={position === option.id}
              disabled={disabled}
              onClick={() => onPositionChange?.(option.id)}
              className={cn(
                "min-h-10 rounded-overlay px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50",
                position === option.id
                  ? "bg-secondary ring-1 ring-gold/70"
                  : "bg-secondary/55 hover:bg-secondary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          QR và thông tin nằm ở hai vùng riêng. Chọn vùng trống của ảnh nền; chữ
          đã có sẵn trong ảnh không thể tự nhận diện. Với thẻ ngang nhiều thông
          tin, ưu tiên QR trái hoặc phải để chữ lớn hơn.
        </p>
      </fieldset>
      <div className="grid min-w-0 gap-2">
        <p className="text-sm font-medium">Dòng bảo vệ cố định của MHG</p>
        <p className="text-sm font-semibold">{QR_CARD_DEFAULT_TAGLINE}</p>
        <p className="text-xs leading-5">
          Luôn hiển thị trên thẻ, không thể sửa hoặc ẩn.
        </p>
      </div>
    </div>
  );
}
