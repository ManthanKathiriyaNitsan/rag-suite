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
  
  console.log('🚀 RAG Suite Search: Loader script started');
  
  // Prevent multiple loads
  if (window.RAGSuiteSearchLoader) {
    console.warn('RAG Suite Search: Loader already initialized');
    return;
  }
  
  window.RAGSuiteSearchLoader = true;
  console.log('✅ RAG Suite Search: Loader marked as initialized');
  
  // Find script tag
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
  
  if (!scriptTag) {
    console.error('❌ RAG Suite Search: Script tag not found. Make sure to include data-ragsuite-project-id attribute.');
    return;
  }
  
  console.log('✅ RAG Suite Search: Script tag found');
  
  // Extract configuration
  const projectId = scriptTag.getAttribute('data-ragsuite-project-id');
  const apiEndpoint = scriptTag.getAttribute('data-api-endpoint') || 
    'http://192.168.0.101:8000/api/v1';
  const widgetVersion = scriptTag.getAttribute('data-version') || 'v1';
  
  // Check for window config
  const windowConfig = window.ragSuiteSearchConfig || {};
  
  // Build configuration
  const config = {
    projectId: projectId || windowConfig.projectId,
    apiEndpoint: apiEndpoint || windowConfig.apiEndpoint,
    position: scriptTag.getAttribute('data-position') || windowConfig.position || 'inline',
    zIndex: parseInt(scriptTag.getAttribute('data-z-index') || String(windowConfig.zIndex || 1), 10),
    primaryColor: scriptTag.getAttribute('data-primary-color') || windowConfig.primaryColor,
    title: scriptTag.getAttribute('data-title') || windowConfig.title,
    welcomeMessage: scriptTag.getAttribute('data-welcome-message') || windowConfig.welcomeMessage,
    orgName: scriptTag.getAttribute('data-org-name') || windowConfig.orgName,
    searchTitle: scriptTag.getAttribute('data-search-title') || windowConfig.searchTitle,
    widgetLogoUrl: scriptTag.getAttribute('data-widget-logo-url') || windowConfig.widgetLogoUrl,
    widgetAvatar: scriptTag.getAttribute('data-widget-avatar') || windowConfig.widgetAvatar,
    widgetShowLogo: scriptTag.getAttribute('data-widget-show-logo') === 'true' || windowConfig.widgetShowLogo,
    widgetShowDateTime: scriptTag.getAttribute('data-widget-show-datetime') === 'true' || windowConfig.widgetShowDateTime,
    widgetBottomSpace: parseInt(scriptTag.getAttribute('data-widget-bottom-space') || String(windowConfig.widgetBottomSpace || 15), 10),
    widgetFontSize: parseInt(scriptTag.getAttribute('data-widget-font-size') || String(windowConfig.widgetFontSize || 16), 10),
    widgetTriggerBorderRadius: parseInt(scriptTag.getAttribute('data-widget-trigger-border-radius') || String(windowConfig.widgetTriggerBorderRadius || 50), 10),
    widgetOffsetX: parseInt(scriptTag.getAttribute('data-widget-offset-x') || String(windowConfig.widgetOffsetX || 20), 10),
    widgetOffsetY: parseInt(scriptTag.getAttribute('data-widget-offset-y') || String(windowConfig.widgetOffsetY || 20), 10),
    // Inline insertion: insert widget where script tag is or in specified container
    insertAfter: scriptTag.getAttribute('data-insert-after') === 'true' || windowConfig.insertAfter || true,
    containerSelector: scriptTag.getAttribute('data-container') || windowConfig.containerSelector || null,
  };
  
  if (!config.projectId) {
    console.error('❌ RAG Suite Search: projectId is required. Please provide a valid project ID.');
    return;
  }
  
  // Load CSS first
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
  };
  document.head.appendChild(widgetCSS);
  
  // Load widget bundle
  const widgetScript = document.createElement('script');
  widgetScript.src = `${config.apiEndpoint}/search-widget/${widgetVersion}/search-widget.umd.js`;
  widgetScript.async = true;
  widgetScript.crossOrigin = 'anonymous';
  console.log('📦 RAG Suite Search: Loading widget bundle from:', widgetScript.src);
  
  widgetScript.onload = function() {
    console.log('✅ RAG Suite Search: Widget bundle loaded successfully');
    if (window.RAGSuiteSearchWidget && window.RAGSuiteSearchWidget.init) {
      console.log('✅ RAG Suite Search: RAGSuiteSearchWidget found on window object');
      try {
        window.RAGSuiteSearchWidget.init(config);
        console.log('✅ RAG Suite Search: Widget initialized successfully');
      } catch (error) {
        console.error('❌ RAG Suite Search: Failed to initialize widget', error);
      }
    } else {
      console.error('❌ RAG Suite Search: Widget script loaded but RAGSuiteSearchWidget not found on window object');
    }
  };
  
  widgetScript.onerror = function() {
    console.error('❌ RAG Suite Search: Failed to load widget script from', widgetScript.src);
    console.error('Possible issues:');
    console.error('  1. Backend not serving files from /api/v1/search-widget/v1/');
    console.error('  2. Files not copied to backend static directory');
    console.error('  3. CORS issues preventing script load');
    console.error('  4. Network connectivity issues');
  };
  
  document.head.appendChild(widgetScript);
  
  console.log('RAG Suite Search: Loader initialized, loading widget...', {
    projectId: config.projectId,
    apiEndpoint: config.apiEndpoint,
    version: widgetVersion
  });
})();

