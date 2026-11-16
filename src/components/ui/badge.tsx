/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5",
    "text-xs font-medium whitespace-nowrap",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-1",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-white border-[var(--ink)]",
        secondary:
          "bg-[var(--surface)] text-[var(--steel)] border-[var(--rule)]",
        destructive:
          "bg-[var(--risk-high)] text-white border-[var(--risk-high)]",
        outline:
          "border-[var(--rule-strong)] text-[var(--steel)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
