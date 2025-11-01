import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // h-9 to match icon buttons and default buttons.
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full border border-input bg-white dark:bg-card hover:bg-[hsl(var(--sidebar-accent))] dark:hover:bg-[hsl(var(--sidebar-accent))] hover:border-[hsl(var(--sidebar-border))] dark:hover:border-[hsl(var(--sidebar-border))] transition-colors px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:dark:hover:bg-card disabled:hover:border-input md:text-sm",
          className
        )}
        style={{ borderRadius: 'var(--component-inputRadius, 0.375rem)' }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
