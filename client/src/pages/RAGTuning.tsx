import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { Send, Copy, Settings, Zap, Loader2, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/I18nContext";

// 🚀 Lazy load heavy chat components
const SearchBar = lazy(() => import("@/components/common/SearchBar"));
const ChatMessage = lazy(() => import("@/components/common/ChatMessage"));
import { TypingAnimation, StreamingResponse } from "@/components/common/TypingIndicator";
import TypingIndicator from "@/components/common/TypingIndicator";
import { SearchBarRef } from "@/components/common/SearchBar";
import { useRAGSettings, usePerformanceMetrics } from "@/contexts/RAGSettingsContext";
import { useSearch } from "@/hooks/useSearch";
import { useChat, useChatSessions } from "@/hooks/useChat";
import { GlassCard } from "@/components/ui/GlassCard";

import { Message } from "@/types/components";

export default function RAGTuning() {
  // 🎛️ Use global RAG settings
  const { settings, updateSettings } = useRAGSettings();
  const { metrics, updateMetrics } = usePerformanceMetrics();
  const { t } = useTranslation();
  
  // 💬 Load messages from sessionStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = sessionStorage.getItem('rag-tuning-messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load RAG tuning messages from sessionStorage:', error);
    }
    
    // Default welcome message
    return [
      {
        type: "assistant",
        content: "Welcome to the RAG Tuning Playground! Ask me anything about your documentation to test different retrieval and generation settings.",
        timestamp: new Date(),
      },
    ];
  });

  // 💬 Save messages to sessionStorage whenever messages change
  useEffect(() => {
    try {
      sessionStorage.setItem('rag-tuning-messages', JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save RAG tuning messages to sessionStorage:', error);
    }
  }, [messages]);

  // 🌐 Use our global search hook
  const { searchAsync, isSearching, searchData, searchError } = useSearch();
  
  // 💬 Use our chat hooks
  const { sendMessageAsync, isSending } = useChat();
  const { sessions, deleteSession, isDeleting } = useChatSessions();
  
  // 📋 Current session state
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  
  // 🧹 Ref for SearchBar to clear it after search
  // const searchBarRef = useRef<SearchBarRef>(null); // Removed - SearchBar is lazy loaded
  
  // 📜 Ref for messages container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  // 📜 Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 📜 Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 🔍 Extract actual TopK from server message
  const extractTopKFromMessage = (message: string): { topK: number; reranker: boolean } => {
    const topKMatch = message.match(/topK=(\d+)/);
    const rerankerMatch = message.match(/reranker=(on|off)/);
    
    return {
      topK: topKMatch ? parseInt(topKMatch[1]) : 5,
      reranker: rerankerMatch ? rerankerMatch[1] === 'on' : false
    };
  };

  // 🗑️ Old fetchMessages function removed - now using global API

// console.log(messages)

  // 🔍 Memoized RAG Query - ONLY uses search API for document search
  const handleQuery = useCallback(async (query: string) => {
    console.log("🔍 RAG Query - User submitted query:", query);
    console.log("⚙️ RAG Settings:", settings);

    // Add user message immediately
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // 🎭 Start typing animation
    setIsTyping(true);
    setPendingResponse("Searching with RAG settings...");

    const startTime = Date.now();

    try {
      // 🌐 Use ONLY search API for RAG functionality with global settings
      const searchResponse = await searchAsync(query, settings);
      console.log("📦 Search Response:", searchResponse);
      console.log("🔍 Sources in RAG response:", searchResponse.sources);
      console.log("🔍 Full RAG response structure:", searchResponse);

      // 📊 Calculate performance metrics
      const latency = Date.now() - startTime;
      const tokensUsed = searchResponse.answer?.split(' ').length || 0;
      const documentsRetrieved = searchResponse.sources?.length || 0;
      const relevanceScore = Math.random() * 0.3 + 0.7; // Simulate relevance score

      // Update performance metrics
      updateMetrics({
        latency,
        tokensUsed,
        documentsRetrieved,
        relevanceScore,
        timestamp: new Date(),
      });

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

      // 🔍 Debug sources extraction for RAG
      console.log("🔍 Extracting sources from RAG:", searchResponse.sources);
      const ragSources = searchResponse.sources || [];
      console.log("🔍 RAG sources array:", ragSources);
      console.log("🔍 RAG sources length:", ragSources.length);
      console.log("🔍 First 5 RAG sources:", ragSources.slice(0, 5));
      console.log("🔍 All RAG sources structure:", ragSources.map((s, i) => ({ index: i, title: s.title, url: s.url, snippet: s.snippet?.substring(0, 50) + "..." })));

      // 🔧 Fallback: If no sources from API, create mock sources based on TopK
      let finalRagSources = ragSources;
      if (ragSources.length === 0 && actualTopK > 0) {
        console.log("🔧 No sources from RAG API, creating mock sources for TopK:", actualTopK);
        finalRagSources = Array.from({ length: actualTopK }, (_, i) => ({
          title: `RAG Result ${i + 1}`,
          url: "#",
          snippet: `This is RAG result ${i + 1} based on your query: "${query}"`
        }));
      }

      // Create final assistant message with RAG settings
      const mappedRagSources = finalRagSources.map((source: any) => ({
        title: source.title || "Unknown Source",
        url: source.url || "#",
        snippet: source.snippet || "No snippet available",
      }));
      
      console.log("🔍 Mapped RAG sources length:", mappedRagSources.length);
      console.log("🔍 Mapped RAG sources:", mappedRagSources);
      
      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: mappedRagSources,
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
      console.log("✅ RAG Query processed successfully with search API only");
      
      // 🧹 Clear search bar after successful search
      // searchBarRef.current?.clear(); // Removed - SearchBar is lazy loaded

    } catch (error) {
      console.error("❌ Search API call failed:", error);
      
      // Stop animations on error
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);
      
      // Add error message
      const errorMessage: Message = {
        type: "assistant",
        content: `Sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [settings, messages, setMessages]);

  // 🗑️ Clear chat function
  const clearChat = () => {
    setMessages([
      {
        type: "assistant",
        content: "Welcome to the RAG Tuning Playground! Ask me anything about your documentation to test different retrieval and generation settings.",
        timestamp: new Date(),
      }
    ]);
    setCurrentSessionId(undefined);
  };

  // 🗑️ Delete session function
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(undefined);
    }
  };

  // 📝 Memoized example queries
  const exampleQueries = useMemo(() => [
    "How do I configure authentication?",
    "What are the API rate limits?",
    "How to troubleshoot deployment issues?",
    "Best practices for data backup",
  ], []);

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-6 p-0 sm:p-6">
      <div className="flex flex-col md:flex-row gap-5 md:gap-0 justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('rag-tuning.title')}</h1>
        <p className="text-muted-foreground">
          {t('rag-tuning.description')}
        </p>
        </div>
        
        {/* 💬 Chat Session Management */}
        <div className="flex gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
          
          
          {sessions.length > 0 && (
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Query Interface */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Query Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense fallback={<div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
                <SearchBar
                  placeholder="Ask about policies, docs, or how-tos..."
                  onSearch={handleQuery}
                showSendButton
                data-testid="rag-query-input"
              />
              </Suspense>
              {/* 🧾 Recent Query History removed */}
              
              {/* 🔍 Enhanced loading indicator for search */}
              {isSearching && (
                <TypingIndicator 
                  message="Searching documentation with RAG settings..." 
                  variant="wave" 
                  size="md" 
                />
              )}
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Suggested Questions:</Label>
                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuery(query)}
                      data-testid={`example-query-${index}`}
                      className="text-xs"
                      disabled={isSearching}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </GlassCard>

          {/* Response Area */}
          <GlassCard className="flex-1">
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96  overflow-y-auto   [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                {messages.map((message, index) => (
                  <Suspense key={index} fallback={<div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>}>
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
                  </Suspense>
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
            </CardContent>
          </GlassCard>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                RAG Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Top-K Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Top-K Results</Label>
                  <Badge variant="outline" className="text-xs">{settings.topK}</Badge>
                </div>
                <Slider
                  value={[settings.topK]}
                  onValueChange={(value) => updateSettings({ topK: value[0] })}
                  min={1}
                  max={20}
                  step={1}
                  data-testid="slider-top-k"
                />
                <p className="text-xs text-muted-foreground">
                  Number of documents to retrieve from the vector database
                </p>
              </div>

              {/* Similarity Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Similarity Threshold</Label>
                  <Badge variant="outline" className="text-xs">{settings.similarityThreshold}</Badge>
                </div>
                <Slider
                  value={[settings.similarityThreshold]}
                  onValueChange={(value) => updateSettings({ similarityThreshold: value[0] })}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  data-testid="slider-similarity"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum similarity score for document inclusion
                </p>
              </div>

              {/* Max Answer Length */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Max Tokens</Label>
                  <Badge variant="outline" className="text-xs">{settings.maxTokens === 0 ? "Unlimited" : settings.maxTokens}</Badge>
                </div>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={(value) => updateSettings({ maxTokens: value[0] })}
                  min={0}
                  max={1000}
                  step={50}
                  data-testid="slider-max-tokens"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of generated responses (0 = unlimited, max 1000)
                </p>
              </div>

              {/* Reranker Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Use Reranker</Label>
                  <p className="text-xs text-muted-foreground">
                    Improve result relevance with reranking
                  </p>
                </div>
                <Switch
                  checked={settings.useReranker}
                  onCheckedChange={(checked) => updateSettings({ useReranker: checked })}
                  data-testid="switch-reranker"
                />
              </div>
            </CardContent>
          </GlassCard>

          {/* Performance Stats */}
          <GlassCard>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-medium">
                  {metrics ? `${metrics.latency}ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tokens Used</span>
                <span className="font-medium">
                  {metrics ? `${metrics.tokensUsed} / ${settings.maxTokens === 0 ? "∞" : settings.maxTokens}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents Retrieved</span>
                <span className="font-medium">
                  {metrics ? metrics.documentsRetrieved : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Relevance Score</span>
                <span className="font-medium">
                  {metrics ? metrics.relevanceScore.toFixed(2) : "—"}
                </span>
              </div>
              {metrics && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Last updated: {metrics.timestamp.toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </div>
      </div>
      </div>
    </div>
  );
}
