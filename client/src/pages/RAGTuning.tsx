import { useEffect, useState } from "react";
import { Send, Copy, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { ChatMessage } from "@/components/ChatMessage";

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


// useEffect(() => {
//   const fetchMessages = async () => {
//     console.log("🚀 RAG Tuning - Making API request to:", "http://192.168.0.124:8000/api/v1/search");
//     console.log("📤 Request payload:", { query: "nitsan" });
    
//     try {
//       const response = await fetch("http://192.168.0.124:8000/api/v1/search", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           query: "nitsan",
//         }),
//       });

//       console.log("📡 RAG API Response status:", response.status);
//       console.log("📡 RAG API Response headers:", response.headers);
//       console.log("📡 RAG API Response ok:", response.ok);

//       const data = await response.json();
//       console.log("📦 RAG API Response data:", data);
//       console.log("📦 RAG API Data type:", typeof data);
//       console.log("📦 RAG API Data length:", Array.isArray(data) ? data.length : "Not an array");

//       console.log("✅ RAG API - Messages set successfully",data);
//     } catch (error) {
//       console.error("🚨 RAG API Error:", error);
//       console.error("🚨 RAG API Error details:", error instanceof Error ? error.message : String(error));
//     }
//   };
//   fetchMessages();
// },[])

  const handleQuery = (query: string) => {
    console.log("🔍 RAG Query - User submitted query:", query);
    console.log("⚙️ RAG Settings:", { 
      topK: topK[0], 
      similarityThreshold: similarityThreshold[0], 
      useReranker, 
      maxTokens: maxTokens[0] 
    });

    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    console.log("👤 User message created:", userMessage);

    // Simulate AI response with current settings
    const assistantMessage: Message = {
      type: "assistant",
      content: `Based on your query "${query}", here's what I found in the documentation:

This is a simulated response that would be generated using your current RAG settings:
- Top-K: ${topK[0]} documents retrieved
- Similarity threshold: ${similarityThreshold[0]}
- Reranker: ${useReranker ? "Enabled" : "Disabled"}
- Max tokens: ${maxTokens[0]}

The system would search through the indexed documents and provide relevant information based on these parameters.`,
      citations: [
        { title: "User Guide", url: "#", snippet: "Relevant section from documentation..." },
        { title: "API Reference", url: "#", snippet: "Technical implementation details..." },
        { title: "FAQ", url: "#", snippet: "Common questions and answers..." },
      ],
      timestamp: new Date(),
    };

    console.log("🤖 Assistant message created:", assistantMessage);
    console.log("📊 Citations count:", assistantMessage.citations?.length || 0);

    setMessages(prev => {
      const newMessages = [...prev, userMessage, assistantMessage];
      console.log("💾 Messages updated, total count:", newMessages.length);
      return newMessages;
    });
    
    console.log("✅ RAG Query processed successfully");
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