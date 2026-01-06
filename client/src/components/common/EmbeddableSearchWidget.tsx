/**
 * EMBEDDABLE SEARCH WIDGET
 * 
 * This widget matches the Search Test tab EXACTLY.
 * It's a clean search interface (not a chatbot) that can be embedded on any website.
 * 
 * Features:
 * - Exact match to Search Test tab design
 * - Search bar with suggestions
 * - Results displayed in cards
 * - All customization and configuration settings work
 * - Project ID authentication
 * - Light and dark mode support
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Search, Sparkles, ScanSearch, HelpCircle, Loader2, Clock, Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { useSearch } from "@/hooks/useSearch";
import { useTheme } from "@/contexts/ThemeContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { searchAPI } from "@/services/api/api";
import { useSearchCitation } from "@/hooks/useSearchCitation";
import { useChatFeedback } from "@/hooks/useChat";
import { GlassCard } from "@/components/ui/GlassCard";
import { Card, CardContent } from "@/components/ui/card";
import { TypingAnimation } from "@/components/common/TypingIndicator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { safeStringConversion } from "@/utils/safeStringConversion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboard } from "@/lib/utils";
import { Message } from "@/types/components";
import "./EmbeddableSearchWidgetStyles.css";

interface SearchWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onReady?: () => void;
  onError?: (error: string, context?: string) => void;
  isPreviewMode?: boolean;
}

const EmbeddableSearchWidgetComponent = React.memo(function EmbeddableSearchWidget({
  isOpen = false,
  onToggle,
  onReady,
  onError,
  isPreviewMode = false,
}: SearchWidgetProps) {
  const { settings } = useRAGSettings();
  const branding = useBranding();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { searchAsync, isSearching } = useSearch();
  const { formatting: searchCitationFormatting } = useSearchCitation();
  const { submitFeedback, isSubmitting } = useChatFeedback();

  // Fetch search configuration and customization from API with real-time updates
  const { data: searchConfigData } = useQuery({
    queryKey: ['search-configuration'],
    queryFn: () => searchAPI.getSearchConfiguration(),
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: 5000, // Poll every 5 seconds for live updates
  });

  const { data: searchCustomizationData } = useQuery({
    queryKey: ['search-customization'],
    queryFn: () => searchAPI.getSearchCustomization(),
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: 5000, // Poll every 5 seconds for live updates
  });

  // Extract configuration values (matching Search Test tab)
  const searchTitle = searchConfigData?.title || "This is AI search";
  const searchIcon = searchConfigData?.searchIcon || "search";
  const searchBorderRadius = searchConfigData?.borderRadius || "semi-rounded";
  const searchStyleOption = searchConfigData?.styleOption || "default";
  const searchBackgroundColor = searchConfigData?.background || "#d5d4d4";
  const searchLoaderType = searchConfigData?.loaderType || "skeleton";

  // Extract customization values (matching Search Test tab)
  const searchFormType = searchCustomizationData?.searchFormType || "default";
  const searchButtonType = searchCustomizationData?.buttonType || "icon";
  const searchButtonText = searchCustomizationData?.searchButtonText || "Search";
  const searchInputPlaceholder = searchCustomizationData?.searchInputPlaceholder || "Search using AI...";
  const searchRecentSearch = searchCustomizationData?.recentSearch ?? false;
  const searchRecentSearchTitle = searchCustomizationData?.recentSearchTitle || "Recent Searches";
  const searchPredefinedQuestions = searchCustomizationData?.predefinedQuestions ?? false;
  const searchQuestionsLimit = searchCustomizationData?.questionsLimit || 5;
  
  // Parse questions and answers from API (matching Search Test tab)
  const searchQuestionsList = useMemo(() => {
    const questionsFromAPI = searchCustomizationData?.questions || [];
    const parsed: string[] = [];
    questionsFromAPI.forEach((item: any) => {
      if (typeof item === 'string') {
        parsed.push(item);
      } else if (item && typeof item === 'object' && item.question) {
        parsed.push(item.question);
      }
    });
    return parsed;
  }, [searchCustomizationData?.questions]);

  // Parse answers from API (matching Search Test tab)
  const searchQuestionsAnswers = useMemo(() => {
    const questionsFromAPI = searchCustomizationData?.questions || [];
    const answers: Record<number, string> = {};
    questionsFromAPI.forEach((item: any, index: number) => {
      if (item && typeof item === 'object' && item.answer && item.answer.trim()) {
        answers[index] = item.answer;
      }
    });
    return answers;
  }, [searchCustomizationData?.questions]);

  // Track if we've encountered a 401 error to stop polling
  const [has401Error, setHas401Error] = React.useState(false);

  // Fetch responseType from API with real-time updates (matching Search Test tab)
  const { data: responseConfig } = useQuery({
    queryKey: ['responseConfig'],
    queryFn: async () => {
      try {
        const config = await searchAPI.getResponseConfig();
        const configValue = typeof config === 'string' ? config : (config as any)?.response_type || 'long';
        setHas401Error(false); // Reset error flag on success
        return configValue;
      } catch (error: any) {
        // If 401 error, return default and stop polling
        if (error?.response?.status === 401) {
          setHas401Error(true);
          return 'long'; // Default response type
        }
        throw error;
      }
    },
    retry: false, // Don't retry on errors
    refetchOnWindowFocus: false,
    refetchInterval: has401Error ? false : 5000, // Stop polling if we got a 401 error
  });

  const responseType = (responseConfig as "long" | "short") || "long";

  // Widget positioning - Always inline for search widget (like Search Test tab)
  // Search widget should never be floating - it's always inline
  const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
  const widgetPosition = isWidgetMode ? "inline" : (branding.widgetPosition || "inline") as "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center" | "inline" | "fixed";
  const widgetZIndex = branding.widgetZIndex || 99999;
  const widgetOffsetX = branding.widgetOffsetX || 20;
  const widgetOffsetY = branding.widgetOffsetY || 20;
  const widgetBottomSpace = branding.widgetBottomSpace || 15;

  // State (matching Search Test tab)
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [localSearchHistory, setLocalSearchHistory] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "up" | "down" | null>>({});
  const [messageCopied, setMessageCopied] = useState<Record<string, boolean>>({});
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get recent searches
  const recentSearches = useMemo(() => {
    return localSearchHistory.slice(0, 2);
  }, [localSearchHistory]);

  // Helper functions (matching Search Test tab)
  const simulateStreamingResponse = async (content: string, onUpdate: (content: string) => void) => {
    const words = content.split(' ');
    let currentContent = '';
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      onUpdate(currentContent);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const extractTopKFromMessage = (message: string): { topK: number; reranker: boolean } => {
    const topKMatch = message.match(/topK=(\d+)/);
    const rerankerMatch = message.match(/reranker=(on|off)/);
    return {
      topK: topKMatch ? parseInt(topKMatch[1]) : 5,
      reranker: rerankerMatch ? rerankerMatch[1] === 'on' : false
    };
  };

  // Validate maxTokens (matching Search Test tab)
  const validateMaxTokens = useCallback((
    maxTokens: number | null | undefined, 
    responseType: 'long' | 'short'
  ): string | null => {
    if (maxTokens === null || maxTokens === undefined || maxTokens === 0) {
      return null;
    }
    if (responseType === 'long' && maxTokens < 400) {
      return `maxTokens for LONG response must be at least 400. You provided ${maxTokens}. Please increase maxTokens to at least 400.`;
    }
    if (responseType === 'short' && maxTokens < 200) {
      return `maxTokens for SHORT response must be at least 200. You provided ${maxTokens}. Please increase maxTokens to at least 200.`;
    }
    return null;
  }, []);

  // Handle search query (matching Search Test tab exactly)
  const handleSearch = useCallback(async (query: string) => {
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    
    // Check if this question has a predefined answer (matching Search Test tab)
    const questionIndex = searchQuestionsList.findIndex(q => q === query);
    const predefinedAnswer = questionIndex >= 0 ? searchQuestionsAnswers[questionIndex] : null;
    
    // If there's a predefined answer, show it instead of making API call (matching Search Test tab)
    if (predefinedAnswer && predefinedAnswer.trim()) {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent("");
      
      // Simulate streaming the predefined answer
      await simulateStreamingResponse(predefinedAnswer, (content) => {
        setStreamingContent(content);
      });
      
      const assistantMessage: Message = {
        type: "assistant",
        content: predefinedAnswer,
        timestamp: new Date(),
        ragSettings: settings,
        queryString: query,
      };
      
      setMessages([userMessage, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");
      
      // Update local search history
      setLocalSearchHistory(prev => {
        const newHistory = [query, ...prev];
        return Array.from(new Set(newHistory)).slice(0, 2);
      });
      
      return;
    }

    // Update local search history immediately
    setLocalSearchHistory(prev => {
      const newHistory = [query, ...prev];
      return Array.from(new Set(newHistory)).slice(0, 2);
    });
    
    // Client-side validation before API call (matching Search Test tab)
    const validationError = validateMaxTokens(settings.maxTokens, responseType);
    if (validationError) {
      setIsTyping(false);
      const errorMessage: Message = {
        type: "assistant",
        content: `Validation Error: ${validationError}`,
      timestamp: new Date(),
    };
      setMessages([userMessage, errorMessage]);
      return;
    }

    // Clear any previous errors
    setSearchError("");
    
    setIsTyping(true);

    try {
      const searchResponse = await searchAsync(query, settings, responseType);
      setIsTyping(false);

      const responseContent = searchResponse.answer || "No answer from API";
      const serverMessage = searchResponse.message || "";
      const { topK: actualTopK, reranker: actualReranker } = extractTopKFromMessage(serverMessage);
      const sources = searchResponse.sources || [];

      await simulateStreamingResponse(responseContent, (content) => {
        setStreamingContent(content);
      });

      const mappedSources = sources.map((source: any) => ({
        title: source.title || "Unknown Source",
        url: source.url || "#",
        snippet: source.snippet || "No snippet available",
      }));

      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: mappedSources,
        timestamp: new Date(),
        ragSettings: settings,
        queryString: query,
        serverMessage: serverMessage,
        actualTopK: actualTopK,
        actualReranker: actualReranker,
        messageId: searchResponse.message_id || `msg-${Date.now()}`,
        sessionId: searchResponse.session_id,
      };
      
      if (searchResponse.session_id) {
        setCurrentSessionId(searchResponse.session_id);
      }
      
      setMessages([userMessage, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");
      setSearchInput("");

      if (onReady) {
        onReady();
      }
    } catch (error: any) {
      console.error("Search widget failed:", error);
      setIsTyping(false);
      setIsStreaming(false);
      
      // Handle backend validation errors (400 status) (matching Search Test tab)
      let errorContent = `Sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
      
      if (error?.response?.status === 400) {
        const errorDetail = error?.response?.data?.detail || error?.message;
        if (errorDetail) {
          errorContent = `Validation Error: ${errorDetail}`;
        }
      } else if (error?.response?.data?.detail) {
        errorContent = error.response.data.detail;
      } else if (error?.message) {
        errorContent = error.message;
      }
      
      const errorMessage: Message = {
        type: "assistant",
        content: errorContent,
        timestamp: new Date(),
        messageId: `error-${Date.now()}`,
      };
      setMessages([userMessage, errorMessage]);

      if (onError) {
        onError(error?.message || "Search failed", "handleSearch");
      }
    }
  }, [searchAsync, settings, responseType, validateMaxTokens, searchQuestionsList, searchQuestionsAnswers, isPreviewMode, onReady, onError]);

  // Input handlers (matching Search Test tab)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.length > 0 && value.length < 3) {
      setSearchError("Please enter at least 3 characters");
    } else {
      setSearchError("");
    }
  }, []);

  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    
    const query = searchInput.trim();
    if (query.length < 3) {
      setSearchError("Please enter at least 3 characters");
      return;
    }
    setSearchError("");
    handleSearch(query);
  }, [searchInput, handleSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchError("");
    setMessages([]);
    setStreamingContent("");
    setIsTyping(false);
    setIsStreaming(false);
  }, []);

  const handleQuestionClick = useCallback((question: string) => {
    setSearchInput(question);
    handleSearch(question);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }, [handleSearch]);

  // Auto-scroll to results
  useEffect(() => {
    if (messages.length > 0 || isTyping || isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent, isStreaming, isTyping]);

  // Position calculation - Widget is inline (not fixed overlay) like Search Test tab
  const getWindowPosition = () => {
    // For inline widget, use static/relative positioning (not fixed)
    if (widgetPosition === 'inline' || !widgetPosition) {
      // Default: inline (static positioning, flows with page content)
      return {
        position: 'relative' as const,
        width: '100%',
        maxWidth: '100%',
      };
    }

    // Only use fixed positioning if explicitly requested (for backward compatibility)
    if (widgetPosition === 'fixed' || widgetPosition === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        maxWidth: 'calc(100% - 40px)',
      };
    }

    const basePosition: React.CSSProperties = {
      position: 'fixed' as const,
    };

    switch (widgetPosition) {
      case 'bottom-right':
        return { ...basePosition, bottom: `${widgetBottomSpace}px`, right: `${widgetOffsetX}px`, top: 'auto', left: 'auto', transform: 'none', width: '600px', maxWidth: 'calc(100% - 40px)' };
      case 'bottom-left':
        return { ...basePosition, bottom: `${widgetBottomSpace}px`, left: `${widgetOffsetX}px`, top: 'auto', right: 'auto', transform: 'none', width: '600px', maxWidth: 'calc(100% - 40px)' };
      case 'top-right':
        return { ...basePosition, top: `${widgetOffsetY}px`, right: `${widgetOffsetX}px`, bottom: 'auto', left: 'auto', transform: 'none', width: '600px', maxWidth: 'calc(100% - 40px)' };
      case 'top-left':
        return { ...basePosition, top: `${widgetOffsetY}px`, left: `${widgetOffsetX}px`, bottom: 'auto', right: 'auto', transform: 'none', width: '600px', maxWidth: 'calc(100% - 40px)' };
      default:
        // Fallback: inline
        return {
          position: 'relative' as const,
          width: '100%',
          maxWidth: '100%',
        };
    }
  };

  const windowPosition = getWindowPosition();

  // Get border radius value (matching Search Test tab)
  const getBorderRadiusValue = (borderRadius: string) => {
    switch (borderRadius) {
      case 'rounded': return '12px';
      case 'medium-rounded': return '10px';
      case 'semi-rounded': return '8px';
      case 'square': return '0px';
      default: return '8px';
    }
  };

  const borderRadiusValue = getBorderRadiusValue(searchBorderRadius);
  const showSendButton = searchFormType === 'withBtn';
  const showSearchIcon = searchFormType === 'default';
  const showButtonLabel = searchButtonType === 'withLabel';
  const isCustomizedStyle = searchStyleOption === 'plugin';
  const wrapperBgColor = isDarkMode ? 'var(--tab-bg-default)' : '#f5f5f5';
  const innerBgColor = isDarkMode ? '#121212' : '#ffffff';
  const inputTextColor = isDarkMode ? '#f9fafb' : '#374151';
  const buttonBgColor = isCustomizedStyle && searchBackgroundColor 
    ? searchBackgroundColor 
    : (isDarkMode ? '#3b82f6' : '#1e3a8a');
  const buttonTextColor = '#ffffff';

  const paddingLeft = showSearchIcon ? '48px' : '16px';
  const paddingRight = showSendButton
    ? (showButtonLabel
      ? (searchInput ? '150px' : '110px')
      : (searchInput ? '106px' : '66px'))
    : (searchInput ? '50px' : '16px');

  const SearchIconComponent = searchIcon === 'scan' ? ScanSearch : searchIcon === 'sparkles' ? Sparkles : Search;

  // Widget is always visible - no animation or toggle needed
  const shouldShow = true;

  // onReady callback
  const onReadyCalled = useRef(false);
  useEffect(() => {
    if (onReady && !onReadyCalled.current) {
      onReadyCalled.current = true;
      onReady();
    }
  }, [onReady]);

  // Debug: Log when widget renders
  React.useEffect(() => {
    console.log('✅ EmbeddableSearchWidget component rendered', {
      isOpen,
      widgetPosition,
      isPreviewMode,
      searchTitle,
      searchFormType
    });
  }, [isOpen, widgetPosition, isPreviewMode, searchTitle, searchFormType]);

  return (
    <React.Fragment>
      {/* Search Window - Always visible, matching Search Test tab exactly */}
      <div
        id="search-widget"
        className="search-widget-container"
        data-preview-mode={isPreviewMode ? 'true' : 'false'}
        data-position={widgetPosition}
        style={{
          ...windowPosition,
          width: isPreviewMode ? '100%' : (widgetPosition === 'inline' ? '100%' : windowPosition.width || '600px'),
          maxWidth: isPreviewMode ? '100%' : (widgetPosition === 'inline' ? '100%' : windowPosition.maxWidth || 'calc(100% - 40px)'),
          maxHeight: isPreviewMode ? '100%' : (widgetPosition === 'inline' ? 'none' : 'calc(100vh - 40px)'),
          zIndex: isPreviewMode ? 1 : (widgetPosition === 'inline' ? 1 : widgetZIndex),
          backgroundColor: 'transparent', // Match Search Test tab - no container background
          borderRadius: '0', // No border radius on container
          boxShadow: 'none', // No shadow on container
          display: 'block', // Block display like Search Test tab
          overflow: 'visible', // Allow overflow for dropdowns
          border: 'none', // No border
          margin: widgetPosition === 'inline' ? '0' : '0',
          padding: '0', // No padding on container
          minHeight: '100px', // Ensure minimum height for visibility
        } as React.CSSProperties & { [key: string]: string | number }}
        role="search"
        aria-label="Search Assistant"
        aria-live="polite"
      >
        {/* No close button - widget is always visible like Search Test tab */}

        {/* Content Area - Matching Search Test tab exactly */}
        <div className="space-y-6 w-full min-w-0 max-w-full" style={{
          padding: '0', // No padding - let GlassCard handle spacing
        }}>
            {/* Search Box Section - Exact match to Search Test tab */}
            <GlassCard className="overflow-visible" style={{
              minHeight: '200px', // Ensure card has minimum height
              display: 'block', // Ensure it's displayed
            }}>
              <CardContent className="space-y-4 pt-6">
                {/* Title with Icon - Matching Search Test tab */}
                {searchTitle && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative">
                      <Search className="h-5 w-5 text-foreground" />
                      <Sparkles className="h-2.5 w-2.5 text-foreground absolute -top-0.5 -right-0.5" fill="currentColor" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{searchTitle}</h3>
                  </div>
                )}

                {/* Search Form - Exact match to Search Test tab */}
                <form onSubmit={handleSearchSubmit} className="space-y-4 w-full min-w-0 relative">
                  <div className="rag-search-form-wrapper w-full min-w-0" style={{
                    backgroundColor: wrapperBgColor,
                    borderRadius: borderRadiusValue,
                    padding: '12px',
                    boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="rag-search-form-inner w-full min-w-0" style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: innerBgColor,
                      borderRadius: borderRadiusValue,
                      border: 'none',
                      overflow: 'hidden',
                      width: '100%',
                      position: 'relative',
                      minHeight: '56px'
                    }}>
                      {/* Left search icon when form type is default */}
                      {showSearchIcon && (
                        <div style={{
                          position: 'absolute',
                          left: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 1,
                          pointerEvents: 'none'
                        }}>
                          <SearchIconComponent className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
          </div>
                      )}
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="rag-search-input-field"
                        style={{
                          flex: '1',
                          minWidth: '0',
                          border: 'none',
                          outline: 'none',
                          paddingLeft: paddingLeft,
                          paddingRight: paddingRight,
                          paddingTop: '14px',
                          paddingBottom: '14px',
                          backgroundColor: 'transparent',
                          color: inputTextColor,
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.5'
                        }}
                        placeholder={searchInputPlaceholder}
                        value={searchInput}
                        onChange={handleInputChange}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                        maxLength={150}
                        minLength={3}
                        autoComplete="off"
                        data-testid="rag-query-input"
                        disabled={isPreviewMode}
                      />
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0',
                        flexShrink: 0,
                        position: 'absolute',
                        right: '0',
                        height: '100%'
                      }}>
                        {searchInput && (
            <button
              type="button"
                            className="rag-search-clear-button"
                            style={{
                              width: '50px',
                              height: '100%',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0',
                              margin: '0',
                              flexShrink: 0,
                              borderRadius: showSendButton ? '8px 0 0 8px' : '8px'
                            }}
                            onClick={handleClearSearch}
              aria-label="Clear Search"
              disabled={isPreviewMode}
            >
                            <X className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
            </button>
                        )}
                        {showSendButton && (
            <button
                            type="submit"
                            className="rag-search-submit-button"
                            style={{
                              width: showButtonLabel ? 'auto' : '80px',
                              minWidth: showButtonLabel ? '110px' : '80px',
                              height: '100%',
                              border: 'none',
                              background: buttonBgColor,
                              borderRadius: searchInput ? `0 ${borderRadiusValue} ${borderRadiusValue} 0` : borderRadiusValue,
                              cursor: (searchInput.trim().length < 3 || isSearching) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: showButtonLabel ? '0 16px' : '0',
                              gap: showButtonLabel ? '8px' : '0',
                              margin: '0',
                              opacity: (searchInput.trim().length < 3 || isSearching) ? 0.6 : 1,
                              transition: 'opacity 0.2s, background-color 0.2s, border-radius 0.2s',
                              flexShrink: 0,
                              boxShadow: 'none'
                            }}
                            disabled={isSearching || searchInput.trim().length < 3 || isPreviewMode}
                            aria-label="Search"
            >
                            {isSearching ? (
                              <Loader2 className="h-5 w-5 animate-spin" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                            ) : (
                              <>
                                {showButtonLabel ? (
                                  <span style={{ color: buttonTextColor, fontSize: '14px', fontWeight: '500' }}>{searchButtonText}</span>
                                ) : (
                                  <SearchIconComponent className="h-5 w-5" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                                )}
                              </>
                            )}
            </button>
                        )}
          </div>
        </div>
                  </div>
                  {searchError && (
                    <div className="text-sm text-destructive">
                      {searchError}
                    </div>
                  )}

                  {/* Recent Searches Dropdown - Show when enabled, focused, AND Predefined Questions are ON */}
                  {searchRecentSearch && searchPredefinedQuestions && searchFocused && recentSearches.length > 0 && (
                    <div 
                      className="absolute left-0 right-0 top-full mt-2 z-[100] bg-background border border-border shadow-lg overflow-hidden"
                      style={{
                        borderRadius: borderRadiusValue
                      }}
                    >
                      <div className="p-3 border-b border-border bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {searchRecentSearchTitle}
                        </p>
                      </div>
                      <div className="flex flex-col w-full">
                        {recentSearches.map((query, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setSearchInput(query);
                              handleSearch(query);
                              if (searchInputRef.current) {
                                searchInputRef.current.blur();
                    }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-medium text-foreground truncate">{query}</span>
            </div>
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
                        ))}
          </div>
                    </div>
                  )}
                </form>

                {/* Predefined Questions - Only show if enabled */}
                {searchPredefinedQuestions && searchQuestionsList.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-4 w-full min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Suggestions
                    </p>
                    <div className="flex flex-wrap gap-3 w-full">
                      {searchQuestionsList.slice(0, searchQuestionsLimit).map((query, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 border border-border cursor-pointer transition-all hover:shadow-sm w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-full"
                          style={{
                            borderRadius: borderRadiusValue
                          }}
                          onClick={() => {
                            setSearchInput(query);
                            handleSearch(query);
                            if (searchInputRef.current) {
                              searchInputRef.current.blur();
                        }
                          }}
                          data-testid={`example-query-${index}`}
                        >
                          <span className="text-sm font-medium flex-1 break-words overflow-wrap-anywhere">
                            {query}
                          </span>
                          <HelpCircle className="h-4 w-4 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches Block - Show when enabled AND Predefined Questions are OFF */}
                {searchRecentSearch && !searchPredefinedQuestions && recentSearches.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-4 w-full min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {searchRecentSearchTitle}
                    </p>
                    <div className="flex flex-col w-full border border-border rounded-lg overflow-hidden">
                      {recentSearches.slice(0, 3).map((query, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                          onClick={() => {
                            setSearchInput(query);
                            handleSearch(query);
                            if (searchInputRef.current) {
                              searchInputRef.current.blur();
                        }
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">{query}</span>
                </div>
                          <div className="text-xs text-muted-foreground">Just now</div>
                  </div>
                      ))}
                </div>
              </div>
            )}
              </CardContent>
            </GlassCard>

            {/* Search Results Section - Matching Search Test tab */}
            {(messages.length > 0 || isTyping || isStreaming) && (
              <GlassCard>
                <CardContent className="pt-6">
                  {/* Loading - Skeleton or Typing Loader based on searchLoaderType */}
                  {(isTyping || (isStreaming && !streamingContent)) && (
                    <>
                      {searchLoaderType === "typing" ? (
                        <TypingAnimation message="AI is thinking..." speed={50} />
                      ) : (
                        <div className="space-y-3">
                          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse w-2/3"></div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Results Display */}
                  <div className="space-y-4">
                    {messages
                      .filter((message) => message.type === "assistant")
                      .map((message, index) => {
                        const isLastMessage = index === messages.filter((m) => m.type === "assistant").length - 1;
                        return (
                          <div key={message.messageId || `${message.timestamp?.getTime()}-${index}`} className="space-y-4 w-full min-w-0 max-w-full overflow-x-hidden">
                            <div className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground prose-p:break-words prose-p:overflow-wrap-anywhere prose-headings:break-words prose-headings:overflow-wrap-anywhere prose-li:break-words prose-li:overflow-wrap-anywhere">
                              {isStreaming && isLastMessage && streamingContent ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeRaw]}
                                  components={{
                                    code: ({ node, className, children, ...props }: any) => {
                                      const isInline = !className?.includes('language-');
                                      if (isInline) {
                                        return (
                                          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                            {children}
                                          </code>
                                        );
                                      }
                                      const match = /language-(\w+)/.exec(className || '');
                                      const language = match ? match[1] : 'text';
                                      return (
                                        <div className="my-4">
                                          <SyntaxHighlighter
                                            language={language}
                                            style={isDarkMode ? oneDark : oneLight}
                                            customStyle={{
                                              margin: 0,
                                              borderRadius: '0.5rem',
                                              fontSize: '0.875rem',
                                              lineHeight: '1.5',
                                            }}
                                            showLineNumbers={false}
                                            wrapLines={true}
                                            wrapLongLines={true}
                                          >
                                            {safeStringConversion(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                </div>
                                      );
                                    },
                                    a: ({ href, children, ...props }) => (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                        {...props}
                                      >
                                        {children}
                                      </a>
                                    ),
                                    ul: ({ children, ...props }) => (
                                      <ul className="list-disc list-inside space-y-1" {...props}>
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children, ...props }) => (
                                      <ol className="list-decimal list-inside space-y-1" {...props}>
                                        {children}
                                      </ol>
                                    ),
                                    blockquote: ({ children, ...props }) => (
                                      <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" {...props}>
                                        {children}
                                      </blockquote>
                                    ),
                                  }}
                                >
                                  {safeStringConversion(streamingContent)}
                                </ReactMarkdown>
                              ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          code: ({ node, className, children, ...props }: any) => {
                            const isInline = !className?.includes('language-');
                            if (isInline) {
                              return (
                                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';
                            return (
                              <div className="my-4">
                                <SyntaxHighlighter
                                  language={language}
                                            style={isDarkMode ? oneDark : oneLight}
                                  customStyle={{
                                    margin: 0,
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                  }}
                                  showLineNumbers={false}
                                  wrapLines={true}
                                  wrapLongLines={true}
                                >
                                  {safeStringConversion(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            );
                          },
                          a: ({ href, children, ...props }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                                    ul: ({ children, ...props }) => (
                                      <ul className="list-disc list-inside space-y-1" {...props}>
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children, ...props }) => (
                                      <ol className="list-decimal list-inside space-y-1" {...props}>
                                        {children}
                                      </ol>
                                    ),
                                    blockquote: ({ children, ...props }) => (
                                      <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" {...props}>
                                        {children}
                                      </blockquote>
                          ),
                        }}
                      >
                                  {safeStringConversion(message.content)}
                      </ReactMarkdown>
                              )}
                    </div>
                            {message.citations && message.citations.length > 0 && (() => {
                              const topKValue = message.actualTopK !== undefined ? message.actualTopK : (message.ragSettings?.topK !== undefined ? message.ragSettings.topK : message.citations.length);
                              const displayedCitations = topKValue ? message.citations.slice(0, topKValue) : message.citations;
                              const citationFormatting = searchCitationFormatting || { showSourceCount: true, layout: 'grid', colorScheme: 'default' };
                              
                              const getCitationColorSchemeClasses = () => {
                                const colorScheme = citationFormatting.colorScheme || 'default';
                                switch (colorScheme) {
                                  case 'primary': return "border-primary/20 bg-primary/5";
                                  case 'muted': return "border-muted bg-muted/30";
                                  case 'accent': return "border-accent/20 bg-accent/5";
                                  default: return "border-border/20 bg-muted/30";
                                }
                              };
                              
                              return (
                                <div className="pt-4 border-t border-border space-y-3 w-full min-w-0">
                                  {citationFormatting.showSourceCount && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Sources ({displayedCitations.length}):
                                      </span>
                  </div>
                                  )}
                                  <div className={`grid gap-3 w-full min-w-0 ${citationFormatting.layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {displayedCitations.map((citation, index) => (
                                      <Card key={index} className={`p-3 w-full min-w-0 border ${getCitationColorSchemeClasses()}`}>
                                        <div className="space-y-2 w-full min-w-0">
                                          <div className="flex items-start gap-2 w-full min-w-0">
                                            <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">{index + 1}.</span>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                              <h4 className="text-sm font-medium text-foreground break-words overflow-wrap-anywhere">{citation.title}</h4>
                                              <p className="text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">{citation.snippet}</p>
                                              <a
                                                href={citation.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1 break-all"
                                              >
                                                View Source
                                                <span>→</span>
                                              </a>
                </div>
              </div>
          </div>
                                      </Card>
                                    ))}
        </div>
                                </div>
                              );
                            })()}
                            {/* Feedback and Copy Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border/20">
                              <div className="flex items-center gap-2">
                                <button
                                  className={`chatbot-message-action-button ${messageCopied[message.messageId || ''] ? "active" : ""}`}
                                  onClick={async () => {
                                    const messageId = message.messageId || '';
                                    await copyToClipboard(message.content);
                                    setMessageCopied(prev => ({ ...prev, [messageId]: true }));
                                    setTimeout(() => {
                                      setMessageCopied(prev => ({ ...prev, [messageId]: false }));
                                    }, 2000);
                                  }}
                                  title="Copy message"
                                >
                                  {messageCopied[message.messageId || ''] ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                                <button
                                  className={`chatbot-message-action-button ${messageFeedback[message.messageId || ''] === "up" ? "active" : ""}`}
                                  onClick={() => {
                                    const messageId = message.messageId || '';
                                    const newFeedback = messageFeedback[messageId] === "up" ? null : "up";
                                    setMessageFeedback(prev => ({ ...prev, [messageId]: newFeedback }));
                                    
                                    if (messageId && currentSessionId && newFeedback) {
                                      submitFeedback({
                                        sessionId: currentSessionId,
                                        messageId: messageId,
                                        feedback: "positive"
                                      });
                                    }
                                  }}
                                  disabled={isSubmitting}
                                  title="Thumbs up"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                <button
                                  className={`chatbot-message-action-button ${messageFeedback[message.messageId || ''] === "down" ? "active" : ""}`}
                                  onClick={() => {
                                    const messageId = message.messageId || '';
                                    const newFeedback = messageFeedback[messageId] === "down" ? null : "down";
                                    setMessageFeedback(prev => ({ ...prev, [messageId]: newFeedback }));
                                    
                                    if (messageId && currentSessionId && newFeedback) {
                                      submitFeedback({
                                        sessionId: currentSessionId,
                                        messageId: messageId,
                                        feedback: "negative"
                                      });
                                    }
                                  }}
                                  disabled={isSubmitting}
                                  title="Thumbs down"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                </button>
              </div>
            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
              </GlassCard>
            )}
        </div>
      </div>
    </React.Fragment>
  );
});

export const EmbeddableSearchWidget = EmbeddableSearchWidgetComponent;

