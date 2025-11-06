import { toast as toastifyToast } from "react-toastify";
import { Bounce } from "react-toastify";

type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "destructive";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

// Map our variants to react-toastify types
const variantMap: Record<Exclude<ToastVariant, "destructive">, "default" | "success" | "error" | "warning" | "info"> = {
  default: "default",
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

// Map destructive variant to error
const getToastType = (variant?: ToastVariant): "default" | "success" | "error" | "warning" | "info" => {
  if (!variant) return "default";
  if (variant === "destructive") return "error";
  return variantMap[variant];
};

function formatToastMessage(title?: string, description?: string): string {
  if (title && description) {
    return `${title}\n${description}`;
  }
  return title || description || "";
}

function toast(options: ToastOptions | string) {
  // Handle string-only usage (backward compatibility)
  if (typeof options === "string") {
    return toastifyToast(options, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Bounce,
    });
  }

  const { title, description, variant } = options;
  const type = getToastType(variant);
  
  // For success toasts, always use "Record saved" as the title
  const finalTitle = (type === "success") ? "Record saved" : title;
  const message = formatToastMessage(finalTitle, description);

  return toastifyToast(message, {
    type,
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Bounce,
  });
}

// Export toast functions for direct use
export const toastSuccess = (message: string, options?: { title?: string }) => {
  // Always use "Record saved" as title for success toasts
  const fullMessage = `Record saved\n${message}`;
  return toastifyToast(fullMessage, {
    type: "success",
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce,
  });
};

export const toastError = (message: string, options?: { title?: string }) => {
  const fullMessage = options?.title ? `${options.title}\n${message}` : message;
  return toastifyToast(fullMessage, {
    type: "error",
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce,
  });
};

export const toastWarning = (message: string, options?: { title?: string }) => {
  const fullMessage = options?.title ? `${options.title}\n${message}` : message;
  return toastifyToast(fullMessage, {
    type: "warning",
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce,
  });
};

export const toastInfo = (message: string, options?: { title?: string }) => {
  const fullMessage = options?.title ? `${options.title}\n${message}` : message;
  return toastifyToast(fullMessage, {
    type: "info",
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    transition: Bounce,
  });
};

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId !== undefined) {
        toastifyToast.dismiss(toastId);
      } else {
        toastifyToast.dismiss();
      }
    },
  };
}

export { useToast, toast };