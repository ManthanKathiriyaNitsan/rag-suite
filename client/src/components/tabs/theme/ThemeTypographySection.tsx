import React, { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Type,
  Info,
  AlertTriangle
} from "lucide-react";

interface ThemeTypographySectionProps {
  theme: {
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
  };
  onUpdateTheme: (updates: Partial<typeof theme>) => void;
}

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Nunito", label: "Nunito" },
  { value: "system-ui", label: "System UI" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" }
];

const ThemeTypographySection: React.FC<ThemeTypographySectionProps> = ({
  theme,
  onUpdateTheme
}) => {
  const updateTypography = useCallback((updates: Partial<typeof theme>) => {
    onUpdateTheme(updates);
  }, [onUpdateTheme]);

  const updateFontSize = useCallback((size: keyof typeof theme.fontSize, value: string) => {
    updateTypography({
      fontSize: {
        ...theme.fontSize,
        [size]: value
      }
    });
  }, [theme.fontSize, updateTypography]);

  const updateFontWeight = useCallback((weight: keyof typeof theme.fontWeight, value: string) => {
    updateTypography({
      fontWeight: {
        ...theme.fontWeight,
        [weight]: value
      }
    });
  }, [theme.fontWeight, updateTypography]);

  const updateLineHeight = useCallback((height: keyof typeof theme.lineHeight, value: string) => {
    updateTypography({
      lineHeight: {
        ...theme.lineHeight,
        [height]: value
      }
    });
  }, [theme.lineHeight, updateTypography]);

  const updateLetterSpacing = useCallback((spacing: keyof typeof theme.letterSpacing, value: string) => {
    updateTypography({
      letterSpacing: {
        ...theme.letterSpacing,
        [spacing]: value
      }
    });
  }, [theme.letterSpacing, updateTypography]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Type className="h-5 w-5" />
          Typography Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure font families, sizes, weights, and spacing for your theme
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Typography settings affect the overall readability and visual hierarchy of your application.
          Choose fonts that match your brand and ensure good legibility across all devices.
        </AlertDescription>
      </Alert>

      {/* Font Family */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Family</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font-family">Primary Font Family</Label>
            <Select value={theme.fontFamily} onValueChange={(value) => updateTypography({ fontFamily: value })}>
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div style={{ fontFamily: theme.fontFamily }}>
              <p className="text-2xl font-bold">Heading Text</p>
              <p className="text-base">Body text with the selected font family</p>
              <p className="text-sm text-muted-foreground">Small text for captions and labels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Sizes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Sizes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(theme.fontSize).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <Label htmlFor={`font-size-${size}`} className="text-xs capitalize">
                  {size}
                </Label>
                <Input
                  id={`font-size-${size}`}
                  value={value}
                  onChange={(e) => updateFontSize(size as keyof typeof theme.fontSize, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="1rem"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Size Preview:</p>
            <div className="space-y-1">
              <p style={{ fontSize: theme.fontSize.xs }}>Extra Small (xs)</p>
              <p style={{ fontSize: theme.fontSize.sm }}>Small (sm)</p>
              <p style={{ fontSize: theme.fontSize.base }}>Base (base)</p>
              <p style={{ fontSize: theme.fontSize.lg }}>Large (lg)</p>
              <p style={{ fontSize: theme.fontSize.xl }}>Extra Large (xl)</p>
              <p style={{ fontSize: theme.fontSize["2xl"] }}>2X Large (2xl)</p>
              <p style={{ fontSize: theme.fontSize["3xl"] }}>3X Large (3xl)</p>
              <p style={{ fontSize: theme.fontSize["4xl"] }}>4X Large (4xl)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(theme.fontWeight).map(([weight, value]) => (
              <div key={weight} className="space-y-2">
                <Label htmlFor={`font-weight-${weight}`} className="text-xs capitalize">
                  {weight}
                </Label>
                <Input
                  id={`font-weight-${weight}`}
                  value={value}
                  onChange={(e) => updateFontWeight(weight as keyof typeof theme.fontWeight, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="400"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Weight Preview:</p>
            <div className="space-y-1">
              <p style={{ fontWeight: theme.fontWeight.light }}>Light Text</p>
              <p style={{ fontWeight: theme.fontWeight.normal }}>Normal Text</p>
              <p style={{ fontWeight: theme.fontWeight.medium }}>Medium Text</p>
              <p style={{ fontWeight: theme.fontWeight.semibold }}>Semibold Text</p>
              <p style={{ fontWeight: theme.fontWeight.bold }}>Bold Text</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Heights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Heights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(theme.lineHeight).map(([height, value]) => (
              <div key={height} className="space-y-2">
                <Label htmlFor={`line-height-${height}`} className="text-xs capitalize">
                  {height}
                </Label>
                <Input
                  id={`line-height-${height}`}
                  value={value}
                  onChange={(e) => updateLineHeight(height as keyof typeof theme.lineHeight, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="1.5"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Line Height Preview:</p>
            <div className="space-y-2">
              <p style={{ lineHeight: theme.lineHeight.tight }}>Tight line height for headings and short text</p>
              <p style={{ lineHeight: theme.lineHeight.normal }}>Normal line height for body text and general content</p>
              <p style={{ lineHeight: theme.lineHeight.relaxed }}>Relaxed line height for better readability in long paragraphs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Letter Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Letter Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(theme.letterSpacing).map(([spacing, value]) => (
              <div key={spacing} className="space-y-2">
                <Label htmlFor={`letter-spacing-${spacing}`} className="text-xs capitalize">
                  {spacing}
                </Label>
                <Input
                  id={`letter-spacing-${spacing}`}
                  value={value}
                  onChange={(e) => updateLetterSpacing(spacing as keyof typeof theme.letterSpacing, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Letter Spacing Preview:</p>
            <div className="space-y-2">
              <p style={{ letterSpacing: theme.letterSpacing.tight }}>Tight letter spacing</p>
              <p style={{ letterSpacing: theme.letterSpacing.normal }}>Normal letter spacing</p>
              <p style={{ letterSpacing: theme.letterSpacing.wide }}>Wide letter spacing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Accessibility Tip:</strong> Ensure line heights are at least 1.5 times the font size for optimal readability.
          Consider using relative units (em, rem) instead of absolute units (px) for better scalability.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ThemeTypographySection;
