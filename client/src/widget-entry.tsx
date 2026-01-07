/**
 * WIDGET ENTRY POINT
 * 
 * This is the standalone entry point for the embeddable widget.
 * When the widget bundle loads, this file initializes the React widget
 * and exposes it to the window object.
 * 
 * How it works:
 * 1. User adds <script> tag to their website
 * 2. Script loads widget.umd.js (this file bundled)
 * 3. This file creates React root and renders EmbeddableWidget
 * 4. Widget appears on the page
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmbeddableWidget } from "./components/common/EmbeddableWidget";
import { RAGSettingsProvider } from "./contexts/RAGSettingsContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useChatbotActivation } from "./hooks/useChatbotActivation";
import "./components/common/EmbeddableWidgetStyles.css";

/**
 * Create a standalone QueryClient for the widget
 * This is separate from the main app's QueryClient
 */
const widgetQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Widget Configuration Interface
 * 
 * This defines what options users can pass when initializing the widget.
 * All fields are optional except projectId (required for API authentication).
 */
interface WidgetConfig {
  // REQUIRED: Unique identifier for this widget instance (project ID)
  // Used to authenticate API requests and track usage
  projectId: string;
  
  // API endpoint - where to send chat/search requests
  // Defaults to the API base URL if not provided
  apiEndpoint?: string;
  
  // Widget position on the page
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  
  // Z-index for widget (how high it appears above other elements)
  zIndex?: number;
  
  // Primary color for widget (buttons, links, etc.)
  primaryColor?: string;
  
  // Widget title shown in header
  title?: string;
  
  // Welcome message shown when widget opens
  welcomeMessage?: string;
  
  // Organization name
  orgName?: string;
  
  // Chatbot title (can be different from widget title)
  chatbotTitle?: string;
  
  // Logo URL for widget header
  widgetLogoUrl?: string;
  
  // Avatar image URL
  widgetAvatar?: string;
  
  // Show logo in widget header
  widgetShowLogo?: boolean;
  
  // Show date/time in messages
  widgetShowDateTime?: boolean;
  
  // Space from bottom of page (in pixels)
  widgetBottomSpace?: number;
  
  // Font size for widget (in pixels)
  widgetFontSize?: number;
  
  // Border radius for trigger button (in pixels)
  widgetTriggerBorderRadius?: number;
  
  // Horizontal offset from edge (in pixels)
  widgetOffsetX?: number;
  
  // Vertical offset from edge (in pixels)
  widgetOffsetY?: number;
}

/**
 * Global Widget Instance
 * 
 * Stores the React root and container element.
 * Used to prevent multiple initializations and allow cleanup.
 */
let widgetInstance: {
  root: any; // React root instance
  container: HTMLElement; // DOM container element
} | null = null;

/**
 * API Base URL
 * 
 * This will be set when widget initializes.
 * Used by API client to make requests.
 */
let API_BASE_URL = "";

/**
 * Initialize Widget
 * 
 * This function:
 * 1. Creates a container element in the page
 * 2. Creates a React root
 * 3. Renders the EmbeddableWidget component
 * 4. Sets up API configuration
 * 
 * @param config - Widget configuration options
 */
function initWidget(config: WidgetConfig) {
  // Prevent multiple initializations
  // If widget is already loaded, just log a warning
  if (widgetInstance) {
    console.warn("RAG Suite Widget: Already initialized. Use destroy() first to reinitialize.");
    return;
  }

  // Validate required configuration
  if (!config.projectId) {
    console.error("RAG Suite Widget: projectId is required. Please provide a valid project ID.");
    return;
  }

  // Set API endpoint
  // Use provided endpoint or default to a standard API URL
  API_BASE_URL = config.apiEndpoint || "http://18.159.50.221:8000/api/v1";

  // Create container element
  // This is where the widget will be rendered
  const container = document.createElement("div");
  container.id = "ragsuite-widget-container";
  // Add scoped class to prevent CSS conflicts with host page
  container.className = "ragsuite-widget-root";
  
  // Append to body (widget will be positioned absolutely)
  document.body.appendChild(container);

  // Create React root
  // React 18+ uses createRoot instead of ReactDOM.render
  const root = createRoot(container);

  // Widget wrapper component to manage internal toggle state
  // This is needed because the widget needs to control its own open/close state
  const WidgetWrapper = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Check chatbot activation status - widget should only show if chatbot is active
    const { isActive: isChatbotActive, isLoading: isActivationLoading, activationData } = useChatbotActivation();
    
    const handleToggle = React.useCallback(() => {
      setIsOpen(prev => !prev);
    }, []);
    
    // For embedded widgets (external websites), NEVER use previewOverrides
    // All settings MUST come from the API via BrandingProvider for live updates
    // Static config values are ignored - widget fetches everything from /chatbot/settings API
    // This ensures the widget always matches your RAG Suite website exactly
    
    // Effect to hide/show widget container based on activation status
    React.useEffect(() => {
      const widgetContainer = document.getElementById('ragsuite-widget-container');
      if (widgetContainer) {
        if (!isChatbotActive && !isActivationLoading) {
          // Hide the entire widget container when disabled
          widgetContainer.style.display = 'none';
          widgetContainer.style.visibility = 'hidden';
          widgetContainer.style.opacity = '0';
          widgetContainer.style.pointerEvents = 'none';
          console.log('🚫 RAG Suite Widget: Chatbot is disabled, hiding widget container', {
            isActive: isChatbotActive,
            isLoading: isActivationLoading,
            data: activationData
          });
        } else if (isChatbotActive) {
          // Show the widget container when enabled
          widgetContainer.style.display = 'block';
          widgetContainer.style.visibility = 'visible';
          widgetContainer.style.opacity = '1';
          widgetContainer.style.pointerEvents = 'auto';
          console.log('✅ RAG Suite Widget: Chatbot is enabled, showing widget container');
        }
      }
    }, [isChatbotActive, isActivationLoading, activationData]);
    
    // Don't render widget if chatbot is disabled
    // Show loading state while checking activation status (but only for a short time)
    // After initial load, if status is still loading, assume disabled for safety
    if (isActivationLoading && activationData === undefined) {
      // Only show loading on initial mount - after that, if we don't have data, assume disabled
      return null; // Don't show anything while loading initially
    }
    
    // If chatbot is disabled OR we don't have activation data, don't render the widget
    // This ensures widget only shows when explicitly enabled
    if (!isChatbotActive) {
      return null;
    }
    
    return (
      <EmbeddableWidget
        isOpen={isOpen}
        onToggle={handleToggle}
        title="AI Assistant" // This will be overridden by API settings (chatbotTitle)
        previewOverrides={undefined} // Always undefined for embedded widgets - use API settings only
        onReady={() => {
          console.log("RAG Suite Widget: Ready and initialized");
          // Dispatch custom event so host page can listen
          window.dispatchEvent(new CustomEvent("ragsuite:ready"));
        }}
        onError={(error) => {
          console.error("RAG Suite Widget: Error occurred", error);
          // Dispatch error event
          window.dispatchEvent(
            new CustomEvent("ragsuite:error", { detail: error })
          );
        }}
      />
    );
  };

  // Render the widget component with all necessary providers
  // These providers are required for the widget to work standalone
  root.render(
    <QueryClientProvider client={widgetQueryClient}>
      <AuthProvider>
        <RAGSettingsProvider>
          <BrandingProvider>
            <ThemeProvider>
              <WidgetWrapper />
            </ThemeProvider>
          </BrandingProvider>
        </RAGSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  // Store instance for later cleanup
  widgetInstance = { root, container };

  // Store API config in window for potential use by API client
  // This allows the widget's API calls to use the correct endpoint
  (window as any).RAGSUITE_API_URL = API_BASE_URL;
  (window as any).RAGSUITE_PROJECT_ID = config.projectId;

  console.log("RAG Suite Widget: Initialized successfully", {
    projectId: config.projectId,
    apiEndpoint: API_BASE_URL,
    position: config.position || "bottom-right",
  });
  
  // Debug: Verify widget container is in DOM
  const widgetContainer = document.getElementById("ragsuite-widget-container");
  if (widgetContainer) {
    console.log("✅ Widget container found in DOM:", widgetContainer);
    const triggerButton = widgetContainer.querySelector("#chatbot-trigger");
    if (triggerButton) {
      console.log("✅ Trigger button found:", triggerButton);
      const styles = window.getComputedStyle(triggerButton);
      console.log("Trigger button styles:", {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        position: styles.position,
        bottom: styles.bottom,
        right: styles.right,
      });
    } else {
      console.warn("⚠️ Trigger button not found in widget container");
    }
  } else {
    console.error("❌ Widget container not found in DOM!");
  }
}

/**
 * Destroy Widget
 * 
 * Removes the widget from the page and cleans up React resources.
 * Useful if you need to remove the widget dynamically.
 */
function destroyWidget() {
  if (widgetInstance) {
    // Unmount React component (cleanup)
    widgetInstance.root.unmount();
    // Remove DOM element
    widgetInstance.container.remove();
    // Clear instance
    widgetInstance = null;
    console.log("RAG Suite Widget: Destroyed and removed from page");
    
    // Dispatch destroy event
    window.dispatchEvent(new CustomEvent("ragsuite:destroyed"));
  }
}

/**
 * Expose Widget to Window Object
 * 
 * This makes the widget available globally so the loader script can call it.
 * 
 * Usage:
 * window.RAGSuiteWidget.init({ projectId: "abc123", ... })
 * window.RAGSuiteWidget.destroy()
 */
declare global {
  interface Window {
    RAGSuiteWidget: {
      init: (config: WidgetConfig) => void;
      destroy: () => void;
      version: string;
    };
  }
}

// Make widget available globally
window.RAGSuiteWidget = {
  init: initWidget,
  destroy: destroyWidget,
  version: "1.0.0", // Widget version for tracking
};

