/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium border rounded-md",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-white border-[var(--ink)] hover:bg-black",
        primary:
          "bg-[var(--ink)] text-white border-[var(--ink)] hover:bg-black",
        destructive:
          "bg-[var(--risk-high)] text-white border-[var(--risk-high)] hover:bg-[var(--risk-critical)]",
        outline:
          "border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--surface)]",
        secondary:
          "bg-[var(--surface)] text-[var(--ink)] border-[var(--rule)] hover:bg-[var(--bg-hover)]",
        ghost:
          "border-transparent bg-transparent text-[var(--ink)] hover:bg-[var(--surface)]",
        link: "border-transparent bg-transparent text-[var(--signal)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-10 px-4",
        icon: "h-9 w-9 p-0",
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
        type={asChild ? undefined : (props.type ?? "button")}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
