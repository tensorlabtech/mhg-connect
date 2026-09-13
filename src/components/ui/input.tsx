"use client"

import * as React from "react"
import { cn } from "cn"

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: "xs" | "sm" | "default" | "lg"
}

function Input({ className, type, size = "default", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "w-full min-w-0 rounded-control border border-transparent bg-input/30 px-4 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 disabled:hover:border-transparent aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/35 data-[size=default]:h-control data-[size=lg]:h-control-lg data-[size=sm]:h-control-sm data-[size=xs]:h-control-xs data-[size=xs]:px-3 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

type FileInputProps = Omit<InputProps, "type"> & {
  selectLabel?: string
  emptyLabel?: string
  selectionLabel?: string
}

function FileInput({
  className,
  disabled,
  emptyLabel = "Chưa chọn tệp",
  multiple,
  onChange,
  selectLabel = "Chọn tệp",
  selectionLabel,
  size = "default",
  ...props
}: FileInputProps) {
  const [selection, setSelection] = React.useState(emptyLabel)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files
    setSelection(
      files?.length
        ? multiple && files.length > 1
          ? `${files.length} tệp đã chọn`
          : files[0].name
        : emptyLabel
    )
    onChange?.(event)
  }

  return (
    <label
      data-disabled={disabled || undefined}
      data-size={size}
      data-slot="file-input"
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-control border border-transparent bg-input/30 px-1.5 transition-colors hover:border-foreground/10 focus-within:ring-2 focus-within:ring-ring/60 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-2 has-[[aria-invalid=true]]:ring-destructive/35 data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50 data-disabled:hover:border-transparent data-[size=default]:h-control data-[size=lg]:h-control-lg data-[size=sm]:h-control-sm data-[size=xs]:h-control-xs",
        className
      )}
    >
      <span className="my-1 inline-flex self-stretch shrink-0 items-center rounded-control bg-muted px-3 text-sm font-medium text-foreground">
        {selectLabel}
      </span>
      <span className="min-w-0 flex-1 truncate pr-2 text-sm text-muted-foreground">
        {selectionLabel ?? selection}
      </span>
      <input
        aria-invalid={props["aria-invalid"]}
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        onChange={handleChange}
        type="file"
        {...props}
      />
    </label>
  )
}

export { FileInput, Input }
