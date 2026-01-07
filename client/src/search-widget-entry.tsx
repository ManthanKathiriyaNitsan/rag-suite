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
 */
interface SearchWidgetConfig {
  projectId: string;
  apiEndpoint?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "inline" | "fixed" | "center";
  zIndex?: number;
  primaryColor?: string;
  title?: string;
  welcomeMessage?: string;
  orgName?: string;
  searchTitle?: string;
  widgetLogoUrl?: string;
  widgetAvatar?: string;
  widgetShowLogo?: boolean;
  widgetShowDateTime?: boolean;
  widgetBottomSpace?: number;
  widgetFontSize?: number;
  widgetTriggerBorderRadius?: number;
  widgetOffsetX?: number;
  widgetOffsetY?: number;
  insertAfter?: boolean;
  containerSelector?: string | null;
}

/**
 * Global Search Widget Instance
 */
let searchWidgetInstance: {
  root: any;
  container: HTMLElement;
} | null = null;

/**
 * API Base URL
 */
let API_BASE_URL = "";

/**
 * Initialize Search Widget
 */
function initSearchWidget(config: SearchWidgetConfig) {
  if (searchWidgetInstance) {
    console.warn("RAG Suite Search Widget: Already initialized. Use destroy() first to reinitialize.");
    return;
  }

  if (!config.projectId) {
    console.error("RAG Suite Search Widget: projectId is required. Please provide a valid project ID.");
    return;
  }

  API_BASE_URL = config.apiEndpoint || "http://192.168.0.101:8000/api/v1";

  // Insert widget inline where script tag is (or in specified container)
  const scriptTag = document.currentScript || 
    (function() {
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].getAttribute('data-ragsuite-project-id')) {
          return scripts[i];
        }
      }
      return null;
    })();

  // Set RAGSUITE_PROJECT_ID BEFORE creating container so widget mode is detected
  (window as any).RAGSUITE_PROJECT_ID = config.projectId;
  (window as any).RAGSUITE_API_ENDPOINT = config.apiEndpoint;

  const container = document.createElement("div");
  container.id = "ragsuite-search-widget-container";
  container.className = "ragsuite-search-widget-root";
  
  // Make container visible immediately - NO PADDING
  container.style.display = 'block';
  container.style.visibility = 'visible';
  container.style.opacity = '1';
  container.style.minHeight = '100px';
  container.style.width = '100%';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.border = 'none';
  container.style.backgroundColor = 'transparent';
  
  console.log('📦 Creating widget container', {
    id: container.id,
    className: container.className,
    projectId: config.projectId
  });
  
  // Insert inline: after script tag or in specified container
  if (config.containerSelector) {
    const targetContainer = document.querySelector(config.containerSelector);
    if (targetContainer) {
      targetContainer.appendChild(container);
      console.log('✅ Container inserted into:', config.containerSelector);
    } else {
      // Fallback: insert after script tag
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.insertBefore(container, scriptTag.nextSibling);
        console.log('✅ Container inserted after script tag');
      } else {
        document.body.appendChild(container);
        console.log('✅ Container appended to body (fallback)');
      }
    }
  } else if (scriptTag && scriptTag.parentNode && (config as any).insertAfter !== false) {
    // Insert right after the script tag (inline)
    // If script tag is in head, append to body instead
    if (scriptTag.parentNode === document.head) {
      // Wait for body to be ready
      if (document.body) {
        document.body.appendChild(container);
        console.log('✅ Container appended to body (script in head)');
      } else {
        // If body not ready, wait for DOMContentLoaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            if (document.body) {
              document.body.appendChild(container);
              console.log('✅ Container appended to body (after DOMContentLoaded)');
            }
          });
        } else {
          // TypeScript workaround: use explicit check
          const bodyElement = document.body as HTMLBodyElement | null;
          if (bodyElement) {
            bodyElement.appendChild(container);
            console.log('✅ Container appended to body (script in head, body ready)');
          }
        }
      }
      // Ensure container is visible - add temporary debug styling
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      container.style.minHeight = '200px';
      container.style.width = '100%';
      container.style.position = 'relative';
      // No debug styling - clean container
      container.style.border = 'none';
      container.style.backgroundColor = 'transparent';
      container.style.padding = '0';
    } else {
      scriptTag.parentNode.insertBefore(container, scriptTag.nextSibling);
      console.log('✅ Container inserted after script tag (inline)');
    }
  } else {
    // Fallback: append to body
    if (document.body) {
      document.body.appendChild(container);
      console.log('✅ Container appended to body (final fallback)');
    } else {
      // Wait for body
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
  document.body.appendChild(container);
            console.log('✅ Container appended to body (after DOMContentLoaded fallback)');
          }
        });
      } else {
        // TypeScript workaround: use explicit check
        const bodyElement = document.body as HTMLBodyElement | null;
        if (bodyElement) {
          bodyElement.appendChild(container);
          console.log('✅ Container appended to body (fallback, body ready)');
        }
      }
    }
  }

  // Verify container is in DOM and add test content
  const containerInDOM = document.getElementById('ragsuite-search-widget-container');
  if (containerInDOM) {
    console.log('✅ Container verified in DOM', {
      parentNode: containerInDOM.parentNode?.nodeName,
      display: window.getComputedStyle(containerInDOM).display,
      visibility: window.getComputedStyle(containerInDOM).visibility,
      opacity: window.getComputedStyle(containerInDOM).opacity,
      height: window.getComputedStyle(containerInDOM).height,
      width: window.getComputedStyle(containerInDOM).width
    });
    
    // Add temporary test content to verify container is visible
    const testDiv = document.createElement('div');
    testDiv.id = 'ragsuite-widget-test';
    testDiv.style.cssText = 'background: yellow; color: black; padding: 10px; margin: 10px 0; border: 2px solid orange; font-weight: bold; z-index: 999999; position: relative;';
    testDiv.textContent = '🔴 TEST: If you see this, the container exists! Widget should render below...';
    containerInDOM.appendChild(testDiv);
    console.log('🔴 DEBUG: Added test div to container');
    
    // Force container to be visible with high z-index and important styles
    containerInDOM.style.cssText += 'position: relative !important; z-index: 999999 !important; display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px !important; width: 100% !important;';
    console.log('🔴 DEBUG: Forced container visibility with inline styles');
  } else {
    console.error('❌ Container NOT found in DOM after insertion!');
  }

  // Add a simple fallback HTML element to ensure something is visible
  const fallbackDiv = document.createElement('div');
  fallbackDiv.id = 'ragsuite-widget-fallback';
  fallbackDiv.style.cssText = 'background: #f0f0f0; border: 2px solid #333; padding: 20px; margin: 20px 0; min-height: 200px;';
  fallbackDiv.innerHTML = '<h3 style="margin:0 0 10px 0;">RAG Suite Search Widget</h3><p style="margin:0; color:#666;">Loading search widget...</p>';
  container.appendChild(fallbackDiv);
  console.log('🔴 DEBUG: Added fallback HTML element to container');

  const root = createRoot(container);

  const onReadyCallback = () => {
    console.log("RAG Suite Search Widget: Ready and initialized");
    // Remove fallback when widget is ready
    const fallback = document.getElementById('ragsuite-widget-fallback');
    if (fallback) {
      fallback.remove();
      console.log('🔴 DEBUG: Removed fallback element - widget should be visible now');
    }
    window.dispatchEvent(new CustomEvent("ragsuite-search:ready"));
  };
  
  const onErrorCallback = (error: any) => {
    console.error("RAG Suite Search Widget: Error occurred", error);
    window.dispatchEvent(
      new CustomEvent("ragsuite-search:error", { detail: error })
    );
  };
  
  const SearchWidgetWrapper = React.memo(() => {
    // Widget is always open by default - no toggle needed
    const [isOpen] = React.useState(true);
    
    const { isActive: isSearchActive, isLoading: isActivationLoading, activationData } = useSearchActivation();
    
    // No toggle function needed - widget is always visible
    const handleToggle = React.useCallback(() => {
      // Do nothing - widget stays open
    }, []);
    
    // Check widget mode - should be true since we set RAGSUITE_PROJECT_ID before creating container
    const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
    
    console.log('🔍 SearchWidgetWrapper render', {
      isWidgetMode,
      projectId: (window as any).RAGSUITE_PROJECT_ID,
      isSearchActive,
      isActivationLoading,
      hasActivationData: !!activationData
    });
    
    React.useEffect(() => {
      const widgetContainer = document.getElementById('ragsuite-search-widget-container');
      if (widgetContainer) {
        // In widget mode, always show the widget (default to active)
        if (isWidgetMode) {
          widgetContainer.style.display = 'block';
          widgetContainer.style.visibility = 'visible';
          widgetContainer.style.opacity = '1';
          widgetContainer.style.pointerEvents = 'auto';
          widgetContainer.style.minHeight = '100px'; // Ensure it has height
          widgetContainer.style.width = '100%'; // Ensure it has width
          console.log('✅ Widget container made visible in widget mode', {
            display: widgetContainer.style.display,
            visibility: widgetContainer.style.visibility,
            opacity: widgetContainer.style.opacity,
            minHeight: widgetContainer.style.minHeight
          });
        } else if (!isSearchActive && !isActivationLoading) {
          widgetContainer.style.display = 'none';
          widgetContainer.style.visibility = 'hidden';
          widgetContainer.style.opacity = '0';
          widgetContainer.style.pointerEvents = 'none';
        } else if (isSearchActive) {
          widgetContainer.style.display = 'block';
          widgetContainer.style.visibility = 'visible';
          widgetContainer.style.opacity = '1';
          widgetContainer.style.pointerEvents = 'auto';
        }
      } else {
        console.warn('⚠️ Widget container not found');
      }
    }, [isSearchActive, isActivationLoading, activationData, isWidgetMode]);
    
    // In widget mode, ALWAYS render the widget - no conditions
    // This ensures the widget is always visible when embedded
    if (isWidgetMode) {
      console.log('✅ Widget mode: Rendering widget (always visible)', {
        projectId: (window as any).RAGSUITE_PROJECT_ID,
        isWidgetMode: true,
        timestamp: new Date().toISOString()
      });
      // Always render in widget mode - don't check anything else
      // Remove fallback element when rendering
      React.useEffect(() => {
        const fallback = document.getElementById('ragsuite-widget-fallback');
        if (fallback) {
          fallback.remove();
          console.log('🔴 DEBUG: Removed fallback element in useEffect');
        }
      }, []);
      
      return (
        <EmbeddableSearchWidget
          isOpen={isOpen}
          onToggle={handleToggle}
          onReady={onReadyCallback}
          onError={onErrorCallback}
        />
      );
    }
    
    // Not in widget mode - check activation status
    if (!isSearchActive) {
      console.log('⚠️ Not in widget mode and search not active, returning null');
      return null;
    }
    
    if (isActivationLoading && activationData === undefined) {
      console.log('⚠️ Activation loading, returning null');
      return null;
    }
    
    console.log('✅ Rendering EmbeddableSearchWidget component', {
      isOpen,
      isWidgetMode,
      projectId: (window as any).RAGSUITE_PROJECT_ID    
    });
    return (
      <EmbeddableSearchWidget
        isOpen={isOpen}
        onToggle={handleToggle}
        onReady={onReadyCallback}
        onError={onErrorCallback}
      />
    );
  });

  // Render with error boundary to catch any rendering errors
  console.log('🔴 DEBUG: About to render React root', {
    containerId: container.id,
    containerInDOM: !!container.parentNode,
    hasRoot: !!root
  });
  
  try {
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
    console.log('✅ React root rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React root:', error);
    // Show error in fallback
    const fallback = document.getElementById('ragsuite-widget-fallback');
    if (fallback) {
      fallback.innerHTML = '<h3 style="margin:0 0 10px 0; color:red;">Error Loading Widget</h3><p style="margin:0; color:#666;">' + (error as Error).message + '</p>';
    }
  }

  searchWidgetInstance = { root, container };

  (window as any).RAGSUITE_API_URL = API_BASE_URL;
  // RAGSUITE_PROJECT_ID is already set above before container creation

  console.log("RAG Suite Search Widget: Initialized successfully", {
    projectId: config.projectId,
    apiEndpoint: API_BASE_URL,
    position: config.position || "inline",
  });
}

/**
 * Destroy Search Widget
 */
function destroySearchWidget() {
  if (searchWidgetInstance) {
    searchWidgetInstance.root.unmount();
    searchWidgetInstance.container.remove();
    searchWidgetInstance = null;
    console.log("RAG Suite Search Widget: Destroyed and removed from page");
    window.dispatchEvent(new CustomEvent("ragsuite-search:destroyed"));
  }
}

/**
 * Expose Search Widget to Window Object
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

window.RAGSuiteSearchWidget = {
  init: initSearchWidget,
  destroy: destroySearchWidget,
  version: "1.0.0",
};

