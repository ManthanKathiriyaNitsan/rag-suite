import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { settingsAPI } from "@/services/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type BrandingState = {
  orgName: string;
  primaryColor: string; // Hex or CSS color (e.g., #1F6FEB)
  logoDataUrl: string | null; // Base64 data URL
  // Widget positioning controls
  widgetZIndex: number;
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  widgetOffsetX: number; // Custom X offset in pixels
  widgetOffsetY: number; // Custom Y offset in pixels
};

type BrandingContextType = BrandingState & {
  setBranding: (updates: Partial<BrandingState>) => void;
  resetBranding: () => void;
};

const DEFAULT_BRANDING: BrandingState = {
  orgName: "RAGSuite",
  primaryColor: "#1F6FEB",
  logoDataUrl: null,
  // Widget positioning defaults
  widgetZIndex: 50,
  widgetPosition: "bottom-right",
  widgetOffsetX: 0,
  widgetOffsetY: 0,
};

// Initialize with default value to prevent "must be used within provider" errors
const defaultContextValue: BrandingContextType = {
  ...DEFAULT_BRANDING,
  setBranding: () => {
    console.warn('setBranding called before BrandingProvider is initialized');
  },
  resetBranding: () => {
    console.warn('resetBranding called before BrandingProvider is initialized');
  },
};

const BrandingContext = createContext<BrandingContextType>(defaultContextValue);

function hexToHslComponents(hex: string): string | null {
  try {
    let h = hex.trim().toLowerCase();
    if (h.startsWith("hsl(")) {
      // Already an hsl() string; extract components inside parentheses
      const inner = h.slice(4, -1).trim();
      return inner || null;
    }
    if (h.startsWith("#")) {
      // Normalize short hex to long hex
      if (h.length === 4) {
        h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
      }
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      let hue = 0;
      let sat = 0;
      const light = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rn:
            hue = (gn - bn) / d + (gn < bn ? 6 : 0);
            break;
          case gn:
            hue = (bn - rn) / d + 2;
            break;
          case bn:
            hue = (rn - gn) / d + 4;
            break;
        }
        hue = hue * 60;
      }
      const H = Math.round(hue);
      const S = Math.round(sat * 100);
      const L = Math.round(light * 100);
      return `${H} ${S}% ${L}%`;
    }
    // Try rgb() format
    if (h.startsWith("rgb(")) {
      const parts = h.slice(4, -1).split(",").map(p => parseFloat(p.trim()));
      if (parts.length >= 3) {
        const [r, g, b] = parts;
        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn);
        const min = Math.min(rn, gn, bn);
        let hue = 0, sat = 0;
        const light = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case rn:
              hue = (gn - bn) / d + (gn < bn ? 6 : 0);
              break;
            case gn:
              hue = (bn - rn) / d + 2;
              break;
            case bn:
              hue = (rn - gn) / d + 4;
              break;
          }
          hue = hue * 60;
        }
        const H = Math.round(hue);
        const S = Math.round(sat * 100);
        const L = Math.round(light * 100);
        return `${H} ${S}% ${L}%`;
      }
    }
    // If the string already looks like H S% L% components
    if (/^\d+\s+\d+%\s+\d+%$/.test(h)) {
      return h;
    }
    return null;
  } catch {
    return null;
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // Use React Query to fetch branding from settings API - fully dynamic, no localStorage
  const brandingQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsAPI.getSettings,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Local state for widget positioning (not stored in API)
  const [widgetSettings, setWidgetSettings] = useState<Pick<BrandingState, 'widgetZIndex' | 'widgetPosition' | 'widgetOffsetX' | 'widgetOffsetY'>>({
    widgetZIndex: DEFAULT_BRANDING.widgetZIndex,
    widgetPosition: DEFAULT_BRANDING.widgetPosition,
    widgetOffsetX: DEFAULT_BRANDING.widgetOffsetX,
    widgetOffsetY: DEFAULT_BRANDING.widgetOffsetY,
  });

  // Merge API settings data with widget settings
  const branding = useMemo<BrandingState>(() => {
    const apiSettings = brandingQuery.data;
    return {
      orgName: apiSettings?.org_name || DEFAULT_BRANDING.orgName,
      primaryColor: apiSettings?.primary_color || DEFAULT_BRANDING.primaryColor,
      logoDataUrl: apiSettings?.logo_data_url || DEFAULT_BRANDING.logoDataUrl,
      ...widgetSettings,
    };
  }, [brandingQuery.data, widgetSettings]);

  // Note: Branding will automatically refetch when:
  // 1. The query is invalidated (e.g., after onboarding completes)
  // 2. Component mounts (refetchOnMount: true)
  // 3. Window regains focus (refetchOnWindowFocus: true)
  // No need for manual subscription - React Query handles this automatically

  // Apply primary color globally via CSS variable used by Tailwind tokens: bg-primary, text-primary, etc.
  useEffect(() => {
    const root = document.documentElement;
    const hsl = hexToHslComponents(branding.primaryColor);
    if (hsl) {
      root.style.setProperty("--primary", hsl);
    } else {
      // Fallback: do not override if conversion failed
    }
  }, [branding.primaryColor]);

  const setBranding = (updates: Partial<BrandingState>) => {
    // Update widget settings if provided
    if (updates.widgetZIndex !== undefined || 
        updates.widgetPosition !== undefined || 
        updates.widgetOffsetX !== undefined || 
        updates.widgetOffsetY !== undefined) {
      setWidgetSettings(prev => ({
        ...prev,
        ...(updates.widgetZIndex !== undefined && { widgetZIndex: updates.widgetZIndex }),
        ...(updates.widgetPosition !== undefined && { widgetPosition: updates.widgetPosition }),
        ...(updates.widgetOffsetX !== undefined && { widgetOffsetX: updates.widgetOffsetX }),
        ...(updates.widgetOffsetY !== undefined && { widgetOffsetY: updates.widgetOffsetY }),
      }));
    }
    
    // If org name, color, or logo is updated, invalidate settings query to refetch from API
    if (updates.orgName !== undefined || updates.primaryColor !== undefined || updates.logoDataUrl !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  };

  const resetBranding = () => {
    // Reset widget settings to defaults
    setWidgetSettings({
      widgetZIndex: DEFAULT_BRANDING.widgetZIndex,
      widgetPosition: DEFAULT_BRANDING.widgetPosition,
      widgetOffsetX: DEFAULT_BRANDING.widgetOffsetX,
      widgetOffsetY: DEFAULT_BRANDING.widgetOffsetY,
    });
    // Invalidate settings query to refetch from API
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };

  const value = useMemo<BrandingContextType>(() => ({
    ...branding,
    setBranding,
    resetBranding,
  }), [branding]);

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextType {
  const ctx = useContext(BrandingContext);
  // Context is always defined (has default value), so no need to check
  return ctx;
}
