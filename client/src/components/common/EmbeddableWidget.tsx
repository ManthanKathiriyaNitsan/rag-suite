import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Mic, Send, Trash2, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { testChatAPIConnection } from "@/services/api/api";
// 🌐 Import our global API hooks
import { useSearch } from "@/hooks/useSearch";
import { useChat, useChatFeedback } from "@/hooks/useChat";
import { useTheme } from "@/contexts/ThemeContext";
import { useBranding } from "@/contexts/BrandingContext";
import { cn, copyToClipboard } from "@/lib/utils";
import "./EmbeddableWidgetStyles.css";
// 📝 Import markdown support for message rendering
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { safeStringConversion } from "@/utils/safeStringConversion";


interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: { title: string; url: string; snippet: string }[];
  // 🎛️ RAG Settings display
  ragSettings?: {
    topK?: number;
    similarityThreshold?: number;
    maxTokens?: number;
    useReranker?: boolean;
  };
  queryString?: string; // Original query string
  // 📊 Server response data
  serverMessage?: string; // Server response message with actual TopK
  actualTopK?: number; // Actual TopK used by server
  actualReranker?: boolean; // Actual reranker status from server
  // 💬 Chat/Feedback data
  messageId?: string; // Message ID for feedback submission
  sessionId?: string; // Session ID for feedback submission
}

interface WidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
  title?: string;
  showPoweredBy?: boolean;
  // 🎯 Custom Event Callbacks
  onReady?: () => void;
  onAnswer?: (answer: string, query: string) => void;
  onError?: (error: string, context?: string) => void;
  // 🎨 Preview overrides (for live preview in customization page)
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
    chatbotTitle?: string; // Chatbot title (separate from orgName)
    bubbleMessage?: string;
    shortDescription?: string;
    welcomeMessage?: string;
  };
  // Preview mode - prevents loading chat history and keeps messages temporary
  isPreviewMode?: boolean;
}

const EmbeddableWidgetComponent = React.memo(function EmbeddableWidget({
  isOpen = false,
  onToggle,
  title = "AI Assistant",
  showPoweredBy = true,
  // 🎯 Custom Event Callbacks
  onReady,
  onAnswer,
  onError,
  // 🎨 Preview overrides
  previewOverrides,
  // Preview mode - prevents loading chat history
  isPreviewMode = false,
}: WidgetProps) {
  // 🎛️ Use global RAG settings
  const { settings } = useRAGSettings();

  // 🎨 Use branding settings for widget positioning and customization
  const branding = useBranding();
  
  // 🎨 Use theme for markdown rendering
  const { theme } = useTheme();
  
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
  // Widget title should use chatbotTitle (from Chatbot Configuration) if available, otherwise fall back to orgName (from Settings) or title prop
  const widgetTitle = previewOverrides?.chatbotTitle !== undefined 
    ? previewOverrides.chatbotTitle 
    : (branding.chatbotTitle || orgName || title);
  const bubbleMessage = previewOverrides?.bubbleMessage !== undefined ? previewOverrides.bubbleMessage : (branding.bubbleMessage || undefined);
  const shortDescription = previewOverrides?.shortDescription !== undefined ? previewOverrides.shortDescription : (branding.shortDescription || undefined);
  const welcomeMessage = previewOverrides?.welcomeMessage !== undefined ? previewOverrides.welcomeMessage : (branding.welcomeMessage || "Hello! I can help you search for information or answer questions about your documentation. What would you like to know?");

  // 🎭 Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldShow, setShouldShow] = useState(isOpen);
  const [showBubble, setShowBubble] = useState(false);
  
  // Ref to ensure border radius persists
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // 🎬 Handle smooth open/close animations
  useEffect(() => {
    if (isOpen && !shouldShow) {
      // Opening animation
      setShouldShow(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    } else if (!isOpen && shouldShow) {
      // Closing animation
      setIsAnimating(true);
      setTimeout(() => {
        setShouldShow(false);
        setIsAnimating(false);
      }, 300);
    }
  }, [isOpen, shouldShow, setShouldShow, setIsAnimating]);

  // 🫧 Handle bubble message visibility - show for 2.5 seconds
  useEffect(() => {
    if (bubbleMessage && bubbleMessage.trim() !== "") {
      // Show bubble when it first appears
      setShowBubble(true);
      
      // Hide after 2.5 seconds
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    } else {
      setShowBubble(false);
    }
  }, [bubbleMessage]);

  // 🎯 Helper function to get position classes
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-right': return 'bottom-4 right-4 sm:bottom-6 sm:right-6';
      case 'bottom-left': return 'bottom-4 left-4 sm:bottom-6 sm:left-6';
      case 'top-right': return 'top-4 right-4 sm:top-6 sm:right-6';
      case 'top-left': return 'top-4 left-4 sm:top-6 sm:left-6';
      default: return 'bottom-4 right-4 sm:bottom-6 sm:right-6';
    }
  };

  const getModalPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-right': return 'top-0 right-0 sm:right-6';
      case 'bottom-left': return 'top-0 left-0 sm:left-6';
      case 'top-right': return 'top-0 right-0 sm:right-6';
      case 'top-left': return 'top-0 left-0 sm:left-6';
      default: return 'top-0 right-0 sm:right-6';
    }
  };

  // Widget appearance settings (defaults, not persisted in localStorage)
  const widgetAppearance = {
    chatBubbleStyle: "rounded" as const,
    avatarStyle: "circle" as const,
            animationsEnabled: true,
          };

  // Always use chat mode (no tabs)
  const activeTab = "chat";


  // 💬 Load messages from API on mount
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 💬 Load chat history from API on mount (skip in preview mode)
  useEffect(() => {
    // In preview mode, only show welcome message and a sample user message, don't load chat history
      if (isPreviewMode) {
        setMessages([
          {
            type: "assistant",
            content: welcomeMessage,
            timestamp: new Date(),
          },
          {
            type: "user",
            content: "hi",
            timestamp: new Date(),
          },
        ]);
        setIsLoadingHistory(false);
        return;
      }

    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const { chatAPI } = await import('@/services/api/api');
        const history = await chatAPI.getChatHistory();

        if (history && history.length > 0) {
          const convertedMessages: Message[] = [
            {
              type: "assistant",
              content: welcomeMessage,
              timestamp: new Date(),
            },
          ];

          [...history].reverse().forEach((item: any) => {
            convertedMessages.push({
              type: "user",
              content: item.userMessage,
              timestamp: new Date(item.createdAt),
            });

            convertedMessages.push({
              type: "assistant",
              content: item.assistantResponse,
              timestamp: new Date(item.createdAt),
              messageId: item.messageId,
              sessionId: item.sessionId,
              citations: item.sources && item.sources.length > 0 ? item.sources.map((source: any) => ({
                title: source.title || 'Untitled',
                url: source.url || '#',
                snippet: source.snippet || ''
              })) : undefined,
            });
          });

          setMessages(convertedMessages);
        } else {
          // No history, just show welcome message
          setMessages([
            {
              type: "assistant",
              content: welcomeMessage,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.warn('Failed to load widget chat history from API:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [welcomeMessage, isPreviewMode]);

  // 💬 Update welcome message when it changes (for preview)
  useEffect(() => {
    if (isPreviewMode) {
      // In preview mode, maintain the static messages (welcome + "hi")
      setMessages([
        {
          type: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        },
        {
          type: "user",
          content: "hi",
          timestamp: new Date(),
        },
      ]);
      return;
    }
    if (messages.length > 0 && messages[0].type === "assistant") {
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[0] && newMessages[0].type === "assistant") {
          newMessages[0] = {
            ...newMessages[0],
            content: welcomeMessage,
          };
        }
        return newMessages;
      });
    }
  }, [welcomeMessage, isPreviewMode]);

  // 🗑️ Clear chat function with API call
  const clearChat = async () => {
    try {
      const { chatAPI } = await import('@/services/api/api');
      await chatAPI.deleteAllMessages();
      console.log('✅ All widget messages deleted from database');
    } catch (error) {
      console.error('❌ Failed to delete widget messages:', error);
    }

    setMessages([
      {
        type: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  };

  // 🌐 Use our global search hook - same as RAGTuning!
  const { searchAsync, isSearching, searchData, searchError } = useSearch();

  // 💬 Use our chat hook for enhanced functionality
  const { sendMessageAsync, isSending } = useChat();
  
  // 💬 Use feedback hook for like/dislike
  const { submitFeedback } = useChatFeedback();
  
  // 💬 Feedback state for each message
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "up" | "down" | null>>({});
  const [copiedMessages, setCopiedMessages] = useState<Record<string, boolean>>({});
  // 🧾 Session history removed per request

  // 📋 Current session state
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();

  // 🎭 Animation states
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);

  // 🎤 Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  // 📜 Ref for messages container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🌊 Simulate streaming response
  const simulateStreamingResponse = async (content: string, onUpdate: (content: string) => void) => {
    const words = content.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      onUpdate(currentContent);
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
    }
  };

  // 📜 Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    if (isPreviewMode) return; // Don't scroll in preview mode to prevent page scroll
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  };

  // 📜 Auto-scroll when messages change
  useEffect(() => {
    if (!isPreviewMode) {
      scrollToBottom();
    }
  }, [messages, isPreviewMode]);

  // 🎯 onReady callback - trigger when widget is ready
  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // 🔍 Extract actual TopK from server message
  const extractTopKFromMessage = (message: string): { topK: number; reranker: boolean } => {
    const topKMatch = message.match(/topK=(\d+)/);
    const rerankerMatch = message.match(/reranker=(on|off)/);

    return {
      topK: topKMatch ? parseInt(topKMatch[1]) : 5,
      reranker: rerankerMatch ? rerankerMatch[1] === 'on' : false
    };
  };

  // 🔍 Memoized Search function - ONLY uses search API
  const handleSearch = useCallback(async (query: string) => {
    console.log("🔍 Widget Search - User submitted query:", query);

    // Add user message immediately
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // 🎭 Start typing animation
    setIsTyping(true);
    setPendingResponse("Searching through documentation...");

    try {
      // 🌐 Use ONLY search API for search functionality with global RAG settings
      const searchResponse = await searchAsync(query, settings);
      console.log("📦 Widget Search Response:", searchResponse);
      console.log("🔍 Sources in response:", searchResponse.sources);
      console.log("🔍 Full response structure:", searchResponse);

      // 🎭 Stop typing animation and start streaming
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent("");
      setPendingResponse(null);

      const responseContent = searchResponse.answer || "No answer from API";

      // Simulate streaming response
      await simulateStreamingResponse(responseContent, (content) => {
        setStreamingContent(content);
      });

      // 🔍 Extract actual TopK from server response
      const serverMessage = searchResponse.message || "";
      const { topK: actualTopK, reranker: actualReranker } = extractTopKFromMessage(serverMessage);

      // 🔍 Debug sources extraction
      console.log("🔍 Extracting sources from:", searchResponse.sources);
      const sources = searchResponse.sources || [];
      console.log("🔍 Sources array:", sources);
      console.log("🔍 Sources length:", sources.length);
      console.log("🔍 First 5 sources:", sources.slice(0, 5));
      console.log("🔍 All sources structure:", sources.map((s, i) => ({ index: i, title: s.title, url: s.url, snippet: s.snippet?.substring(0, 50) + "..." })));

      // Use only real API sources - no mock data fallback
      if (sources.length === 0) {
        console.log("⚠️ No sources returned from API for this query");
      }

      // Create final assistant message with RAG settings using only real API data
      const mappedSources = sources.map((source: any) => ({
        title: source.title || "Unknown Source",
        url: source.url || "#",
        snippet: source.snippet || "No snippet available",
      }));

      console.log("🔍 Mapped sources length:", mappedSources.length);
      console.log("🔍 Mapped sources:", mappedSources);

      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: mappedSources,
        timestamp: new Date(),
        ragSettings: settings, // 🎛️ Pass RAG settings
        queryString: query, // 🔍 Pass original query
        serverMessage: serverMessage, // 📊 Server response message
        actualTopK: actualTopK, // 📊 Actual TopK used by server
        actualReranker: actualReranker, // 📊 Actual reranker status
        messageId: searchResponse.message_id, // 💬 Message ID for feedback
        sessionId: searchResponse.session_id, // 💬 Session ID for feedback
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");
      console.log("✅ Widget search completed with search API only");

      // 🎯 onAnswer callback - trigger when AI responds successfully
      if (onAnswer) {
        onAnswer(responseContent, query);
      }

    } catch (error) {
      console.error("❌ Widget search failed:", error);

      // Stop animations on error
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);

      // 🎯 onError callback - trigger when search fails
      if (onError) {
        const errorMessage = error instanceof Error ? error.message : "Search failed";
        onError(errorMessage, "search");
      }

      // Check if it's a CORS error
      const isCORSError = error && typeof error === 'object' && 'message' in error && (error.message as string).includes('CORS');

      let errorMessage = "Sorry, I encountered an error while searching. Please try again.";

      if (isCORSError) {
        errorMessage = "CORS Error: The server is blocking requests from localhost:5000. Please check server CORS configuration.";
      } else if (error instanceof Error) {
        errorMessage = `Search Error: ${error.message}`;
      }

      // Add error message
      const errorMsg: Message = {
        type: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    }
  }, [messages, setMessages]);

  // 💬 Memoized Chat function - ONLY uses chat API
  const handleChat = useCallback(async (query: string) => {
    console.log("💬 Widget Chat - User submitted message:", query);

    // In preview mode, don't allow sending messages
    if (isPreviewMode) {
      console.log("💬 Preview mode: Message submission blocked");
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // 🎭 Start typing animation
    setIsTyping(true);
    setPendingResponse("AI is thinking...");

    try {
      // 🌐 Use ONLY chat API for chat functionality with global RAG settings
      const chatResponse = await sendMessageAsync({
        message: query,
        sessionId: currentSessionId,
        ragSettings: settings
      });
      console.log("💬 Widget Chat Response:", chatResponse);
      console.log("🔍 Sources in chat response:", chatResponse?.sources);
      console.log("🔍 Full chat response structure:", chatResponse);

      // Update session ID if we got one from chat
      if (chatResponse?.sessionId && !currentSessionId) {
        setCurrentSessionId(chatResponse.sessionId);
      }

      // 🎭 Stop typing animation and start streaming
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent("");
      setPendingResponse(null);

      const responseContent = chatResponse?.response || "No response from chat API";

      // Simulate streaming response
      await simulateStreamingResponse(responseContent, (content) => {
        setStreamingContent(content);
      });

      // 🔍 Extract actual TopK from server response
      const serverMessage = "";
      const { topK: actualTopK, reranker: actualReranker } = extractTopKFromMessage(serverMessage);

      // 🔍 Debug sources extraction for chat
      console.log("🔍 Extracting sources from chat:", chatResponse?.sources);
      const chatSources = chatResponse?.sources || [];
      console.log("🔍 Chat sources array:", chatSources);
      console.log("🔍 Chat sources length:", chatSources.length);
      console.log("🔍 First 5 chat sources:", chatSources.slice(0, 5));
      console.log("🔍 All chat sources structure:", chatSources.map((s, i) => ({ index: i, title: s.title, url: s.url, snippet: s.snippet?.substring(0, 50) + "..." })));

      // Create final assistant message with RAG settings
      const mappedChatSources = chatSources.map((source: any) => ({
        title: source.title || "Unknown Source",
        url: source.url || "#",
        snippet: source.snippet || "No snippet available",
      }));

      console.log("🔍 Mapped chat sources length:", mappedChatSources.length);
      console.log("🔍 Mapped chat sources:", mappedChatSources);

      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: mappedChatSources,
        timestamp: new Date(),
        ragSettings: settings, // 🎛️ Pass RAG settings
        queryString: query, // 🔍 Pass original query
        serverMessage: serverMessage, // 📊 Server response message
        actualTopK: actualTopK, // 📊 Actual TopK used by server
        actualReranker: actualReranker, // 📊 Actual reranker status
        messageId: chatResponse?.messageId, // 💬 Message ID for feedback
        sessionId: chatResponse?.sessionId || currentSessionId, // 💬 Session ID for feedback
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");
      console.log("✅ Widget chat completed with chat API only");

      // 🎯 onAnswer callback - trigger when AI responds successfully
      if (onAnswer) {
        onAnswer(responseContent, query);
      }

    } catch (error) {
      console.error("❌ Widget chat failed:", error);

      // Stop animations on error
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);

      // 🎯 onError callback - trigger when chat fails
      if (onError) {
        const errorMessage = error instanceof Error ? error.message : "Chat failed";
        onError(errorMessage, "chat");
      }

      // Check if it's a network error
      const isNetworkError = error && typeof error === 'object' && 'code' in error && (error as any).code === 'ERR_NETWORK';
      const isServerError = error && typeof error === 'object' && 'response' in error && (error as any).response?.status >= 500;
      const isCORSError = error && typeof error === 'object' && 'message' in error && (error as any).message.includes('CORS');
      const isTimeoutError = error && typeof error === 'object' && 'message' in error && (error as any).message.includes('timeout');
      const isAbortError = error && typeof error === 'object' && 'name' in error && (error as any).name === 'AbortError';

      let errorMessage = "Sorry, I encountered an error while chatting. Please try again.";

      if (isAbortError || isTimeoutError) {
        errorMessage = "Connection Timeout: The chat server is not responding. Please check if the server is running at http://192.168.0.117:8000";
      } else if (isCORSError) {
        errorMessage = "CORS Error: The server is blocking requests from localhost:5000. Please check server CORS configuration.";
      } else if (isNetworkError) {
        errorMessage = "Network Error: Cannot connect to the chat server. Please check if the server is running at http://192.168.0.117:8000";
      } else if (isServerError) {
        errorMessage = "Server Error: The chat server is experiencing issues. Please try again later.";
      } else if (error instanceof Error) {
        errorMessage = `Chat Error: ${error.message}`;
      }

      // Add error message
      const errorMsg: Message = {
        type: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    }
  }, [messages, setMessages, isPreviewMode]);

  // Avatar options (matching ChatbotConfiguration)
  const avatarOptions = [
    { id: "default-1", emoji: "🤖" },
    { id: "default-2", emoji: "👤" },
    { id: "default-3", emoji: "👨" },
    { id: "default-4", emoji: "👩" },
    { id: "default-5", emoji: "🧑" },
    { id: "default-6", emoji: "👨‍💼" },
    { id: "default-7", emoji: "👩‍💼" },
    { id: "default-8", emoji: "👨‍🔬" },
    { id: "default-9", emoji: "👩‍🔬" },
    { id: "default-10", emoji: "🤵" },
    { id: "default-11", emoji: "👰" },
    { id: "default-12", emoji: "🎭" },
  ];

  // Check if widgetAvatar is a custom image (URL or data URL) or a default emoji
  const isCustomAvatarImage = widgetAvatar && !widgetAvatar.startsWith("default-") && (widgetAvatar.startsWith("http") || widgetAvatar.startsWith("data:"));
  const selectedAvatar = avatarOptions.find(a => a.id === widgetAvatar) || avatarOptions[0];
  
  // Check if widgetChatbotColor is a custom gradient
  const isCustomGradient = widgetChatbotColor && widgetChatbotColor.startsWith("linear-gradient");
  const isDefaultGradient = widgetChatbotColor === "gradient";
  
  // Ensure border radius is applied and persists (reapply after any DOM changes)
  useEffect(() => {
    if (triggerButtonRef.current) {
      triggerButtonRef.current.style.setProperty('border-radius', `${widgetTriggerBorderRadius}px`, 'important');
    }
  }, [widgetTriggerBorderRadius, shouldShow, isOpen]);

  // Format timestamp as relative time (e.g., "2 months ago")
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just Now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  // 🎤 Voice recognition handlers
  const startRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('🎤 Speech recognition not supported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = (navigator.language || "en-US");
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = finalTranscript || interimTranscript;
        if (combined) {
          setInputValue(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        if (finalTranscript.trim()) {
          setInputValue(finalTranscript.trim());
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('🎤 Speech recognition error:', err);
      setIsListening(false);
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    try {
      if (rec) rec.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition]);

  // 🧹 Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  // 📝 Input handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query && !isPreviewMode) {
      handleChat(query);
      setInputValue("");
    }
  }, [inputValue, handleChat, isPreviewMode]);

  // 🎯 Handle Enter key to submit message (prevent new line and sidebar)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const query = inputValue.trim();
      if (query && !isPreviewMode) {
        handleChat(query);
        setInputValue("");
      }
    }
  }, [inputValue, handleChat, isPreviewMode]);

  // 💬 Handle copy message
  const handleCopyMessage = useCallback(async (content: string, messageId: string) => {
    await copyToClipboard(content);
    setCopiedMessages(prev => ({ ...prev, [messageId]: true }));
    setTimeout(() => {
      setCopiedMessages(prev => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
    }, 2000);
  }, []);

  // 💬 Handle feedback (like/dislike)
  const handleFeedback = useCallback((messageId: string, sessionId: string | undefined, type: "up" | "down") => {
    const currentFeedback = messageFeedback[messageId];
    const newFeedback = currentFeedback === type ? null : type;
    
    setMessageFeedback(prev => ({ ...prev, [messageId]: newFeedback }));
    
    if (sessionId && messageId && newFeedback) {
      submitFeedback({
        sessionId,
        messageId,
        feedback: newFeedback === "up" ? "positive" : "negative"
      });
    }
  }, [messageFeedback, submitFeedback]);

  // Helper function to render a message in the new format
  const renderMessage = useCallback((message: Message, index: number) => {
    const isBot = message.type === "assistant";
    const messageClass = isBot ? "bot-message" : "user-message";
    
    return (
      <div key={index} className={`chatbot-message ${messageClass}`}>
        {isBot && (
          <div className="chatbot-message__avatar">
            {isCustomAvatarImage ? (
              <img
                className="chatbot-avatar-image"
                src={widgetAvatar}
                alt="Avatar"
                width={30}
                height={30}
              />
            ) : (
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor,
                  backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                {selectedAvatar.emoji}
              </div>
            )}
          </div>
        )}
        <div className="chatbot-message__content">
          <div 
            className="chatbot-message-text"
            style={!isBot ? {
              backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor,
              backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
            } : undefined}
          >
            {isBot ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <p>{children}</p>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {safeStringConversion(message.content)}
              </ReactMarkdown>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
          {/* Like, Dislike, Copy buttons and timestamp on same line */}
          {isBot && (
            <div className="chatbot-message-footer">
              <div className="chatbot-message-actions">
                <button
                  type="button"
                  className="chatbot-message-action-button"
                  onClick={() => handleCopyMessage(message.content, message.messageId || `msg-${index}`)}
                  aria-label="Copy message"
                  title="Copy message"
                >
                  <Copy style={{ width: '14px', height: '14px' }} />
                  {copiedMessages[message.messageId || `msg-${index}`] && (
                    <span className="chatbot-message-action-text">Copied!</span>
                  )}
                </button>
                <button
                  type="button"
                  className={`chatbot-message-action-button ${messageFeedback[message.messageId || `msg-${index}`] === "up" ? "active" : ""}`}
                  onClick={() => handleFeedback(message.messageId || `msg-${index}`, message.sessionId, "up")}
                  aria-label="Like message"
                  title="Like"
                >
                  <ThumbsUp style={{ width: '14px', height: '14px' }} />
                </button>
                <button
                  type="button"
                  className={`chatbot-message-action-button ${messageFeedback[message.messageId || `msg-${index}`] === "down" ? "active" : ""}`}
                  onClick={() => handleFeedback(message.messageId || `msg-${index}`, message.sessionId, "down")}
                  aria-label="Dislike message"
                  title="Dislike"
                >
                  <ThumbsDown style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
              {widgetShowDateTime && (
                <div className={`chatbot-message-time chatbot-message-time--visible`}>
                  {formatRelativeTime(message.timestamp)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [isCustomAvatarImage, widgetAvatar, widgetChatbotColor, isDefaultGradient, isCustomGradient, selectedAvatar, widgetShowDateTime, messageFeedback, copiedMessages, handleCopyMessage, handleFeedback]);

  // Calculate chat window bottom position to account for trigger button
  const triggerButtonHeight = widgetAvatarSize;
  const spacingBetween = 12; // Space between trigger button and chat window
  const chatWindowBottomOffset = triggerButtonHeight + spacingBetween + widgetBottomSpace;
  // Calculate widget height to end above trigger button
  // In preview mode, use container height instead of viewport height
  const widgetHeight = isPreviewMode 
    ? '100%' 
    : `calc(100vh - ${chatWindowBottomOffset}px)`;

  // Helper function to get position modifier class
  const getPositionModifier = (position: string) => {
    switch (position) {
      case 'bottom-left':
      case 'top-left':
        return 'chatbot-aside--left';
      default:
        return 'chatbot-aside--right';
    }
  };

  // Render trigger button component
  const renderTriggerButton = () => {
    const positionModifier = getPositionModifier(widgetPosition);
    
    return (
      <aside 
        id="chatbotAside"
        className={`chatbot-aside ${positionModifier} ${isOpen ? 'chatbot-open' : ''}`}
        style={{
          '--widget-bottom-size': `${widgetBottomSpace}px`,
          '--avatar-size': `${widgetAvatarSize}px`,
          '--chatbot-color': widgetChatbotColor,
        } as React.CSSProperties & { [key: string]: string }}
      >
        <button
          id="chatbot-trigger"
          ref={triggerButtonRef}
          onClick={onToggle}
          className={`chatbot-trigger ${isOpen ? 'chatbot-trigger--active' : ''}`}
          style={{
            width: `${widgetAvatarSize}px`,
            height: `${widgetAvatarSize}px`,
            borderRadius: `${widgetTriggerBorderRadius}px`,
            backgroundColor: 'transparent',
            backgroundImage: 'none',
          } as React.CSSProperties}
          data-testid="button-widget-launcher"
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          tabIndex={0}
        >
          {isCustomAvatarImage ? (
            <img
              className="chatbot-avatar"
              id="chatbotAvatar"
              src={widgetAvatar}
              alt="Custom avatar"
              width={widgetAvatarSize}
              height={widgetAvatarSize}
              style={{
                borderRadius: `${widgetTriggerBorderRadius}px`,
              }}
            />
          ) : (
            <span style={{ fontSize: `${Math.min(widgetAvatarSize * 0.6, 32)}px` }}>
              {selectedAvatar.emoji}
            </span>
          )}
        </button>
        {/* Hint Bubble */}
        {bubbleMessage && bubbleMessage.trim() !== "" && showBubble && !isOpen && (
          <div 
            id="chatbotBubble"
            className={`chatbot-hint chatbot-bubble--active ${showBubble ? 'chatbot-hint--visible' : ''}`}
          >
            {bubbleMessage}
          </div>
        )}
      </aside>
    );
  };

  // If widget is closed, only show trigger button
  if (!shouldShow) {
    return renderTriggerButton();
  }

  // Determine position classes for window
  const getWindowPosition = () => {
    if (isPreviewMode) return { position: 'relative' as const, top: 0, left: 0, right: 0 };
    const positionModifier = getPositionModifier(widgetPosition);
    if (positionModifier === 'chatbot-aside--left') {
      return { position: 'fixed' as const, left: `${20 + widgetOffsetX}px`, right: 'auto', top: 0 };
    }
    return { position: 'fixed' as const, right: `${20 + widgetOffsetX}px`, left: 'auto', top: 0 };
  };

  const windowPosition = getWindowPosition();

  // If widget is open, show both chat window and trigger button
  return (
    <React.Fragment>
      {/* Chat Window */}
      <div
        id="chatbot"
        className={`chatbot-window ${shouldShow ? 'chatbot-window--active' : ''}`}
        data-preview-mode={isPreviewMode ? 'true' : 'false'}
        style={{
          ...windowPosition,
          bottom: isPreviewMode ? 'auto' : `calc(var(--widget-bottom-size) + 70px)`,
          width: isPreviewMode ? '100%' : '448px',
          maxWidth: isPreviewMode ? '100%' : 'calc(100% - 40px)',
          height: isPreviewMode ? '100%' : widgetHeight,
          maxHeight: isPreviewMode ? '100%' : `calc(100% - calc(var(--widget-bottom-size) + 72px))`,
          zIndex: isPreviewMode ? 1 : Math.max(widgetZIndex, 99999),
          '--widget-bottom-size': `${widgetBottomSpace}px`,
          '--chatbot-color': widgetChatbotColor,
          fontSize: widgetFontSize ? `${widgetFontSize}px` : undefined,
        } as React.CSSProperties & { [key: string]: string | number }}
        role="dialog"
        aria-label="AI Assistant Chat"
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
            <h3 id="chatbotTitle" className="chatbot-title">{widgetTitle}</h3>
          </div>
          <div className="chatbot-header-actions">
            <button
              type="button"
              id="deleteChat"
              className="chatbot-delete"
              onClick={clearChat}
              aria-label="Delete Chat"
              disabled={isPreviewMode}
            >
              <Trash2 style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              type="button"
              id="closeChat"
              className="chatbot-close"
              onClick={onToggle}
              aria-label="Close Chat"
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chatbot-messages" id="chatMessages">
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
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor,
                    backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                  }}
                >
                  {selectedAvatar.emoji}
                </div>
              )}
            </div>
            <div className="chatbot-welcome-text">
              <div className="chatbot-welcome-title">{widgetTitle}</div>
              {welcomeMessage && (
                <div className="chatbot-welcome-subtitle">{welcomeMessage}</div>
              )}
            </div>
          </div>

          {/* Dynamic Messages Container */}
          <div className="chatbot-conversation" id="chatMessagesContainer">
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
                    />
                  ) : (
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor,
                        backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      {selectedAvatar.emoji}
                    </div>
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
                    />
                  ) : (
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor,
                        backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      {selectedAvatar.emoji}
                    </div>
                  )}
                </div>
                <div className="chatbot-message__content">
                  <div className="chatbot-message-text">
                    <p>{streamingContent}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll target for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="chatbot-input">
          <form id="chatbot_form" className="chatbot-form" onSubmit={handleInputSubmit}>
            <div className={`chatbot-input-area ${isPreviewMode ? 'disabled' : ''}`}>
              <textarea
                ref={textareaRef}
                className="chatbot-textarea"
                id="chatbot_prompt"
                rows={1}
                placeholder="Message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                aria-label="Type your message"
                disabled={isPreviewMode}
              />
              <div className="chatbot-input-buttons">
                <button
                  type="button"
                  className={`chatbot-voice-button ${isListening ? 'is-listening' : ''}`}
                  id="speech_chatbot_message_button"
                  onClick={handleMicClick}
                  aria-label="Voice Input"
                  disabled={isPreviewMode}
                >
                  <Mic className="chatbot-icon" />
                </button>
                <button
                  type="submit"
                  className="chatbot-send-button"
                  id="send_chatbot_message_button"
                  aria-label="Send message"
                  disabled={!inputValue.trim() || isPreviewMode}
                >
                  <Send className="chatbot-icon" style={{ width: '24px', height: '24px' }} />
                </button>
              </div>
            </div>
            {showPoweredBy && (
              <div className="chatbot-input-footer">Generative AI is experimental.</div>
            )}
          </form>
        </div>
      </div>

      {/* Trigger Button - Always visible at bottom */}
      {renderTriggerButton()}
    </React.Fragment>
  );
});

export const EmbeddableWidget = EmbeddableWidgetComponent;
