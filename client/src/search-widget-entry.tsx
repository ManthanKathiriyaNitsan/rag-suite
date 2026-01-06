/**
 * SEARCH WIDGET ENTRY POINT
 * 
 * This is the standalone entry point for the embeddable search widget.
 * When the widget bundle loads, this file initializes the React search widget
 * and exposes it to the window object.
 * 
 * How it works:
 * 1. User adds <script> tag to their website
 * 2. Script loads search-widget.umd.js (this file bundled)
 * 3. This file creates React root and renders EmbeddableSearchWidget
 * 4. Search widget appears on the page
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmbeddableSearchWidget } from "./components/common/EmbeddableSearchWidget";
import { RAGSettingsProvider } from "./contexts/RAGSettingsContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CitationFormattingProvider } from "./contexts/CitationFormattingContext";
import { useSearchActivation } from "./hooks/useSearchActivation";
import "./components/common/EmbeddableSearchWidgetStyles.css";

/**
 * Create a standalone QueryClient for the search widget
 * This is separate from the main app's QueryClient
 */
const searchWidgetQueryClient = new QueryClient({
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
 * Search Widget Configuration Interface
 * 
 * This defines what options users can pass when initializing the search widget.
 * All fields are optional except projectId (required for API authentication).
 */
interface SearchWidgetConfig {
  // REQUIRED: Unique identifier for this widget instance (project ID)
  // Used to authenticate API requests and track usage
  projectId: string;
  
  // API endpoint - where to send search requests
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
  
  // Search widget title
  searchTitle?: string;
  
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
 * Global Search Widget Instance
 * 
 * Stores the React root and container element.
 * Used to prevent multiple initializations and allow cleanup.
 */
let searchWidgetInstance: {
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
 * Initialize Search Widget
 * 
 * This function:
 * 1. Creates a container element in the page
 * 2. Creates a React root
 * 3. Renders the EmbeddableSearchWidget component
 * 4. Sets up API configuration
 * 
 * @param config - Search widget configuration options
 */
function initSearchWidget(config: SearchWidgetConfig) {
  // Prevent multiple initializations
  // If widget is already loaded, just log a warning
  if (searchWidgetInstance) {
    console.warn("RAG Suite Search Widget: Already initialized. Use destroy() first to reinitialize.");
    return;
  }

  // Validate required configuration
  if (!config.projectId) {
    console.error("RAG Suite Search Widget: projectId is required. Please provide a valid project ID.");
    return;
  }

  // Set API endpoint
  // Use provided endpoint or default to a standard API URL
  API_BASE_URL = config.apiEndpoint || "http://192.168.0.101:8000/api/v1";

  // Create container element
  // This is where the widget will be rendered
  const container = document.createElement("div");
  container.id = "ragsuite-search-widget-container";
  // Add scoped class to prevent CSS conflicts with host page
  container.className = "ragsuite-search-widget-root";
  
  // Append to body (widget will be positioned absolutely)
  document.body.appendChild(container);

  // Create React root
  // React 18+ uses createRoot instead of ReactDOM.render
  const root = createRoot(container);

  // Search widget wrapper component to manage internal toggle state
  // Define callbacks as regular functions (not hooks) since they're stable and don't need memoization
  const onReadyCallback = () => {
    console.log("RAG Suite Search Widget: Ready and initialized");
    // Dispatch custom event so host page can listen
    window.dispatchEvent(new CustomEvent("ragsuite-search:ready"));
  };
  
  const onErrorCallback = (error: any) => {
    console.error("RAG Suite Search Widget: Error occurred", error);
    // Dispatch error event
    window.dispatchEvent(
      new CustomEvent("ragsuite-search:error", { detail: error })
    );
  };
  
  const SearchWidgetWrapper = React.memo(() => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Check search activation status - widget should only show if search is active
    const { isActive: isSearchActive, isLoading: isActivationLoading, activationData } = useSearchActivation();
    
    const handleToggle = React.useCallback(() => {
      setIsOpen(prev => !prev);
    }, []);
    
    // Effect to hide/show widget container based on activation status
    React.useEffect(() => {
      const widgetContainer = document.getElementById('ragsuite-search-widget-container');
      if (widgetContainer) {
        if (!isSearchActive && !isActivationLoading) {
          // Hide the entire widget container when disabled
          widgetContainer.style.display = 'none';
          widgetContainer.style.visibility = 'hidden';
          widgetContainer.style.opacity = '0';
          widgetContainer.style.pointerEvents = 'none';
          console.log('🚫 RAG Suite Search Widget: Search is disabled, hiding widget container', {
            isActive: isSearchActive,
            isLoading: isActivationLoading,
            data: activationData
          });
        } else if (isSearchActive) {
          // Show the widget container when enabled
          widgetContainer.style.display = 'block';
          widgetContainer.style.visibility = 'visible';
          widgetContainer.style.opacity = '1';
          widgetContainer.style.pointerEvents = 'auto';
          console.log('✅ RAG Suite Search Widget: Search is enabled, showing widget container');
        }
      }
    }, [isSearchActive, isActivationLoading, activationData]);
    
    // In widget mode, show widget by default if activation status can't be determined
    // Only hide if we explicitly know search is disabled
    const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
    
    // Don't render widget if search is explicitly disabled
    // In widget mode, if we're still loading or have an error, show the widget by default
    // This ensures widget works even if activation endpoint doesn't exist or fails
    if (!isSearchActive) {
      // Only hide if we explicitly know it's disabled (is_active: false from API)
      // In widget mode, if loading or error, we default to showing (isActive = true)
      // So if isSearchActive is false here, it means API explicitly returned false
      console.log('🚫 RAG Suite Search Widget: Search is explicitly disabled, not rendering widget');
      return null;
    }
    
    // If we're still loading in widget mode, show the widget anyway (default to active)
    // This prevents the widget from being hidden during the initial API call
    if (isActivationLoading && activationData === undefined && !isWidgetMode) {
      // Only hide during loading in main app mode
      return null;
    }
    
    // For embedded widgets (external websites), NEVER use previewOverrides
    // All settings MUST come from the API via BrandingProvider for live updates
    // Static config values are ignored - widget fetches everything from API
    
    return (
      <EmbeddableSearchWidget
        isOpen={isOpen}
        onToggle={handleToggle}
        title="Search Assistant" // This will be overridden by API settings
        previewOverrides={undefined} // Always undefined for embedded widgets - use API settings only
        onReady={onReadyCallback}
        onError={onErrorCallback}
      />
    );
  });

  // Render the widget component with all necessary providers
  // These providers are required for the widget to work standalone
  root.render(
    <QueryClientProvider client={searchWidgetQueryClient}>
      <AuthProvider>
        <RAGSettingsProvider>
          <BrandingProvider>
            <ThemeProvider>
              <CitationFormattingProvider>
                <SearchWidgetWrapper />
              </CitationFormattingProvider>
            </ThemeProvider>
          </BrandingProvider>
        </RAGSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  // Store instance for later cleanup
  searchWidgetInstance = { root, container };

  // Store API config in window for potential use by API client
  // This allows the widget's API calls to use the correct endpoint
  (window as any).RAGSUITE_API_URL = API_BASE_URL;
  (window as any).RAGSUITE_PROJECT_ID = config.projectId;

  console.log("RAG Suite Search Widget: Initialized successfully", {
    projectId: config.projectId,
    apiEndpoint: API_BASE_URL,
    position: config.position || "bottom-right",
  });
  
  // Debug: Verify widget container is in DOM
  // Use setTimeout to allow React to render first
  setTimeout(() => {
    const widgetContainer = document.getElementById("ragsuite-search-widget-container");
    if (widgetContainer) {
      console.log("✅ Search widget container found in DOM:", widgetContainer);
      const triggerButton = widgetContainer.querySelector("#search-widget-trigger");
      if (triggerButton) {
        console.log("✅ Search trigger button found:", triggerButton);
        const styles = window.getComputedStyle(triggerButton as HTMLElement);
        console.log("Search trigger button styles:", {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
          bottom: styles.bottom,
          right: styles.right,
        });
      } else {
        console.warn("⚠️ Search trigger button not found in widget container");
        console.warn("Widget container HTML:", widgetContainer.innerHTML.substring(0, 200));
      }
    } else {
      console.error("❌ Search widget container not found in DOM!");
    }
  }, 100);
}

/**
 * Destroy Search Widget
 * 
 * Removes the widget from the page and cleans up React resources.
 * Useful if you need to remove the widget dynamically.
 */
function destroySearchWidget() {
  if (searchWidgetInstance) {
    // Unmount React component (cleanup)
    searchWidgetInstance.root.unmount();
    // Remove DOM element
    searchWidgetInstance.container.remove();
    // Clear instance
    searchWidgetInstance = null;
    console.log("RAG Suite Search Widget: Destroyed and removed from page");
    
    // Dispatch destroy event
    window.dispatchEvent(new CustomEvent("ragsuite-search:destroyed"));
  }
}

/**
 * Expose Search Widget to Window Object
 * 
 * This makes the widget available globally so the loader script can call it.
 * 
 * Usage:
 * window.RAGSuiteSearchWidget.init({ projectId: "abc123", ... })
 * window.RAGSuiteSearchWidget.destroy()
 */
declare global {
  interface Window {
    RAGSuiteSearchWidget: {
      init: (config: SearchWidgetConfig) => void;
      destroy: () => void;
      version: string;
    };
  }
}

// Make search widget available globally
window.RAGSuiteSearchWidget = {
  init: initSearchWidget,
  destroy: destroySearchWidget,
  version: "1.0.0", // Widget version for tracking
};

