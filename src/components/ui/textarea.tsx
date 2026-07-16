import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border/80 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-bg-main/60 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-md border bg-bg-main/40 px-3 py-3 text-base shadow-xs transition-[border-color,background-color,color,box-shadow] outline-none hover:border-primary/50 hover:bg-bg-main/55 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
