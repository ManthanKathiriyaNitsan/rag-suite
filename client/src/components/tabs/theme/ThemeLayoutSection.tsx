import React, { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Layout,
  Info,
  AlertTriangle
} from "lucide-react";

interface ThemeLayoutSectionProps {
  theme: {
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
  };
  onUpdateTheme: (updates: Partial<typeof theme>) => void;
}

const ThemeLayoutSection: React.FC<ThemeLayoutSectionProps> = ({
  theme,
  onUpdateTheme
}) => {
  const updateLayout = useCallback((updates: Partial<typeof theme>) => {
    onUpdateTheme(updates);
  }, [onUpdateTheme]);

  const updateBorderRadius = useCallback((size: keyof typeof theme.borderRadius, value: string) => {
    updateLayout({
      borderRadius: {
        ...theme.borderRadius,
        [size]: value
      }
    });
  }, [theme.borderRadius, updateLayout]);

  const updateSpacing = useCallback((size: keyof typeof theme.spacing, value: string) => {
    updateLayout({
      spacing: {
        ...theme.spacing,
        [size]: value
      }
    });
  }, [theme.spacing, updateLayout]);

  const updateShadows = useCallback((size: keyof typeof theme.shadows, value: string) => {
    updateLayout({
      shadows: {
        ...theme.shadows,
        [size]: value
      }
    });
  }, [theme.shadows, updateLayout]);

  const updateAnimations = useCallback((category: keyof typeof theme.animations, key: string, value: string) => {
    updateLayout({
      animations: {
        ...theme.animations,
        [category]: {
          ...theme.animations[category],
          [key]: value
        }
      }
    });
  }, [theme.animations, updateLayout]);

  const updateLayoutProps = useCallback((key: keyof typeof theme.layout, value: string) => {
    updateLayout({
      layout: {
        ...theme.layout,
        [key]: value
      }
    });
  }, [theme.layout, updateLayout]);

  const updateComponents = useCallback((key: keyof typeof theme.components, value: string) => {
    updateLayout({
      components: {
        ...theme.components,
        [key]: value
      }
    });
  }, [theme.components, updateLayout]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Layout & Spacing
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure spacing, border radius, shadows, and layout dimensions
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Layout settings control the visual structure and spacing of your application.
          Consistent spacing and border radius create a cohesive design system.
        </AlertDescription>
      </Alert>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Border Radius</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(theme.borderRadius).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <Label htmlFor={`border-radius-${size}`} className="text-xs capitalize">
                  {size}
                </Label>
                <Input
                  id={`border-radius-${size}`}
                  value={value}
                  onChange={(e) => updateBorderRadius(size as keyof typeof theme.borderRadius, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0.375rem"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Border Radius Preview:</p>
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(theme.borderRadius).map(([size, value]) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-12 h-12 bg-primary/20 border-2 border-primary"
                    style={{ borderRadius: value }}
                  />
                  <span className="text-xs text-muted-foreground">{size}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spacing Scale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(theme.spacing).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <Label htmlFor={`spacing-${size}`} className="text-xs capitalize">
                  {size}
                </Label>
                <Input
                  id={`spacing-${size}`}
                  value={value}
                  onChange={(e) => updateSpacing(size as keyof typeof theme.spacing, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0.5rem"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Spacing Preview:</p>
            <div className="space-y-2">
              {Object.entries(theme.spacing).map(([size, value]) => (
                <div key={size} className="flex items-center gap-2">
                  <span className="text-xs w-12">{size}:</span>
                  <div 
                    className="h-4 bg-primary/20"
                    style={{ width: value }}
                  />
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shadows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Box Shadows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(theme.shadows).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <Label htmlFor={`shadow-${size}`} className="text-xs capitalize">
                  {size}
                </Label>
                <Input
                  id={`shadow-${size}`}
                  value={value}
                  onChange={(e) => updateShadows(size as keyof typeof theme.shadows, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0 1px 2px rgba(0,0,0,0.05)"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Shadow Preview:</p>
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(theme.shadows).map(([size, value]) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-16 h-16 bg-white border rounded"
                    style={{ boxShadow: value }}
                  />
                  <span className="text-xs text-muted-foreground">{size}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layout Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(theme.layout).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`layout-${key}`} className="text-xs">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <Input
                  id={`layout-${key}`}
                  value={value}
                  onChange={(e) => updateLayoutProps(key as keyof typeof theme.layout, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="1200px"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Component Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(theme.components).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`component-${key}`} className="text-xs">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <Input
                  id={`component-${key}`}
                  value={value}
                  onChange={(e) => updateComponents(key as keyof typeof theme.components, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0.375rem"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Component Preview:</p>
            <div className="space-y-3">
              <Button style={{ borderRadius: theme.components.buttonRadius }}>
                Button with custom radius
              </Button>
              <Input 
                placeholder="Input with custom radius"
                style={{ borderRadius: theme.components.inputRadius }}
              />
              <div 
                className="p-3 bg-card border"
                style={{ borderRadius: theme.components.cardRadius }}
              >
                Card with custom radius
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Animation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration</Label>
              <div className="space-y-2">
                {Object.entries(theme.animations.duration).map(([speed, value]) => (
                  <div key={speed} className="flex items-center gap-2">
                    <Label htmlFor={`duration-${speed}`} className="text-xs w-16">
                      {speed}
                    </Label>
                    <Input
                      id={`duration-${speed}`}
                      value={value}
                      onChange={(e) => updateAnimations('duration', speed, e.target.value)}
                      className="h-8 text-xs flex-1"
                      placeholder="150ms"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Easing</Label>
              <div className="space-y-2">
                {Object.entries(theme.animations.easing).map(([type, value]) => (
                  <div key={type} className="flex items-center gap-2">
                    <Label htmlFor={`easing-${type}`} className="text-xs w-16">
                      {type}
                    </Label>
                    <Select value={value} onValueChange={(newValue) => updateAnimations('easing', type, newValue)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease">Ease</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                        <SelectItem value="cubic-bezier(0.4, 0, 0.2, 1)">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Design System Tip:</strong> Use consistent spacing scales and border radius values throughout your application.
          Consider using CSS custom properties for better maintainability and theming support.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ThemeLayoutSection;
