"use client";

import { cn } from "cn";
import { Check } from "lucide-react";

import { qrCardPresetBackgrounds } from "@/features/qr/qr-card-presets";

/** Hàng ảnh nền có sẵn; bấm là dùng ngay, không cần tải ảnh lên. */
export function QrCardPresetPicker({
  buttonName,
  disabled,
  onPick,
  selectedUrl,
}: {
  /** Đặt khi dùng trong form: nút gửi kèm presetId. */
  buttonName?: string;
  disabled?: boolean;
  onPick?: (presetId: string) => void;
  selectedUrl: string | null;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <p className="text-sm font-medium">Nền có sẵn</p>
      <div className="flex flex-wrap gap-2">
        {qrCardPresetBackgrounds.map((preset) => {
          const selected = selectedUrl === preset.url;
          return (
            <button
              aria-label={`Dùng nền ${preset.label}`}
              aria-pressed={selected}
              className={cn(
                "relative grid w-28 cursor-pointer gap-1.5 rounded-overlay p-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait",
                selected
                  ? "bg-secondary ring-1 ring-gold/70"
                  : "bg-secondary/55 hover:bg-secondary",
              )}
              disabled={disabled}
              key={preset.id}
              name={buttonName}
              onClick={onPick ? () => onPick(preset.id) : undefined}
              type={buttonName ? "submit" : "button"}
              value={preset.id}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block rounded-[0.35rem] bg-cover bg-center",
                  preset.orientation === "portrait"
                    ? "mx-auto h-16 w-10"
                    : "h-10 w-full",
                )}
                style={{ backgroundImage: `url(${preset.url})` }}
              />
              <span className="text-[0.6875rem] leading-4 font-medium">
                {preset.label}
              </span>
              {selected ? (
                <Check
                  aria-hidden="true"
                  className="absolute top-1 right-1 size-3.5 text-gold"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
