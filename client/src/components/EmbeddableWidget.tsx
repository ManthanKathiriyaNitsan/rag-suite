import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Minimize2, Search, MessageSquare, Zap, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "./SearchBar";
import { ChatMessage } from "./ChatMessage";
import { Badge } from "@/components/ui/badge";
import { TypingIndicator, TypingAnimation, StreamingResponse } from "./TypingIndicator";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { testChatAPIConnection } from "@/lib/api";
// 🌐 Import our global API hooks
import { useSearch } from "@/hooks/useSearch";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/contexts/ThemeContext";
import { useBranding } from "@/contexts/BrandingContext";


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
}

export function EmbeddableWidget({
  isOpen = false,
  onToggle,
  title = "AI Assistant",
  showPoweredBy = true,
  // 🎯 Custom Event Callbacks
  onReady,
  onAnswer,
  onError,
}: WidgetProps) {
  // 🎛️ Use global RAG settings
  const { settings } = useRAGSettings();
  
  // 🎨 Use branding settings for widget positioning
  const { widgetZIndex, widgetPosition, widgetOffsetX, widgetOffsetY } = useBranding();
  
  // 🎯 Helper function to get position classes
  const getPositionClasses = (position: string) => {
    switch(position) {
      case 'bottom-right': return 'bottom-6 right-6';
      case 'bottom-left': return 'bottom-6 left-6';
      case 'top-right': return 'top-6 right-6';
      case 'top-left': return 'top-6 left-6';
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-6 right-6';
    }
  };
  
  // Get widget appearance settings from global context - make it reactive
  const [widgetAppearance, setWidgetAppearance] = useState({
    chatBubbleStyle: "rounded",
    avatarStyle: "circle",
    animationsEnabled: true,
  });

  // Update widget appearance when localStorage changes
  useEffect(() => {
    const getWidgetAppearance = () => {
      try {
        const saved = localStorage.getItem("theme-layout");
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.widgetAppearance || {
            chatBubbleStyle: "rounded",
            avatarStyle: "circle",
            animationsEnabled: true,
          };
        }
      } catch (error) {
        console.warn("Failed to load widget appearance from localStorage:", error);
      }
      return {
        chatBubbleStyle: "rounded",
        avatarStyle: "circle",
        animationsEnabled: true,
      };
    };
    
    setWidgetAppearance(getWidgetAppearance());
    
    // Listen for storage changes
    const handleStorageChange = () => {
      const newAppearance = getWidgetAppearance();
      const hasChanged = JSON.stringify(newAppearance) !== JSON.stringify(widgetAppearance);
      if (hasChanged) {
        console.log("🎨 Widget appearance updated");
        setWidgetAppearance(newAppearance);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (since we're updating from the same tab)
    const interval = setInterval(handleStorageChange, 2000); // Reduced frequency
    
    // Listen for custom theme change events
    const handleThemeChange = () => {
      console.log("🎨 Widget theme changed");
      setWidgetAppearance(getWidgetAppearance());
    };
    
    window.addEventListener('theme-changed', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleThemeChange);
      clearInterval(interval);
    };
  }, []);
  
  const [activeTab, setActiveTab] = useState("auto");
  
  // 💬 Load messages from sessionStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = sessionStorage.getItem('widget-messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load widget messages from sessionStorage:', error);
    }
    
    // Default welcome message
    return [
      {
        type: "assistant",
        content: "Hello! I can help you search for information or answer questions about your documentation. What would you like to know?",
        timestamp: new Date(),
      },
    ];
  });

  // 💬 Save messages to sessionStorage whenever messages change
  useEffect(() => {
    try {
      sessionStorage.setItem('widget-messages', JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save widget messages to sessionStorage:', error);
    }
  }, [messages]);

  // 🗑️ Clear chat function
  const clearChat = () => {
    setMessages([
      {
        type: "assistant",
        content: "Hello! I can help you search for information or answer questions about your documentation. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
  };

  // 🌐 Use our global search hook - same as RAGTuning!
  const { searchAsync, isSearching, searchData, searchError } = useSearch();
  
  // 💬 Use our chat hook for enhanced functionality
  const { sendMessageAsync, isSending } = useChat();
  // 🧾 Session history removed per request
  
  // 📋 Current session state
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  
  // 🎭 Animation states
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 📜 Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      topK: topKMatch ? parseInt(topKMatch[1]) : undefined,
      reranker: rerankerMatch ? rerankerMatch[1] === 'on' : undefined
    };
  };

  // 🔍 Search function - ONLY uses search API
  const handleSearch = async (query: string) => {
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
      console.log("🔍 Full response structure:", JSON.stringify(searchResponse, null, 2));

      // 🎭 Stop typing animation and start streaming
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent("");
      setPendingResponse(null);

      const responseContent = searchResponse.answer || searchResponse.response || "No answer from API";
      
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

      // 🔧 Fallback: If no sources from API, create mock sources based on TopK
      let finalSources = sources;
      if (sources.length === 0 && actualTopK > 0) {
        console.log("🔧 No sources from API, creating mock sources for TopK:", actualTopK);
        finalSources = Array.from({ length: actualTopK }, (_, i) => ({
          title: `Search Result ${i + 1}`,
          url: "#",
          snippet: `This is search result ${i + 1} based on your query: "${query}"`
        }));
      }

      // Create final assistant message with RAG settings
      const mappedSources = finalSources.map((source: any) => ({
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
      const isCORSError = error && typeof error === 'object' && 'message' in error && error.message.includes('CORS');
      
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
  };

  // 💬 Chat function - ONLY uses chat API
  const handleChat = async (query: string) => {
    console.log("💬 Widget Chat - User submitted message:", query);

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
      console.log("🔍 Full chat response structure:", JSON.stringify(chatResponse, null, 2));

      // Update session ID if we got one from chat
      if (chatResponse?.sessionId && !currentSessionId) {
        setCurrentSessionId(chatResponse.sessionId);
      }

      // 🎭 Stop typing animation and start streaming
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingContent("");
      setPendingResponse(null);

      const responseContent = chatResponse?.answer || chatResponse?.response || "No response from chat API";
      
      // Simulate streaming response
      await simulateStreamingResponse(responseContent, (content) => {
        setStreamingContent(content);
      });

      // 🔍 Extract actual TopK from server response
      const serverMessage = chatResponse?.message || "";
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
      const isNetworkError = error && typeof error === 'object' && 'code' in error && error.code === 'ERR_NETWORK';
      const isServerError = error && typeof error === 'object' && 'response' in error && error.response?.status >= 500;
      const isCORSError = error && typeof error === 'object' && 'message' in error && error.message.includes('CORS');
      const isTimeoutError = error && typeof error === 'object' && 'message' in error && error.message.includes('timeout');
      const isAbortError = error && typeof error === 'object' && 'name' in error && error.name === 'AbortError';
      
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
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className={`fixed h-14 w-14 rounded-full shadow-lg ${getPositionClasses(widgetPosition)}`}
        style={{ 
          zIndex: widgetZIndex,
          transform: `translate(${widgetOffsetX}px, ${widgetOffsetY}px)`
        }}
        data-testid="button-widget-launcher"
        aria-label="Open AI Assistant"
        aria-expanded="false"
        aria-haspopup="dialog"
        tabIndex={0}
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  }

  return (
    <Card 
      className={`widget-container fixed ${getPositionClasses(widgetPosition)} w-[100%] md:mx-0 md:w-96 h-[600px] shadow-xl flex flex-col overflow-hidden ${
        widgetAppearance.chatBubbleStyle === "sharp" ? "rounded-none" :
        widgetAppearance.chatBubbleStyle === "minimal" ? "rounded-sm" :
        "rounded-lg"
      } ${
        widgetAppearance.animationsEnabled ? "transition-all duration-200 ease-in-out" : ""
      }`}
      style={{ 
        wordBreak: 'break-word', 
        overflowWrap: 'anywhere',
        zIndex: widgetZIndex,
        transform: `translate(${widgetOffsetX}px, ${widgetOffsetY}px)`
      }}
      role="dialog"
      aria-label="AI Assistant Chat"
      aria-modal="true"
      aria-live="polite"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            Online
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            data-testid="button-clear-chat"
            className="h-8 w-8"
            title="Clear chat"
            aria-label="Clear chat history"
            tabIndex={0}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            data-testid="button-widget-close"
            className="h-8 w-8"
            aria-label="Close AI Assistant"
            tabIndex={0}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pb-3">
            <TabsList className="grid w-full grid-cols-3" role="tablist" aria-label="Widget navigation">
              <TabsTrigger 
                value="search" 
                data-testid="tab-search"
                role="tab"
                aria-selected={activeTab === "search"}
                aria-controls="search-panel"
                tabIndex={0}
                className="flex items-center justify-center gap-1"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                data-testid="tab-chat"
                role="tab"
                aria-selected={activeTab === "chat"}
                aria-controls="chat-panel"
                tabIndex={0}
                className="flex items-center justify-center gap-1"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="auto" 
                data-testid="tab-auto"
                role="tab"
                aria-selected={activeTab === "auto"}
                aria-controls="auto-panel"
                tabIndex={0}
                className="flex items-center justify-center gap-1"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                Auto
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent 
            value="search" 
            className="flex-1 flex flex-col px-4 mt-0"
            role="tabpanel"
            id="search-panel"
            aria-labelledby="tab-search"
            tabIndex={0}
          >
            <div className="space-y-3 flex-1 overflow-y-auto">
              <SearchBar
                placeholder="Search documentation..."
                onSearch={handleSearch}
                showSendButton
                enableHistory={false}
              />
              {/* 🔎 Recent Search History removed */}
              
              {/* 🔍 Enhanced loading indicator for search */}
              {isSearching && (
                <TypingIndicator 
                  message="Searching through documentation..." 
                  variant="wave" 
                  size="md" 
                />
              )}
              
              {/* 🎭 Typing Animation for Search */}
              {isTyping && !isSearching && (
                <TypingAnimation message={pendingResponse || "Preparing search..."} />
              )}
              
              {/* 🌊 Streaming Response for Search */}
              {isStreaming && streamingContent && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <StreamingResponse 
                    content={streamingContent} 
                    isStreaming={isStreaming}
                  />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Try searching for "API", "getting started", or "troubleshooting"
              </div>
            </div>
          </TabsContent>

          <TabsContent 
            value="chat" 
            className="flex-1 flex flex-col px-4 mt-0"
            role="tabpanel"
            id="chat-panel"
            aria-labelledby="tab-chat"
            tabIndex={0}
          >
            <div 
              className="flex-1 overflow-y-auto space-y-4  min-h-0 max-h-[400px] w-full"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db transparent'
              }}
            >
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  type={message.type}
                  content={message.content}
                  citations={message.citations}
                  timestamp={message.timestamp}
                  showFeedback={message.type === "assistant"}
                  ragSettings={message.ragSettings}
                  queryString={message.queryString}
                  serverMessage={message.serverMessage}
                  actualTopK={message.actualTopK}
                  actualReranker={message.actualReranker}
                />
              ))}
              
              {/* 🎭 Typing Animation */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <TypingAnimation message={pendingResponse || "AI is thinking..."} />
                  </div>
                </div>
              )}
              
              {/* 🌊 Streaming Response */}
              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <StreamingResponse 
                        content={streamingContent} 
                        isStreaming={isStreaming}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 📜 Scroll target for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0  ">
              <SearchBar
                placeholder="Type your message..."
                onSearch={handleChat}
                showSendButton
                enableHistory={false}
              />
              {/* 💬 Recent Chat History removed */}
              
              {/* 💬 Enhanced loading indicator for chat */}
              {isSending && (
                <TypingIndicator 
                  message="Sending message..." 
                  variant="pulse" 
                  size="sm" 
                />
              )}
            </div>
          </TabsContent>

          <TabsContent 
            value="auto" 
            className="flex-1 flex flex-col px-4 mt-0"
            role="tabpanel"
            id="auto-panel"
            aria-labelledby="tab-auto"
            tabIndex={0}
          >
            <div 
              className="flex-1 overflow-y-auto space-y-4 min-h-0 max-h-[400px] w-full"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db transparent'
              }}
            >
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  type={message.type}
                  content={message.content}
                  citations={message.citations}
                  timestamp={message.timestamp}
                  showFeedback={message.type === "assistant"}
                  ragSettings={message.ragSettings}
                  queryString={message.queryString}
                  serverMessage={message.serverMessage}
                  actualTopK={message.actualTopK}
                  actualReranker={message.actualReranker}
                />
              ))}
              
              {/* 🎭 Typing Animation */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <TypingAnimation message={pendingResponse || "AI is thinking..."} />
                  </div>
                </div>
              )}
              
              {/* 🌊 Streaming Response */}
              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <StreamingResponse 
                        content={streamingContent} 
                        isStreaming={isStreaming}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 ">
              <SearchBar
                placeholder="Ask anything or search..."
                onSearch={handleChat}
                showSendButton
                showMicButton
                enableHistory={false}
              />
              
              {/* 💬 Enhanced loading indicator for auto */}
              {isSending && (
                <TypingIndicator 
                  message="Processing..." 
                  variant="wave" 
                  size="sm" 
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showPoweredBy && (
          <div className="px-4 py-2 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-medium">RAGSuite</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


/* Style the widget container */
// .widget-container {
//   border: 2px solid #3b82f6 !important;
//   box-shadow: 0 0 20px rgba(59, 130, 246, 0.3) !important;
// }

// /* Style chat bubbles */
// .chat-bubble {
//   border-radius: 20px !important;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
// }

// /* Style chat messages */
// .chat-message {
//   margin-bottom: 1rem !important;
// }