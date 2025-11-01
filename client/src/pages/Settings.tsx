import React, { useState, useEffect, useRef } from "react";
import { Upload, Palette, Globe, Activity, FileText, MousePointer, User } from "lucide-react";
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
import { useI18n } from "@/contexts/I18nContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useCitationFormatting } from "@/contexts/CitationFormattingContext";
import { useBackground } from "@/contexts/BackgroundContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Layers } from "lucide-react";

const Settings = React.memo(function Settings() {
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
  const [primaryColor, setPrimaryColor] = useState(primaryColorGlobal || "#1F5AAD");
  const [retentionDays, setRetentionDays] = useState(90);
  
  // Widget positioning state
  const [widgetZIndex, setWidgetZIndex] = useState(widgetZIndexGlobal || 50);
  const [widgetPosition, setWidgetPosition] = useState(widgetPositionGlobal || "bottom-right");
  const [widgetOffsetX, setWidgetOffsetX] = useState(widgetOffsetXGlobal || 0);
  const [widgetOffsetY, setWidgetOffsetY] = useState(widgetOffsetYGlobal || 0);
  
  // Background theme context
  const { backgroundTheme, setBackgroundTheme } = useBackground();
  // const [locale, setLocale] = useState("en");
  const { locale, setLocale, t } = useI18n();
  const { formatting, updateFormatting, resetFormatting } = useCitationFormatting();
  const { toast } = useToast();

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
      toast({ title: "Logo uploaded", description: "Your logo preview has been updated.", variant: "success" });
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
      toast({ title: "Branding saved", description: "Organization name, color, and logo were saved.", variant: "success" });
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
    toast({ title: "Branding reset", description: "Branding settings were reset to defaults.", variant: "info" });
  };

  const handleSaveLocale = () => {
    // I18nProvider already persists the locale; provide UX feedback only
    toast({ 
      title: t("common.success"), 
      description: `${locale} ${t('settings.i18n.defaultLanguage').toLowerCase()} ${t('common.save').toLowerCase()}d.`,
      variant: "success"
    });
  };

  const handleResetLocale = () => {
    setLocale("en");
    toast({ 
      title: t("common.success"), 
      description: `${t('settings.i18n.defaultLanguage')} ${t('common.clear').toLowerCase()}ed to English (US).`,
      variant: "success"
    });
  };


  return (
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 space-y-6 sm:px-6 lg:px-8 p-0 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('settings.description')}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full h-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" data-testid="tab-profile" className="text-xs sm:text-sm">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="retention" data-testid="tab-retention" className="text-xs sm:text-sm">{t('settings.data-retention')}</TabsTrigger>
          <TabsTrigger value="i18n" data-testid="tab-i18n" className="text-xs sm:text-sm">{t('settings.i18n')}</TabsTrigger>
          <TabsTrigger value="citations" data-testid="tab-citations" className="text-xs sm:text-sm">{t('settings.citation-formatting')}</TabsTrigger>
        </TabsList>

        {/* Profile & Branding */}
        <TabsContent value="profile" className="space-y-6">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
               Theme Option
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="space-y-4">
                <div className="">
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
                   
                      <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-upload-logo"
                          className="w-full border-none hover:bg-none p-0 sm:w-auto"
                        >
                          <div className="h-20 w-20 sm:h-16 sm:w-16 bg-sidebar flex items-center justify-center overflow-hidden">
                        {logoDataUrl ? (
                          <img src={logoDataUrl} alt="Logo preview" className="h-full w-full object-contain" />
                        ) : (
                          <User className="h-[100px] w-[100px]" />
                        )} 
                      </div>
                        </Button>
                      </div>
                      {logoDataUrl && (
                          <Button variant="ghost" onClick={handleRemoveLogo} data-testid="button-remove-logo" className="w-full border sm:w-auto">
                          Remove
                        </Button>
                      )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 64x64px PNG or SVG</p>
                  </div>
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      data-testid="input-org-name"
                      className="mt-2"
                    />
                  </div>

                  <CardContent className="space-y-6  p-0 ">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="background-theme">Background Theme</Label>
                  <Select 
                    value={backgroundTheme} 
                    onValueChange={(value) => {
                      setBackgroundTheme(value as 'geometric' | 'simple');
                      const themeNames: Record<string, string> = {
                        'geometric': 'Geometric',
                        'simple': 'Simple'
                      };
                      toast({
                        title: "Background Theme Updated",
                        description: `Background theme changed to ${themeNames[value] || value}.`,
                        variant: "success"
                      });
                    }}
                  >
                    <SelectTrigger id="background-theme" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geometric">Geometric</SelectItem>
                      <SelectItem value="simple">Default</SelectItem>
                    </SelectContent>
                  </Select>
                 
                </div>
             
              </div>
            </CardContent>

                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="mt-2 flex items-center gap-4">
                   
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => { const v = e.target.value; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        className="w-20 p-0 border-none "
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
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#1F5AAD"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-default"
                        className="p-0 w-[70px]"
                      >
                        <div className="w-[100%] bg-[#1F5AAD] h-[100%] p-0 m-0" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#EE8433"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-1"
                        className="p-0 w-[70px]"
                      >
                        <div className="w-[100%] bg-[#EE8433] h-[100%] p-0 m-0" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#4D4D4D"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-2"
                        className="p-0 w-[70px]"
                      >
                        <div className="w-[100%] bg-[#4D4D4D] h-[100%] p-0 m-0" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const v = "#D04038"; setPrimaryColor(v); setBranding({ primaryColor: v }); }}
                        data-testid="button-preset-3"
                        className="p-0 w-[70px]"
                      >
                        <div className="w-[100%] bg-[#D04038] h-[100%] p-0 m-0" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4  ">
                  <Label>Live Preview</Label>
                  <Card className="p-4 h-full flex items-center justify-start bg-white dark:bg-card">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-sidebar rounded flex items-center justify-center overflow-hidden">
                          {logoDataUrl ? (
                            <img src={logoDataUrl} alt="Logo preview" className="h-full w-full object-contain" />
                          ) : (
                            <User className="h-4 w-4" />
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

              <div className="flex flex-col sm:flex-row justify-end gap-2  pt-10">
                <Button variant="outline" onClick={handleResetBranding} className="w-full sm:w-auto">Reset</Button>
                <Button onClick={handleSaveBranding} data-testid="button-save-branding" className="w-full sm:w-auto group">Save Changes</Button>
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
              <div className="grid gap-6 grid-cols-1 ">
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
                      <SelectTrigger id="widget-position" className="mt-2"  >
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
                      className="mt-2"
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
                      className="mt-2"
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
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Positive = move down, Negative = move up
                    </p>
                  </div>
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
                  className="w-full mt-2"
                  data-testid="input-retention-days"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Number of days to retain user queries, responses, and feedback data
                </p>
              </div>

              <div className="p-4 bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 border ">
                <h4 className="font-medium mb-2 text-yellow-900 dark:text-yellow-100">Data Retention Policy</h4>
                <ul className="text-sm text-yellow-900 dark:text-yellow-100 space-y-1">
                  <li>• Query logs and responses will be automatically deleted after {retentionDays} days</li>
                  <li>• User feedback and analytics data will be retained for the same period</li>
                  <li>• Crawled documents and embeddings are not affected by this policy</li>
                  <li>• System logs and audit trails follow separate retention rules</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" className="w-full sm:w-auto">Reset</Button>
                <Button data-testid="button-save-retention" className="w-full sm:w-auto">Save Changes</Button>
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
                <Select value={locale} onValueChange={setLocale}  >
                  <SelectTrigger className="w-full mt-2" data-testid="select-locale">
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
              </div>

        

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={handleResetLocale} className="w-full sm:w-auto">
                  Reset
                </Button>
                <Button data-testid="button-save-locale" onClick={handleSaveLocale} className="w-full sm:w-auto group">
                  Save Changes
                </Button>
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
                Citation Format
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
                  <SelectTrigger className="w-full mt-2">
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
                  <SelectTrigger className="w-full mt-2">
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
                  <SelectTrigger className="w-full mt-2">
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
                  <SelectTrigger className="w-full mt-2">
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
                  <Switch
                    checked={formatting.showSnippets}
                    onCheckedChange={(checked: boolean) => updateFormatting({ showSnippets: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show URLs</Label>
                    <p className="text-xs text-muted-foreground">
                      Display source links
                    </p>
                  </div>
                  <Switch
                    checked={formatting.showUrls}
                    onCheckedChange={(checked: boolean) => updateFormatting({ showUrls: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Source Count</Label>
                    <p className="text-xs text-muted-foreground">
                      Display number of sources
                    </p>
                  </div>
                  <Switch
                    checked={formatting.showSourceCount}
                    onCheckedChange={(checked: boolean) => updateFormatting({ showSourceCount: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Hover Effects</Label>
                    <p className="text-xs text-muted-foreground">
                      Add hover animations
                    </p>
                  </div>
                  <Switch
                    checked={formatting.enableHover}
                    onCheckedChange={(checked: boolean) => updateFormatting({ enableHover: checked })}
                  />
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
                <div className="mt-3 p-3 bg-muted rounded-[2px] border">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {`This is a sample citation snippet that demonstrates how the text will be truncated when it exceeds the maximum length you've set. `.repeat(3).substring(0, formatting.maxSnippetLength)}
                    {formatting.maxSnippetLength < `This is a sample citation snippet that demonstrates how the text will be truncated when it exceeds the maximum length you've set. `.repeat(3).length && "..."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={resetFormatting} className="w-full sm:w-auto">
                  Reset
                </Button>
                <Button className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
});

export default Settings;
