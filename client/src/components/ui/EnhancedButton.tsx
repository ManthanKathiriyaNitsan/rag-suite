import * as React from "react"
import { Button, ButtonProps } from "./button"
import { PointerTypes } from "./animated-pointer"
import { cn } from "@/utils"

export interface EnhancedButtonProps extends ButtonProps {
  showPointer?: boolean
  pointerType?: keyof typeof PointerTypes
  pointerAnimation?: "bounce" | "pulse" | "wiggle" | "heart" | "star" | "sparkle"
  pointerEmoji?: string
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    showPointer = true,
    pointerType,
    pointerAnimation,
    pointerEmoji,
    children,
    ...props 
  }, ref) => {
    // Determine pointer type based on button variant and content
    const getPointerType = () => {
      if (pointerType) return PointerTypes[pointerType]
      if (variant === "destructive") return PointerTypes.Error
      if (variant === "outline") return PointerTypes.Click
      if (variant === "secondary") return PointerTypes.Settings
      
      // Default to Click for primary buttons
      return PointerTypes.Click
    }

    const PointerComponent = getPointerType()

    return (
      <div className="relative">
        <Button
          className={cn(className)}
          variant={variant}
          size={size}
          asChild={asChild}
          ref={ref}
          {...props}
        >
          {children}
        </Button>
        {showPointer && (
          <PointerComponent className="absolute inset-0" />
        )}
      </div>
    )
  },
)

EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton }
