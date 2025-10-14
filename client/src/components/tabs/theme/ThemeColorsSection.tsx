import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Palette, 
  Copy,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

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
  onUpdateTheme: (updates: Partial<typeof theme>) => void;
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
  },
  {
    name: "Secondary", 
    light: "#6b7280",
    dark: "#9ca3af",
    description: "Secondary actions and elements"
  },
  {
    name: "Accent",
    light: "#f59e0b",
    dark: "#fbbf24", 
    description: "Highlighted elements and call-to-actions"
  },
  {
    name: "Background",
    light: "#ffffff",
    dark: "#111827",
    description: "Main background color"
  },
  {
    name: "Surface",
    light: "#f9fafb",
    dark: "#1f2937",
    description: "Card and panel backgrounds"
  },
  {
    name: "Card",
    light: "#ffffff",
    dark: "#374151",
    description: "Card component backgrounds"
  },
  {
    name: "Text Primary",
    light: "#111827",
    dark: "#f9fafb",
    description: "Primary text color"
  },
  {
    name: "Text Secondary",
    light: "#6b7280",
    dark: "#d1d5db",
    description: "Secondary text color"
  },
  {
    name: "Text Muted",
    light: "#9ca3af",
    dark: "#6b7280",
    description: "Muted text color"
  },
  {
    name: "Border",
    light: "#e5e7eb",
    dark: "#4b5563",
    description: "Border and divider colors"
  },
  {
    name: "Error",
    light: "#ef4444",
    dark: "#f87171",
    description: "Error states and validation"
  },
  {
    name: "Warning",
    light: "#f59e0b",
    dark: "#fbbf24",
    description: "Warning states"
  },
  {
    name: "Success",
    light: "#10b981",
    dark: "#34d399",
    description: "Success states"
  },
  {
    name: "Info",
    light: "#3b82f6",
    dark: "#60a5fa",
    description: "Information states"
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

  const getColorValue = (token: ColorToken) => {
    const colorMap: Record<string, string> = {
      "Primary": theme.primaryColor,
      "Secondary": theme.secondaryColor,
      "Accent": theme.accentColor,
      "Background": theme.backgroundColor,
      "Surface": theme.surfaceColor,
      "Card": theme.cardColor,
      "Text Primary": theme.textPrimary,
      "Text Secondary": theme.textSecondary,
      "Text Muted": theme.textMuted,
      "Border": theme.borderColor,
      "Error": theme.errorColor,
      "Warning": theme.warningColor,
      "Success": theme.successColor,
      "Info": theme.infoColor,
    };
    return colorMap[token.name] || token.light;
  };

  const updateColor = (tokenName: string, value: string) => {
    const colorMap: Record<string, keyof typeof theme> = {
      "Primary": "primaryColor",
      "Secondary": "secondaryColor", 
      "Accent": "accentColor",
      "Background": "backgroundColor",
      "Surface": "surfaceColor",
      "Card": "cardColor",
      "Text Primary": "textPrimary",
      "Text Secondary": "textSecondary",
      "Text Muted": "textMuted",
      "Border": "borderColor",
      "Error": "errorColor",
      "Warning": "warningColor",
      "Success": "successColor",
      "Info": "infoColor",
    };
    
    const property = colorMap[tokenName];
    if (property) {
      onUpdateTheme({ [property]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Colors automatically adapt between light and dark modes. Click on color values to copy them to clipboard.
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
                  <div className="flex-1">
                    <Label htmlFor={`${token.name}-color`} className="text-xs text-muted-foreground">
                      Color Value
                    </Label>
                    <Input
                      id={`${token.name}-color`}
                      value={colorValue}
                      onChange={(e) => updateColor(token.name, e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{token.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Use color picker tools or design systems like Tailwind CSS for consistent color palettes.
          Ensure sufficient contrast ratios for accessibility compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ThemeColorsSection;
