/**
 * EMBEDDABLE SEARCH WIDGET
 * 
 * This is a search-focused widget that can be embedded on external websites.
 * It's similar to EmbeddableWidget but focused on search functionality only.
 * 
 * Features:
 * - Search-only interface (no chat)
 * - Same design and styling as chatbot widget
 * - Live updates from API settings
 * - Project ID authentication
 * - Sources and citations display
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Send, Trash2, Search } from "lucide-react";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { useSearch } from "@/hooks/useSearch";
import { useTheme } from "@/contexts/ThemeContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import "./EmbeddableSearchWidgetStyles.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { safeStringConversion } from "@/utils/safeStringConversion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChatMessage from "./ChatMessage";

interface SearchMessage {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: { title: string; url: string; snippet: string }[];
  queryString?: string;
  ragSettings?: {
    topK?: number;
    similarityThreshold?: number;
    maxTokens?: number;
    useReranker?: boolean;
  };
  serverMessage?: string;
  actualTopK?: number;
  actualReranker?: boolean;
}

interface SearchWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
  title?: string;
  showPoweredBy?: boolean;
  onReady?: () => void;
  onError?: (error: string, context?: string) => void;
  previewOverrides?: {
    widgetLogoUrl?: string | null;
    widgetAvatar?: string;
    widgetAvatarSize?: number;
    widgetChatbotColor?: string;
    widgetShowLogo?: boolean;
    widgetShowDateTime?: boolean;
    widgetBottomSpace?: number;
    widgetFontSize?: number;
    widgetTriggerBorderRadius?: number;
    widgetPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    widgetZIndex?: number;
    widgetOffsetX?: number;
    widgetOffsetY?: number;
    orgName?: string;
    searchTitle?: string;
    welcomeMessage?: string;
  };
  isPreviewMode?: boolean;
}

const EmbeddableSearchWidgetComponent = React.memo(function EmbeddableSearchWidget({
  isOpen = false,
  onToggle,
  title = "Search Assistant",
  showPoweredBy = true,
  onReady,
  onError,
  previewOverrides,
  isPreviewMode = false,
}: SearchWidgetProps) {
  const { settings } = useRAGSettings();
  const branding = useBranding();
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const { searchAsync, isSearching } = useSearch();

  // Use preview overrides if provided, otherwise use branding context values
  const widgetZIndex = previewOverrides?.widgetZIndex !== undefined ? previewOverrides.widgetZIndex : branding.widgetZIndex;
  const widgetPosition = previewOverrides?.widgetPosition !== undefined ? previewOverrides.widgetPosition : branding.widgetPosition;
  const widgetOffsetX = previewOverrides?.widgetOffsetX !== undefined ? previewOverrides.widgetOffsetX : branding.widgetOffsetX;
  const widgetOffsetY = previewOverrides?.widgetOffsetY !== undefined ? previewOverrides.widgetOffsetY : branding.widgetOffsetY;
  const widgetLogoUrl = previewOverrides?.widgetLogoUrl !== undefined ? previewOverrides.widgetLogoUrl : branding.widgetLogoUrl;
  const widgetAvatar = previewOverrides?.widgetAvatar !== undefined ? previewOverrides.widgetAvatar : branding.widgetAvatar;
  const widgetAvatarSize = previewOverrides?.widgetAvatarSize !== undefined ? previewOverrides.widgetAvatarSize : branding.widgetAvatarSize;
  const widgetChatbotColor = previewOverrides?.widgetChatbotColor !== undefined ? previewOverrides.widgetChatbotColor : branding.widgetChatbotColor;
  const widgetShowLogo = previewOverrides?.widgetShowLogo !== undefined ? previewOverrides.widgetShowLogo : branding.widgetShowLogo;
  const widgetShowDateTime = previewOverrides?.widgetShowDateTime !== undefined ? previewOverrides.widgetShowDateTime : branding.widgetShowDateTime;
  const widgetBottomSpace = previewOverrides?.widgetBottomSpace !== undefined ? previewOverrides.widgetBottomSpace : branding.widgetBottomSpace;
  const widgetFontSize = previewOverrides?.widgetFontSize !== undefined ? previewOverrides.widgetFontSize : branding.widgetFontSize;
  const widgetTriggerBorderRadius = previewOverrides?.widgetTriggerBorderRadius !== undefined ? previewOverrides.widgetTriggerBorderRadius : (branding.widgetTriggerBorderRadius ?? 50);
  const orgName = previewOverrides?.orgName !== undefined ? previewOverrides.orgName : branding.orgName;
  const widgetTitle = previewOverrides?.searchTitle !== undefined 
    ? previewOverrides.searchTitle 
    : (branding.chatbotTitle || orgName || title);
  const welcomeMessage = previewOverrides?.welcomeMessage !== undefined 
    ? previewOverrides.welcomeMessage 
    : (branding.welcomeMessage || "Hello! I can help you search for information. What would you like to find?");

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldShow, setShouldShow] = useState(isOpen);
  const [messages, setMessages] = useState<SearchMessage[]>([
    {
      type: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;

  // Animation handling
  useEffect(() => {
    if (isOpen && !shouldShow) {
      setShouldShow(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    } else if (!isOpen && shouldShow) {
      setIsAnimating(true);
      setTimeout(() => {
        setShouldShow(false);
        setIsAnimating(false);
      }, 300);
    }
  }, [isOpen, shouldShow]);

  // Avatar handling (same as chatbot widget)
  const apiBaseUrl = typeof window !== 'undefined' ? ((window as any).RAGSUITE_API_URL || 'http://192.168.0.101:8000/api/v1') : 'http://192.168.0.101:8000/api/v1';
  const avatarOptions = [
    { id: 'avatar-1', image: `${apiBaseUrl}/avatars/avatar-1.png` },
    { id: 'avatar-2', image: `${apiBaseUrl}/avatars/avatar-2.png` },
    { id: 'avatar-3', image: `${apiBaseUrl}/avatars/avatar-3.png` },
    { id: 'avatar-4', image: `${apiBaseUrl}/avatars/avatar-4.png` },
    { id: 'avatar-5', image: `${apiBaseUrl}/avatars/avatar-5.png` },
  ];
  const defaultAvatarUrl = `${apiBaseUrl}/avatars/avatar-1.png`;
  const isCustomAvatarImage = widgetAvatar && (widgetAvatar.startsWith('http://') || widgetAvatar.startsWith('https://'));
  const isDefaultAvatarImage = widgetAvatar && !isCustomAvatarImage && avatarOptions.some(a => a.id === widgetAvatar);
  const selectedAvatar = isDefaultAvatarImage ? avatarOptions.find(a => a.id === widgetAvatar) || avatarOptions[0] : avatarOptions[0];
  const shouldSkipAvatarImage = !widgetAvatar || widgetAvatar === '';

  // Track failed avatar attempts to prevent infinite loops
  const failedAvatarAttempts = useRef<Set<string>>(new Set());
  const avatarLoadingDisabled = useRef<boolean>(false); // Global flag to stop all avatar loading
  const maxAvatarRetries = 1; // Stop after just 1 failure to prevent infinite loops
  
  // Disable avatar loading immediately if we're in widget mode and avatars are known to fail
  // This prevents the initial load attempts that cause ERR_ADDRESS_IN_USE errors
  React.useEffect(() => {
    const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
    if (isWidgetMode) {
      // In widget mode, check if avatars are likely to fail (backend might not serve them)
      // We'll let the first attempt happen, but disable immediately on first error
      // This is handled in the onError handlers below
    }
  }, []);

  // Streaming simulation
  const simulateStreamingResponse = async (content: string, onUpdate: (content: string) => void) => {
    const words = content.split(' ');
    let currentContent = '';
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      onUpdate(currentContent);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (isPreviewMode) return;
    const scrollContainer = chatMessagesRef.current;
    if (scrollContainer && messagesEndRef.current) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [isPreviewMode]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isOpen, scrollToBottom]);

  // Extract TopK from server message
  const extractTopKFromMessage = (message: string): { topK: number; reranker: boolean } => {
    const topKMatch = message.match(/topK=(\d+)/);
    const rerankerMatch = message.match(/reranker=(on|off)/);
    return {
      topK: topKMatch ? parseInt(topKMatch[1]) : 5,
      reranker: rerankerMatch ? rerankerMatch[1] === 'on' : false
    };
  };

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    console.log("🔍 Search Widget - User submitted query:", query);

    if (isPreviewMode) {
      console.log("🔍 Preview mode: Search submission blocked");
      return;
    }

    const userMessage: SearchMessage = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const searchResponse = await searchAsync(query, settings);
      console.log("📦 Search Widget Response:", searchResponse);

      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent("");

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

      const assistantMessage: SearchMessage = {
        type: "assistant",
        content: responseContent,
        citations: mappedSources,
        timestamp: new Date(),
        ragSettings: settings,
        queryString: query,
        serverMessage: serverMessage,
        actualTopK: actualTopK,
        actualReranker: actualReranker,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");

      if (onReady) {
        onReady();
      }
    } catch (error: any) {
      console.error("❌ Search widget failed:", error);
      setIsTyping(false);
      setIsStreaming(false);
      
      const errorMsg: SearchMessage = {
        type: "assistant",
        content: error?.response?.data?.detail || error?.message || "Sorry, I encountered an error while searching. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);

      if (onError) {
        onError(error?.message || "Search failed", "handleSearch");
      }
    }
  }, [searchAsync, settings, isPreviewMode]); // Removed onReady and onError from deps to prevent infinite loops

  // Input handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query && !isPreviewMode) {
      handleSearch(query);
      setInputValue("");
    }
  }, [inputValue, handleSearch, isPreviewMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const query = inputValue.trim();
      if (query && !isPreviewMode) {
        handleSearch(query);
        setInputValue("");
      }
    }
  }, [inputValue, handleSearch, isPreviewMode]);

  // Clear search history
  const clearSearch = useCallback(() => {
    setMessages([
      {
        type: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  }, [welcomeMessage]);

  // Render message
  const renderMessage = useCallback((message: SearchMessage, index: number) => {
    return (
      <ChatMessage
        key={index}
        type={message.type}
        content={message.content}
        citations={message.citations}
        timestamp={message.timestamp}
        showFeedback={false}
        ragSettings={message.ragSettings}
        queryString={message.queryString}
        serverMessage={message.serverMessage}
        actualTopK={message.actualTopK}
        actualReranker={message.actualReranker}
        isWidget={true}
        widgetAvatar={widgetAvatar}
        widgetAvatarSize={widgetAvatarSize}
        widgetChatbotColor={widgetChatbotColor}
        widgetShowDateTime={widgetShowDateTime}
        widgetFontSize={widgetFontSize}
        avatarOptions={avatarOptions}
      />
    );
  }, [widgetAvatar, widgetAvatarSize, widgetChatbotColor, widgetShowDateTime, widgetFontSize, avatarOptions]);

  // Position calculation
  const getWindowPosition = () => {
    const basePosition: React.CSSProperties = {
      position: 'fixed' as const,
    };

    switch (widgetPosition) {
      case 'bottom-right':
        return { ...basePosition, bottom: `calc(${widgetBottomSpace}px + 70px)`, right: `${widgetOffsetX}px` };
      case 'bottom-left':
        return { ...basePosition, bottom: `calc(${widgetBottomSpace}px + 70px)`, left: `${widgetOffsetX}px` };
      case 'top-right':
        return { ...basePosition, top: `${widgetOffsetY}px`, right: `${widgetOffsetX}px` };
      case 'top-left':
        return { ...basePosition, top: `${widgetOffsetY}px`, left: `${widgetOffsetX}px` };
      default:
        return { ...basePosition, bottom: `calc(${widgetBottomSpace}px + 70px)`, right: `${widgetOffsetX}px` };
    }
  };

  const getTriggerPosition = () => {
    const basePosition: React.CSSProperties = {
      position: 'fixed' as const,
    };

    switch (widgetPosition) {
      case 'bottom-right':
        return { ...basePosition, bottom: `${widgetBottomSpace}px`, right: `${widgetOffsetX}px` };
      case 'bottom-left':
        return { ...basePosition, bottom: `${widgetBottomSpace}px`, left: `${widgetOffsetX}px` };
      case 'top-right':
        return { ...basePosition, top: `${widgetOffsetY}px`, right: `${widgetOffsetX}px` };
      case 'top-left':
        return { ...basePosition, top: `${widgetOffsetY}px`, left: `${widgetOffsetX}px` };
      default:
        return { ...basePosition, bottom: `${widgetBottomSpace}px`, right: `${widgetOffsetX}px` };
    }
  };

  const windowPosition = getWindowPosition();
  const isDefaultGradient = widgetChatbotColor === '#667eea';
  const isCustomGradient = widgetChatbotColor && widgetChatbotColor.includes('gradient');

  // Render trigger button
  const renderTriggerButton = () => {
    return (
      <button
        id="search-widget-trigger"
        className="chatbot-trigger"
        onClick={onToggle}
        aria-label="Open Search"
        style={{
          ...getTriggerPosition(),
          zIndex: Math.max(widgetZIndex, 99999),
          borderRadius: `${widgetTriggerBorderRadius}%`,
          '--chatbot-color': widgetChatbotColor,
          fontSize: widgetFontSize ? `${widgetFontSize}px` : undefined,
        } as React.CSSProperties & { [key: string]: string | number }}
      >
        {!avatarLoadingDisabled.current && isCustomAvatarImage ? (
          <img
            src={widgetAvatar}
            alt="Search"
            width={widgetAvatarSize || 60}
            height={widgetAvatarSize || 60}
            style={{
              borderRadius: 'inherit',
              objectFit: 'cover',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              
              // If avatar loading is globally disabled, just hide and return
              if (avatarLoadingDisabled.current) {
                target.style.display = 'none';
                return;
              }
              
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
            }}
          />
        ) : !avatarLoadingDisabled.current && !shouldSkipAvatarImage && isDefaultAvatarImage ? (
          <img
            src={selectedAvatar.image}
            alt="Search"
            width={widgetAvatarSize || 60}
            height={widgetAvatarSize || 60}
            style={{
              borderRadius: 'inherit',
              objectFit: 'cover',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              
              // If avatar loading is globally disabled, just hide and return
              if (avatarLoadingDisabled.current) {
                target.style.display = 'none';
                return;
              }
              
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
            }}
          />
        ) : !avatarLoadingDisabled.current ? (
          <img
            src={defaultAvatarUrl}
            alt="Search"
            width={widgetAvatarSize || 60}
            height={widgetAvatarSize || 60}
            style={{
              borderRadius: 'inherit',
              objectFit: 'cover',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              
              // If avatar loading is globally disabled, just hide and return
              if (avatarLoadingDisabled.current) {
                target.style.display = 'none';
                return;
              }
              
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
            }}
          />
        ) : null}
      </button>
    );
  };

  // onReady callback - only call once on mount, not on every onReady change
  const onReadyCalled = useRef(false);
  useEffect(() => {
    if (onReady && !onReadyCalled.current) {
      onReadyCalled.current = true;
      onReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to prevent infinite loops

  if (!shouldShow) {
    return <>{renderTriggerButton()}</>;
  }

  return (
    <React.Fragment>
      {/* Search Window */}
      <div
        id="search-widget"
        className={`chatbot-window ${shouldShow ? 'chatbot-window--active' : ''}`}
        data-preview-mode={isPreviewMode ? 'true' : 'false'}
        style={{
          ...windowPosition,
          bottom: isPreviewMode ? 'auto' : `calc(var(--widget-bottom-size) + 70px)`,
          width: isPreviewMode ? '100%' : '448px',
          maxWidth: isPreviewMode ? '100%' : 'calc(100% - 40px)',
          height: isPreviewMode ? '100%' : '600px',
          maxHeight: isPreviewMode ? '100%' : `calc(100% - calc(var(--widget-bottom-size) + 72px))`,
          zIndex: isPreviewMode ? 1 : Math.max(widgetZIndex, 99999),
          '--widget-bottom-size': `${widgetBottomSpace}px`,
          '--chatbot-color': widgetChatbotColor,
          fontSize: widgetFontSize ? `${widgetFontSize}px` : undefined,
        } as React.CSSProperties & { [key: string]: string | number }}
        role="dialog"
        aria-label="Search Assistant"
        aria-modal={isPreviewMode ? "false" : "true"}
        aria-live="polite"
      >
        {/* Header */}
        <div
          className="chatbot-header"
          style={{
            backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor,
            backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
          }}
        >
          <div className="chatbot-header-content">
            {widgetShowLogo && widgetLogoUrl && (
              <img src={widgetLogoUrl} alt="Logo" className="chatbot-logo" />
            )}
            <h3 className="chatbot-title">{widgetTitle}</h3>
          </div>
          <div className="chatbot-header-actions">
            <button
              type="button"
              className="chatbot-delete"
              onClick={clearSearch}
              aria-label="Clear Search"
              disabled={isPreviewMode}
            >
              <Trash2 style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              type="button"
              className="chatbot-close"
              onClick={onToggle}
              aria-label="Close Search"
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chatbot-messages" id="searchMessages" ref={chatMessagesRef}>
          {/* Welcome Message */}
          <div className="chatbot-welcome">
            <div className="chatbot-welcome-avatar">
              {isCustomAvatarImage ? (
                <img
                  className="chatbot-avatar"
                  src={widgetAvatar}
                  alt={widgetTitle}
                  width={80}
                  height={80}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    
                    // If avatar loading is globally disabled, just hide and return
                    if (avatarLoadingDisabled.current) {
                      target.style.display = 'none';
                      return;
                    }
                    
                    const failedUrl = target.src;
                    failedAvatarAttempts.current.add(failedUrl);
                    
                    // Stop ALL avatar loading after first failure to prevent infinite loops
                    if (failedAvatarAttempts.current.size >= maxAvatarRetries) {
                      console.warn('⚠️ Avatar loading failed, disabling all avatar loading');
                      avatarLoadingDisabled.current = true;
                      target.style.display = 'none';
                      return;
                    }
                    
                    // Hide immediately - don't try other avatars
                    target.style.display = 'none';
                  }}
                />
              ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
                <img
                  className="chatbot-avatar"
                  src={selectedAvatar.image}
                  alt={widgetTitle}
                  width={80}
                  height={80}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    
                    // If avatar loading is globally disabled, just hide and return
                    if (avatarLoadingDisabled.current) {
                      target.style.display = 'none';
                      return;
                    }
                    
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                  }}
                />
              ) : (
                <img
                  className="chatbot-avatar"
                  src={defaultAvatarUrl}
                  alt={widgetTitle}
                  width={80}
                  height={80}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    
                    // If avatar loading is globally disabled, just hide and return
                    if (avatarLoadingDisabled.current) {
                      target.style.display = 'none';
                      return;
                    }
                    
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="chatbot-welcome-text">
              <div className="chatbot-welcome-title">{widgetTitle}</div>
              {welcomeMessage && (
                <div className="chatbot-welcome-subtitle">{welcomeMessage}</div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="chatbot-conversation" 
            id="searchMessagesContainer"
          >
            {messages.map((message, index) => renderMessage(message, index))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-message bot-message">
                <div className="chatbot-message__avatar">
                  {isCustomAvatarImage ? (
                    <img
                      className="chatbot-avatar-image"
                      src={widgetAvatar}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        
                        // If avatar loading is globally disabled, just hide and return
                        if (avatarLoadingDisabled.current) {
                          target.style.display = 'none';
                          return;
                        }
                        
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                      }}
                    />
                  ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
                    <img
                      className="chatbot-avatar-image"
                      src={selectedAvatar.image}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    
                    // If avatar loading is globally disabled, just hide and return
                    if (avatarLoadingDisabled.current) {
                      target.style.display = 'none';
                      return;
                    }
                    
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                  }}
                    />
                  ) : (
                    <img
                      className="chatbot-avatar-image"
                      src={defaultAvatarUrl}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        
                        // If avatar loading is globally disabled, just hide and return
                        if (avatarLoadingDisabled.current) {
                          target.style.display = 'none';
                          return;
                        }
                        
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="chatbot-message__content">
                  <div className="chatbot-typing-indicator loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming Response */}
            {isStreaming && streamingContent && (
              <div className="chatbot-message bot-message">
                <div className="chatbot-message__avatar">
                  {isCustomAvatarImage ? (
                    <img
                      className="chatbot-avatar-image"
                      src={widgetAvatar}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        
                        // If avatar loading is globally disabled, just hide and return
                        if (avatarLoadingDisabled.current) {
                          target.style.display = 'none';
                          return;
                        }
                        
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                      }}
                    />
                  ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
                    <img
                      className="chatbot-avatar-image"
                      src={selectedAvatar.image}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    
                    // If avatar loading is globally disabled, just hide and return
                    if (avatarLoadingDisabled.current) {
                      target.style.display = 'none';
                      return;
                    }
                    
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                  }}
                    />
                  ) : (
                    <img
                      className="chatbot-avatar-image"
                      src={defaultAvatarUrl}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        
                        // If avatar loading is globally disabled, just hide and return
                        if (avatarLoadingDisabled.current) {
                          target.style.display = 'none';
                          return;
                        }
                        
              // Stop ALL avatar loading immediately after first failure
              // Only log once to prevent console spam
              if (!avatarLoadingDisabled.current) {
                console.log('ℹ️ Avatar images unavailable - widget will continue without avatars');
              }
              avatarLoadingDisabled.current = true;
              target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="chatbot-message__content">
                  <div className="chatbot-message-text">
                    <div className="text-sm leading-relaxed prose-sm max-w-none">
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
                                  style={theme === 'dark' ? oneDark : oneLight}
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
                        }}
                      >
                        {safeStringConversion(streamingContent)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="chatbot-input">
          <form className="chatbot-form" onSubmit={handleInputSubmit}>
            <div className={`chatbot-input-area ${isPreviewMode ? 'disabled' : ''}`}>
              <textarea
                ref={textareaRef}
                className="chatbot-textarea"
                rows={1}
                placeholder="Search..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                aria-label="Type your search query"
                disabled={isPreviewMode}
              />
              <div className="chatbot-input-buttons">
                <button
                  type="submit"
                  className="chatbot-send-button"
                  aria-label="Search"
                  disabled={!inputValue.trim() || isPreviewMode}
                >
                  <Search className="chatbot-icon" style={{ width: '24px', height: '24px' }} />
                </button>
              </div>
            </div>
            {showPoweredBy && (
              <div className="chatbot-input-footer">Generative AI is experimental.</div>
            )}
          </form>
        </div>
      </div>

      {/* Trigger Button */}
      {renderTriggerButton()}
    </React.Fragment>
  );
});

export const EmbeddableSearchWidget = EmbeddableSearchWidgetComponent;

