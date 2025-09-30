import { useEffect, useState } from "react";
import { Send, Copy, Settings, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { ChatMessage } from "@/components/ChatMessage";
// 🌐 Import our global API hook
import { useSearch } from "@/hooks/useSearch";

interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: { title: string; url: string; snippet: string }[];
}

export default function RAGTuning() {
  const [topK, setTopK] = useState([5]);
  const [similarityThreshold, setSimilarityThreshold] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([500]);
  const [useReranker, setUseReranker] = useState(true);
  const [messages, setMessages] = useState<Message[]>(
    [
    {
      type: "assistant",
      content: "Welcome to the RAG Tuning Playground! Ask me anything about your documentation to test different retrieval and generation settings.",
      timestamp: new Date(),
    },
  ]);

  // 🌐 Use our global search hook
  const { searchAsync, isSearching, searchData, searchError } = useSearch();


  // 🗑️ Old fetchMessages function removed - now using global API

// console.log(messages)

  // 🎯 New handleQuery using global API
  const handleQuery = async (query: string) => {
    console.log("🔍 RAG Query - User submitted query:", query);
    console.log("⚙️ RAG Settings:", { 
      topK: topK[0], 
      similarityThreshold: similarityThreshold[0], 
      useReranker, 
      maxTokens: maxTokens[0] 
    });

    // Add user message immediately
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // 🌐 Use global API - much simpler!
      const apiResponse = await searchAsync(query);
      console.log("📦 Global API Response:", apiResponse);

      // Create assistant message with real API response
      const assistantMessage: Message = {
        type: "assistant",
        content: apiResponse.answer || "No answer from API",
        citations: apiResponse.sources?.map((source: any) => ({
          title: source.title || "Unknown Source",
          url: source.url || "#",
          snippet: source.snippet || "No snippet available",
        })) || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log("✅ RAG Query processed successfully with global API");

    } catch (error) {
      console.error("❌ Global API call failed:", error);
      
      // Add error message
      const errorMessage: Message = {
        type: "assistant",
        content: `Sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const exampleQueries = [
    "How do I configure authentication?",
    "What are the API rate limits?",
    "How to troubleshoot deployment issues?",
    "Best practices for data backup",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RAG Tuning Playground</h1>
        <p className="text-muted-foreground">
          Test and optimize your retrieval-augmented generation settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Query Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Query Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchBar
                placeholder="Ask about policies, docs, or how-tos..."
                onSearch={handleQuery}
                showSendButton
                data-testid="rag-query-input"
              />
              
              {/* 🌐 Loading indicator for global API */}
              {isSearching && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Searching with global API...
                  </span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Quick Examples:</Label>
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
          </Card>

          {/* Response Area */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    type={message.type}
                    content={message.content}
                    citations={message.citations}
                    timestamp={message.timestamp}
                    showFeedback={message.type === "assistant"}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
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
                  <Badge variant="outline" className="text-xs">{topK[0]}</Badge>
                </div>
                <Slider
                  value={topK}
                  onValueChange={setTopK}
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
                  <Badge variant="outline" className="text-xs">{similarityThreshold[0]}</Badge>
                </div>
                <Slider
                  value={similarityThreshold}
                  onValueChange={setSimilarityThreshold}
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
                  <Badge variant="outline" className="text-xs">{maxTokens[0]}</Badge>
                </div>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  min={100}
                  max={2000}
                  step={50}
                  data-testid="slider-max-tokens"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of generated responses
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
                  checked={useReranker}
                  onCheckedChange={setUseReranker}
                  data-testid="switch-reranker"
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-medium">245ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tokens Used</span>
                <span className="font-medium">127 / {maxTokens[0]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents Retrieved</span>
                <span className="font-medium">{topK[0]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Relevance Score</span>
                <span className="font-medium">0.89</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}