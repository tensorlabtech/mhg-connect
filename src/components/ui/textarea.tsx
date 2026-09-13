"use client"

import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-overlay border border-transparent bg-input/30 px-4 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground hover:border-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 disabled:hover:border-transparent aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/35 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
