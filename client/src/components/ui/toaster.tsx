import { useToast } from "@/hooks/useToast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

function getIcon(variant?: string) {
  switch (variant) {
    case "success":
      return <div className="h-5 w-5 rounded-full bg-green-700 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-white fill-white" /></div>
    case "destructive":
      return <div className="h-5 w-5 rounded-full bg-red-700 flex items-center justify-center"><XCircle className="h-4 w-4 text-white fill-white" /></div>
    case "warning":
      return <div className="h-5 w-5 rounded-full bg-yellow-700 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-white fill-white" /></div>
    case "info":
      return <div className="h-5 w-5 rounded-full bg-blue-700 flex items-center justify-center"><Info className="h-4 w-4 text-white fill-white" /></div>
    default:
      return null
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = getIcon(variant)
        // Default title for success variant
        const displayTitle = title || (variant === "success" ? "Record Saved" : undefined)
        // Ensure icon shows for success variant
        const showIcon = icon || (variant === "success" ? getIcon("success") : null)
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex items-start gap-3 flex-1">
              {showIcon && (
                <div className="flex-shrink-0 mt-0.5">
                  {showIcon}
                </div>
              )}
              <div className="grid gap-1 flex-1">
                {displayTitle && <ToastTitle>{displayTitle}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
