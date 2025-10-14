import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  // NEW: allow globally updating font family and base font size
  setTypography: (opts: { 
    fontFamily?: string; 
    baseFontSize?: string;
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      "2xl"?: string;
    };
  }) => void;
  // NEW: allow globally updating layout settings
  setLayout: (opts: {
    borderRadius?: {
      sm?: string;
      md?: string;
      lg?: string;
    };
    widgetAppearance?: {
      chatBubbleStyle?: "rounded" | "sharp" | "minimal";
      avatarStyle?: "circle" | "square" | "rounded";
      animationsEnabled?: boolean;
    };
    customCSS?: {
      enabled?: boolean;
      css?: string;
    };
  }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    
    // Default to dark as per design brief
    return "dark";
  });

  // NEW: global typography state persisted in localStorage
  const [typography, setTypographyState] = useState<{ 
    fontFamily: string; 
    baseFontSize: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
    };
  }>(() => {
    try {
      const saved = localStorage.getItem("theme-typography");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fontFamily: parsed.fontFamily || "Inter, system-ui, -apple-system, sans-serif",
          baseFontSize: parsed.baseFontSize || "16px",
          fontSize: parsed.fontSize || {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
          },
        };
      }
    } catch {}
    return {
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      baseFontSize: "16px",
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
    };
  });

  // NEW: global layout state persisted in localStorage
  const [layout, setLayoutState] = useState<{
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
    };
    widgetAppearance: {
      chatBubbleStyle: "rounded" | "sharp" | "minimal";
      avatarStyle: "circle" | "square" | "rounded";
      animationsEnabled: boolean;
    };
    customCSS: {
      enabled: boolean;
      css: string;
    };
  }>(() => {
    try {
      const saved = localStorage.getItem("theme-layout");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          borderRadius: parsed.borderRadius || {
            sm: "0.125rem",
            md: "0.375rem",
            lg: "0.5rem",
          },
          widgetAppearance: parsed.widgetAppearance || {
            chatBubbleStyle: "rounded",
            avatarStyle: "circle",
            animationsEnabled: true,
          },
          customCSS: parsed.customCSS || {
            enabled: false,
            css: "",
          },
        };
      }
    } catch {}
    return {
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
      },
      widgetAppearance: {
        chatBubbleStyle: "rounded",
        avatarStyle: "circle",
        animationsEnabled: true,
      },
      customCSS: {
        enabled: false,
        css: "",
      },
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply global typography to :root CSS variables and html font-size
  useEffect(() => {
    const root = document.documentElement;
    // Update Tailwind CSS variable used by font-sans utility
    root.style.setProperty("--font-sans", typography.fontFamily);
    // Update base font-size globally (affects rem-based sizing)
    root.style.fontSize = typography.baseFontSize;
    
    // Set CSS custom properties for all font sizes
    root.style.setProperty("--font-size-xs", typography.fontSize.xs);
    root.style.setProperty("--font-size-sm", typography.fontSize.sm);
    root.style.setProperty("--font-size-base", typography.fontSize.base);
    root.style.setProperty("--font-size-lg", typography.fontSize.lg);
    root.style.setProperty("--font-size-xl", typography.fontSize.xl);
    root.style.setProperty("--font-size-2xl", typography.fontSize["2xl"]);
    
    // Persist
    localStorage.setItem("theme-typography", JSON.stringify(typography));
  }, [typography]);

  // Apply global layout settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS custom properties for border radius
    root.style.setProperty("--border-radius-sm", layout.borderRadius.sm);
    root.style.setProperty("--border-radius-md", layout.borderRadius.md);
    root.style.setProperty("--border-radius-lg", layout.borderRadius.lg);
    
    // Set CSS custom properties for widget appearance
    root.style.setProperty("--chat-bubble-style", layout.widgetAppearance.chatBubbleStyle);
    root.style.setProperty("--avatar-style", layout.widgetAppearance.avatarStyle);
    root.style.setProperty("--animations-enabled", layout.widgetAppearance.animationsEnabled ? "1" : "0");
    
    // Apply custom CSS if enabled
    if (layout.customCSS.enabled && layout.customCSS.css.trim()) {
      console.log("🎨 Applying custom CSS:", layout.customCSS.css);
      // Create or update custom CSS style element
      let customStyleElement = document.getElementById("widget-custom-css");
      if (!customStyleElement) {
        customStyleElement = document.createElement("style");
        customStyleElement.id = "widget-custom-css";
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = layout.customCSS.css;
    } else {
      console.log("🎨 Removing custom CSS");
      // Remove custom CSS if disabled
      const customStyleElement = document.getElementById("widget-custom-css");
      if (customStyleElement) {
        customStyleElement.remove();
      }
    }
    
    // Persist
    localStorage.setItem("theme-layout", JSON.stringify(layout));
  }, [layout]);

  // Helper: extract primary font family name from CSS font-family string
  const extractPrimaryFontName = (fontFamily: string) => {
    const first = (fontFamily || "").split(",")[0]?.trim() || "";
    return first.replace(/^['\"`]/, "").replace(/['\"`]$/, "");
  };

  // Load Google Font for known families when global font family changes
  useEffect(() => {
    const primary = extractPrimaryFontName(typography.fontFamily);
    const known: Record<string, string> = {
      Inter: "Inter:wght@400;500;600;700",
      Roboto: "Roboto:wght@400;500;700",
      Poppins: "Poppins:wght@400;500;600;700",
      "Open Sans": "Open+Sans:wght@400;600;700",
      "Source Sans Pro": "Source+Sans+Pro:wght@400;600;700",
    };
    const spec = known[primary];
    if (!spec) return;
    const id = `global-font-${primary.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
    document.head.appendChild(link);
  }, [typography.fontFamily]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Expose setter for global typography
  const setTypography = (opts: { 
    fontFamily?: string; 
    baseFontSize?: string;
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      "2xl"?: string;
    };
  }) => {
    setTypographyState(prev => ({
      fontFamily: opts.fontFamily ?? prev.fontFamily,
      baseFontSize: opts.baseFontSize ?? prev.baseFontSize,
      fontSize: opts.fontSize ? {
        xs: opts.fontSize.xs ?? prev.fontSize.xs,
        sm: opts.fontSize.sm ?? prev.fontSize.sm,
        base: opts.fontSize.base ?? prev.fontSize.base,
        lg: opts.fontSize.lg ?? prev.fontSize.lg,
        xl: opts.fontSize.xl ?? prev.fontSize.xl,
        "2xl": opts.fontSize["2xl"] ?? prev.fontSize["2xl"],
      } : prev.fontSize,
    }));
  };

  // Expose setter for global layout
  const setLayout = (opts: {
    borderRadius?: {
      sm?: string;
      md?: string;
      lg?: string;
    };
    widgetAppearance?: {
      chatBubbleStyle?: "rounded" | "sharp" | "minimal";
      avatarStyle?: "circle" | "square" | "rounded";
      animationsEnabled?: boolean;
    };
    customCSS?: {
      enabled?: boolean;
      css?: string;
    };
  }) => {
    setLayoutState(prev => ({
      borderRadius: opts.borderRadius ? {
        sm: opts.borderRadius.sm ?? prev.borderRadius.sm,
        md: opts.borderRadius.md ?? prev.borderRadius.md,
        lg: opts.borderRadius.lg ?? prev.borderRadius.lg,
      } : prev.borderRadius,
      widgetAppearance: opts.widgetAppearance ? {
        chatBubbleStyle: opts.widgetAppearance.chatBubbleStyle ?? prev.widgetAppearance.chatBubbleStyle,
        avatarStyle: opts.widgetAppearance.avatarStyle ?? prev.widgetAppearance.avatarStyle,
        animationsEnabled: opts.widgetAppearance.animationsEnabled ?? prev.widgetAppearance.animationsEnabled,
      } : prev.widgetAppearance,
      customCSS: opts.customCSS ? {
        enabled: opts.customCSS.enabled ?? prev.customCSS.enabled,
        css: opts.customCSS.css ?? prev.customCSS.css,
      } : prev.customCSS,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, setTypography, setLayout }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
