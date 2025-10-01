import * as React from "react";
import { useState, useCallback } from "react";
import { Copy, ThumbsUp, ThumbsDown, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// 💬 Import feedback hook
import { useChatFeedback } from "@/hooks/useChat";

interface Citation {
  title: string;
  url: string;
  snippet: string;
}

interface ChatMessageProps {
  type: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp?: Date;
  showFeedback?: boolean;
  messageId?: string; // 💬 Add message ID for feedback
}

export const ChatMessage = React.memo(function ChatMessage({
  type,
  content,
  citations = [],
  timestamp,
  showFeedback = false,
  messageId,
}: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  
  // 💬 Use feedback hook
  const { submitFeedback, isSubmitting } = useChatFeedback();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // 💬 Enhanced feedback handler with API call
  const handleFeedback = useCallback((type: "up" | "down") => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    
    // Submit feedback to API if we have a messageId
    if (messageId && newFeedback) {
      submitFeedback({
        messageId: messageId,
        feedback: newFeedback === "up" ? "positive" : "negative"
      });
      console.log(`👍 Feedback submitted: ${newFeedback} for message ${messageId}`);
    }
  }, [feedback, messageId, submitFeedback]);

  return (
    <div
      className={`flex gap-3 ${type === "user" ? "justify-end" : "justify-start"}`}
      data-testid={`message-${type}`}
    >
      {type === "assistant" && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] min-w-0 ${type === "user" ? "order-first" : ""}`}>
        <Card
          className={`p-4 ${
            type === "user"
              ? "bg-primary   ml-auto"
              : "bg-card"
          }`}
        >
          <div className="space-y-3">
            <div className="opacity-90 w-full min-w-0">
              <p 
                className="whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto word-break-break-word text-wrap"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-wrap',
                  hyphens: 'auto'
                }}
              >
                {content}
              </p>
            </div>

            {citations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium opacity-70">Sources:</p>
                <div className="flex flex-wrap gap-1">
                  {citations.map((citation, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs cursor-pointer hover-elevate max-w-full truncate"
                      onClick={() => {/* Citation clicked */}}
                      data-testid={`citation-${index}`}
                      title={citation.title}
                    >
                      {citation.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {type === "assistant" && (
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    data-testid="button-copy"
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3" />
                    {copied && <span className="ml-1 text-xs">Copied!</span>}
                  </Button>
                </div>

                {showFeedback && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback("up")}
                      data-testid="button-feedback-up"
                      disabled={isSubmitting}
                      className={`h-8 px-2 ${
                        feedback === "up" ? "bg-accent" : ""
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback("down")}
                      data-testid="button-feedback-down"
                      disabled={isSubmitting}
                      className={`h-8 px-2 ${
                        feedback === "down" ? "bg-accent" : ""
                      }`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    {isSubmitting && (
                      <span className="text-xs text-muted-foreground">
                        Submitting feedback...
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {timestamp && (
          <p className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>

      {type === "user" && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});