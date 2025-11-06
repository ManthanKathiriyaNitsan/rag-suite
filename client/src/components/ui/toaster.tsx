import { ToastContainer, Bounce } from "react-toastify";
import { useTheme } from "@/contexts/ThemeContext";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      transition={Bounce}
    />
  );
}