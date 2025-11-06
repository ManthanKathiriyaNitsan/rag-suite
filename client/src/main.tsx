import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "./components/error";

// Wrap the entire app in an error boundary
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary level="critical">
    <App />
  </ErrorBoundary>
);
    
