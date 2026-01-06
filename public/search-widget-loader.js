/**
 * RAG SUITE SEARCH WIDGET LOADER
 * 
 * This is the loader script that users add to their website for the search widget.
 * It's a small JavaScript file that:
 * 1. Reads configuration from script tag attributes
 * 2. Loads the search widget bundle (search-widget.umd.js)
 * 3. Loads search widget CSS (search-widget.css)
 * 4. Initializes the search widget with the configuration
 * 
 * HOW TO USE:
 * 
 * Basic:
 * <script src="https://api.yoursite.com/search-widget/v1/loader.js" 
 *         data-ragsuite-project-id="your-project-id" 
 *         async></script>
 * 
 * Advanced:
 * <script>
 *   window.ragSuiteSearchConfig = { projectId: "abc123", position: "bottom-right" };
 * </script>
 * <script src="https://api.yoursite.com/search-widget/v1/loader.js" async></script>
 */

(function() {
  'use strict';
  
  // Log that loader script is executing
  console.log('🚀 RAG Suite Search: Loader script started');
  
  /**
   * PREVENT MULTIPLE LOADS
   * 
   * If loader is already initialized, don't run again.
   * This prevents duplicate widgets on the page.
   */
  if (window.RAGSuiteSearchLoader) {
    console.warn('RAG Suite Search: Loader already initialized');
    return;
  }
  
  // Mark loader as initialized
  window.RAGSuiteSearchLoader = true;
  console.log('✅ RAG Suite Search: Loader marked as initialized');
  
  /**
   * FIND SCRIPT TAG
   * 
   * We need to find the script tag that loaded this file.
   * This allows us to read configuration from data attributes.
   */
  const scriptTag = document.currentScript || 
    (function() {
      // Fallback: search all scripts for the one with data-ragsuite-project-id
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].getAttribute('data-ragsuite-project-id')) {
          return scripts[i];
        }
      }
      return null;
    })();
  
  // If we can't find the script tag, show error
  if (!scriptTag) {
    console.error('❌ RAG Suite Search: Script tag not found. Make sure to include data-ragsuite-project-id attribute.');
    return;
  }
  
  console.log('✅ RAG Suite Search: Script tag found');
  
  /**
   * EXTRACT CONFIGURATION FROM SCRIPT TAG ATTRIBUTES
   * 
   * Users can configure the widget using data attributes:
   * - data-ragsuite-project-id: Required project ID
   * - data-api-endpoint: API server URL
   * - data-position: Widget position
   * - data-z-index: Z-index value
   * - etc.
   */
  const projectId = scriptTag.getAttribute('data-ragsuite-project-id');
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || 
    'http://192.168.0.101:8000/api/v1'; // Default API endpoint
  const widgetVersion = scriptTag.getAttribute('data-version') || 'v1';
  
  /**
   * CHECK FOR WINDOW CONFIG (ALTERNATIVE METHOD)
   * 
   * Users can also set configuration in window.ragSuiteSearchConfig
   * This takes precedence over data attributes.
   * 
   * Example:
   * <script>
   *   window.ragSuiteSearchConfig = {
   *     projectId: 'abc123',
   *     position: 'bottom-right',
   *     primaryColor: '#007bff'
   *   };
   * </script>
   */
  const windowConfig = window.ragSuiteSearchConfig || {};
  
  /**
   * MERGE CONFIGURATIONS
   * 
   * Combine window config and data attributes.
   * Window config takes precedence (allows override).
   */
  const config = {
    // Required: Project ID for authentication
    projectId: windowConfig.projectId || projectId,
    
    // API endpoint for making requests
    apiEndpoint: windowConfig.apiEndpoint || apiEndpoint,
    
    // Widget position on page
    position: windowConfig.position || scriptTag.getAttribute('data-position') || 'bottom-right',
    
    // Z-index (how high widget appears)
    zIndex: windowConfig.zIndex || parseInt(scriptTag.getAttribute('data-z-index') || '99999', 10),
    
    // Primary color for branding
    primaryColor: windowConfig.primaryColor || scriptTag.getAttribute('data-primary-color'),
    
    // Widget title
    title: windowConfig.title || scriptTag.getAttribute('data-title'),
    
    // Welcome message
    welcomeMessage: windowConfig.welcomeMessage || scriptTag.getAttribute('data-welcome-message'),
    
    // Organization name
    orgName: windowConfig.orgName || scriptTag.getAttribute('data-org-name'),
    
    // Search widget title
    searchTitle: windowConfig.searchTitle || scriptTag.getAttribute('data-search-title'),
    
    // Logo URL
    widgetLogoUrl: windowConfig.widgetLogoUrl || scriptTag.getAttribute('data-logo-url'),
    
    // Avatar URL
    widgetAvatar: windowConfig.widgetAvatar || scriptTag.getAttribute('data-avatar'),
    
    // Show logo (boolean)
    widgetShowLogo: windowConfig.widgetShowLogo !== undefined ? windowConfig.widgetShowLogo : 
      scriptTag.getAttribute('data-show-logo') === 'true',
    
    // Show date/time (boolean)
    widgetShowDateTime: windowConfig.widgetShowDateTime !== undefined ? windowConfig.widgetShowDateTime : 
      scriptTag.getAttribute('data-show-datetime') === 'true',
    
    // Bottom spacing (pixels)
    widgetBottomSpace: windowConfig.widgetBottomSpace || 
      parseInt(scriptTag.getAttribute('data-bottom-space') || '20', 10),
    
    // Font size (pixels)
    widgetFontSize: windowConfig.widgetFontSize || 
      parseInt(scriptTag.getAttribute('data-font-size') || '14', 10),
    
    // Border radius (pixels)
    widgetTriggerBorderRadius: windowConfig.widgetTriggerBorderRadius || 
      parseInt(scriptTag.getAttribute('data-border-radius') || '50', 10),
    
    // Horizontal offset (pixels)
    widgetOffsetX: windowConfig.widgetOffsetX || 
      parseInt(scriptTag.getAttribute('data-offset-x') || '20', 10),
    
    // Vertical offset (pixels)
    widgetOffsetY: windowConfig.widgetOffsetY || 
      parseInt(scriptTag.getAttribute('data-offset-y') || '20', 10),
  };
  
  /**
   * VALIDATE CONFIGURATION
   * 
   * Project ID is required for the widget to work.
   */
  if (!config.projectId) {
    console.error('RAG Suite Search: projectId is required. Add data-ragsuite-project-id attribute to script tag or set window.ragSuiteSearchConfig.projectId');
    return;
  }
  
  /**
   * LOAD SEARCH WIDGET CSS
   * 
   * Load the search widget stylesheet first.
   * This ensures styles are available when widget renders.
   */
  const widgetCSS = document.createElement('link');
  widgetCSS.rel = 'stylesheet';
  widgetCSS.href = `${config.apiEndpoint}/search-widget/${widgetVersion}/search-widget.css`;
  console.log('📦 RAG Suite Search: Loading CSS from:', widgetCSS.href);
  widgetCSS.onload = function() {
    console.log('✅ RAG Suite Search: CSS loaded successfully');
  };
  widgetCSS.onerror = function() {
    console.error('❌ RAG Suite Search: Failed to load widget CSS from', widgetCSS.href);
    console.warn('RAG Suite Search: Widget may still work but styling may be incomplete');
    console.warn('Check that search-widget.css is available at:', widgetCSS.href);
  };
  document.head.appendChild(widgetCSS);
  
  /**
   * LOAD SEARCH WIDGET BUNDLE
   * 
   * Load the main search widget JavaScript file.
   * This contains React, the search widget component, and all dependencies.
   */
  const widgetScript = document.createElement('script');
  widgetScript.src = `${config.apiEndpoint}/search-widget/${widgetVersion}/search-widget.umd.js`;
  widgetScript.async = true; // Load asynchronously (don't block page)
  widgetScript.crossOrigin = 'anonymous'; // Allow CORS if needed
  console.log('📦 RAG Suite Search: Loading widget bundle from:', widgetScript.src);
  
  /**
   * HANDLE SEARCH WIDGET SCRIPT LOAD SUCCESS
   * 
   * When widget bundle loads, initialize the search widget.
   */
  widgetScript.onload = function() {
    console.log('✅ RAG Suite Search: Widget bundle loaded successfully');
    // Check if search widget is available
    if (window.RAGSuiteSearchWidget && window.RAGSuiteSearchWidget.init) {
      console.log('✅ RAG Suite Search: RAGSuiteSearchWidget found on window object');
      try {
        // Initialize search widget with configuration
        window.RAGSuiteSearchWidget.init(config);
        console.log('✅ RAG Suite Search: Widget initialized successfully');
      } catch (error) {
        console.error('❌ RAG Suite Search: Failed to initialize widget', error);
        console.error('Error details:', error.message, error.stack);
      }
    } else {
      console.error('❌ RAG Suite Search: Widget script loaded but RAGSuiteSearchWidget not found on window object');
      console.error('Available window properties:', Object.keys(window).filter(k => k.includes('RAG')));
      console.error('Check if search-widget.umd.js loaded correctly and exports RAGSuiteSearchWidget');
    }
  };
  
  /**
   * HANDLE SEARCH WIDGET SCRIPT LOAD ERROR
   * 
   * If widget fails to load, show error message.
   */
  widgetScript.onerror = function() {
    console.error('❌ RAG Suite Search: Failed to load widget script from', widgetScript.src);
    console.error('❌ RAG Suite Search: Check that the widget files are available at the specified endpoint');
    console.error('Possible issues:');
    console.error('  1. Backend not serving files from /api/v1/search-widget/v1/');
    console.error('  2. Files not copied to backend static directory');
    console.error('  3. CORS issues preventing script load');
    console.error('  4. Network connectivity issues');
  };
  
  /**
   * ADD SCRIPT TO PAGE
   * 
   * Append the script tag to <head> to start loading.
   */
  document.head.appendChild(widgetScript);
  
  console.log('RAG Suite Search: Loader initialized, loading widget...', {
    projectId: config.projectId,
    apiEndpoint: config.apiEndpoint,
    version: widgetVersion
  });
})();

