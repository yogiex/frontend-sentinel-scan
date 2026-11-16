import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md px-3 py-1.5 text-sm",
          "border border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--ink)]",
          "placeholder:text-[var(--steel)]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:bg-[var(--surface)] disabled:opacity-60",
          "aria-[invalid=true]:border-[var(--risk-high)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
