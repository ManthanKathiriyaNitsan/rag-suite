import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { Upload, Palette, Globe, Key, Activity, Eye, EyeOff, Copy, Trash2, Plus, FileText, Loader2, MousePointer } from "lucide-react";

// 🚀 Lazy load heavy form components
const CreateApiKeyForm = lazy(() => import("@/components/forms/CreateApiKeyForm"));
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/contexts/I18nContext";
import { PointerTypes } from "@/components/ui/AnimatedPointer";
import { ConditionalPointerTypes } from "@/components/ui/ConditionalPointer";
import { useBranding } from "@/contexts/BrandingContext";
import { useCitationFormatting } from "@/contexts/CitationFormattingContext";
import { useCursor } from "@/contexts/CursorContext";
import ResponsiveDarkVeil from "@/components/ui/ResponsiveDarkVeil";
import { GlassCard } from "@/components/ui/GlassCard";

const Settings = React.memo(function Settings() {
  // 📝 Memoized API keys data
  const apiKeys = useMemo(() => [
    {
      id: "key-001",
      name: "Production API Key",
      key: "rgs_live_1234567890abcdef",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      requests: 15420,
      rateLimit: 1000,
    },
    {
      id: "key-002",
      name: "Development API Key",
      key: "rgs_test_abcdef1234567890",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 5 * 60 * 1000),
      requests: 2847,
      rateLimit: 100,
    },
  ], []);

  // 📊 Memoized system services data
  const systemServices = useMemo(() => [
    { name: "API Gateway", status: "healthy", lastHeartbeat: new Date(Date.now() - 30 * 1000), uptime: "99.9%" },
    { name: "Redis Cache", status: "healthy", lastHeartbeat: new Date(Date.now() - 45 * 1000), uptime: "99.8%" },
    { name: "Vector Database", status: "degraded", lastHeartbeat: new Date(Date.now() - 2 * 60 * 1000), uptime: "98.5%" },
    { name: "PostgreSQL", status: "healthy", lastHeartbeat: new Date(Date.now() - 15 * 1000), uptime: "99.9%" },
    { name: "OpenAI API", status: "healthy", lastHeartbeat: new Date(Date.now() - 20 * 1000), uptime: "99.7%" },
  ], []);
  const { 
    orgName: orgNameGlobal, 
    primaryColor: primaryColorGlobal, 
    logoDataUrl: logoGlobal, 
    widgetZIndex: widgetZIndexGlobal,
    widgetPosition: widgetPositionGlobal,
    widgetOffsetX: widgetOffsetXGlobal,
    widgetOffsetY: widgetOffsetYGlobal,
    setBranding, 
    resetBranding 
  } = useBranding();
  const [orgName, setOrgName] = useState(orgNameGlobal || "Acme Corporation");
  const [primaryColor, setPrimaryColor] = useState(primaryColorGlobal || "#1F6FEB");
  const [retentionDays, setRetentionDays] = useState(90);
  
  // Widget positioning state
  const [widgetZIndex, setWidgetZIndex] = useState(widgetZIndexGlobal || 50);
  const [widgetPosition, setWidgetPosition] = useState(widgetPositionGlobal || "bottom-right");
  const [widgetOffsetX, setWidgetOffsetX] = useState(widgetOffsetXGlobal || 0);
  const [widgetOffsetY, setWidgetOffsetY] = useState(widgetOffsetYGlobal || 0);
  
  // Custom cursor context
  const { customCursorEnabled, setCustomCursorEnabled, pointerIconsEnabled, setPointerIconsEnabled } = useCursor();
  // const [locale, setLocale] = useState("en");
  const { locale, setLocale, t } = useI18n();
  const { formatting, updateFormatting, resetFormatting } = useCitationFormatting();
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "default";
      case "degraded":
        return "secondary";
      case "down":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleCreateApiKey = (data: Record<string, unknown>) => {
    console.log("Creating API key:", data);
    toast({
      title: "API Key Created",
      description: `Successfully created ${data.name}`,
    });
  };

  const handleRevokeApiKey = (keyId: string) => {
    console.log("Revoking API key:", keyId);
    toast({
      title: "API Key Revoked",
      description: "API key has been revoked and is no longer valid",
      variant: "destructive",
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    console.log("API key copied to clipboard");
  };

  // Branding: logo upload + persistence
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("branding");
      if (saved) {
        const b = JSON.parse(saved) as { orgName?: string; primaryColor?: string; logoDataUrl?: string | null };
        if (typeof b.orgName !== "undefined") setOrgName(b.orgName ?? "");
        if (typeof b.primaryColor !== "undefined") setPrimaryColor(b.primaryColor ?? "");
        if (typeof b.logoDataUrl !== "undefined") setLogoDataUrl(b.logoDataUrl ?? null);
      }
    } catch (e) {
      console.warn("Failed to load branding from localStorage", e);
    }
  }, []); // Empty dependency array - runs only on mount

  const handleLogoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoDataUrl(result);
      toast({ title: "Logo uploaded", description: "Your logo preview has been updated." });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveBranding = () => {
    try {
      const data = { orgName, primaryColor, logoDataUrl };
      localStorage.setItem("branding", JSON.stringify(data));
      setBranding(data); // update global context so all pages reflect immediately
      toast({ title: "Branding saved", description: "Organization name, color, and logo were saved." });
    } catch (e) {
      toast({ title: "Save failed", description: "Could not save branding settings.", variant: "destructive" });
    }
  };

  const handleResetBranding = () => {
    setOrgName("Acme Corporation");
    setPrimaryColor("#1F6FEB");
    setLogoDataUrl(null);
    resetBranding();
    localStorage.removeItem("branding");
    toast({ title: "Branding reset", description: "Branding settings were reset to defaults." });
  };

  const handleSaveLocale = () => {
    // I18nProvider already persists the locale; provide UX feedback only
    toast({ 
      title: t("common.success"), 
      description: `${locale} ${t('settings.i18n.defaultLanguage').toLowerCase()} ${t('common.save').toLowerCase()}d.` 
    });
  };

  const handleResetLocale = () => {
    setLocale("en");
    toast({ 
      title: t("common.success"), 
      description: `${t('settings.i18n.defaultLanguage')} ${t('common.clear').toLowerCase()}ed to English (US).` 
    });
  };

  // Custom cursor toggle handlers
  const handleCursorToggle = (enabled: boolean) => {
    setCustomCursorEnabled(enabled);
    toast({
      title: "Cursor Setting Updated",
      description: enabled ? "Custom cursor is now enabled" : "Default cursor is now enabled",
    });
  };

  // Pointer icons toggle handlers
  const handlePointerIconsToggle = (enabled: boolean) => {
    setPointerIconsEnabled(enabled);
    toast({
      title: "Pointer Icons Setting Updated",
      description: enabled ? "Animated pointer icons are now enabled" : "Animated pointer icons are now disabled",
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* Theme-aware Background */}
      <ResponsiveDarkVeil />
      
      {/* Content */}
      <div className="relative z-10 space-y-6 sm:px-6 lg:px-8 p-0 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('settings.description')}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full h-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="profile" data-testid="tab-profile" className="text-xs sm:text-sm">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="retention" data-testid="tab-retention" className="text-xs sm:text-sm">{t('settings.data-retention')}</TabsTrigger>
          <TabsTrigger value="i18n" data-testid="tab-i18n" className="text-xs sm:text-sm">{t('settings.i18n')}</TabsTrigger>
          <TabsTrigger value="citations" data-testid="tab-citations" className="text-xs sm:text-sm">{t('settings.citation-formatting')}</TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys" className="text-xs sm:text-sm">{t('settings.api-keys')}</TabsTrigger>
          <TabsTrigger value="health" data-testid="tab-health" className="text-xs sm:text-sm">{t('settings.system-health')}</TabsTrigger>
        </TabsList>

        {/* Profile & Branding */}
        <TabsContent value="profile" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Organization Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      data-testid="input-org-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo-upload">Logo Upload</Label>
                    <input
                      id="logo-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                      data-testid="input-logo-file"
                    />
                    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="h-20 w-20 sm:h-16 sm:w-16 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                        {logoDataUrl ? (
                          <img src={logoDataUrl} alt="Logo preview" className="h-full w-full object-contain" />
                        ) : (
                          <Upload className="h-8 w-8 sm:h-6 sm:w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-upload-logo"
                          className="w-full sm:w-auto"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        <ConditionalPointerTypes.Upload className="absolute inset-0" />
                      </div>
                      {logoDataUrl && (
                          <Button variant="ghost" onClick={handleRemoveLogo} data-testid="button-remove-logo" className="w-full sm:w-auto">
                          Remove
                        </Button>
                      )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 64x64px PNG or SVG</p>
                  </div>

                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-10 w-20 rounded border" style={{ backgroundColor: primaryColor }} />
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => { const v = e.target.value; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        className="w-20"
                        data-testid="input-primary-color"
                      />
                      <Input
                        type="text"
                        placeholder="#1F6FEB"
                        value={primaryColor}
                        onChange={(e) => {
                          let v = e.target.value.trim();
                          if (/^[0-9a-fA-F]{6}$/.test(v)) v = '#' + v; // add # for 6-char hex
                          setPrimaryColor(v);
                          if (v.startsWith('#') || v.startsWith('rgb(') || v.startsWith('hsl(')) {
                            setBranding({ primaryColor: v });
                          }
                        }}
                        onBlur={(e) => {
                          let v = e.target.value.trim();
                          if (/^[0-9a-fA-F]{3}$/.test(v)) v = '#' + v; // add # for 3-char hex
                          if (/^[0-9a-fA-F]{6}$/.test(v)) v = '#' + v; // add # for 6-char hex
                          setPrimaryColor(v);
                          if (v.startsWith('#') || v.startsWith('rgb(') || v.startsWith('hsl(')) {
                            setBranding({ primaryColor: v });
                          }
                        }}
                        className="font-mono"
                        data-testid="input-primary-color-hex"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Theme Presets</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#1F6FEB"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-blue"
                      >
                        <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
                        Blue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#22C55E"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-green"
                      >
                        <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                        Green
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#8B5CF6"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-purple"
                      >
                        <div className="w-4 h-4 bg-purple-500 rounded mr-2" />
                        Purple
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Live Preview</Label>
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-secondary rounded flex items-center justify-center overflow-hidden">
                          {logoDataUrl ? (
                            <img src={logoDataUrl} alt="Logo preview" className="h-full w-full object-contain" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-semibold">{orgName}</span>
                      </div>
                      <Button style={{ backgroundColor: primaryColor }} className="text-white">
                        Primary Button
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        This is how your branding will appear in the admin interface and embeddable widget.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="relative">
                  <Button variant="outline" onClick={handleResetBranding} className="w-full sm:w-auto">Reset</Button>
                  <ConditionalPointerTypes.Refresh className="absolute inset-0" />
                </div>
                <div className="relative">
                  <Button onClick={handleSaveBranding} data-testid="button-save-branding" className="w-full sm:w-auto group">Save Changes</Button>
                  <ConditionalPointerTypes.Save className="absolute inset-0" />
                </div>
              </div>
            </CardContent>
          </GlassCard>

          {/* Widget Positioning Controls */}
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Widget Positioning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="widget-position">Widget Position</Label>
                    <Select 
                      value={widgetPosition} 
                      onValueChange={(value) => {
                        setWidgetPosition(value as any);
                        setBranding({ widgetPosition: value as any });
                      }}
                    >
                      <SelectTrigger id="widget-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="widget-zindex">Z-Index Level</Label>
                    <Input
                      id="widget-zindex"
                      type="number"
                      value={widgetZIndex}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 50;
                        setWidgetZIndex(value);
                        setBranding({ widgetZIndex: value });
                      }}
                      placeholder="50"
                      data-testid="input-widget-zindex"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Higher values appear above other elements
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="widget-offset-x">X Offset (pixels)</Label>
                    <Input
                      id="widget-offset-x"
                      type="number"
                      value={widgetOffsetX}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setWidgetOffsetX(value);
                        setBranding({ widgetOffsetX: value });
                      }}
                      placeholder="0"
                      data-testid="input-widget-offset-x"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Positive = move right, Negative = move left
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="widget-offset-y">Y Offset (pixels)</Label>
                    <Input
                      id="widget-offset-y"
                      type="number"
                      value={widgetOffsetY}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setWidgetOffsetY(value);
                        setBranding({ widgetOffsetY: value });
                      }}
                      placeholder="0"
                      data-testid="input-widget-offset-y"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Positive = move down, Negative = move up
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          {/* Custom Cursor Toggle */}
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Custom Cursor Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Custom Cursor</Label>
                    <p className="text-xs text-muted-foreground">
                      Toggle between custom animated cursor and default system cursor
                    </p>
                  </div>
                  <div className="relative">
                    <Switch
                      checked={customCursorEnabled}
                      onCheckedChange={handleCursorToggle}
                      data-testid="switch-custom-cursor"
                    />
                    <ConditionalPointerTypes.Settings className="absolute inset-0" />
                  </div>
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-medium mb-2">Cursor Preview</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                        <MousePointer className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">
                        {customCursorEnabled ? "Custom animated cursor" : "Default system cursor"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {customCursorEnabled 
                        ? "Smooth animated cursor with theme-aware colors" 
                        : "Standard browser cursor"
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={() => handleCursorToggle(true)}
                    className="w-full sm:w-auto"
                    data-testid="button-enable-cursor"
                  >
                    Enable Custom Cursor
                  </Button>
                  <ConditionalPointerTypes.Settings className="absolute inset-0" />
                </div>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={() => handleCursorToggle(false)}
                    className="w-full sm:w-auto"
                    data-testid="button-disable-cursor"
                  >
                    Use Default Cursor
                  </Button>
                  <ConditionalPointerTypes.Refresh className="absolute inset-0" />
                </div>
              </div>
            </CardContent>
          </GlassCard>

          {/* Pointer Icons Toggle */}
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Animated Pointer Icons Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Animated Pointer Icons</Label>
                    <p className="text-xs text-muted-foreground">
                      Toggle animated pointer icons on buttons and interactive elements
                    </p>
                  </div>
                  <div className="relative">
                    <Switch
                      checked={pointerIconsEnabled}
                      onCheckedChange={handlePointerIconsToggle}
                      data-testid="switch-pointer-icons"
                    />
                    <ConditionalPointerTypes.Settings className="absolute inset-0" />
                  </div>
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-medium mb-2">Pointer Icons Preview</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                        <MousePointer className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">
                        {pointerIconsEnabled ? "Animated pointer icons enabled" : "Animated pointer icons disabled"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pointerIconsEnabled 
                        ? "Interactive elements show animated pointer icons on hover" 
                        : "Interactive elements show no animated pointer icons"
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePointerIconsToggle(true)}
                    className="w-full sm:w-auto"
                    data-testid="button-enable-pointer-icons"
                  >
                    Enable Pointer Icons
                  </Button>
                  <ConditionalPointerTypes.Settings className="absolute inset-0" />
                </div>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePointerIconsToggle(false)}
                    className="w-full sm:w-auto"
                    data-testid="button-disable-pointer-icons"
                  >
                    Disable Pointer Icons
                  </Button>
                  <ConditionalPointerTypes.Refresh className="absolute inset-0" />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* Data Retention */}
        <TabsContent value="retention" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle>Data Retention Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="retention-days">Retention Period (Days)</Label>
                <Input
                  id="retention-days"
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  className="w-32 mt-2"
                  data-testid="input-retention-days"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Number of days to retain user queries, responses, and feedback data
                </p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Data Retention Policy</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Query logs and responses will be automatically deleted after {retentionDays} days</li>
                  <li>• User feedback and analytics data will be retained for the same period</li>
                  <li>• Crawled documents and embeddings are not affected by this policy</li>
                  <li>• System logs and audit trails follow separate retention rules</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="relative">
                  <Button variant="outline" className="w-full sm:w-auto">Reset to Default</Button>
                  <ConditionalPointerTypes.Refresh className="absolute inset-0" />
                </div>
                <div className="relative">
                  <Button data-testid="button-save-retention" className="w-full sm:w-auto">Save Policy</Button>
                  <ConditionalPointerTypes.Save className="absolute inset-0" />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* Internationalization */}
        <TabsContent value="i18n" className="space-y-6" >
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.i18n.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="locale">{t('settings.i18n.defaultLanguage')}</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="w-full sm:w-64 mt-2" data-testid="select-locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English (US)</SelectItem>
                    <SelectItem value="en-gb">🇬🇧 English (UK)</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文</SelectItem>
                    <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                    <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('settings.i18n.description')}
                </p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Translation Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Interface</span>
                    <Badge variant="default">100% Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Widget Interface</span>
                    <Badge variant="default">100% Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Messages</span>
                    <Badge className=" bg-red-600 text-white ">85% Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Documentation</span>
                    <Badge variant="outline">Available in English only</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="relative">
                  <Button variant="outline" onClick={handleResetLocale} className="w-full sm:w-auto">
                    {t('common.clear')} / Reset to Default
                  </Button>
                  <ConditionalPointerTypes.Refresh className="absolute inset-0" />
                </div>
                <div className="relative">
                  <Button data-testid="button-save-locale" onClick={handleSaveLocale} className="w-full sm:w-auto group">
                    {t('common.save')} / {t('settings.i18n.save')}
                  </Button>
                  <ConditionalPointerTypes.Save className="absolute inset-0" />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* Citation Formatting */}
        <TabsContent value="citations" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Citation Formatting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Citation Style */}
              <div>
                <Label htmlFor="citation-style">Citation Style</Label>
                <Select 
                  value={formatting.style} 
                  onValueChange={(value: any) => updateFormatting({ style: value })}
                >
                  <SelectTrigger className="w-full sm:w-64 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how citations are displayed
                </p>
              </div>

              {/* Layout */}
              <div>
                <Label htmlFor="citation-layout">Layout</Label>
                <Select 
                  value={formatting.layout} 
                  onValueChange={(value: any) => updateFormatting({ layout: value })}
                >
                  <SelectTrigger className="w-full sm:w-64 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  How citations are arranged
                </p>
              </div>

              {/* Numbering Style */}
              <div>
                <Label htmlFor="citation-numbering">Numbering Style</Label>
                <Select 
                  value={formatting.numbering} 
                  onValueChange={(value: any) => updateFormatting({ numbering: value })}
                >
                  <SelectTrigger className="w-full sm:w-64 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brackets">[1] [2] [3]</SelectItem>
                    <SelectItem value="parentheses">(1) (2) (3)</SelectItem>
                    <SelectItem value="dots">1. 2. 3.</SelectItem>
                    <SelectItem value="numbers">1 2 3</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  How citations are numbered
                </p>
              </div>

              {/* Color Scheme */}
              <div>
                <Label htmlFor="citation-colors">Color Scheme</Label>
                <Select 
                  value={formatting.colorScheme} 
                  onValueChange={(value: any) => updateFormatting({ colorScheme: value })}
                >
                  <SelectTrigger className="w-full sm:w-64 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="muted">Muted</SelectItem>
                    <SelectItem value="accent">Accent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Citation color theme
                </p>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Display Options</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Snippets</Label>
                    <p className="text-xs text-muted-foreground">
                      Display content snippets
                    </p>
                  </div>
                  <div className="relative">
                    <Switch
                      checked={formatting.showSnippets}
                      onCheckedChange={(checked: boolean) => updateFormatting({ showSnippets: checked })}
                    />
                    <ConditionalPointerTypes.Settings className="absolute inset-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show URLs</Label>
                    <p className="text-xs text-muted-foreground">
                      Display source links
                    </p>
                  </div>
                  <div className="relative">
                    <Switch
                      checked={formatting.showUrls}
                      onCheckedChange={(checked: boolean) => updateFormatting({ showUrls: checked })}
                    />
                    <ConditionalPointerTypes.Settings className="absolute inset-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Source Count</Label>
                    <p className="text-xs text-muted-foreground">
                      Display number of sources
                    </p>
                  </div>
                  <div className="relative">
                    <Switch
                      checked={formatting.showSourceCount}
                      onCheckedChange={(checked: boolean) => updateFormatting({ showSourceCount: checked })}
                    />
                    <ConditionalPointerTypes.Settings className="absolute inset-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Hover Effects</Label>
                    <p className="text-xs text-muted-foreground">
                      Add hover animations
                    </p>
                  </div>
                  <div className="relative">
                    <Switch
                      checked={formatting.enableHover}
                      onCheckedChange={(checked: boolean) => updateFormatting({ enableHover: checked })}
                    />
                    <ConditionalPointerTypes.Settings className="absolute inset-0" />
                  </div>
                </div>
              </div>

              {/* Snippet Length */}
              <div>
                <Label htmlFor="snippet-length">Max Snippet Length</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="25"
                    value={formatting.maxSnippetLength}
                    onChange={(e) => updateFormatting({ maxSnippetLength: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-16">
                    {formatting.maxSnippetLength} chars
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum length of content snippets
                </p>
                
                {/* Live Preview */}
                <div className="mt-3 p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {`This is a sample citation snippet that demonstrates how the text will be truncated when it exceeds the maximum length you've set. `.repeat(3).substring(0, formatting.maxSnippetLength)}
                    {formatting.maxSnippetLength < `This is a sample citation snippet that demonstrates how the text will be truncated when it exceeds the maximum length you've set. `.repeat(3).length && "..."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="relative">
                  <Button variant="outline" onClick={resetFormatting} className="w-full sm:w-auto">
                    Reset to Default
                  </Button>
                  <ConditionalPointerTypes.Refresh className="absolute inset-0" />
                </div>
                <div className="relative">
                  <Button className="w-full sm:w-auto">
                    Save Settings
                  </Button>
                  <ConditionalPointerTypes.Save className="absolute inset-0" />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-6">
          <GlassCard>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('api-keys.title')}
              </CardTitle>
              <Button
                onClick={() => setShowCreateKeyForm(true)}
                data-testid="button-create-api-key"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('api-keys.create')}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="space-y-3 p-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="border rounded-lg p-4 space-y-3" data-testid={`row-api-key-${key.id}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{key.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeApiKey(key.id)}
                          data-testid={`button-revoke-key-${key.id}`}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground">API Key</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                              {showApiKey === key.id ? key.key : `${key.key.slice(0, 20)}...`}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                              data-testid={`button-toggle-key-${key.id}`}
                              className="h-6 w-6 p-0"
                            >
                              {showApiKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(key.key)}
                              data-testid={`button-copy-key-${key.id}`}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-muted-foreground">Created</label>
                            <p className="mt-1">{key.createdAt.toLocaleDateString(locale)}</p>
                          </div>
                          <div>
                            <label className="text-muted-foreground">Last Used</label>
                            <p className="mt-1">
                              {new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
                                Math.floor((key.lastUsed.getTime() - Date.now()) / (1000 * 60)),
                                "minute"
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="text-muted-foreground">Requests</label>
                            <p className="mt-1">{key.requests.toLocaleString(locale)}</p>
                          </div>
                          <div>
                            <label className="text-muted-foreground">Rate Limit</label>
                            <p className="mt-1">{key.rateLimit}/hour</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('api-keys.name')}</TableHead>
                        <TableHead>{t('api-keys.key')}</TableHead>
                        <TableHead>{t('api-keys.created')}</TableHead>
                        <TableHead>{t('api-keys.lastUsed')}</TableHead>
                        <TableHead>{t('api-keys.requests')}</TableHead>
                        <TableHead>{t('api-keys.rateLimit')}</TableHead>
                        <TableHead className="text-center">{t('api-keys.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                          <TableCell className="font-medium">{key.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                                {showApiKey === key.id ? key.key : `${key.key.slice(0, 20)}...`}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                                  data-testid={`button-toggle-key-${key.id}`}
                                  className="h-6 w-6 p-0"
                                >
                                  {showApiKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyKey(key.key)}
                                  data-testid={`button-copy-key-${key.id}`}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {key.createdAt.toLocaleDateString(locale)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
                              Math.floor((key.lastUsed.getTime() - Date.now()) / (1000 * 60)),
                              "minute"
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{key.requests.toLocaleString(locale)}</TableCell>
                          <TableCell className="text-sm">{key.rateLimit}/hour</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeApiKey(key.id)}
                              data-testid={`button-revoke-key-${key.id}`}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        {/* System Health */}
        <TabsContent value="health" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {systemServices.map((service, index) => (
                  <GlassCard key={index} data-testid={`service-card-${index}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <Badge variant={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{service.uptime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Heartbeat</span>
                        <span className="font-medium">
                          {new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
                            Math.floor((service.lastHeartbeat.getTime() - Date.now()) / 1000),
                            "second"
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </GlassCard>
                ))}
              </div>

              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Health Legend</h4>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Healthy</Badge>
                    <span className="text-muted-foreground">Service operating normally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Degraded</Badge>
                    <span className="text-muted-foreground">Service experiencing issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Down</Badge>
                    <span className="text-muted-foreground">Service unavailable</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Create API Key Form */}
      <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
        <CreateApiKeyForm
          open={showCreateKeyForm}
          onOpenChange={setShowCreateKeyForm}
          onSubmit={handleCreateApiKey}
        />
      </Suspense>
      </div>
    </div>
  );
});

export default Settings;
