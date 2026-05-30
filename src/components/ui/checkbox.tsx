import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indicator?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indicator = true, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }
    return (
      <label
        className={cn(
          "relative flex items-center justify-center",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "h-5 w-5 rounded border-2 transition-all duration-200",
            "flex items-center justify-center",
            "peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)]",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            "hover:border-[var(--primary)]",
            props.checked
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "bg-transparent border-slate-300 dark:border-slate-600",
            "data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]",
            className
          )}
          style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
          data-state={props.checked ? "checked" : "unchecked"}
        >
          {indicator && props.checked && (
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          )}
        </div>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }