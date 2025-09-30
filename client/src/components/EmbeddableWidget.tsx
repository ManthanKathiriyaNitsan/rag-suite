import { useState } from "react";
import { MessageCircle, X, Minimize2, Search, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "./SearchBar";
import { ChatMessage } from "./ChatMessage";
import { Badge } from "@/components/ui/badge";

interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: { title: string; url: string; snippet: string }[];
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
  const [activeTab, setActiveTab] = useState("auto");
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "assistant",
      content: "Hello! I can help you search for information or answer questions about your documentation. What would you like to know?",
      timestamp: new Date(),
    }
  ]);

  const handleSearch = (query: string) => {
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      type: "assistant",
      content: "I found some relevant information about your query. Here are the key points from our documentation...",
      citations: [
        { title: "User Guide", url: "#", snippet: "Relevant information..." },
        { title: "API Docs", url: "#", snippet: "Technical details..." },
      ],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    // Widget search performed
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
    <Card className="fixed md:bottom-6 bottom-1 w-[100%] md:right-6 mx-1  md:mx-0 md:w-96 h-[600px] shadow-xl z-50 flex flex-col">
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
              <div className="text-sm text-muted-foreground">
                Try searching for "API", "getting started", or "troubleshooting"
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 flex flex-col px-4 mt-0">
            <div 
              className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-[400px]"
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
                />
              ))}
            </div>
            <div className="flex-shrink-0">
              <SearchBar
                placeholder="Type your message..."
                onSearch={handleSearch}
                showSendButton
              />
            </div>
          </TabsContent>

          <TabsContent value="auto" className="flex-1 flex flex-col px-4 mt-0">
            <div 
              className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-[400px]"
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
                />
              ))}
            </div>
            <div className="flex-shrink-0">
              <SearchBar
                placeholder="Ask anything or search..."
                onSearch={handleSearch}
                showSendButton
                showMicButton
              />
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