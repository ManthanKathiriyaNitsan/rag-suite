/**
 * Custom hook for managing integration form state
 * Handles all form data, validation, and persistence
 */

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface IntegrationFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "paused" | "archived";
  environments: Array<"staging" | "production">;
  settings: {
    enableChat: boolean;
    enableSearch: boolean;
    enableSuggestions: boolean;
    maxTokens?: number;
    temperature?: number;
  };
  branding?: {
    primaryColor?: string;
    logo?: string;
    customCSS?: string;
  };
  typography?: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
  layout?: {
    sidebarCollapsed: boolean;
    headerHeight: number;
    contentPadding: number;
  };
}

interface UseIntegrationFormProps {
  integrationId?: string;
  mode: "create" | "edit";
  onSave: (data: IntegrationFormData) => void;
}

export function useIntegrationForm({ integrationId, mode, onSave }: UseIntegrationFormProps) {
  const { setTypography, setLayout } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [formData, setFormData] = useState<IntegrationFormData>({
    name: "",
    slug: "",
    description: "",
    status: "active",
    environments: ["staging"],
    settings: {
      enableChat: true,
      enableSearch: true,
      enableSuggestions: true,
    },
  });

  // Load typography settings from localStorage
  const loadTypographyFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("theme-typography");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fontFamily: parsed.fontFamily || "Inter, system-ui, sans-serif",
          fontSize: parsed.fontSize || {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
          },
        };
      }
    } catch (error) {
      console.warn("Failed to load typography from localStorage:", error);
    }
    return {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem", 
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
    };
  }, []);

  // Load layout settings from localStorage
  const loadLayoutFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem("theme-layout");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          sidebarCollapsed: parsed.sidebarCollapsed || false,
          headerHeight: parsed.headerHeight || 64,
          contentPadding: parsed.contentPadding || 24,
        };
      }
    } catch (error) {
      console.warn("Failed to load layout from localStorage:", error);
    }
    return {
      sidebarCollapsed: false,
      headerHeight: 64,
      contentPadding: 24,
    };
  }, []);

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && integrationId) {
      // TODO: Load integration data from API
      // For now, use mock data
      setFormData({
        id: integrationId,
        name: "Sample Integration",
        slug: "sample-integration",
        description: "A sample integration for testing",
        status: "active",
        environments: ["staging", "production"],
        settings: {
          enableChat: true,
          enableSearch: true,
          enableSuggestions: true,
          maxTokens: 1000,
          temperature: 0.7,
        },
        typography: loadTypographyFromStorage(),
        layout: loadLayoutFromStorage(),
      });
    } else {
      // Initialize with default values for create mode
      setFormData(prev => ({
        ...prev,
        typography: loadTypographyFromStorage(),
        layout: loadLayoutFromStorage(),
      }));
    }
  }, [mode, integrationId, loadTypographyFromStorage, loadLayoutFromStorage]);

  // Auto-save draft
  useEffect(() => {
    if (formData.name || formData.description) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("integration-draft", JSON.stringify(formData));
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<IntegrationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Update specific nested data
  const updateSettings = useCallback((settings: Partial<IntegrationFormData['settings']>) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  }, []);

  const updateBranding = useCallback((branding: Partial<IntegrationFormData['branding']>) => {
    setFormData(prev => ({
      ...prev,
      branding: { ...prev.branding, ...branding }
    }));
  }, []);

  const updateTypography = useCallback((typography: Partial<IntegrationFormData['typography']>) => {
    const newTypography = { 
      fontFamily: formData.typography?.fontFamily || 'Inter',
      fontSize: formData.typography?.fontSize || { sm: '14px', md: '16px', lg: '18px' },
      ...typography 
    };
    setFormData(prev => ({ ...prev, typography: newTypography }));
    
    // Apply to theme context
    if (newTypography) {
      setTypography(newTypography);
      localStorage.setItem("theme-typography", JSON.stringify(newTypography));
    }
  }, [formData.typography, setTypography]);

  const updateLayout = useCallback((layout: Partial<IntegrationFormData['layout']>) => {
    const newLayout = { 
      sidebarCollapsed: formData.layout?.sidebarCollapsed || false,
      headerHeight: formData.layout?.headerHeight || 64,
      contentPadding: formData.layout?.contentPadding || 16,
      ...layout 
    };
    setFormData(prev => ({ ...prev, layout: newLayout }));
    
    // Apply to theme context - convert to theme layout format
    const themeLayout = {
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem", 
        lg: "0.5rem"
      },
      widgetAppearance: {
        chatBubbleStyle: "rounded" as const,
        avatarStyle: "circle" as const,
        animationsEnabled: true
      },
      customCSS: {
        enabled: false,
        css: ""
      }
    };
    setLayout(themeLayout);
    localStorage.setItem("theme-layout", JSON.stringify(newLayout));
  }, [formData.layout, setLayout]);

  // Save integration
  const saveIntegration = useCallback(() => {
    try {
      onSave(formData);
      localStorage.removeItem("integration-draft");
    } catch (error) {
      console.error("Failed to save integration:", error);
    }
  }, [formData, onSave]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem("integration-draft");
    setIsDraftSaved(false);
  }, []);

  return {
    // State
    activeTab,
    isDraftSaved,
    formData,
    
    // Actions
    setActiveTab,
    updateFormData,
    updateSettings,
    updateBranding,
    updateTypography,
    updateLayout,
    saveIntegration,
    clearDraft,
    
    // Computed
    isFormValid: formData.name.length > 0 && formData.slug.length > 0,
    hasUnsavedChanges: isDraftSaved,
  };
}
