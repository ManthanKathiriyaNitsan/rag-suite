import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LayoutState = {
  components: {
    buttonRadius: string;
    inputRadius: string;
    cardRadius: string;
    modalRadius: string;
  };
  version: number;
};

const LAYOUT_SCHEMA_VERSION = 2;

const DEFAULT_LAYOUT: LayoutState = {
  components: {
    buttonRadius: "2px",
    inputRadius: "2px",
    cardRadius: "2px",
    modalRadius: "2px",
  },
  version: LAYOUT_SCHEMA_VERSION,
};

const LOCAL_STORAGE_KEY = "layout";

export type LayoutContextType = LayoutState & {
  setLayout: (updates: Partial<LayoutState>) => void;
  resetLayout: () => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayoutState] = useState<LayoutState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LayoutState>;
        // If schema version mismatches or missing, reset to new defaults
        if (parsed.version !== LAYOUT_SCHEMA_VERSION) {
          return DEFAULT_LAYOUT;
        }

        const result: LayoutState = {
          components: {
            buttonRadius: parsed.components?.buttonRadius ?? DEFAULT_LAYOUT.components.buttonRadius,
            inputRadius: parsed.components?.inputRadius ?? DEFAULT_LAYOUT.components.inputRadius,
            cardRadius: parsed.components?.cardRadius ?? DEFAULT_LAYOUT.components.cardRadius,
            modalRadius: parsed.components?.modalRadius ?? DEFAULT_LAYOUT.components.modalRadius,
          },
          version: LAYOUT_SCHEMA_VERSION,
        };
        return result;
      }
    } catch (error) {
      console.error('LayoutContext: Error loading from localStorage:', error);
    }
    return DEFAULT_LAYOUT;
  });

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        ...layout,
        version: LAYOUT_SCHEMA_VERSION,
      }));
      // Layout saved to localStorage
    } catch (error) {
      console.error('LayoutContext: Error saving to localStorage:', error);
    }
  }, [layout]);

  // Apply layout globally via CSS variables and CSS classes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply component variables to CSS custom properties
    Object.entries(layout.components).forEach(([key, value]) => {
      root.style.setProperty(`--component-${key}`, value);
      console.log(`LayoutContext: Set CSS variable --component-${key} to ${value}`);
    });
    
    // Create or update global CSS styles for all components
    const updateGlobalStyles = () => {
      // Remove existing style element if it exists
      const existingStyle = document.getElementById('layout-global-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      console.log('LayoutContext: Creating global styles with:', layout.components);
      
      // Create new style element with global styles
      const style = document.createElement('style');
      style.id = 'layout-global-styles';
      style.textContent = `
        /* Global Button Styles */
        button, [type="button"], [type="submit"], [type="reset"], .btn {
          border-radius: ${layout.components.buttonRadius} !important;
        }
        
        /* Global Input Styles */
        input, textarea, select, .input {
          border-radius: ${layout.components.inputRadius} !important;
        }
        
        /* Global Card Styles */
        [class*="card"], .card, [data-card], .Card, [class*="Card"], .shadcn-card {
          border-radius: ${layout.components.cardRadius} !important;
        }
        
        /* Global Modal Styles */
        [class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"] {
          border-radius: ${layout.components.modalRadius} !important;
        }
        
        /* Desktop Modal Styles - Apply proper radius on larger screens */
        @media (min-width: 640px) {
          [class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"] {
            border-radius: ${layout.components.modalRadius} !important;
          }
        }
        
        /* Force Switch components to always be circular */
        button[data-state="checked"],
        button[data-state="unchecked"],
        button.peer {
          border-radius: 9999px !important;
        }
      `;
      
      document.head.appendChild(style);
      console.log('LayoutContext: Global styles applied');
    };
    
    // Apply styles immediately
    updateGlobalStyles();
    
    // Also apply directly to existing elements for immediate effect
    const applyToExistingElements = () => {
      const allButtons = document.querySelectorAll('button:not([data-state="checked"]):not([data-state="unchecked"]):not(.peer), [type="button"], [type="submit"], [type="reset"], .btn');
      allButtons.forEach(button => {
        (button as HTMLElement).style.borderRadius = layout.components.buttonRadius;
      });
      
      const allInputs = document.querySelectorAll('input, textarea, select, .input');
      allInputs.forEach(input => {
        (input as HTMLElement).style.borderRadius = layout.components.inputRadius;
      });
      
      const allCards = document.querySelectorAll('[class*="card"], .card, [data-card], .Card, [class*="Card"]');
      allCards.forEach(card => {
        (card as HTMLElement).style.borderRadius = layout.components.cardRadius;
      });
      
      const allModals = document.querySelectorAll('[class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"]');
      allModals.forEach(modal => {
        (modal as HTMLElement).style.borderRadius = layout.components.modalRadius;
      });
    };
    
    applyToExistingElements();
    
    // Use MutationObserver to apply styles to dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Apply button styles (exclude switches)
            if (element.matches('button:not([data-state="checked"]):not([data-state="unchecked"]):not(.peer), [type="button"], [type="submit"], [type="reset"], .btn')) {
              (element as HTMLElement).style.borderRadius = layout.components.buttonRadius;
            }
            
            // Apply input styles
            if (element.matches('input, textarea, select, .input')) {
              (element as HTMLElement).style.borderRadius = layout.components.inputRadius;
            }
            
            // Apply card styles
            if (element.matches('[class*="card"], .card, [data-card], .Card, [class*="Card"]')) {
              (element as HTMLElement).style.borderRadius = layout.components.cardRadius;
            }
            
            // Apply modal styles
            if (element.matches('[class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"]')) {
              (element as HTMLElement).style.borderRadius = layout.components.modalRadius;
            }
            
            // Apply to child elements (exclude switches)
            const buttons = element.querySelectorAll('button:not([data-state="checked"]):not([data-state="unchecked"]):not(.peer), [type="button"], [type="submit"], [type="reset"], .btn');
            buttons.forEach(button => {
              (button as HTMLElement).style.borderRadius = layout.components.buttonRadius;
            });
            
            const inputs = element.querySelectorAll('input, textarea, select, .input');
            inputs.forEach(input => {
              (input as HTMLElement).style.borderRadius = layout.components.inputRadius;
            });
            
            const cards = element.querySelectorAll('[class*="card"], .card, [data-card], .Card, [class*="Card"]');
            cards.forEach(card => {
              (card as HTMLElement).style.borderRadius = layout.components.cardRadius;
            });
            
            const modals = element.querySelectorAll('[class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"]');
            modals.forEach(modal => {
              (modal as HTMLElement).style.borderRadius = layout.components.modalRadius;
            });
          }
        });
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Cleanup function
    return () => {
      observer.disconnect();
      const existingStyle = document.getElementById('layout-global-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [layout]);

  const setLayout = (updates: Partial<LayoutState>) => {
    console.log('LayoutContext: setLayout called with:', updates);
    setLayoutState(prev => {
      const newState = { ...prev };
      
      // Handle nested updates properly
      if (updates.components) {
        newState.components = { ...prev.components, ...updates.components };
        console.log('LayoutContext: Updated components:', newState.components);
      }
      
      // Handle other top-level updates
      Object.keys(updates).forEach(key => {
        if (key !== 'components') {
          (newState as any)[key] = (updates as any)[key];
        }
      });
      
      console.log('LayoutContext: New state:', newState);
      return newState;
    });
  };

  const resetLayout = () => {
    try {
      setLayoutState(DEFAULT_LAYOUT);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      // Apply default values immediately using the same global approach
      const root = document.documentElement;
      
      // Apply default component variables to CSS custom properties
      Object.entries(DEFAULT_LAYOUT.components).forEach(([key, value]) => {
        root.style.setProperty(`--component-${key}`, value);
      });
      
      // Create or update global CSS styles for defaults
      const existingStyle = document.getElementById('layout-global-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = 'layout-global-styles';
      style.textContent = `
        /* Global Button Styles */
        button, [type="button"], [type="submit"], [type="reset"], .btn {
          border-radius: ${DEFAULT_LAYOUT.components.buttonRadius} !important;
        }
        
        /* Global Input Styles */
        input, textarea, select, .input {
          border-radius: ${DEFAULT_LAYOUT.components.inputRadius} !important;
        }
        
        /* Global Card Styles */
        [class*="card"], .card, [data-card], .Card, [class*="Card"] {
          border-radius: ${DEFAULT_LAYOUT.components.cardRadius} !important;
        }
        
        /* Global Modal Styles */
        [class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"] {
          border-radius: ${DEFAULT_LAYOUT.components.modalRadius} !important;
        }
        
        /* Desktop Modal Styles - Apply proper radius on larger screens */
        @media (min-width: 640px) {
          [class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"] {
            border-radius: ${DEFAULT_LAYOUT.components.modalRadius} !important;
          }
        }
        
        /* Force Switch components to always be circular */
        button[data-state="checked"],
        button[data-state="unchecked"],
        button.peer {
          border-radius: 9999px !important;
        }
      `;
      
      document.head.appendChild(style);
      
      // Also apply directly to existing elements for immediate effect
      const allButtons = document.querySelectorAll('button:not([data-state="checked"]):not([data-state="unchecked"]):not(.peer), [type="button"], [type="submit"], [type="reset"], .btn');
      allButtons.forEach(button => {
        (button as HTMLElement).style.borderRadius = DEFAULT_LAYOUT.components.buttonRadius;
      });
      
      const allInputs = document.querySelectorAll('input, textarea, select, .input');
      allInputs.forEach(input => {
        (input as HTMLElement).style.borderRadius = DEFAULT_LAYOUT.components.inputRadius;
      });
      
      const allCards = document.querySelectorAll('[class*="card"], .card, [data-card], .Card, [class*="Card"]');
      allCards.forEach(card => {
        (card as HTMLElement).style.borderRadius = DEFAULT_LAYOUT.components.cardRadius;
      });
      
      const allModals = document.querySelectorAll('[class*="modal"], .modal, [data-modal], [role="dialog"], .Modal, [class*="Modal"]');
      allModals.forEach(modal => {
        (modal as HTMLElement).style.borderRadius = DEFAULT_LAYOUT.components.modalRadius;
      });
      
      console.log('Layout reset to defaults and applied globally');
    } catch (error) {
      console.error('LayoutContext: Error resetting layout:', error);
    }
  };

  const value = useMemo(() => ({ ...layout, setLayout, resetLayout }), [layout]);

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextType {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within a LayoutProvider");
  return ctx;
}
