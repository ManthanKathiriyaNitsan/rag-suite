import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Palette, 
  Copy,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useBranding } from "@/contexts/BrandingContext";

interface ColorToken {
  name: string;
  light: string;
  dark: string;
  description: string;
}

interface ThemeColorsSectionProps {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    cardColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderColor: string;
    errorColor: string;
    warningColor: string;
    successColor: string;
    infoColor: string;
  };
  onUpdateTheme: (updates: Partial<ThemeColorsSectionProps['theme']>) => void;
  activePreviewMode: "light" | "dark";
  copiedColor: string | null;
  onSetCopiedColor: (color: string | null) => void;
}

const colorTokens: ColorToken[] = [
  {
    name: "Primary",
    light: "#3b82f6",
    dark: "#60a5fa",
    description: "Main brand color for buttons and links"
  }
];

const ThemeColorsSection: React.FC<ThemeColorsSectionProps> = ({
  theme,
  onUpdateTheme,
  activePreviewMode,
  copiedColor,
  onSetCopiedColor
}) => {
  const { toast } = useToast();
  const { primaryColor: globalPrimaryColor, setBranding } = useBranding();

  const copyToClipboard = useCallback(async (text: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onSetCopiedColor(colorName);
      toast({
        title: "Copied!",
        description: `${colorName} color copied to clipboard`,
      });
      setTimeout(() => onSetCopiedColor(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy color to clipboard",
        variant: "destructive",
      });
    }
  }, [toast, onSetCopiedColor]);

  // Sync with global primary color
  useEffect(() => {
    if (globalPrimaryColor && globalPrimaryColor !== theme.primaryColor) {
      onUpdateTheme({ primaryColor: globalPrimaryColor });
    }
  }, [globalPrimaryColor, theme.primaryColor, onUpdateTheme]);

  const getColorValue = (token: ColorToken) => {
    const colorMap: Record<string, string> = {
      "Primary": theme.primaryColor,
    };
    return colorMap[token.name] || token.light;
  };

  const updateColor = (tokenName: string, value: string) => {
    const colorMap: Record<string, keyof typeof theme> = {
      "Primary": "primaryColor",
    };
    
    const property = colorMap[tokenName];
    if (property) {
      onUpdateTheme({ [property]: value });
      
      // Also update global branding context for primary color
      if (tokenName === "Primary") {
        setBranding({ primaryColor: value });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Palette
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize your theme colors for light and dark modes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activePreviewMode === "light" ? "default" : "outline"}>
            Light Mode
          </Badge>
          <Badge variant={activePreviewMode === "dark" ? "default" : "outline"}>
            Dark Mode
          </Badge>
        </div>
      </div>

      <Alert className="bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
        <Info className="h-4 w-4 text-blue-700 dark:text-blue-300" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          Colors automatically adapt between light and dark modes. Primary color syncs with global settings. Click on color values to copy them to clipboard.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorTokens.map((token) => {
          const colorValue = getColorValue(token);
          const isCopied = copiedColor === token.name;
          
          return (
            <Card key={token.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{token.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(colorValue, token.name)}
                    className="h-6 w-6 p-0"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: colorValue }}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id={`${token.name}-color-picker`}
                        type="color"
                        value={colorValue}
                        onChange={(e) => updateColor(token.name, e.target.value)}
                        className="w-12 h-8 p-1 border rounded"
                        title="Color picker"
                      />
                      <Input
                        id={`${token.name}-color-text`}
                        value={colorValue}
                        onChange={(e) => {
                          let v = e.target.value.trim();
                          if (/^[0-9a-fA-F]{6}$/.test(v)) v = '#' + v; // add # for 6-char hex
                          updateColor(token.name, v);
                        }}
                        className="h-8 text-xs font-mono flex-1"
                        placeholder="#000000"
                      />
                    </div>
                
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{token.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert className="bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700">
        <AlertTriangle className="h-4 w-4 text-purple-700 dark:text-purple-300" />
        <AlertDescription className="text-purple-900 dark:text-purple-100">
          <strong>Pro Tip:</strong> Use color picker tools or design systems like Tailwind CSS for consistent color palettes.
          Ensure sufficient contrast ratios for accessibility compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ThemeColorsSection;
