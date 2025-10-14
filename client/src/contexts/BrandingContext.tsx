import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BrandingState = {
  orgName: string;
  primaryColor: string; // Hex or CSS color (e.g., #1F6FEB)
  logoDataUrl: string | null; // Base64 data URL
  // Widget positioning controls
  widgetZIndex: number;
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
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

const LOCAL_STORAGE_KEY = "branding";

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

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
  const [branding, setBrandingState] = useState<BrandingState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BrandingState>;
        return {
          orgName: parsed.orgName ?? DEFAULT_BRANDING.orgName,
          primaryColor: parsed.primaryColor ?? DEFAULT_BRANDING.primaryColor,
          logoDataUrl: typeof parsed.logoDataUrl !== "undefined" ? (parsed.logoDataUrl as string | null) : DEFAULT_BRANDING.logoDataUrl,
          // Widget positioning fields
          widgetZIndex: parsed.widgetZIndex ?? DEFAULT_BRANDING.widgetZIndex,
          widgetPosition: parsed.widgetPosition ?? DEFAULT_BRANDING.widgetPosition,
          widgetOffsetX: parsed.widgetOffsetX ?? DEFAULT_BRANDING.widgetOffsetX,
          widgetOffsetY: parsed.widgetOffsetY ?? DEFAULT_BRANDING.widgetOffsetY,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_BRANDING;
  });

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(branding));
    } catch {
      // ignore
    }
  }, [branding]);

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
    setBrandingState(prev => ({ ...prev, ...updates }));
  };

  const resetBranding = () => {
    setBrandingState(DEFAULT_BRANDING);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
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
  if (!ctx) throw new Error("useBranding must be used within a BrandingProvider");
  return ctx;
}
