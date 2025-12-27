import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

type Theme = "light" | "dark";

interface ThemeData {
  // Brand Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Background Colors
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border Colors
  borderColor: string;
  
  // Status Colors
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
  
  // Typography
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  
  // Global theme data
  themeData: ThemeData;
  setThemeData: (data: Partial<ThemeData>) => void;
  
  // Typography management
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
  
  // Layout management
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
  
  // Color management
  setColors: (colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    card?: string;
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    border?: string;
    error?: string;
    warning?: string;
    success?: string;
    info?: string;
  }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  
  const [theme, setTheme] = useState<Theme>(() => {
    // Default to dark as per design brief
    return "dark";
  });

  // Default theme data
  const defaultThemeData: ThemeData = {
    primaryColor: "#3b82f6",
    secondaryColor: "#6b7280",
    accentColor: "#f59e0b",
    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
    surfaceColor: theme === "dark" ? "#1e293b" : "#f9fafb",
    cardColor: theme === "dark" ? "#334155" : "#ffffff",
    textPrimary: theme === "dark" ? "#f1f5f9" : "#111827",
    textSecondary: theme === "dark" ? "#94a3b8" : "#6b7280",
    textMuted: theme === "dark" ? "#64748b" : "#9ca3af",
    borderColor: theme === "dark" ? "#475569" : "#e5e7eb",
    errorColor: "#ef4444",
    warningColor: "#f59e0b",
    successColor: "#10b981",
    infoColor: "#3b82f6",
    fontFamily: "Inter",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem"
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      "2xl": "3rem",
      "3xl": "4rem"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
    },
    animations: {
      duration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms"
      },
      easing: {
        linear: "linear",
        ease: "ease",
        easeIn: "ease-in",
        easeOut: "ease-out",
        easeInOut: "ease-in-out"
      }
    }
  };

  const [themeData, setThemeDataState] = useState<ThemeData>(() => {
    return defaultThemeData;
  });

  // Global typography state (not persisted in localStorage)
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

  // Global layout state (not persisted in localStorage)
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

  // Reset theme to defaults when user changes (logout/login)
  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out - reset to defaults
      console.log('🔄 User logged out, resetting theme to defaults...');
      setTheme("dark");
      // Theme data, typography, and layout will use their default values on next mount
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
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

  // Global theme data management
  const setThemeData = (data: Partial<ThemeData>) => {
    setThemeDataState(prev => ({ ...prev, ...data }));
  };

  // Color management
  const setColors = (colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    card?: string;
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    border?: string;
    error?: string;
    warning?: string;
    success?: string;
    info?: string;
  }) => {
    setThemeDataState(prev => ({
      ...prev,
      primaryColor: colors.primary ?? prev.primaryColor,
      secondaryColor: colors.secondary ?? prev.secondaryColor,
      accentColor: colors.accent ?? prev.accentColor,
      backgroundColor: colors.background ?? prev.backgroundColor,
      surfaceColor: colors.surface ?? prev.surfaceColor,
      cardColor: colors.card ?? prev.cardColor,
      textPrimary: colors.textPrimary ?? prev.textPrimary,
      textSecondary: colors.textSecondary ?? prev.textSecondary,
      textMuted: colors.textMuted ?? prev.textMuted,
      borderColor: colors.border ?? prev.borderColor,
      errorColor: colors.error ?? prev.errorColor,
      warningColor: colors.warning ?? prev.warningColor,
      successColor: colors.success ?? prev.successColor,
      infoColor: colors.info ?? prev.infoColor,
    }));
  };

  // Apply theme data to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty("--color-primary", themeData.primaryColor);
    root.style.setProperty("--color-secondary", themeData.secondaryColor);
    root.style.setProperty("--color-accent", themeData.accentColor);
    root.style.setProperty("--color-background", themeData.backgroundColor);
    root.style.setProperty("--color-surface", themeData.surfaceColor);
    root.style.setProperty("--color-card", themeData.cardColor);
    root.style.setProperty("--color-text-primary", themeData.textPrimary);
    root.style.setProperty("--color-text-secondary", themeData.textSecondary);
    root.style.setProperty("--color-text-muted", themeData.textMuted);
    root.style.setProperty("--color-border", themeData.borderColor);
    root.style.setProperty("--color-error", themeData.errorColor);
    root.style.setProperty("--color-warning", themeData.warningColor);
    root.style.setProperty("--color-success", themeData.successColor);
    root.style.setProperty("--color-info", themeData.infoColor);
    
    // Apply typography variables
    root.style.setProperty("--font-family", themeData.fontFamily);
    root.style.setProperty("--font-size-xs", themeData.fontSize.xs);
    root.style.setProperty("--font-size-sm", themeData.fontSize.sm);
    root.style.setProperty("--font-size-base", themeData.fontSize.base);
    root.style.setProperty("--font-size-lg", themeData.fontSize.lg);
    root.style.setProperty("--font-size-xl", themeData.fontSize.xl);
    root.style.setProperty("--font-size-2xl", themeData.fontSize["2xl"]);
    
    // Apply spacing variables
    root.style.setProperty("--spacing-xs", themeData.spacing.xs);
    root.style.setProperty("--spacing-sm", themeData.spacing.sm);
    root.style.setProperty("--spacing-md", themeData.spacing.md);
    root.style.setProperty("--spacing-lg", themeData.spacing.lg);
    root.style.setProperty("--spacing-xl", themeData.spacing.xl);
    root.style.setProperty("--spacing-2xl", themeData.spacing["2xl"]);
    root.style.setProperty("--spacing-3xl", themeData.spacing["3xl"]);
    
    // Apply shadow variables
    root.style.setProperty("--shadow-sm", themeData.shadows.sm);
    root.style.setProperty("--shadow-md", themeData.shadows.md);
    root.style.setProperty("--shadow-lg", themeData.shadows.lg);
    root.style.setProperty("--shadow-xl", themeData.shadows.xl);
    root.style.setProperty("--shadow-2xl", themeData.shadows["2xl"]);
    
    // Apply animation variables
    root.style.setProperty("--animation-duration-fast", themeData.animations.duration.fast);
    root.style.setProperty("--animation-duration-normal", themeData.animations.duration.normal);
    root.style.setProperty("--animation-duration-slow", themeData.animations.duration.slow);
    root.style.setProperty("--animation-easing-linear", themeData.animations.easing.linear);
    root.style.setProperty("--animation-easing-ease", themeData.animations.easing.ease);
    root.style.setProperty("--animation-easing-ease-in", themeData.animations.easing.easeIn);
    root.style.setProperty("--animation-easing-ease-out", themeData.animations.easing.easeOut);
    root.style.setProperty("--animation-easing-ease-in-out", themeData.animations.easing.easeInOut);
  }, [themeData]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme, 
      themeData,
      setThemeData,
      setTypography, 
      setLayout,
      setColors
    }}>
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
