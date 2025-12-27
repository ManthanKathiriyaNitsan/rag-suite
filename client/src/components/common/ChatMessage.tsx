import * as React from "react";
import { useState, useCallback } from "react";
import { Copy, ThumbsUp, ThumbsDown, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";
// 💬 Import feedback hook
import { useChatFeedback } from "@/hooks/useChat";
import { linkifyTextToNodes } from "@/utils/linkify";
import { copyToClipboard } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { simpleHighlight } from "@/utils/textHighlighting";
import { useCitationFormatting } from "@/contexts/CitationFormattingContext";
import { safeStringConversion } from "@/utils/safeStringConversion";
// 📝 Import markdown support
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
// 🎨 Import syntax highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  sessionId?: string; // 💬 Add session ID for feedback
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
  isWidget?: boolean; // 🎨 Whether this is being used in embedded widget (grid layout disabled)
  // Widget customization props
  widgetAvatar?: string;
  widgetAvatarSize?: number;
  widgetChatbotColor?: string;
  widgetShowDateTime?: boolean;
  widgetFontSize?: number;
  avatarOptions?: Array<{ id: string; emoji: string }>;
}

// Format timestamp as relative time (e.g., "2 months ago")
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
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
}

const ChatMessage = React.memo(function ChatMessage({
  type,
  content,
  citations = [],
  timestamp,
  showFeedback = false,
  messageId,
  sessionId,
  ragSettings,
  queryString,
  serverMessage,
  actualTopK,
  actualReranker,
  isWidget = false,
  widgetAvatar,
  widgetAvatarSize,
  widgetChatbotColor,
  widgetShowDateTime,
  widgetFontSize,
  avatarOptions,
}: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // 💬 Use feedback hook
  const { submitFeedback, isSubmitting } = useChatFeedback();
  const [copied, setCopied] = useState(false);

  // 🎨 Get theme for syntax highlighting
  const { theme } = useTheme();

  // 🎨 Get citation formatting options
  const { formatting } = useCitationFormatting();

  // Widget appearance settings (defaults, not persisted in localStorage)
  const widgetAppearance: {
    chatBubbleStyle: "rounded" | "sharp" | "minimal";
    avatarStyle: "circle" | "square" | "rounded";
    animationsEnabled: boolean;
  } = {
    chatBubbleStyle: "rounded",
    avatarStyle: "circle",
    animationsEnabled: true,
  };

  // 🎨 Citation formatting functions
  const getNumberingStyle = (index: number) => {
    switch (formatting.numbering) {
      case 'brackets': return `[${index + 1}]`;
      case 'parentheses': return `(${index + 1})`;
      case 'dots': return `${index + 1}.`;
      case 'numbers': return `${index + 1}`;
      default: return `[${index + 1}]`;
    }
  };

  const getCitationStyleClasses = () => {
    const baseClasses = "rounded-md border";

    switch (formatting.style) {
      case 'compact':
        return `${baseClasses} p-1 text-xs`;
      case 'detailed':
        return `${baseClasses} p-3 bg-muted/50`;
      case 'card':
        return `${baseClasses} p-2 shadow-sm`;
      case 'minimal':
        return `${baseClasses} p-1 text-xs bg-transparent border-dashed`;
      default:
        return `${baseClasses} p-2`;
    }
  };

  const getLayoutClasses = () => {
    // 🎨 Grid layout only works in RAGTuning, not in embedded widget
    if (isWidget && formatting.layout === 'grid') {
      return "space-y-2"; // Force vertical layout in widget
    }
    
    switch (formatting.layout) {
      case 'vertical': return "space-y-2";
      case 'grid': return "grid grid-cols-1 sm:grid-cols-2 gap-2";
      default: return "space-y-2";
    }
  };

  const getColorSchemeClasses = () => {
    switch (formatting.colorScheme) {
      case 'primary': return "border-primary/20 bg-primary/5";
      case 'muted': return "border-muted bg-muted/30";
      case 'accent': return "border-accent/20 bg-accent/5";
      default: return "border-border/20 bg-muted/30";
    }
  };

  const truncateSnippet = (snippet: string) => {
    if (!formatting.showSnippets) return "";
    if (snippet.length <= formatting.maxSnippetLength) return snippet;
    return snippet.substring(0, formatting.maxSnippetLength) + "...";
  };

  const handleCopy = useCallback(async () => {
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // 💬 Enhanced feedback handler with API call
  const handleFeedback = useCallback((type: "up" | "down") => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);

    // Submit feedback to API if we have both messageId and sessionId
    if (messageId && sessionId && newFeedback) {
      submitFeedback({
        sessionId: sessionId,
        messageId: messageId,
        feedback: newFeedback === "up" ? "positive" : "negative"
      });
      console.log(`👍 Feedback submitted: ${newFeedback} for message ${messageId} in session ${sessionId}`);
    } else if (newFeedback) {
      console.warn('⚠️ Cannot submit feedback: missing messageId or sessionId', { messageId, sessionId });
    }
  }, [feedback, messageId, sessionId, submitFeedback]);

  return (
    <div
      className={`chat-message flex ${isWidget ? "gap-2" : "gap-3"} ${type === "user" ? "justify-end" : "justify-start"}`}
      data-testid={`message-${type}`}
      role="article"
      aria-label={`${type === "user" ? "User" : "Assistant"} message`}
      aria-live="polite"
    >
      {type === "assistant" && (
        <Avatar
          className={`${isWidget ? "h-6 w-6" : "h-8 w-8"} mt-1 rounded-full flex-shrink-0`}
          aria-label="AI Assistant avatar"
          style={{
            width: isWidget && widgetAvatarSize ? `${Math.min(widgetAvatarSize, 24)}px` : undefined,
            height: isWidget && widgetAvatarSize ? `${Math.min(widgetAvatarSize, 24)}px` : undefined,
          }}
        >
          {isWidget && widgetAvatar && (widgetAvatar.startsWith("http") || widgetAvatar.startsWith("data:")) ? (
            <img
              src={widgetAvatar}
              alt="Custom avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {isWidget && avatarOptions && widgetAvatar ? (
                <span style={{ fontSize: `${Math.min((widgetAvatarSize || 32) * 0.4, 14)}px` }}>
                  {avatarOptions.find(a => a.id === widgetAvatar)?.emoji || "🤖"}
                </span>
              ) : (
                <Bot className="h-4 w-4" aria-hidden="true" />
              )}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div className={`max-w-[80%] min-w-0 ${type === "user" ? "order-first" : ""}`}>
        <Card
          className={`chat-bubble ${isWidget ? "p-3" : "p-4"} ${type === "user"
            ? "ml-auto"
            : ""
            } ${isWidget ? "rounded-2xl" : "rounded-lg"} ${type === "assistant" && isWidget ? "bg-muted" : ""}`}
          style={{
            backgroundColor: type === "assistant" && isWidget
              ? undefined // Use bg-muted class for theme-aware color
              : type === "user" && isWidget && widgetChatbotColor 
              ? (widgetChatbotColor === "gradient" || widgetChatbotColor.startsWith("linear-gradient") ? undefined : widgetChatbotColor)
              : type === "user" && isWidget
              ? "#3b82f6" // Default blue for user messages in widget
              : type === "user" ? undefined : undefined,
            backgroundImage: type === "user" && isWidget && widgetChatbotColor
              ? (widgetChatbotColor === "gradient" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : widgetChatbotColor.startsWith("linear-gradient") ? widgetChatbotColor : undefined)
              : undefined,
            fontSize: isWidget ? (widgetFontSize ? `${widgetFontSize}px` : '14px') : undefined,
            color: type === "user" && isWidget ? "#ffffff" : undefined, // White text for user messages in widget (blue background)
            lineHeight: isWidget ? '1.5' : undefined,
            boxShadow: isWidget ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined,
          }}
        >
          <div className={isWidget ? "space-y-0" : "space-y-3"}>
            <div className={`${isWidget ? "" : "opacity-90"} w-full min-w-0`}>
              {type === "assistant" ? (
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
                    {safeStringConversion(content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p
                  className={`whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto word-break-break-word text-wrap ${isWidget ? "text-white text-sm" : ""}`}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                    hyphens: 'auto',
                    lineHeight: isWidget ? '1.5' : undefined,
                  }}
                  role="text"
                  aria-label="User message content"
                >
                  {content}
                </p>
              )}
            </div>

            {/* 🎨 Enhanced Citation Display with Formatting Options */}
            {type === "assistant" && citations && citations.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border/20">
                {formatting.showSourceCount && (
                  <p className="text-xs font-medium opacity-70">
                    Sources ({citations.length}):
                  </p>
                )}
                <div className={getLayoutClasses()}>
                  {citations.map((source, index) => (
                    <HoverCard key={index} openDelay={300} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div
                          className={`${getCitationStyleClasses()} ${getColorSchemeClasses()} ${formatting.enableHover ? 'cursor-pointer' : ''
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${formatting.style === 'minimal' ? 'text-xs px-1 py-0' : ''
                                }`}
                            >
                              {getNumberingStyle(index)}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-foreground mb-1 ${formatting.style === 'compact' ? 'text-xs' : 'text-sm'
                                }`}>
                                {source.title || `Source ${index + 1}`}
                              </p>
                              {formatting.showSnippets && truncateSnippet(source.snippet) && (
                                <p className={`text-muted-foreground leading-relaxed ${formatting.style === 'compact' ? 'text-xs' : 'text-xs'
                                  }`}>
                                  {queryString ? simpleHighlight(truncateSnippet(source.snippet), queryString) : truncateSnippet(source.snippet)}
                                </p>
                              )}
                              {formatting.showUrls && source.url && source.url !== "#" && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-primary hover:underline mt-1 inline-block ${formatting.style === 'compact' ? 'text-xs' : 'text-xs'
                                    }`}
                                >
                                  View Source →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="w-80 max-h-60 overflow-y-auto"
                        side="top"
                        align="start"
                        sideOffset={5}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getNumberingStyle(index)}
                            </Badge>
                            <h4 className="font-semibold text-sm">{source.title || `Source ${index + 1}`}</h4>
                          </div>
                          {source.snippet && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {source.snippet}
                            </p>
                          )}
                          {source.url && source.url !== "#" && (
                            <div className="pt-2 border-t">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <span className="truncate">{source.url}</span>
                                <Copy className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
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
                  <div className="flex items-center gap-1" role="group" aria-label="Message feedback">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback("up")}
                      data-testid="button-feedback-up"
                      disabled={isSubmitting}
                      className={`h-8 px-2 ${feedback === "up" ? "bg-accent" : ""
                        }`}
                      aria-label="Thumbs up - positive feedback"
                      aria-pressed={feedback === "up"}
                      tabIndex={0}
                    >
                      <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback("down")}
                      data-testid="button-feedback-down"
                      disabled={isSubmitting}
                      className={`h-8 px-2 ${feedback === "down" ? "bg-accent" : ""
                        }`}
                      aria-label="Thumbs down - negative feedback"
                      aria-pressed={feedback === "down"}
                      tabIndex={0}
                    >
                      <ThumbsDown className="h-3 w-3" aria-hidden="true" />
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

        {timestamp && (!isWidget || widgetShowDateTime !== false) && (
          <p 
            className={`text-xs text-muted-foreground mt-1 ${type === "user" ? "text-right" : "text-left"}`}
            style={{
              fontSize: isWidget && widgetFontSize ? `${Math.max((widgetFontSize || 14) - 2, 10)}px` : undefined,
            }}
          >
            {isWidget ? formatRelativeTime(timestamp) : timestamp.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        )}
      </div>

      {type === "user" && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});

export default ChatMessage;

