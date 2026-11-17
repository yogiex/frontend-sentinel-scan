import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm",
        "border border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--ink)]",
        "placeholder:text-[var(--steel)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:bg-[var(--surface)] disabled:opacity-60",
        "aria-[invalid=true]:border-[var(--risk-high)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
