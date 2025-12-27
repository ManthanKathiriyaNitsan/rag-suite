import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { settingsAPI, chatbotAPI } from "@/services/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";

export type BrandingState = {
  orgName: string; // Organization name from Settings API (main branding)
  primaryColor: string; // Hex or CSS color (e.g., #1F6FEB)
  logoDataUrl: string | null; // Base64 data URL
  // Chatbot configuration (separate from main branding)
  chatbotTitle?: string; // Chatbot title from Chatbot Configuration API (used for widget title)
  bubbleMessage?: string; // Bubble message shown on widget trigger
  shortDescription?: string; // Short description shown in widget header
  welcomeMessage?: string; // Welcome message shown when chat opens
  chatbotLanguage?: string; // Language code for chatbot
  // Widget positioning controls
  widgetZIndex: number;
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  widgetOffsetX: number; // Custom X offset in pixels
  widgetOffsetY: number; // Custom Y offset in pixels
  // Widget customization
  widgetLogoUrl: string | null; // Logo for widget header
  widgetAvatar: string; // Avatar image URL or identifier
  widgetAvatarSize: number; // Avatar size in pixels (15-200px)
  widgetChatbotColor: string; // Chatbot color theme
  widgetShowLogo: boolean; // Show logo in widget
  widgetShowDateTime: boolean; // Show date and time in messages
  widgetBottomSpace: number; // Bottom space in pixels (15-200px)
  widgetFontSize: number; // Font size in pixels (12-20px)
  widgetTriggerBorderRadius: number; // Border radius for trigger button (0-50px)
};

type BrandingContextType = BrandingState & {
  setBranding: (updates: Partial<BrandingState>) => void;
  resetBranding: () => void;
};

const DEFAULT_BRANDING: BrandingState = {
  orgName: "RAGSuite",
  primaryColor: "#1F6FEB",
  logoDataUrl: null,
  // Chatbot configuration defaults
  chatbotTitle: undefined,
  bubbleMessage: undefined,
  shortDescription: undefined,
  welcomeMessage: undefined,
  chatbotLanguage: "en",
  // Widget positioning defaults
  widgetZIndex: 50,
  widgetPosition: "bottom-right",
  widgetOffsetX: 0,
  widgetOffsetY: 0,
  // Widget customization defaults
  widgetLogoUrl: null,
  widgetAvatar: "default-1",
  widgetAvatarSize: 38,
  widgetChatbotColor: "#1F2937",
  widgetShowLogo: true,
  widgetShowDateTime: true,
  widgetBottomSpace: 15,
  widgetFontSize: 14,
  widgetTriggerBorderRadius: 50, // Default 50px (fully circular)
};

// Initialize with default value to prevent "must be used within provider" errors
const defaultContextValue: BrandingContextType = {
  ...DEFAULT_BRANDING,
  setBranding: () => {
    console.warn('setBranding called before BrandingProvider is initialized');
  },
  resetBranding: () => {
    console.warn('resetBranding called before BrandingProvider is initialized');
  },
};

const BrandingContext = createContext<BrandingContextType>(defaultContextValue);

function hexToHslComponents(hex: string): string | null {
  try {
    let h = hex.trim().toLowerCase();
    if (h.startsWith("hsl(")) {
      // Already an hsl() string; extract components inside parentheses
      const inner = h.slice(4, -1).trim();
      return inner || null;
    }
    if (h.startsWith("#")) {
      // Normalize short hex to long hex
      if (h.length === 4) {
        h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
      }
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      let hue = 0;
      let sat = 0;
      const light = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rn:
            hue = (gn - bn) / d + (gn < bn ? 6 : 0);
            break;
          case gn:
            hue = (bn - rn) / d + 2;
            break;
          case bn:
            hue = (rn - gn) / d + 4;
            break;
        }
        hue = hue * 60;
      }
      const H = Math.round(hue);
      const S = Math.round(sat * 100);
      const L = Math.round(light * 100);
      return `${H} ${S}% ${L}%`;
    }
    // Try rgb() format
    if (h.startsWith("rgb(")) {
      const parts = h.slice(4, -1).split(",").map(p => parseFloat(p.trim()));
      if (parts.length >= 3) {
        const [r, g, b] = parts;
        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn);
        const min = Math.min(rn, gn, bn);
        let hue = 0, sat = 0;
        const light = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case rn:
              hue = (gn - bn) / d + (gn < bn ? 6 : 0);
              break;
            case gn:
              hue = (bn - rn) / d + 2;
              break;
            case bn:
              hue = (rn - gn) / d + 4;
              break;
          }
          hue = hue * 60;
        }
        const H = Math.round(hue);
        const S = Math.round(sat * 100);
        const L = Math.round(light * 100);
        return `${H} ${S}% ${L}%`;
      }
    }
    // If the string already looks like H S% L% components
    if (/^\d+\s+\d+%\s+\d+%$/.test(h)) {
      return h;
    }
    return null;
  } catch {
    return null;
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthContext();
  
  // Use React Query to fetch branding from settings API - fully dynamic, no localStorage
  const brandingQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsAPI.getSettings,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Fetch chatbot settings (configuration + customization) for widget
  const chatbotSettingsQuery = useQuery({
    queryKey: ['chatbot-settings'],
    queryFn: chatbotAPI.getSettings,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Local state for widget settings - initialized from chatbot API or defaults
  const [widgetSettings, setWidgetSettings] = useState<Pick<BrandingState, 'widgetZIndex' | 'widgetPosition' | 'widgetOffsetX' | 'widgetOffsetY' | 'widgetLogoUrl' | 'widgetAvatar' | 'widgetAvatarSize' | 'widgetChatbotColor' | 'widgetShowLogo' | 'widgetShowDateTime' | 'widgetBottomSpace' | 'widgetFontSize' | 'widgetTriggerBorderRadius'>>({
    widgetZIndex: DEFAULT_BRANDING.widgetZIndex,
    widgetPosition: DEFAULT_BRANDING.widgetPosition,
    widgetOffsetX: DEFAULT_BRANDING.widgetOffsetX,
    widgetOffsetY: DEFAULT_BRANDING.widgetOffsetY,
    widgetLogoUrl: DEFAULT_BRANDING.widgetLogoUrl,
    widgetAvatar: DEFAULT_BRANDING.widgetAvatar,
    widgetAvatarSize: DEFAULT_BRANDING.widgetAvatarSize,
    widgetChatbotColor: DEFAULT_BRANDING.widgetChatbotColor,
    widgetShowLogo: DEFAULT_BRANDING.widgetShowLogo,
    widgetShowDateTime: DEFAULT_BRANDING.widgetShowDateTime,
    widgetBottomSpace: DEFAULT_BRANDING.widgetBottomSpace,
    widgetFontSize: DEFAULT_BRANDING.widgetFontSize,
    widgetTriggerBorderRadius: DEFAULT_BRANDING.widgetTriggerBorderRadius,
  });

  // Sync chatbot settings API data to widget settings
  useEffect(() => {
    if (chatbotSettingsQuery.data?.customization) {
      const customization = chatbotSettingsQuery.data.customization;
      setWidgetSettings({
        widgetZIndex: customization.widget_z_index ?? DEFAULT_BRANDING.widgetZIndex,
        widgetPosition: (customization.widget_position as typeof DEFAULT_BRANDING.widgetPosition) || DEFAULT_BRANDING.widgetPosition,
        widgetOffsetX: customization.widget_offset_x ?? DEFAULT_BRANDING.widgetOffsetX,
        widgetOffsetY: customization.widget_offset_y ?? DEFAULT_BRANDING.widgetOffsetY,
        widgetLogoUrl: customization.widget_logo_url || null,
        widgetAvatar: customization.widget_avatar || DEFAULT_BRANDING.widgetAvatar,
        widgetAvatarSize: customization.widget_avatar_size ?? DEFAULT_BRANDING.widgetAvatarSize,
        widgetChatbotColor: customization.widget_chatbot_color || DEFAULT_BRANDING.widgetChatbotColor,
        widgetShowLogo: customization.widget_show_logo ?? DEFAULT_BRANDING.widgetShowLogo,
        widgetShowDateTime: customization.widget_show_date_time ?? DEFAULT_BRANDING.widgetShowDateTime,
        widgetBottomSpace: customization.widget_bottom_space ?? DEFAULT_BRANDING.widgetBottomSpace,
        widgetFontSize: customization.widget_font_size ?? DEFAULT_BRANDING.widgetFontSize,
        widgetTriggerBorderRadius: customization.widget_trigger_border_radius ?? DEFAULT_BRANDING.widgetTriggerBorderRadius,
      });
    }
  }, [chatbotSettingsQuery.data]);

  // Sync chatbot configuration API data to orgName
  useEffect(() => {
    if (chatbotSettingsQuery.data?.configuration?.chatbot_title) {
      // Update orgName from chatbot configuration
      // This will be merged in the branding useMemo below
    }
  }, [chatbotSettingsQuery.data?.configuration?.chatbot_title]);

  // Merge API settings data with widget settings
  const branding = useMemo<BrandingState>(() => {
    const apiSettings = brandingQuery.data;
    const chatbotConfig = chatbotSettingsQuery.data?.configuration;
    return {
      // orgName should ONLY come from Settings API, not from Chatbot Configuration
      orgName: apiSettings?.org_name || DEFAULT_BRANDING.orgName,
      primaryColor: apiSettings?.primary_color || DEFAULT_BRANDING.primaryColor,
      logoDataUrl: apiSettings?.logo_data_url || DEFAULT_BRANDING.logoDataUrl,
      // Chatbot configuration from API (used for widget, separate from main branding)
      // IMPORTANT: chatbotTitle must NEVER contain prompt text - filter it out if present
      chatbotTitle: (() => {
        const title = chatbotConfig?.chatbot_title;
        if (!title) return DEFAULT_BRANDING.chatbotTitle;
        const cleanTitle = title.trim();
        // Filter out prompt-like text as a safeguard
        if (cleanTitle.toLowerCase().includes('_prompt') || cleanTitle.toLowerCase().startsWith('pretend you are')) {
          return undefined; // Don't use if it looks like prompt text
        }
        return cleanTitle;
      })(),
      bubbleMessage: chatbotConfig?.bubble_message || DEFAULT_BRANDING.bubbleMessage,
      // IMPORTANT: shortDescription must NEVER contain prompt text - filter it out if present
      shortDescription: (() => {
        const desc = chatbotConfig?.short_description;
        if (!desc) return DEFAULT_BRANDING.shortDescription;
        const cleanDesc = desc.trim();
        // Filter out prompt-like text as a safeguard
        if (cleanDesc.toLowerCase().includes('_prompt') || cleanDesc.toLowerCase().startsWith('pretend you are')) {
          return undefined; // Don't use if it looks like prompt text
        }
        return cleanDesc;
      })(),
      welcomeMessage: chatbotConfig?.welcome_message || DEFAULT_BRANDING.welcomeMessage,
      chatbotLanguage: chatbotConfig?.chatbot_language || DEFAULT_BRANDING.chatbotLanguage,
      ...widgetSettings,
    };
  }, [brandingQuery.data, chatbotSettingsQuery.data?.configuration, widgetSettings]);

  // Refetch settings when user changes (login/logout)
  useEffect(() => {
    if (isAuthenticated && user) {
      // User logged in - refetch settings for new user
      console.log('🔄 User changed, refetching branding settings...');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['chatbot-settings'] });
    } else if (!isAuthenticated) {
      // User logged out - reset to defaults
      console.log('🔄 User logged out, resetting branding to defaults...');
      setWidgetSettings({
        widgetZIndex: DEFAULT_BRANDING.widgetZIndex,
        widgetPosition: DEFAULT_BRANDING.widgetPosition,
        widgetOffsetX: DEFAULT_BRANDING.widgetOffsetX,
        widgetOffsetY: DEFAULT_BRANDING.widgetOffsetY,
        widgetLogoUrl: DEFAULT_BRANDING.widgetLogoUrl,
        widgetAvatar: DEFAULT_BRANDING.widgetAvatar,
        widgetAvatarSize: DEFAULT_BRANDING.widgetAvatarSize,
        widgetChatbotColor: DEFAULT_BRANDING.widgetChatbotColor,
        widgetShowLogo: DEFAULT_BRANDING.widgetShowLogo,
        widgetShowDateTime: DEFAULT_BRANDING.widgetShowDateTime,
        widgetBottomSpace: DEFAULT_BRANDING.widgetBottomSpace,
        widgetFontSize: DEFAULT_BRANDING.widgetFontSize,
        widgetTriggerBorderRadius: DEFAULT_BRANDING.widgetTriggerBorderRadius,
      });
    }
  }, [isAuthenticated, user?.id, queryClient]);

  // Apply primary color globally via CSS variable used by Tailwind tokens: bg-primary, text-primary, etc.
  useEffect(() => {
    const root = document.documentElement;
    const hsl = hexToHslComponents(branding.primaryColor);
    if (hsl) {
      root.style.setProperty("--primary", hsl);
    } else {
      // Fallback: do not override if conversion failed
    }
  }, [branding.primaryColor]);

  const setBranding = (updates: Partial<BrandingState>) => {
    // Update widget settings if provided
    if (updates.widgetZIndex !== undefined || 
        updates.widgetPosition !== undefined || 
        updates.widgetOffsetX !== undefined || 
        updates.widgetOffsetY !== undefined ||
        updates.widgetLogoUrl !== undefined ||
        updates.widgetAvatar !== undefined ||
        updates.widgetAvatarSize !== undefined ||
        updates.widgetChatbotColor !== undefined ||
        updates.widgetShowLogo !== undefined ||
        updates.widgetShowDateTime !== undefined ||
        updates.widgetBottomSpace !== undefined ||
        updates.widgetFontSize !== undefined ||
        updates.widgetTriggerBorderRadius !== undefined) {
      setWidgetSettings(prev => ({
        ...prev,
        ...(updates.widgetZIndex !== undefined && { widgetZIndex: updates.widgetZIndex }),
        ...(updates.widgetPosition !== undefined && { widgetPosition: updates.widgetPosition }),
        ...(updates.widgetOffsetX !== undefined && { widgetOffsetX: updates.widgetOffsetX }),
        ...(updates.widgetOffsetY !== undefined && { widgetOffsetY: updates.widgetOffsetY }),
        ...(updates.widgetLogoUrl !== undefined && { widgetLogoUrl: updates.widgetLogoUrl }),
        ...(updates.widgetAvatar !== undefined && { widgetAvatar: updates.widgetAvatar }),
        ...(updates.widgetAvatarSize !== undefined && { widgetAvatarSize: updates.widgetAvatarSize }),
        ...(updates.widgetChatbotColor !== undefined && { widgetChatbotColor: updates.widgetChatbotColor }),
        ...(updates.widgetShowLogo !== undefined && { widgetShowLogo: updates.widgetShowLogo }),
        ...(updates.widgetShowDateTime !== undefined && { widgetShowDateTime: updates.widgetShowDateTime }),
        ...(updates.widgetBottomSpace !== undefined && { widgetBottomSpace: updates.widgetBottomSpace }),
        ...(updates.widgetFontSize !== undefined && { widgetFontSize: updates.widgetFontSize }),
        ...(updates.widgetTriggerBorderRadius !== undefined && { widgetTriggerBorderRadius: updates.widgetTriggerBorderRadius }),
      }));
    }
    
    // If org name, color, or logo is updated, invalidate settings query to refetch from API
    if (updates.orgName !== undefined || updates.primaryColor !== undefined || updates.logoDataUrl !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
    
    // If widget settings are updated, invalidate chatbot-settings query to keep in sync
    if (updates.widgetZIndex !== undefined || 
        updates.widgetPosition !== undefined || 
        updates.widgetOffsetX !== undefined || 
        updates.widgetOffsetY !== undefined ||
        updates.widgetLogoUrl !== undefined ||
        updates.widgetAvatar !== undefined ||
        updates.widgetAvatarSize !== undefined ||
        updates.widgetChatbotColor !== undefined ||
        updates.widgetShowLogo !== undefined ||
        updates.widgetShowDateTime !== undefined ||
        updates.widgetBottomSpace !== undefined ||
        updates.widgetFontSize !== undefined ||
        updates.widgetTriggerBorderRadius !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['chatbot-settings'] });
    }
  };

  const resetBranding = () => {
    // Reset widget settings to defaults
    setWidgetSettings({
      widgetZIndex: DEFAULT_BRANDING.widgetZIndex,
      widgetPosition: DEFAULT_BRANDING.widgetPosition,
      widgetOffsetX: DEFAULT_BRANDING.widgetOffsetX,
      widgetOffsetY: DEFAULT_BRANDING.widgetOffsetY,
      widgetLogoUrl: DEFAULT_BRANDING.widgetLogoUrl,
      widgetAvatar: DEFAULT_BRANDING.widgetAvatar,
      widgetAvatarSize: DEFAULT_BRANDING.widgetAvatarSize,
      widgetChatbotColor: DEFAULT_BRANDING.widgetChatbotColor,
      widgetShowLogo: DEFAULT_BRANDING.widgetShowLogo,
      widgetShowDateTime: DEFAULT_BRANDING.widgetShowDateTime,
      widgetBottomSpace: DEFAULT_BRANDING.widgetBottomSpace,
      widgetFontSize: DEFAULT_BRANDING.widgetFontSize,
      widgetTriggerBorderRadius: DEFAULT_BRANDING.widgetTriggerBorderRadius,
    });
    // Invalidate settings query to refetch from API
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };

  const value = useMemo<BrandingContextType>(() => ({
    ...branding,
    setBranding,
    resetBranding,
  }), [branding]);

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextType {
  const ctx = useContext(BrandingContext);
  // Context is always defined (has default value), so no need to check
  return ctx;
}
