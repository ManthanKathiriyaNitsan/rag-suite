import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Code,
  Download,
  Upload,
  RotateCcw,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ThemeAdvancedSectionProps {
  theme: {
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
  };
  onUpdateTheme: (updates: Partial<typeof theme>) => void;
  onExportTheme: () => void;
}

const ThemeAdvancedSection: React.FC<ThemeAdvancedSectionProps> = ({
  theme,
  onUpdateTheme,
  onExportTheme
}) => {
  const [importData, setImportData] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const updateFeature = useCallback((feature: keyof typeof theme.features, value: boolean) => {
    onUpdateTheme({
      features: {
        ...theme.features,
        [feature]: value
      }
    });
  }, [theme.features, onUpdateTheme]);

  const updateBreakpoint = useCallback((breakpoint: keyof typeof theme.breakpoints, value: string) => {
    onUpdateTheme({
      breakpoints: {
        ...theme.breakpoints,
        [breakpoint]: value
      }
    });
  }, [theme.breakpoints, onUpdateTheme]);

  const updateZIndex = useCallback((layer: keyof typeof theme.zIndex, value: number) => {
    onUpdateTheme({
      zIndex: {
        ...theme.zIndex,
        [layer]: value
      }
    });
  }, [theme.zIndex, onUpdateTheme]);

  const updateCustomCSS = useCallback((css: string) => {
    onUpdateTheme({ customCSS: css });
  }, [onUpdateTheme]);

  const handleImport = useCallback(() => {
    try {
      const importedTheme = JSON.parse(importData);
      onUpdateTheme(importedTheme);
      setImportData("");
      setShowImport(false);
      toast({
        title: "Theme imported successfully",
        description: "Your custom theme has been applied",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid theme data. Please check your JSON format.",
        variant: "destructive",
      });
    }
  }, [importData, onUpdateTheme, toast]);

  const resetTheme = useCallback(() => {
    onUpdateTheme({
      customCSS: "",
      features: {
        darkMode: true,
        reducedMotion: false,
        highContrast: false,
        focusVisible: true,
        animations: true,
      },
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      zIndex: {
        dropdown: 1000,
        modal: 1050,
        tooltip: 1100,
        notification: 1150,
      }
    });
    toast({
      title: "Theme reset",
      description: "Theme has been reset to default values",
    });
  }, [onUpdateTheme, toast]);

  const copyCustomCSS = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(theme.customCSS);
      toast({
        title: "CSS copied!",
        description: "Custom CSS copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy CSS to clipboard",
        variant: "destructive",
      });
    }
  }, [theme.customCSS, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Advanced Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Custom CSS, accessibility features, and advanced configuration options
        </p>
      </div>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(theme.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {feature === 'darkMode' && 'Enable automatic dark mode detection and switching'}
                    {feature === 'reducedMotion' && 'Respect user\'s motion preferences for accessibility'}
                    {feature === 'highContrast' && 'Provide high contrast mode for better visibility'}
                    {feature === 'focusVisible' && 'Show visible focus indicators for keyboard navigation'}
                    {feature === 'animations' && 'Enable smooth animations and transitions'}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => updateFeature(feature as keyof typeof theme.features, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsive Breakpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure breakpoints for responsive design. These values are used for media queries and responsive utilities.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(theme.breakpoints).map(([breakpoint, value]) => (
              <div key={breakpoint} className="space-y-2">
                <Label htmlFor={`breakpoint-${breakpoint}`} className="text-xs font-medium">
                  {breakpoint}
                </Label>
                <input
                  id={`breakpoint-${breakpoint}`}
                  type="text"
                  value={value}
                  onChange={(e) => updateBreakpoint(breakpoint as keyof typeof theme.breakpoints, e.target.value)}
                  className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background"
                  placeholder="640px"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Breakpoint Preview:</p>
            <div className="space-y-1 text-xs font-mono">
              <div>sm: {theme.breakpoints.sm} and up</div>
              <div>md: {theme.breakpoints.md} and up</div>
              <div>lg: {theme.breakpoints.lg} and up</div>
              <div>xl: {theme.breakpoints.xl} and up</div>
              <div>2xl: {theme.breakpoints["2xl"]} and up</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Z-Index Layers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Z-Index Layers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(theme.zIndex).map(([layer, value]) => (
              <div key={layer} className="space-y-2">
                <Label htmlFor={`zindex-${layer}`} className="text-xs font-medium">
                  {layer.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <input
                  id={`zindex-${layer}`}
                  type="number"
                  value={value}
                  onChange={(e) => updateZIndex(layer as keyof typeof theme.zIndex, parseInt(e.target.value))}
                  className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background"
                  placeholder="1000"
                />
              </div>
            ))}
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Z-index values determine the stacking order of overlapping elements. Higher values appear on top.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom CSS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-css" className="text-sm font-medium">
                Additional CSS Rules
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCustomCSS}
                  disabled={!theme.customCSS}
                >
                  <Code className="h-4 w-4 mr-1" />
                  Copy CSS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </div>
            <Textarea
              id="custom-css"
              value={theme.customCSS}
              onChange={(e) => updateCustomCSS(e.target.value)}
              placeholder="/* Add your custom CSS here */
.my-custom-class {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  padding: 1rem;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}"
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          
          {showPreview && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">CSS Preview:</p>
              <pre className="text-xs font-mono overflow-x-auto">
                {theme.customCSS || '/* No custom CSS added yet */'}
              </pre>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Custom CSS will be applied globally to your application. Use CSS custom properties for better theming integration.
              <br />
              <strong>Example:</strong> <code>color: var(--primary); background: var(--background);</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import & Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={onExportTheme} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Theme
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Theme
            </Button>
            <Button 
              variant="outline" 
              onClick={resetTheme}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </div>

          {showImport && (
            <div className="space-y-3 p-4 border rounded-lg">
              <Label htmlFor="import-data" className="text-sm font-medium">
                Paste Theme JSON
              </Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='{"primaryColor": "#3b82f6", "fontFamily": "Inter", ...}'
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleImport} size="sm">
                  Import Theme
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportData("");
                    setShowImport(false);
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Importing a theme will overwrite your current settings.
              Make sure to export your current theme before importing a new one.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeAdvancedSection;
