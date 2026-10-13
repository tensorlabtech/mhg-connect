"use client";

import { cn } from "cn";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  QR_CARD_DEFAULT_TAGLINE,
  QR_CARD_TAGLINE_MAX,
  qrCardOrientationOptions,
  type QrCardOrientation,
} from "@/features/qr/qr-card-layout";

/** Chọn hướng thẻ (dọc/ngang) và dòng chữ cạnh logo; dùng chung cho thẻ chính và mẫu thẻ. */
export function QrCardLayoutFields({
  disabled,
  idPrefix,
  onOrientationChange,
  onTaglineCommit,
  onTaglinePreview,
  orientation,
  tagline,
}: {
  disabled?: boolean;
  idPrefix: string;
  onOrientationChange: (next: QrCardOrientation) => void;
  onTaglineCommit: (next: string) => void;
  onTaglinePreview?: (draft: string) => void;
  orientation: QrCardOrientation;
  tagline: string;
}) {
  const [draft, setDraft] = useState(tagline);
  const [lastShown, setLastShown] = useState(
    tagline.trim() || QR_CARD_DEFAULT_TAGLINE,
  );
  const shown = draft.trim().length > 0;

  function commit(next: string) {
    const value = next.trim();
    setDraft(value);
    onTaglinePreview?.(value);
    if (value) setLastShown(value);
    if (value !== tagline.trim()) onTaglineCommit(value);
  }

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

      <div className="grid min-w-0 gap-2">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-medium"
            htmlFor={`${idPrefix}-tagline`}
          >
            Dòng chữ cạnh logo
          </label>
          <Switch
            aria-label="Hiện dòng chữ cạnh logo"
            checked={shown}
            disabled={disabled}
            onCheckedChange={(checked) =>
              commit(checked ? lastShown || QR_CARD_DEFAULT_TAGLINE : "")
            }
          />
        </div>
        <Input
          disabled={disabled}
          id={`${idPrefix}-tagline`}
          maxLength={QR_CARD_TAGLINE_MAX}
          onBlur={(event) => commit(event.target.value)}
          onChange={(event) => {
            setDraft(event.target.value);
            onTaglinePreview?.(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
          }}
          placeholder={QR_CARD_DEFAULT_TAGLINE}
          value={draft}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          In đậm trên nền đậm ngay cạnh logo MHG. Tắt công tắc để ẩn.
        </p>
      </div>
    </div>
  );
}
