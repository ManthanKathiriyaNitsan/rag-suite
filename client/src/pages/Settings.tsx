import React, { useState, useEffect, useRef } from "react";
import { Upload, Palette, Globe, FileText, MousePointer, User } from "lucide-react";
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
import { useBackground } from "@/contexts/BackgroundContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Layers } from "lucide-react";
import { useSettingsAPI } from "@/hooks/useSettingsAPI";

const Settings = React.memo(function Settings() {
  const {
    orgName: orgNameGlobal,
    primaryColor: primaryColorGlobal,
    logoDataUrl: logoGlobal,
    setBranding,
    resetBranding
  } = useBranding();
  
  // Use settings API for branding data
  const { settings, isLoading: isLoadingSettings, saveSettingsAsync, isSaving, refetchSettings } = useSettingsAPI();
  
  const [orgName, setOrgName] = useState(orgNameGlobal || "Acme Corporation");
  const [primaryColor, setPrimaryColor] = useState(primaryColorGlobal || "#1F5AAD");
  const [retentionDays, setRetentionDays] = useState(90);

  // Background theme context
  const { backgroundTheme, setBackgroundTheme } = useBackground();
  // const [locale, setLocale] = useState("en");
  const { locale, setLocale, t } = useI18n();
  const { toast } = useToast();

  // Branding: logo upload + persistence
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from API on mount
  useEffect(() => {
    if (settings) {
      if (settings.org_name) setOrgName(settings.org_name);
      if (settings.primary_color) setPrimaryColor(settings.primary_color);
      if (settings.logo_data_url !== undefined) setLogoDataUrl(settings.logo_data_url);
      }
  }, [settings]);

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

  const handleSaveBranding = async () => {
    try {
      // Save to API
      await saveSettingsAsync({
        org_name: orgName.trim(),
        primary_color: primaryColor,
        logo_data_url: logoDataUrl,
      });
      
      // Update global context so all pages reflect immediately
      setBranding({
        orgName: orgName.trim(),
        primaryColor: primaryColor,
        logoDataUrl: logoDataUrl,
      });
      
      // Refetch settings to ensure consistency
      await refetchSettings();
    } catch (error) {
      // Error handled by hook (toast notification)
      console.error("Failed to save branding:", error);
    }
  };

  const handleResetBranding = async () => {
    try {
      // Reset to defaults and save to API
      const defaultOrgName = "RAGSuite";
      const defaultColor = "#1F6FEB";
      
      await saveSettingsAsync({
        org_name: defaultOrgName,
        primary_color: defaultColor,
        logo_data_url: null,
      });
      
      setOrgName(defaultOrgName);
      setPrimaryColor(defaultColor);
    setLogoDataUrl(null);
    resetBranding();
      
      // Refetch settings
      await refetchSettings();
      
    toast({ title: "Branding reset", description: "Branding settings were reset to defaults.", variant: "info" });
    } catch (error) {
      console.error("Failed to reset branding:", error);
      toast({ title: "Reset failed", description: "Could not reset branding settings.", variant: "destructive" });
    }
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
    <div className="relative">
      <div className="relative z-10 space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '92vw' }}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
            <p className="text-muted-foreground">
              {t('settings.description')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto mb-3 pb-1">
            <TabsList className="inline-flex flex-nowrap">
              <TabsTrigger value="profile" data-testid="tab-profile" className="flex-shrink-0 whitespace-nowrap">{t('settings.profile')}</TabsTrigger>
              <TabsTrigger value="retention" data-testid="tab-retention" className="flex-shrink-0 whitespace-nowrap">{t('settings.data-retention')}</TabsTrigger>
              <TabsTrigger value="i18n" data-testid="tab-i18n" className="flex-shrink-0 whitespace-nowrap">{t('settings.i18n')}</TabsTrigger>
            </TabsList>
          </div>

          {/* Profile & Branding */}
          <TabsContent value="profile" className="space-y-6 w-full overflow-hidden">
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
                  <Button 
                    variant="outline" 
                    onClick={handleResetBranding} 
                    className="w-full sm:w-auto"
                    disabled={isSaving || isLoadingSettings}
                  >
                    Reset
                  </Button>
                  <Button 
                    onClick={handleSaveBranding} 
                    data-testid="button-save-branding" 
                    className="w-full sm:w-auto group"
                    disabled={isSaving || isLoadingSettings}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

          </TabsContent>

          {/* Data Retention */}
          <TabsContent value="retention" className="space-y-6 w-full overflow-hidden">
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
          <TabsContent value="i18n" className="space-y-6 w-full overflow-hidden">
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
        </Tabs>
      </div>
    </div>
  );
});

export default Settings;
