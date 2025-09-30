import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Eye, 
  Code,
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorToken {
  name: string;
  light: string;
  dark: string;
  description: string;
}

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
  
  // State Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  
  // Border & Divider
  borderColor: string;
  dividerColor: string;
  
  // Theme Settings
  darkModeEnabled: boolean;
  defaultMode: "light" | "dark" | "system";
  
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
  
  // Layout
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  
  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Advanced
  customCSS: string;
  enableCustomCSS: boolean;
  
  // Widget Appearance
  chatBubbleStyle: "rounded" | "sharp" | "minimal";
  avatarStyle: "circle" | "square" | "rounded";
  animationsEnabled: boolean;
}

interface ThemeTabProps {
  data: ThemeData;
  onChange: (data: ThemeData) => void;
}

const defaultColorTokens: ColorToken[] = [
  { name: "Primary", light: "#1F6FEB", dark: "#58A6FF", description: "Main brand color for buttons and links" },
  { name: "Secondary", light: "#6C757D", dark: "#8B949E", description: "Secondary actions and content" },
  { name: "Accent", light: "#7C3AED", dark: "#A78BFA", description: "Highlights and special elements" },
  { name: "Background", light: "#FFFFFF", dark: "#0D1117", description: "Main background color" },
  { name: "Surface", light: "#F8FAFC", dark: "#161B22", description: "Card and panel backgrounds" },
  { name: "Text Primary", light: "#1F2937", dark: "#F0F6FC", description: "Main text color" },
  { name: "Text Secondary", light: "#6B7280", dark: "#8B949E", description: "Secondary text" },
  { name: "Border", light: "#E5E7EB", dark: "#30363D", description: "Borders and dividers" },
];

export default function ThemeTab({ data, onChange }: ThemeTabProps) {
  const [theme, setTheme] = useState<ThemeData>(data);
  const [activePreviewMode, setActivePreviewMode] = useState<"light" | "dark">("light");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [importData, setImportData] = useState("");
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  // Sync local state when parent data changes (for edit mode)
  useEffect(() => {
    setTheme(data);
  }, [data]);

  // Update parent state when theme changes
  useEffect(() => {
    onChange(theme);
  }, [theme, onChange]);

  const updateTheme = (updates: Partial<ThemeData>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const copyToClipboard = async (text: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(colorName);
      setTimeout(() => setCopiedColor(null), 2000);
      toast({
        title: "Copied!",
        description: `${colorName} color code copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportTheme = () => {
    const exportData = {
      name: "Custom Theme",
      version: "1.0.0",
      theme: theme,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Theme exported",
      description: "Theme configuration has been downloaded",
    });
  };

  const importTheme = () => {
    try {
      const parsed = JSON.parse(importData);
      if (parsed.theme) {
        setTheme(parsed.theme);
        setShowImport(false);
        setImportData("");
        toast({
          title: "Theme imported",
          description: "Theme configuration has been loaded successfully",
        });
      } else {
        throw new Error("Invalid theme format");
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid JSON format or missing theme data",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    const defaultTheme: ThemeData = {
      // Brand Colors
      primaryColor: "#1F6FEB",
      secondaryColor: "#6C757D", 
      accentColor: "#7C3AED",
      
      // Background Colors
      backgroundColor: "#FFFFFF",
      surfaceColor: "#F8FAFC",
      cardColor: "#FFFFFF",
      
      // Text Colors
      textPrimary: "#1F2937",
      textSecondary: "#6B7280", 
      textMuted: "#9CA3AF",
      
      // State Colors
      successColor: "#22C55E",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      infoColor: "#38BDF8",
      
      // Border & Divider
      borderColor: "#E5E7EB",
      dividerColor: "#F3F4F6",
      
      // Theme Settings
      darkModeEnabled: true,
      defaultMode: "system",
      
      // Typography
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem", 
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      
      // Layout
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
      },
      
      // Spacing
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem", 
        lg: "1.5rem",
        xl: "2rem",
      },
      
      // Advanced
      customCSS: "",
      enableCustomCSS: false,
      
      // Widget Appearance
      chatBubbleStyle: "rounded",
      avatarStyle: "circle",
      animationsEnabled: true,
    };
    
    setTheme(defaultTheme);
    toast({
      title: "Theme reset",
      description: "All theme settings have been reset to defaults",
    });
  };

  const previewStyles = {
    light: {
      backgroundColor: theme.backgroundColor,
      color: theme.textPrimary,
      border: `1px solid ${theme.borderColor}`,
    },
    dark: {
      backgroundColor: "#0D1117",
      color: "#F0F6FC", 
      border: "1px solid #30363D",
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-0 sm:px-0" style={{ maxWidth: '95vw' }}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Theme Customization</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowImport(!showImport)}
            data-testid="button-import-theme"
            className="flex-1 sm:flex-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportTheme}
            data-testid="button-export-theme"
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetToDefaults}
            data-testid="button-reset-theme"
            className="flex-1 sm:flex-none"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Import Section */}
      {showImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-data">Theme JSON Data</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste exported theme JSON here..."
                rows={8}
                data-testid="textarea-import-theme"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={importTheme} disabled={!importData.trim()} data-testid="button-confirm-import">
                Import Theme
              </Button>
              <Button variant="outline" onClick={() => setShowImport(false)} data-testid="button-cancel-import">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Configuration Tabs */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto">
          <TabsTrigger value="colors" data-testid="tab-colors" className="text-sm ">Colors</TabsTrigger>
          <TabsTrigger value="typography" data-testid="tab-typography" className=":text-sm">Typography</TabsTrigger>
          <TabsTrigger value="layout" data-testid="tab-layout" className="text-sm">Layout</TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced" className="text-sm">Advanced</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Color Configuration */}
            <div className="space-y-6">
              <Card className="w-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={theme.primaryColor}
                          onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-primary-color"
                        />
                        <Input
                          value={theme.primaryColor}
                          onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                          className="flex-1"
                          data-testid="input-primary-color-text"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(theme.primaryColor, "Primary")}
                          data-testid="button-copy-primary"
                        >
                          {copiedColor === "Primary" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={theme.secondaryColor}
                          onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-secondary-color"
                        />
                        <Input
                          value={theme.secondaryColor}
                          onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                          className="flex-1"
                          data-testid="input-secondary-color-text"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(theme.secondaryColor, "Secondary")}
                          data-testid="button-copy-secondary"
                        >
                          {copiedColor === "Secondary" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="w-16 h-10 p-1"
                        data-testid="input-accent-color"
                      />
                      <Input
                        value={theme.accentColor}
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="flex-1"
                        data-testid="input-accent-color-text"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(theme.accentColor, "Accent")}
                        data-testid="button-copy-accent"
                      >
                        {copiedColor === "Accent" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full overflow-hidden">
                <CardHeader>
                  <CardTitle>State Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="success-color">Success</Label>
                      <div className="flex gap-2">
                        <Input
                          id="success-color"
                          type="color"
                          value={theme.successColor}
                          onChange={(e) => updateTheme({ successColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-success-color"
                        />
                        <Input
                          value={theme.successColor}
                          onChange={(e) => updateTheme({ successColor: e.target.value })}
                          className="flex-1"
                          data-testid="input-success-color-text"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="error-color">Error</Label>
                      <div className="flex gap-2">
                        <Input
                          id="error-color"
                          type="color"
                          value={theme.errorColor}
                          onChange={(e) => updateTheme({ errorColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-error-color"
                        />
                        <Input
                          value={theme.errorColor}
                          onChange={(e) => updateTheme({ errorColor: e.target.value })}
                          className="flex-1"
                          data-testid="input-error-color-text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warning-color">Warning</Label>
                      <div className="flex gap-2">
                        <Input
                          id="warning-color"
                          type="color"
                          value={theme.warningColor}
                          onChange={(e) => updateTheme({ warningColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-warning-color"
                        />
                        <Input
                          value={theme.warningColor}
                          onChange={(e) => updateTheme({ warningColor: e.target.value })}
                          className="flex-1"
                          data-testid="input-warning-color-text"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="info-color">Info</Label>
                      <div className="flex gap-2">
                        <Input
                          id="info-color"
                          type="color"
                          value={theme.infoColor}
                          onChange={(e) => updateTheme({ infoColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-info-color"
                        />
                        <Input
                          value={theme.infoColor}
                          onChange={(e) => updateTheme({ infoColor: e.target.value })}
                          className="flex-1"
                          data-testid="input-info-color-text"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Dark Mode Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode-enabled">Enable Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Allow users to switch to dark theme</p>
                    </div>
                    <Switch
                      id="dark-mode-enabled"
                      checked={theme.darkModeEnabled}
                      onCheckedChange={(checked) => updateTheme({ darkModeEnabled: checked })}
                      data-testid="switch-dark-mode"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-mode">Default Theme Mode</Label>
                    <Select 
                      value={theme.defaultMode} 
                      onValueChange={(value: "light" | "dark" | "system") => updateTheme({ defaultMode: value })}
                    >
                      <SelectTrigger id="default-mode" data-testid="select-default-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light Mode
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark Mode
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System Preference
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant={activePreviewMode === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActivePreviewMode("light")}
                      data-testid="button-preview-light"
                      className="flex-1 sm:flex-none"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={activePreviewMode === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActivePreviewMode("dark")}
                      data-testid="button-preview-dark"
                      className="flex-1 sm:flex-none"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-6 rounded-lg space-y-4"
                    style={previewStyles[activePreviewMode]}
                    data-testid="preview-container"
                  >
                    {/* Preview Content */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">AI Chat Preview</h3>
                      
                      {/* Chat Messages */}
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div 
                            className="px-4 py-2 rounded-lg max-w-xs"
                            style={{ 
                              backgroundColor: theme.primaryColor, 
                              color: "white",
                              borderRadius: theme.chatBubbleStyle === "sharp" ? "4px" : 
                                          theme.chatBubbleStyle === "minimal" ? "8px" : "16px"
                            }}
                          >
                            How do I reset my password?
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div 
                            className="px-4 py-2 rounded-lg max-w-xs"
                            style={{ 
                              backgroundColor: activePreviewMode === "light" ? theme.surfaceColor : "#21262D",
                              color: activePreviewMode === "light" ? theme.textPrimary : "#F0F6FC",
                              borderRadius: theme.chatBubbleStyle === "sharp" ? "4px" : 
                                          theme.chatBubbleStyle === "minimal" ? "8px" : "16px"
                            }}
                          >
                            You can reset your password by clicking the "Forgot Password" link on the login page.
                          </div>
                        </div>
                      </div>

                      {/* UI Elements Preview */}
                      <div className="flex gap-2 flex-wrap">
                        <div 
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{ backgroundColor: theme.primaryColor, color: "white" }}
                        >
                          Primary Button
                        </div>
                        <div 
                          className="px-3 py-1 rounded text-sm border"
                          style={{ 
                            borderColor: theme.borderColor,
                            color: activePreviewMode === "light" ? theme.textPrimary : "#F0F6FC"
                          }}
                        >
                          Secondary Button
                        </div>
                        <div 
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: theme.successColor, color: "white" }}
                        >
                          Success
                        </div>
                        <div 
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: theme.warningColor, color: "white" }}
                        >
                          Warning
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Color Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {defaultColorTokens.map((token, index) => (
                      <div key={index} className="space-y-2">
                        <div 
                          className="h-12 rounded border cursor-pointer hover-elevate"
                          style={{ backgroundColor: 
                            token.name === "Primary" ? theme.primaryColor :
                            token.name === "Secondary" ? theme.secondaryColor :
                            token.name === "Accent" ? theme.accentColor :
                            token.name === "Background" ? theme.backgroundColor :
                            token.name === "Surface" ? theme.surfaceColor :
                            token.name === "Text Primary" ? theme.textPrimary :
                            token.name === "Text Secondary" ? theme.textSecondary :
                            token.name === "Border" ? theme.borderColor :
                            token.light
                          }}
                          onClick={() => copyToClipboard(
                            token.name === "Primary" ? theme.primaryColor :
                            token.name === "Secondary" ? theme.secondaryColor :
                            token.name === "Accent" ? theme.accentColor :
                            token.name === "Background" ? theme.backgroundColor :
                            token.name === "Surface" ? theme.surfaceColor :
                            token.name === "Text Primary" ? theme.textPrimary :
                            token.name === "Text Secondary" ? theme.textSecondary :
                            token.name === "Border" ? theme.borderColor :
                            token.light,
                            token.name
                          )}
                          data-testid={`color-swatch-${token.name.toLowerCase().replace(" ", "-")}`}
                        />
                        <div className="text-xs text-center">
                          <p className="font-medium">{token.name}</p>
                          <p className="text-muted-foreground">
                            {token.name === "Primary" ? theme.primaryColor :
                             token.name === "Secondary" ? theme.secondaryColor :
                             token.name === "Accent" ? theme.accentColor :
                             token.light}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select 
                  value={theme.fontFamily} 
                  onValueChange={(value) => updateTheme({ fontFamily: value })}
                >
                  <SelectTrigger id="font-family" data-testid="select-font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, system-ui, sans-serif">Inter (Recommended)</SelectItem>
                    <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
                    <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                    <SelectItem value="'Source Sans Pro', sans-serif">Source Sans Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-xs">Extra Small</Label>
                  <Input
                    id="font-xs"
                    value={theme.fontSize.xs}
                    onChange={(e) => updateTheme({ 
                      fontSize: { ...theme.fontSize, xs: e.target.value }
                    })}
                    data-testid="input-font-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-sm">Small</Label>
                  <Input
                    id="font-sm"
                    value={theme.fontSize.sm}
                    onChange={(e) => updateTheme({ 
                      fontSize: { ...theme.fontSize, sm: e.target.value }
                    })}
                    data-testid="input-font-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-base">Base</Label>
                  <Input
                    id="font-base"
                    value={theme.fontSize.base}
                    onChange={(e) => updateTheme({ 
                      fontSize: { ...theme.fontSize, base: e.target.value }
                    })}
                    data-testid="input-font-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-lg">Large</Label>
                  <Input
                    id="font-lg"
                    value={theme.fontSize.lg}
                    onChange={(e) => updateTheme({ 
                      fontSize: { ...theme.fontSize, lg: e.target.value }
                    })}
                    data-testid="input-font-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-xl">Extra Large</Label>
                  <Input
                    id="font-xl"
                    value={theme.fontSize.xl}
                    onChange={(e) => updateTheme({ 
                      fontSize: { ...theme.fontSize, xl: e.target.value }
                    })}
                    data-testid="input-font-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-2xl">2X Large</Label>
                  <Input
                    id="font-2xl"
                    value={theme.fontSize["2xl"]}
                    onChange={(e) => updateTheme({ 
                      fontSize: { ...theme.fontSize, "2xl": e.target.value }
                    })}
                    data-testid="input-font-2xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="radius-sm">Small</Label>
                  <Input
                    id="radius-sm"
                    value={theme.borderRadius.sm}
                    onChange={(e) => updateTheme({ 
                      borderRadius: { ...theme.borderRadius, sm: e.target.value }
                    })}
                    data-testid="input-radius-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius-md">Medium</Label>
                  <Input
                    id="radius-md"
                    value={theme.borderRadius.md}
                    onChange={(e) => updateTheme({ 
                      borderRadius: { ...theme.borderRadius, md: e.target.value }
                    })}
                    data-testid="input-radius-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius-lg">Large</Label>
                  <Input
                    id="radius-lg"
                    value={theme.borderRadius.lg}
                    onChange={(e) => updateTheme({ 
                      borderRadius: { ...theme.borderRadius, lg: e.target.value }
                    })}
                    data-testid="input-radius-lg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Widget Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chat-bubble-style">Chat Bubble Style</Label>
                  <Select 
                    value={theme.chatBubbleStyle} 
                    onValueChange={(value: "rounded" | "sharp" | "minimal") => updateTheme({ chatBubbleStyle: value })}
                  >
                    <SelectTrigger id="chat-bubble-style" data-testid="select-chat-bubble-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="sharp">Sharp</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar-style">Avatar Style</Label>
                  <Select 
                    value={theme.avatarStyle} 
                    onValueChange={(value: "circle" | "square" | "rounded") => updateTheme({ avatarStyle: value })}
                  >
                    <SelectTrigger id="avatar-style" data-testid="select-avatar-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations-enabled">Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">Smooth transitions and effects</p>
                  </div>
                  <Switch
                    id="animations-enabled"
                    checked={theme.animationsEnabled}
                    onCheckedChange={(checked) => updateTheme({ animationsEnabled: checked })}
                    data-testid="switch-animations"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Custom CSS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-custom-css">Enable Custom CSS</Label>
                  <p className="text-sm text-muted-foreground">Allow custom CSS overrides</p>
                </div>
                <Switch
                  id="enable-custom-css"
                  checked={theme.enableCustomCSS}
                  onCheckedChange={(checked) => updateTheme({ enableCustomCSS: checked })}
                  data-testid="switch-custom-css"
                />
              </div>

              {theme.enableCustomCSS && (
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS Code</Label>
                  <Textarea
                    id="custom-css"
                    value={theme.customCSS}
                    onChange={(e) => updateTheme({ customCSS: e.target.value })}
                    placeholder="/* Add your custom CSS here */&#10;.chat-widget { &#10;  /* Custom styles */ &#10;}"
                    rows={12}
                    className="font-mono text-sm"
                    data-testid="textarea-custom-css"
                  />
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Custom CSS will be injected into the widget. Use with caution and test thoroughly.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}