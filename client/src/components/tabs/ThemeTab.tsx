import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Palette, 
  Download, 
  Sun,
  Moon,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  ThemeColorsSection,
  ThemeTypographySection,
  ThemeLayoutSection,
  ThemeAdvancedSection
} from "./theme";

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
    "3xl": string;
    "4xl": string;
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
  
  // Layout
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
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
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  layout: {
    containerMaxWidth: string;
    sidebarWidth: string;
    headerHeight: string;
    footerHeight: string;
  };
  components: {
    buttonRadius: string;
    inputRadius: string;
    cardRadius: string;
    modalRadius: string;
  };
  
  // Advanced
  customCSS: string;
  features: {
    darkMode: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    focusVisible: boolean;
    animations: boolean;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    notification: number;
  };
}

interface ThemeTabProps {
  data: ThemeData;
  onChange: (data: ThemeData) => void;
}

export default function ThemeTab({ data, onChange }: ThemeTabProps) {
  const { setTypography, setLayout } = useTheme();
  const [theme, setTheme] = useState<ThemeData>(() => ({
    ...data,
    // Default values if not provided
    primaryColor: data.primaryColor || "#3b82f6",
    secondaryColor: data.secondaryColor || "#6b7280",
    accentColor: data.accentColor || "#f59e0b",
    backgroundColor: data.backgroundColor || "#ffffff",
    surfaceColor: data.surfaceColor || "#f9fafb",
    cardColor: data.cardColor || "#ffffff",
    textPrimary: data.textPrimary || "#111827",
    textSecondary: data.textSecondary || "#6b7280",
    textMuted: data.textMuted || "#9ca3af",
    borderColor: data.borderColor || "#e5e7eb",
    errorColor: data.errorColor || "#ef4444",
    warningColor: data.warningColor || "#f59e0b",
    successColor: data.successColor || "#10b981",
    infoColor: data.infoColor || "#3b82f6",
    fontFamily: data.fontFamily || "Inter",
    fontSize: data.fontSize || {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: data.fontWeight || {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: data.lineHeight || {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
    letterSpacing: data.letterSpacing || {
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
    },
    borderRadius: data.borderRadius || {
      none: "0",
      sm: "0.125rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      full: "9999px",
    },
    spacing: data.spacing || {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      "2xl": "3rem",
      "3xl": "4rem",
    },
    shadows: data.shadows || {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    animations: data.animations || {
      duration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      easing: {
        linear: "linear",
        easeIn: "ease-in",
        easeOut: "ease-out",
        easeInOut: "ease-in-out",
      },
    },
    layout: data.layout || {
      containerMaxWidth: "1200px",
      sidebarWidth: "280px",
      headerHeight: "64px",
      footerHeight: "80px",
    },
    components: data.components || {
      buttonRadius: "0.375rem",
      inputRadius: "0.375rem",
      cardRadius: "0.5rem",
      modalRadius: "0.75rem",
    },
    customCSS: data.customCSS || "",
    features: data.features || {
      darkMode: true,
      reducedMotion: false,
      highContrast: false,
      focusVisible: true,
      animations: true,
    },
    breakpoints: data.breakpoints || {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    zIndex: data.zIndex || {
      dropdown: 1000,
      modal: 1050,
      tooltip: 1100,
      notification: 1150,
    },
  }));

  const [activePreviewMode, setActivePreviewMode] = useState<"light" | "dark">("light");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { toast } = useToast();

  // Update parent component when theme changes
  useEffect(() => {
    onChange(theme);
  }, [theme, onChange]);

  // Apply typography changes to theme context
  useEffect(() => {
    if (setTypography) {
      setTypography({
        fontFamily: theme.fontFamily,
        baseFontSize: theme.fontSize.base,
        lineHeight: theme.lineHeight.normal,
      });
    }
  }, [theme.fontFamily, theme.fontSize.base, theme.lineHeight.normal, setTypography]);

  // Apply layout changes to theme context
  useEffect(() => {
    if (setLayout) {
      setLayout({
        sidebarWidth: theme.layout.sidebarWidth,
        headerHeight: theme.layout.headerHeight,
        containerMaxWidth: theme.layout.containerMaxWidth,
      });
    }
  }, [theme.layout.sidebarWidth, theme.layout.headerHeight, theme.layout.containerMaxWidth, setLayout]);

  const updateTheme = useCallback((updates: Partial<ThemeData>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  }, []);

  const exportTheme = useCallback(() => {
    const exportData = {
      ...theme,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ragsuite-theme-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Theme exported!",
      description: "Your theme has been downloaded as a JSON file",
    });
  }, [theme, toast]);

  const togglePreviewMode = useCallback(() => {
    setActivePreviewMode(prev => prev === "light" ? "dark" : "light");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Theme Customization
          </h2>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your RAG Suite interface
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            {activePreviewMode === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {activePreviewMode === "light" ? "Light" : "Dark"} Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportTheme}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Theme
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Customize your theme with colors, typography, layout, and advanced settings.
          Changes are applied in real-time and can be exported for reuse.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" data-testid="tab-colors" className="text-sm">
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" data-testid="tab-typography" className="text-sm">
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" data-testid="tab-layout" className="text-sm">
            Layout
          </TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced" className="text-sm">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <ThemeColorsSection
            theme={theme}
            onUpdateTheme={updateTheme}
            activePreviewMode={activePreviewMode}
            copiedColor={copiedColor}
            onSetCopiedColor={setCopiedColor}
          />
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <ThemeTypographySection
            theme={theme}
            onUpdateTheme={updateTheme}
          />
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <ThemeLayoutSection
            theme={theme}
            onUpdateTheme={updateTheme}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <ThemeAdvancedSection
            theme={theme}
            onUpdateTheme={updateTheme}
            onExportTheme={exportTheme}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}