/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-lg transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "bg-[var(--text-primary)] text-white border-[var(--text-primary)] hover:bg-[var(--text-primary)]/90",
        primary: "bg-[var(--primary)] text-white border-[var(--primary)] hover:bg-[var(--primary-dark)]",
        destructive:
          "bg-[var(--danger)] text-white border-[var(--danger)] hover:bg-[var(--danger)]/90",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 hover:border-[var(--text-primary)]",
        secondary:
          "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-hover)]",
        ghost: "border-transparent hover:bg-[var(--text-primary)]/10 hover:text-[var(--text-primary)]",
        link: "text-[var(--text-primary)] underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
