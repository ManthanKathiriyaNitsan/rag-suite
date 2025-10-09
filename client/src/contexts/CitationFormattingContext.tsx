import React, { createContext, useContext, useState, useEffect } from 'react';

// 🎨 Citation Formatting Options
export interface CitationFormattingOptions {
  style: 'compact' | 'detailed' | 'card' | 'minimal';
  layout: 'vertical' | 'grid';
  numbering: 'brackets' | 'parentheses' | 'dots' | 'numbers';
  showSnippets: boolean;
  showUrls: boolean;
  maxSnippetLength: number;
  colorScheme: 'default' | 'primary' | 'muted' | 'accent';
  showSourceCount: boolean;
  enableHover: boolean;
}

// 🎨 Default Citation Formatting
const DEFAULT_CITATION_FORMATTING: CitationFormattingOptions = {
  style: 'detailed',
  layout: 'vertical',
  numbering: 'brackets',
  showSnippets: true,
  showUrls: true,
  maxSnippetLength: 150,
  colorScheme: 'default',
  showSourceCount: true,
  enableHover: true,
};

interface CitationFormattingContextType {
  formatting: CitationFormattingOptions;
  updateFormatting: (newFormatting: Partial<CitationFormattingOptions>) => void;
  resetFormatting: () => void;
}

const CitationFormattingContext = createContext<CitationFormattingContextType | undefined>(undefined);

// 🎨 Citation Formatting Provider
export function CitationFormattingProvider({ children }: { children: React.ReactNode }) {
  const [formatting, setFormatting] = useState<CitationFormattingOptions>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('citation-formatting');
      if (saved) {
        try {
          return { ...DEFAULT_CITATION_FORMATTING, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Failed to parse saved citation formatting:', error);
        }
      }
    }
    return DEFAULT_CITATION_FORMATTING;
  });

  // 💾 Save formatting to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('citation-formatting', JSON.stringify(formatting));
    }
  }, [formatting]);

  // 🔄 Update formatting function
  const updateFormatting = (newFormatting: Partial<CitationFormattingOptions>) => {
    setFormatting(prev => ({ ...prev, ...newFormatting }));
  };

  // 🔄 Reset formatting to defaults
  const resetFormatting = () => {
    setFormatting(DEFAULT_CITATION_FORMATTING);
  };

  const value: CitationFormattingContextType = {
    formatting,
    updateFormatting,
    resetFormatting,
  };

  return (
    <CitationFormattingContext.Provider value={value}>
      {children}
    </CitationFormattingContext.Provider>
  );
}

// 🎨 Hook to use citation formatting
export function useCitationFormatting() {
  const context = useContext(CitationFormattingContext);
  if (context === undefined) {
    throw new Error('useCitationFormatting must be used within a CitationFormattingProvider');
  }
  return context;
}
