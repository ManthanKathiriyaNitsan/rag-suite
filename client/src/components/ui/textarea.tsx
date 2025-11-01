import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
        className={cn(
          "flex min-h-[80px] w-full border border-input bg-white dark:bg-card hover:bg-[hsl(var(--sidebar-accent))] dark:hover:bg-[hsl(var(--sidebar-accent))] hover:border-[hsl(var(--sidebar-border))] dark:hover:border-[hsl(var(--sidebar-border))] transition-colors px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:dark:hover:bg-card disabled:hover:border-input md:text-sm",
          className
        )}
      style={{ borderRadius: 'var(--component-inputRadius, 0.375rem)' }}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
