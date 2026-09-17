"use client";

import type { ChangeEvent, DragEvent, ReactNode, RefObject } from "react";

import { Button } from "@/components/ui/button";

export type ProfileMediaKind = "avatar" | "cover";

export function HiddenMediaInput({
  inputRef,
  kind,
  onChange,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  kind: ProfileMediaKind;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
    kind: ProfileMediaKind,
  ) => void;
}) {
  return (
    <input
      accept="image/jpeg,image/png,image/webp"
      aria-hidden="true"
      className="sr-only"
      name={kind}
      onChange={(event) => onChange(event, kind)}
      ref={inputRef}
      tabIndex={-1}
      type="file"
    />
  );
}

export function MediaField({
  action,
  children,
  label,
}: {
  action?: ReactNode;
  children: ReactNode;
  label: string;
}) {
  return (
    <section className="grid gap-2">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{label}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function UploadArea({
  error,
  fileName,
  kind,
  onClick,
  onDrop,
  preview,
}: {
  error?: string;
  fileName?: string;
  kind: ProfileMediaKind;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  preview: ReactNode;
}) {
  const isAvatar = kind === "avatar";
  return (
    <div className="grid gap-2">
      <button
        aria-describedby={error ? `${kind}-upload-error` : undefined}
        className={`grid w-full gap-3 rounded-overlay bg-secondary p-3 text-left transition-[background-color,transform] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px ${isAvatar ? "grid-cols-[auto_minmax(0,1fr)] items-center" : "grid-cols-1"}`}
        onClick={onClick}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        type="button"
      >
        {preview}
        <span className="min-w-0">
          <span className="block text-sm font-medium">
            {fileName
              ? "Ảnh đã sẵn sàng"
              : isAvatar
                ? "Đổi ảnh đại diện"
                : "Đổi ảnh bìa"}
          </span>
          <span className="mt-1 block truncate text-xs leading-5 text-muted-foreground">
            {fileName ||
              `Kéo thả hoặc nhấn để chọn. JPG, PNG, WebP, tối đa ${isAvatar ? "2 MB" : "5 MB"}.`}
          </span>
        </span>
      </button>
      {error ? (
        <p className="text-xs text-destructive" id={`${kind}-upload-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ResetButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} size="xs" type="button" variant="ghost">
      {children}
      {label}
    </Button>
  );
}
