"use client";

import { cn } from "cn";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  normalizeQrCardTextColor,
  qrCardFontOptions,
  qrCardTextColorSwatches,
  type QrCardFont,
} from "@/features/qr/qr-card-layout";

/** Chọn phông chữ và màu chữ trên thẻ; dùng chung cho thẻ chính và mẫu thẻ. */
export function QrCardTypographyFields({
  disabled,
  font,
  idPrefix,
  onColorPreview,
  onFontChange,
  onTextColorChange,
  textColor,
}: {
  disabled?: boolean;
  font: QrCardFont;
  idPrefix: string;
  /** Xem trước màu khi đang kéo bảng màu, chưa lưu. */
  onColorPreview?: (color: string | null) => void;
  onFontChange: (next: QrCardFont) => void;
  onTextColorChange: (next: string | null) => void;
  textColor: string | null;
}) {
  // Màu đang kéo trên bảng màu; null là hiện đúng màu đã lưu.
  const [customDraft, setCustomDraft] = useState<string | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
    },
    [],
  );
  const isSwatch = qrCardTextColorSwatches.some(
    (swatch) => swatch.value === textColor,
  );

  function choose(next: string | null) {
    if (next === textColor) return;
    onTextColorChange(next);
  }

  return (
    <div className="grid min-w-0 gap-5">
      <fieldset className="grid min-w-0 gap-3">
        <legend className="text-sm font-medium">Phông chữ</legend>
        <div
          aria-label="Phông chữ trên thẻ"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="radiogroup"
        >
          {qrCardFontOptions.map((option) => {
            const selected = option.id === font;
            return (
              <button
                aria-checked={selected}
                aria-label={`${option.label}: ${option.description}`}
                className={cn(
                  "grid min-w-0 cursor-pointer gap-1 rounded-overlay px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait",
                  selected
                    ? "bg-secondary ring-1 ring-gold/70"
                    : "bg-secondary/55 hover:bg-secondary",
                )}
                disabled={disabled}
                key={option.id}
                onClick={() => {
                  if (!selected) onFontChange(option.id);
                }}
                role="radio"
                type="button"
              >
                <span
                  className={cn(
                    "truncate text-lg leading-7 font-bold",
                    option.uppercase && "uppercase",
                  )}
                  style={{ fontFamily: option.family }}
                >
                  Trần Hòa
                </span>
                <span className="truncate text-xs leading-4 text-muted-foreground">
                  {option.label} · {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid min-w-0 gap-3">
        <legend className="text-sm font-medium">Màu chữ</legend>
        <p className="-mt-1 text-xs leading-5 text-muted-foreground">
          Áp cho tên, chức danh và địa điểm. Tự động: chữ trắng trên nền tối,
          chữ đen trên khung sáng.
        </p>
        <div
          aria-label="Màu chữ trên thẻ"
          className="flex flex-wrap items-center gap-2"
          role="radiogroup"
        >
          <button
            aria-checked={textColor === null}
            className={cn(
              "flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait",
              textColor === null
                ? "bg-secondary ring-1 ring-gold/70"
                : "bg-secondary/55 hover:bg-secondary",
            )}
            disabled={disabled}
            onClick={() => choose(null)}
            role="radio"
            type="button"
          >
            <span
              aria-hidden="true"
              className="size-5 rounded-full bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_50%,#0a0a0a_50%,#0a0a0a_100%)] ring-1 ring-border"
            />
            Tự động
          </button>
          {qrCardTextColorSwatches.map((swatch) => {
            const selected = swatch.value === textColor;
            return (
              <button
                aria-checked={selected}
                aria-label={swatch.label}
                className={cn(
                  "relative flex size-10 cursor-pointer items-center justify-center rounded-full transition-transform focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait",
                  selected
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                    : "hover:scale-105",
                )}
                disabled={disabled}
                key={swatch.value}
                onClick={() => choose(swatch.value)}
                role="radio"
                title={swatch.label}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="size-8 rounded-full ring-1 ring-white/25"
                  style={{ backgroundColor: swatch.value }}
                />
                {selected ? (
                  <Check
                    aria-hidden="true"
                    className="absolute size-4 mix-blend-difference"
                    color="#ffffff"
                  />
                ) : null}
              </button>
            );
          })}
          <label
            className={cn(
              "relative flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-within:ring-2 focus-within:ring-ring/60",
              textColor && !isSwatch
                ? "bg-secondary ring-1 ring-gold/70"
                : "bg-secondary/55 hover:bg-secondary",
            )}
            htmlFor={`${idPrefix}-text-color`}
          >
            <span
              aria-hidden="true"
              className="size-5 rounded-full ring-1 ring-white/25"
              style={{
                background:
                  textColor && !isSwatch
                    ? textColor
                    : "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
              }}
            />
            Màu khác
            <input
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={disabled}
              id={`${idPrefix}-text-color`}
              onChange={(event) => {
                const next = normalizeQrCardTextColor(event.target.value);
                setCustomDraft(event.target.value);
                onColorPreview?.(next);
                // Bảng màu bắn sự kiện liên tục khi kéo: chờ dừng tay rồi mới lưu.
                if (commitTimer.current) clearTimeout(commitTimer.current);
                commitTimer.current = setTimeout(() => {
                  setCustomDraft(null);
                  onColorPreview?.(null);
                  if (next) choose(next);
                }, 500);
              }}
              type="color"
              value={customDraft ?? textColor ?? "#ffffff"}
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
}
