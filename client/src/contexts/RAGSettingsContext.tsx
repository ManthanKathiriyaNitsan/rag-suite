import React, { createContext, useContext, useState, useEffect } from 'react';

// 🎛️ RAG Settings Interface
export interface RAGSettings {
  topK: number;
  similarityThreshold: number;
  maxTokens: number;
  useReranker: boolean;
}

// 📊 Performance Metrics Interface
export interface PerformanceMetrics {
  latency: number;
  tokensUsed: number;
  documentsRetrieved: number;
  relevanceScore: number;
  timestamp: Date;
}

// 🎛️ RAG Settings Context
interface RAGSettingsContextType {
  // Settings
  settings: RAGSettings;
  updateSettings: (newSettings: Partial<RAGSettings>) => void;
  resetSettings: () => void;
  
  // Performance
  metrics: PerformanceMetrics | null;
  updateMetrics: (metrics: PerformanceMetrics) => void;
  clearMetrics: () => void;
}

const RAGSettingsContext = createContext<RAGSettingsContextType | undefined>(undefined);

// 🎛️ Default RAG Settings (matching your server defaults)
const DEFAULT_RAG_SETTINGS: RAGSettings = {
  topK: 5,
  similarityThreshold: 0.2,
  maxTokens: 1000, // Fixed: max 1000 tokens as per server limit
  useReranker: false,
};

// 🎛️ RAG Settings Provider
export function RAGSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RAGSettings>(() => {
    // Load from localStorage if available, otherwise use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rag-settings');
      if (saved) {
        try {
          return { ...DEFAULT_RAG_SETTINGS, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Failed to parse saved RAG settings:', error);
        }
      }
    }
    return DEFAULT_RAG_SETTINGS;
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // 💾 Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rag-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // 🔄 Update settings function
  const updateSettings = (newSettings: Partial<RAGSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 🔄 Reset settings to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_RAG_SETTINGS);
  };

  // 📊 Update performance metrics
  const updateMetrics = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  };

  // 🗑️ Clear performance metrics
  const clearMetrics = () => {
    setMetrics(null);
  };

  const value: RAGSettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    metrics,
    updateMetrics,
    clearMetrics,
  };

  return (
    <RAGSettingsContext.Provider value={value}>
      {children}
    </RAGSettingsContext.Provider>
  );
}

// 🎛️ Use RAG Settings Hook
export function useRAGSettings() {
  const context = useContext(RAGSettingsContext);
  if (context === undefined) {
    throw new Error('useRAGSettings must be used within a RAGSettingsProvider');
  }
  return context;
}

// 📊 Use Performance Metrics Hook
export function usePerformanceMetrics() {
  const { metrics, updateMetrics, clearMetrics } = useRAGSettings();
  return { metrics, updateMetrics, clearMetrics };
}
