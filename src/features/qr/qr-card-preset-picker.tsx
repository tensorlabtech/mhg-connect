"use client";

import { cn } from "cn";
import { Check } from "lucide-react";

import {
  groupQrCardPresets,
  type QrCardPreset,
} from "@/features/qr/qr-card-presets";

/**
 * Mẫu sticker có sẵn (lấy từ database), gom theo nhóm như “Sticker sản phẩm MHG”, “Đất nước”.
 * Bấm một mẫu là áp luôn ảnh nền, hướng thẻ, kiểu nền chữ và dòng chữ cạnh logo.
 */
export function QrCardPresetPicker({
  buttonName,
  disabled,
  onPick,
  presets,
  selectedUrl,
}: {
  /** Đặt khi dùng trong form: nút gửi kèm presetId. */
  buttonName?: string;
  disabled?: boolean;
  onPick?: (presetId: string) => void;
  presets: readonly QrCardPreset[];
  selectedUrl: string | null;
}) {
  if (presets.length === 0) return null;
  const groups = groupQrCardPresets(presets);
  return (
    <div className="grid min-w-0 gap-3">
      <div>
        <p className="text-sm font-medium">Mẫu sticker có sẵn</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Bấm một mẫu để áp ảnh nền, hướng thẻ và dòng chữ cạnh logo.
        </p>
      </div>
      {groups.map((group) => (
        <div className="grid min-w-0 gap-2" key={group.category}>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.category}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
            {group.presets.map((preset) => {
              const selected = selectedUrl === preset.backgroundUrl;
              return (
                <button
                  aria-label={`Dùng mẫu ${preset.name}`}
                  aria-pressed={selected}
                  className={cn(
                    "relative grid min-h-11 cursor-pointer content-start gap-1.5 rounded-overlay p-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-wait disabled:opacity-60",
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
                        ? "mx-auto aspect-[53.98/85.6] h-20"
                        : "aspect-[85.6/53.98] w-full",
                    )}
                    style={{ backgroundImage: `url(${preset.backgroundUrl})` }}
                  />
                  <span className="text-[0.6875rem] leading-4 font-medium">
                    {preset.name}
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
      ))}
    </div>
  );
}
