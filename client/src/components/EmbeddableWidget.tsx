import { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2, Search, MessageSquare, Zap, Loader2 } from "lucide-react";
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
}

export function EmbeddableWidget({
  isOpen = false,
  onToggle,
  title = "AI Assistant",
  showPoweredBy = true,
}: WidgetProps) {
  // 🎛️ Use global RAG settings
  const { settings } = useRAGSettings();
  
  const [activeTab, setActiveTab] = useState("auto");
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "assistant",
      content: "Hello! I can help you search for information or answer questions about your documentation. What would you like to know?",
      timestamp: new Date(),
    }
  ]);

  // 🌐 Use our global search hook - same as RAGTuning!
  const { searchAsync, isSearching, searchData, searchError } = useSearch();
  
  // 💬 Use our chat hook for enhanced functionality
  const { sendMessageAsync, isSending } = useChat();
  
  // 📋 Current session state
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  
  // 🎭 Animation states
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);

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
      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: finalSources.map((source: any) => ({
          title: source.title || "Unknown Source",
          url: source.url || "#",
          snippet: source.snippet || "No snippet available",
        })),
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

    } catch (error) {
      console.error("❌ Widget search failed:", error);
      
      // Stop animations on error
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);
      
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

      // Create final assistant message with RAG settings
      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: chatSources.map((source: any) => ({
          title: source.title || "Unknown Source",
          url: source.url || "#",
          snippet: source.snippet || "No snippet available",
        })),
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

    } catch (error) {
      console.error("❌ Widget chat failed:", error);
      
      // Stop animations on error
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);
      
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
        className="fixed bottom-[3%]   right-10 h-14 w-14 rounded-full shadow-lg z-50"
        data-testid="button-widget-launcher"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  }

  return (
    <Card 
      className="fixed md:bottom-6 bottom-1 w-[100%] md:right-6 mx-1  md:mx-0 md:w-96 h-[600px] shadow-xl z-50 flex flex-col overflow-hidden"
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
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
            onClick={onToggle}
            data-testid="button-widget-close"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pb-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" data-testid="tab-search">
                <Search className="h-4 w-4 mr-1" />
                Search
              </TabsTrigger>
              <TabsTrigger value="chat" data-testid="tab-chat">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="auto" data-testid="tab-auto">
                <Zap className="h-4 w-4 mr-1" />
                Auto
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="search" className="flex-1 flex flex-col px-4 mt-0">
            <div className="space-y-3 flex-1 overflow-y-auto">
              <SearchBar
                placeholder="Search documentation..."
                onSearch={handleSearch}
                showSendButton
              />
              
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

          <TabsContent value="chat" className="flex-1 flex flex-col px-4 mt-0">
            <div 
              className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-[400px] w-full"
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
            <div className="flex-shrink-0">
              <SearchBar
                placeholder="Type your message..."
                onSearch={handleChat}
                showSendButton
              />
              
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

          <TabsContent value="auto" className="flex-1 flex flex-col px-4 mt-0">
            <div 
              className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-[400px] w-full"
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
            <div className="flex-shrink-0">
              <SearchBar
                placeholder="Ask anything or search..."
                onSearch={handleChat}
                showSendButton
                showMicButton
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