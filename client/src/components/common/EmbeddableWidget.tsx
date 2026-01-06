import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Send, Trash2, ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { testChatAPIConnection } from "@/services/api/api";
// 🌐 Import our global API hooks
import { useSearch } from "@/hooks/useSearch";
import { useChat, useChatFeedback } from "@/hooks/useChat";
import { useTheme } from "@/contexts/ThemeContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn, copyToClipboard } from "@/lib/utils";
import "./EmbeddableWidgetStyles.css";
// 📝 Import markdown support for message rendering
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { safeStringConversion } from "@/utils/safeStringConversion";
// 🎨 Import syntax highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';


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
  
  // 🔐 Use authentication context to check if user is authenticated
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  
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
      // Opening animation - restore scroll position BEFORE making widget visible
      if (chatMessagesRef.current && shouldRestoreScrollRef.current && !hasRestoredRef.current && !isPreviewMode) {
        // Try to restore scroll position immediately before showing widget
        const tryRestoreBeforeShow = () => {
          const container = chatMessagesRef.current;
          if (container && container.scrollHeight > container.clientHeight) {
            try {
              const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
              if (savedPosition) {
                const scrollPosition = parseInt(savedPosition, 10);
                if (!isNaN(scrollPosition) && scrollPosition >= 0) {
                  // Temporarily disable smooth scrolling
                  container.style.scrollBehavior = 'auto';
                  container.scrollTop = scrollPosition;
                  container.scrollTo({ top: scrollPosition, behavior: 'auto' });
                  hasRestoredRef.current = true;
                  console.log('📜 Pre-restored scroll position before show:', scrollPosition);
                }
              }
            } catch (error) {
              console.warn('Failed to pre-restore scroll position:', error);
            }
          }
        };
        // Try immediately and on next frame
        tryRestoreBeforeShow();
        requestAnimationFrame(tryRestoreBeforeShow);
      }
      
      // Opening animation
      setShouldShow(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    } else if (!isOpen && shouldShow) {
      // Closing animation - save scroll position before closing
      if (chatMessagesRef.current && !isPreviewMode) {
        const scrollPosition = chatMessagesRef.current.scrollTop;
        try {
          localStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
          console.log('💾 Saved scroll position before closing:', scrollPosition);
        } catch (error) {
          console.warn('Failed to save scroll position:', error);
        }
      }
      setIsAnimating(true);
      setTimeout(() => {
        setShouldShow(false);
        setIsAnimating(false);
      }, 300);
    }
  }, [isOpen, shouldShow, setShouldShow, setIsAnimating, isPreviewMode]);

  // 🫧 Handle bubble message visibility - show after widget closes with 1 second delay
  useEffect(() => {
    if (bubbleMessage && bubbleMessage.trim() !== "" && !isOpen) {
      // Wait 1 second after widget closes before showing bubble
      const timer = setTimeout(() => {
        setShowBubble(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Hide bubble immediately when widget opens or no message
      setShowBubble(false);
    }
  }, [bubbleMessage, isOpen]);

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

  // Check if we're in widget mode (external website with projectId)
  const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;

  // 💬 Load chat history from API on mount (works in both authenticated mode and widget mode)
  useEffect(() => {
    // In preview mode, only show welcome message, don't load chat history
      if (isPreviewMode) {
        setMessages([
          {
            type: "assistant",
            content: welcomeMessage,
            timestamp: new Date(),
          },
        ]);
        setIsLoadingHistory(false);
        return;
      }

    // 🔐 Wait for auth to finish initializing before checking (only if not in widget mode)
    if (!isWidgetMode && isAuthLoading) {
      return; // Wait for auth to finish loading
    }

    // 🔐 Load chat history if:
    // 1. User is authenticated (main website), OR
    // 2. We're in widget mode (external website with projectId)
    if (!isAuthenticated && !isWidgetMode) {
        setMessages([
          {
            type: "assistant",
            content: welcomeMessage,
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
  }, [welcomeMessage, isPreviewMode, isAuthenticated, isAuthLoading, isWidgetMode]);

  // 💬 Update welcome message when it changes (for preview)
  useEffect(() => {
    if (isPreviewMode) {
      // In preview mode, maintain the static welcome message
      setMessages([
        {
          type: "assistant",
          content: welcomeMessage,
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
      await chatAPI.deleteAllMessages('widget');  // Pass 'widget' for soft delete (hides from widget, keeps in history)
      console.log('✅ All widget messages hidden from widget (still visible in history)');
    } catch (error) {
      console.error('❌ Failed to delete widget messages:', error);
    }

    // Clear saved scroll position when chat is cleared
    try {
      localStorage.removeItem(SCROLL_POSITION_KEY);
      console.log('💾 Cleared saved scroll position');
    } catch (error) {
      console.warn('Failed to clear scroll position:', error);
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  // 📜 Ref for messages container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null); // Ref for the actual scrollable container (.chatbot-messages)
  
  // 📜 Scroll position persistence key
  const SCROLL_POSITION_KEY = 'embeddable-widget-scroll-position';

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

  // 📜 Smooth scroll function (Lenis-like) using requestAnimationFrame
  const smoothScrollTo = useCallback((target: number, duration: number = 800) => {
    // Use chatMessagesRef (the actual scrollable container) instead of messagesContainerRef
    const scrollContainer = chatMessagesRef.current || messagesContainerRef.current;
    if (!scrollContainer) return;
    
    const start = scrollContainer.scrollTop;
    const distance = target - start;
    const startTime = performance.now();
    
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      scrollContainer.scrollTop = start + distance * eased;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }, []);

  // 📜 Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    if (isPreviewMode) return; // Don't scroll in preview mode to prevent page scroll
    // Use chatMessagesRef (the actual scrollable container) for scrolling
    const scrollContainer = chatMessagesRef.current;
    if (scrollContainer && messagesEndRef.current) {
      // Scroll to the bottom of the scrollable container
      const targetScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      smoothScrollTo(targetScroll, 600);
    }
  }, [isPreviewMode, smoothScrollTo]);

  // 📜 Save scroll position when widget closes (save from the actual scrollable container)
  useEffect(() => {
    if (!isOpen && chatMessagesRef.current && !isPreviewMode) {
      const scrollPosition = chatMessagesRef.current.scrollTop;
      try {
        localStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
        console.log('💾 Saved scroll position:', scrollPosition);
      } catch (error) {
        console.warn('Failed to save scroll position:', error);
      }
    }
  }, [isOpen, isPreviewMode]);

  // 📜 Track if we should restore scroll position (only on initial open, not on new messages)
  const shouldRestoreScrollRef = useRef(false);
  const hasRestoredRef = useRef(false); // Track if we've already restored for this open session
  
  // 📜 Reset restoration flag when widget closes
  useEffect(() => {
    if (!isOpen && !isPreviewMode) {
      shouldRestoreScrollRef.current = false;
      hasRestoredRef.current = false;
    }
  }, [isOpen, isPreviewMode]);
  
  // 📜 Set flag to restore scroll when widget opens
  useEffect(() => {
    if (isOpen && !isPreviewMode && !hasRestoredRef.current) {
      shouldRestoreScrollRef.current = true;
    }
  }, [isOpen, isPreviewMode]);

  // 📜 Restore scroll position when widget opens (works even if messages are already loaded)
  useEffect(() => {
    // Only restore if widget is open, visible, and we haven't restored yet
    if (isOpen && shouldShow && chatMessagesRef.current && shouldRestoreScrollRef.current && !hasRestoredRef.current && !isPreviewMode) {
      // Use multiple attempts to ensure DOM is ready
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryRestore = () => {
        attempts++;
        const container = chatMessagesRef.current;
        
        if (!container) {
          if (attempts < maxAttempts) {
            requestAnimationFrame(tryRestore);
          }
          return;
        }
        
        // Check if container has content and is scrollable
        const hasContent = container.scrollHeight > container.clientHeight;
        
        if (!hasContent && attempts < maxAttempts) {
          // Content not ready yet, try again on next frame
          requestAnimationFrame(tryRestore);
          return;
        }
        
        try {
          const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
          if (savedPosition) {
            const scrollPosition = parseInt(savedPosition, 10);
            if (!isNaN(scrollPosition) && scrollPosition >= 0) {
              console.log('📜 Restoring scroll position instantly:', scrollPosition);
              
              // Temporarily disable smooth scrolling behavior
              const originalScrollBehavior = container.style.scrollBehavior;
              container.style.scrollBehavior = 'auto';
              
              // Set scroll position instantly (no animation)
              container.scrollTop = scrollPosition;
              
              // Force immediate update using scrollTo with auto behavior
              container.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
              });
              
              // Restore original scroll behavior after a frame
              requestAnimationFrame(() => {
                if (container) {
                  container.style.scrollBehavior = originalScrollBehavior;
                }
              });
              
              // Mark as restored
              hasRestoredRef.current = true;
              shouldRestoreScrollRef.current = false;
            } else {
              // Invalid position, scroll to bottom
              console.log('📜 Invalid scroll position, scrolling to bottom');
              scrollToBottom();
              hasRestoredRef.current = true;
              shouldRestoreScrollRef.current = false;
            }
          } else {
            // No saved position, scroll to bottom
            console.log('📜 No saved scroll position, scrolling to bottom');
            scrollToBottom();
            hasRestoredRef.current = true;
            shouldRestoreScrollRef.current = false;
          }
        } catch (error) {
          console.warn('Failed to restore scroll position:', error);
          hasRestoredRef.current = true;
          shouldRestoreScrollRef.current = false;
        }
      };
      
      // Start restoration immediately using requestAnimationFrame for instant positioning
      requestAnimationFrame(() => {
        requestAnimationFrame(tryRestore); // Double RAF ensures layout is ready
      });
    }
  }, [isOpen, shouldShow, isPreviewMode, scrollToBottom]);

  // 📜 Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length);
  
  // 📜 Auto-scroll when new messages are added (only if not restoring scroll)
  useEffect(() => {
    if (!isPreviewMode && isOpen && !hasRestoredRef.current && !shouldRestoreScrollRef.current) {
      const currentMessageCount = messages.length;
      const prevMessageCount = prevMessageCountRef.current;
      
      // Only auto-scroll if a new message was added (count increased)
      if (currentMessageCount > prevMessageCount) {
        scrollToBottom();
      }
      
      prevMessageCountRef.current = currentMessageCount;
    } else if (isOpen) {
      // Update message count even when restoring
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length, isPreviewMode, isOpen]);

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

  // Get API base URL for absolute avatar paths (works on external websites)
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && (window as any).RAGSUITE_API_URL) {
      return (window as any).RAGSUITE_API_URL;
    }
    return 'http://192.168.0.101:8000/api/v1';
  };

  const apiBaseUrl = getApiBaseUrl();
  
  // Avatar options with absolute URLs (works on external websites)
  const avatarOptions = [
    { id: "default-1", image: `${apiBaseUrl}/avatars/avatar-1.png` },
    { id: "default-2", image: `${apiBaseUrl}/avatars/avatar-2.png` },
    { id: "default-3", image: `${apiBaseUrl}/avatars/avatar-3.png` },
    { id: "default-4", image: `${apiBaseUrl}/avatars/avatar-4.png` },
  ];

  // Default avatar image URL (always use avatar-1.png as fallback)
  const defaultAvatarUrl = avatarOptions[0].image;

  // Check if widgetAvatar is a custom image (URL or data URL) or a default avatar
  // Valid formats: http://, https://, data:image/, or default-* IDs
  const isCustomAvatarImage = widgetAvatar && 
    !widgetAvatar.startsWith("default-") && 
    (widgetAvatar.startsWith("http://") || 
     widgetAvatar.startsWith("https://") || 
     widgetAvatar.startsWith("data:"));
  const selectedAvatar = avatarOptions.find(a => a.id === widgetAvatar) || avatarOptions[0];
  const isDefaultAvatarImage = selectedAvatar && selectedAvatar.image;
  
  // Always use avatar images (no need to skip - they're absolute URLs now)
  const shouldSkipAvatarImage = false;
  
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
    try {
      await copyToClipboard(content);
      setCopiedMessages(prev => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setCopiedMessages(prev => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
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
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  // Fallback to default avatar image if custom image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAvatarUrl;
                  target.style.display = 'block';
                }}
              />
            ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
              <img
                className="chatbot-avatar-image"
                src={selectedAvatar.image}
                alt="Avatar"
                width={30}
                height={30}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  // Fallback to default avatar-1 if selected avatar fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultAvatarUrl) {
                    target.src = defaultAvatarUrl;
                  }
                }}
              />
            ) : (
              <img
                className="chatbot-avatar-image"
                src={defaultAvatarUrl}
                alt="Avatar"
                width={30}
                height={30}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  // If default avatar also fails, try other avatars
                  const target = e.target as HTMLImageElement;
                  const currentIndex = avatarOptions.findIndex(a => a.image === target.src);
                  const nextIndex = (currentIndex + 1) % avatarOptions.length;
                  target.src = avatarOptions[nextIndex].image;
                }}
              />
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
              <div
                className="text-sm leading-relaxed prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground"
                role="text"
                aria-label="Assistant message content"
              >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    // 🎨 Enhanced code blocks with syntax highlighting
                    code: ({ node, className, children, ...props }: any) => {
                      const isInline = !className?.includes('language-');
                      if (isInline) {
                        return (
                          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }

                      // Extract language from className (e.g., "language-javascript" -> "javascript")
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
                    // Custom styling for links
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
                    // Custom styling for lists
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
                    // Custom styling for blockquotes
                    blockquote: ({ children, ...props }) => (
                      <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" {...props}>
                        {children}
                      </blockquote>
                    ),
                }}
              >
                {safeStringConversion(message.content)}
              </ReactMarkdown>
              </div>
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
                  onClick={() => {
                    const msgId = message.messageId || `msg-${index}`;
                    handleCopyMessage(message.content, msgId);
                  }}
                  aria-label="Copy message"
                  title="Copy message"
                >
                  {copiedMessages[message.messageId || `msg-${index}`] ? (
                    <Check style={{ width: '14px', height: '14px' }} />
                  ) : (
                  <Copy style={{ width: '14px', height: '14px' }} />
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
            backgroundColor: widgetChatbotColor || '#007bff',
            backgroundImage: widgetChatbotColor?.startsWith('linear-gradient') ? widgetChatbotColor : undefined,
            border: 'none',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
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
              onError={(e) => {
                // Fallback to default avatar image if custom image fails to load
                const target = e.target as HTMLImageElement;
                target.src = defaultAvatarUrl;
                target.style.display = 'block';
              }}
            />
          ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
            <img
              src={selectedAvatar.image}
              alt="Avatar"
              width={widgetAvatarSize}
              height={widgetAvatarSize}
              style={{
                borderRadius: `${widgetTriggerBorderRadius}px`,
                objectFit: 'cover',
              }}
              onError={(e) => {
                // Fallback to default avatar-1 if selected avatar fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultAvatarUrl) {
                  target.src = defaultAvatarUrl;
                }
              }}
            />
          ) : (
            <img
              src={defaultAvatarUrl}
              alt="Avatar"
              width={widgetAvatarSize}
              height={widgetAvatarSize}
              style={{
                borderRadius: `${widgetTriggerBorderRadius}px`,
                objectFit: 'cover',
              }}
              onError={(e) => {
                // If default avatar fails, try other avatars
                const target = e.target as HTMLImageElement;
                const currentIndex = avatarOptions.findIndex(a => a.image === target.src);
                const nextIndex = (currentIndex + 1) % avatarOptions.length;
                target.src = avatarOptions[nextIndex].image;
              }}
            />
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
          '--widget-border-radius': `${widgetTriggerBorderRadius}px`, // CSS variable for border radius
          fontSize: widgetFontSize ? `${widgetFontSize}px` : undefined,
          borderRadius: `${widgetTriggerBorderRadius}px`, // Apply border radius from configuration
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
        <div className="chatbot-messages" id="chatMessages" ref={chatMessagesRef}>
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
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    // Fallback to default avatar image if custom image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatarUrl;
                    target.style.display = 'block';
                  }}
                />
              ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
                <img
                  className="chatbot-avatar"
                  src={selectedAvatar.image}
                  alt={widgetTitle}
                  width={80}
                  height={80}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    // Fallback to default avatar-1 if selected avatar fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== defaultAvatarUrl) {
                      target.src = defaultAvatarUrl;
                    }
                  }}
                />
              ) : (
                <img
                  className="chatbot-avatar"
                  src={defaultAvatarUrl}
                  alt={widgetTitle}
                  width={80}
                  height={80}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    // If default avatar fails, try other avatars
                    const target = e.target as HTMLImageElement;
                    const currentIndex = avatarOptions.findIndex(a => a.image === target.src);
                    const nextIndex = (currentIndex + 1) % avatarOptions.length;
                    target.src = avatarOptions[nextIndex].image;
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

          {/* Dynamic Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="chatbot-conversation" 
            id="chatMessagesContainer"
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
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Fallback to default avatar image if custom image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatarUrl;
                        target.style.display = 'block';
                      }}
                    />
                  ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
                    <img
                      className="chatbot-avatar-image"
                      src={selectedAvatar.image}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Fallback to default avatar-1 if selected avatar fails to load
                        const target = e.target as HTMLImageElement;
                        if (target.src !== defaultAvatarUrl) {
                          target.src = defaultAvatarUrl;
                        }
                      }}
                    />
                  ) : (
                    <img
                      className="chatbot-avatar-image"
                      src={defaultAvatarUrl}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // If default avatar fails, try other avatars
                        const target = e.target as HTMLImageElement;
                        const currentIndex = avatarOptions.findIndex(a => a.image === target.src);
                        const nextIndex = (currentIndex + 1) % avatarOptions.length;
                        target.src = avatarOptions[nextIndex].image;
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
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Fallback to default avatar image if custom image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatarUrl;
                        target.style.display = 'block';
                      }}
                    />
                  ) : !shouldSkipAvatarImage && isDefaultAvatarImage ? (
                    <img
                      className="chatbot-avatar-image"
                      src={selectedAvatar.image}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Fallback to default avatar-1 if selected avatar fails to load
                        const target = e.target as HTMLImageElement;
                        if (target.src !== defaultAvatarUrl) {
                          target.src = defaultAvatarUrl;
                        }
                      }}
                    />
                  ) : (
                    <img
                      className="chatbot-avatar-image"
                      src={defaultAvatarUrl}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // If default avatar fails, try other avatars
                        const target = e.target as HTMLImageElement;
                        const currentIndex = avatarOptions.findIndex(a => a.image === target.src);
                        const nextIndex = (currentIndex + 1) % avatarOptions.length;
                        target.src = avatarOptions[nextIndex].image;
                      }}
                    />
                  )}
                </div>
                <div className="chatbot-message__content">
                  <div className="chatbot-message-text">
                    <div
                      className="text-sm leading-relaxed prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground"
                      role="text"
                      aria-label="Assistant message content"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          // 🎨 Enhanced code blocks with syntax highlighting
                          code: ({ node, className, children, ...props }: any) => {
                            const isInline = !className?.includes('language-');
                            if (isInline) {
                              return (
                                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }

                            // Extract language from className (e.g., "language-javascript" -> "javascript")
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
                          // Custom styling for links
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
                          // Custom styling for lists
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
                          // Custom styling for blockquotes
                          blockquote: ({ children, ...props }) => (
                            <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" {...props}>
                              {children}
                            </blockquote>
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
