/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 px-2.5 py-0.5 text-xs font-bold font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]",
        secondary:
          "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        destructive:
          "border-[var(--danger)] bg-[var(--danger)] text-white",
        outline: "border-[var(--text-primary)] text-[var(--text-primary)] bg-transparent",
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
