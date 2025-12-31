import * as React from "react";
import { useState, useCallback } from "react";
import { Copy, ThumbsUp, ThumbsDown, User, Bot, Check } from "lucide-react";
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
import { useBranding } from "@/contexts/BrandingContext";
import { simpleHighlight } from "@/utils/textHighlighting";
import { useCitationFormatting, CitationFormattingOptions } from "@/contexts/CitationFormattingContext";
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
  avatarOptions?: Array<{ id: string; emoji?: string; image?: string }>;
  // 🎨 Citation formatting (optional, falls back to context)
  citationFormatting?: CitationFormattingOptions;
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
  citationFormatting,
}: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // 💬 Use feedback hook
  const { submitFeedback, isSubmitting } = useChatFeedback();
  const [copied, setCopied] = useState(false);

  // 🎨 Get theme for syntax highlighting
  const { theme } = useTheme();
  // 🎨 Get branding for primary color
  const { primaryColor } = useBranding();

  // 🎨 Get citation formatting options (use prop if provided, otherwise use context)
  const contextFormatting = useCitationFormatting();
  const formatting = citationFormatting || contextFormatting.formatting;

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
    // 🎨 Grid layout works in Search Test (isWidget=true but not embedded widget)
    // Only force vertical in actual embedded widget (when used in EmbeddableWidget component)
    // For Search Test, allow grid layout to work
    switch (formatting.layout) {
      case 'vertical': return "space-y-2";
      case 'grid': return "grid grid-cols-1 sm:grid-cols-2 gap-2 items-stretch";
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

  // 🎨 Render citation card content (reusable for both hover and non-hover states)
  const renderCitationCard = (source: Citation, index: number) => {
    const hoverClasses = formatting.enableHover 
      ? 'cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md hover:border-primary/30' 
      : '';
    
    // Ensure cards have equal height in grid layout
    const heightClasses = formatting.layout === 'grid' ? 'h-full flex flex-col' : '';
    
    return (
      <div
        className={`${getCitationStyleClasses()} ${getColorSchemeClasses()} ${hoverClasses} ${heightClasses}`}
      >
        <div className={`flex items-start gap-2 ${formatting.layout === 'grid' ? 'flex-1' : ''}`}>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${formatting.style === 'minimal' ? 'text-xs px-1 py-0' : ''}`}
          >
            {getNumberingStyle(index)}
          </Badge>
          <div className="flex-1 min-w-0 flex flex-col">
            <p className={`font-medium text-foreground mb-1 ${formatting.style === 'compact' ? 'text-xs' : 'text-sm'}`}>
              {source.title || `Source ${index + 1}`}
            </p>
            {formatting.showSnippets && truncateSnippet(source.snippet) && (
              <p className={`text-muted-foreground leading-relaxed flex-1 ${formatting.style === 'compact' ? 'text-xs' : 'text-xs'}`}>
                {queryString ? simpleHighlight(truncateSnippet(source.snippet), queryString) : truncateSnippet(source.snippet)}
              </p>
            )}
            {formatting.showUrls && source.url && source.url !== "#" && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-primary hover:underline mt-1 inline-block ${formatting.style === 'compact' ? 'text-xs' : 'text-xs'}`}
              >
                View Source →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🎨 Render hover card content (for the popup)
  const renderHoverCardContent = (source: Citation, index: number) => (
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
  );

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

  // Use chatbot widget structure when isWidget is true
  if (isWidget) {
    const isBot = type === "assistant";
    const isUser = type === "user";
    const messageClass = isBot ? "bot-message" : "user-message";
    const isCustomAvatarImage = widgetAvatar && (widgetAvatar.startsWith("http") || widgetAvatar.startsWith("data:"));
    const isDefaultGradient = widgetChatbotColor === "gradient";
    const isCustomGradient = widgetChatbotColor && widgetChatbotColor.startsWith("linear-gradient");
    const selectedAvatar = avatarOptions?.find(a => a.id === widgetAvatar) || { image: "/avatars/avatar-1.png" };
    const isDefaultAvatarImage = selectedAvatar && selectedAvatar.image;

    return (
      <div className={`chatbot-message ${messageClass}`} data-testid={`message-${type}`}>
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
            ) : isDefaultAvatarImage ? (
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
              />
            ) : (
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: (isDefaultGradient || isCustomGradient) ? undefined : widgetChatbotColor || '#1F2937',
                  backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : (isCustomGradient ? widgetChatbotColor : undefined),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                🤖
              </div>
            )}
          </div>
        )}
        <div className="chatbot-message__content">
          <div 
            className="chatbot-message-text"
            style={isUser ? {
              // User messages use same color as chatbot header (widgetChatbotColor)
              // For gradients, set backgroundImage; for solid colors, CSS will use --chatbot-color
              ...(isDefaultGradient || isCustomGradient ? {
                backgroundImage: isDefaultGradient ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : widgetChatbotColor,
              } : {}),
              color: '#fff',
              fontSize: widgetFontSize ? `${widgetFontSize}px` : '14px',
            } : {
              fontSize: widgetFontSize ? `${widgetFontSize}px` : '14px',
            }}
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
                  {safeStringConversion(content)}
                </ReactMarkdown>
              </div>
            ) : (
              <p>{content}</p>
            )}
          </div>
          {/* Citations for bot messages - Use detailed format for Search Test */}
          {isBot && citations && citations.length > 0 && (() => {
            // Calculate Top-K value (use actualTopK if available, otherwise ragSettings.topK, or use citations length)
            const topKValue = actualTopK !== undefined ? actualTopK : (ragSettings?.topK !== undefined ? ragSettings.topK : citations.length);
            const displayedCitations = topKValue ? citations.slice(0, topKValue) : citations;
            
            // Use detailed citation format (same as non-widget) to show "Top-K: X Sources (X):" format
            return (
              <div className="space-y-3 pt-3 border-t border-border/20 mt-2 overflow-x-hidden">
                {/* Display Top-K label before Sources count - controlled by showSourceCount from citation formatting */}
                {formatting.showSourceCount && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {topKValue !== undefined && topKValue !== null && (
                      <span className="text-xs font-medium opacity-70">
                        Top-K: {topKValue}
                      </span>
                    )}
                    <span className="text-xs font-medium opacity-70">
                      Sources ({displayedCitations.length}):
                    </span>
                  </div>
                )}
                {/* Always show source cards, even if showSourceCount is false */}
                <div className={`${getLayoutClasses()} overflow-x-hidden`}>
                  {displayedCitations.map((source, index) => 
                    formatting.enableHover ? (
                      <div key={index} className={formatting.layout === 'grid' ? 'h-full' : ''}>
                        <HoverCard openDelay={300} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            {renderCitationCard(source, index)}
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-80 max-h-60 overflow-y-auto"
                            side="top"
                            align="start"
                            sideOffset={5}
                          >
                            {renderHoverCardContent(source, index)}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    ) : (
                      <div key={index} className={formatting.layout === 'grid' ? 'h-full' : ''}>
                        {renderCitationCard(source, index)}
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })()}
          {/* Message Footer (Actions and Time on same line) */}
          {isBot && (
            <div className="chatbot-message-footer">
              <div className="chatbot-message-actions">
                <button
                  className={`chatbot-message-action-button ${copied ? "active" : ""}`}
                  onClick={handleCopy}
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                {showFeedback && (
                  <>
                    <button
                      className={`chatbot-message-action-button ${feedback === "up" ? "active" : ""}`}
                      onClick={() => handleFeedback("up")}
                      disabled={isSubmitting}
                      title="Thumbs up"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      className={`chatbot-message-action-button ${feedback === "down" ? "active" : ""}`}
                      onClick={() => handleFeedback("down")}
                      disabled={isSubmitting}
                      title="Thumbs down"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
              {timestamp && widgetShowDateTime !== false && (
                <span className={`chatbot-message-time ${widgetShowDateTime ? "chatbot-message-time--visible" : ""}`}>
                  {formatRelativeTime(timestamp)}
                </span>
              )}
            </div>
          )}
          {isUser && timestamp && widgetShowDateTime !== false && (
            <span className={`chatbot-message-time ${widgetShowDateTime ? "chatbot-message-time--visible" : ""}`}>
              {formatRelativeTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Original non-widget structure
  return (
    <div
      className={`chat-message flex gap-3 ${type === "user" ? "justify-end" : "justify-start"}`}
      data-testid={`message-${type}`}
      role="article"
      aria-label={`${type === "user" ? "User" : "Assistant"} message`}
      aria-live="polite"
    >
      {type === "assistant" && (
        <Avatar
          className="h-8 w-8 mt-1 rounded-full flex-shrink-0"
          aria-label="AI Assistant avatar"
        >
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] min-w-0 ${type === "user" ? "order-first" : ""}`}>
        <Card
          className={`chat-bubble p-4 ${type === "user" ? "ml-auto user-message-bubble" : ""} rounded-lg`}
          style={type === "user" && !isWidget ? {
            '--user-message-bg': primaryColor || '#3b82f6',
            backgroundColor: primaryColor || '#3b82f6',
            color: '#ffffff'
          } as React.CSSProperties & { '--user-message-bg'?: string } : undefined}
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
            {type === "assistant" && citations && citations.length > 0 && (() => {
              // Calculate Top-K value (use actualTopK if available, otherwise ragSettings.topK, or use citations length)
              const topKValue = actualTopK !== undefined ? actualTopK : (ragSettings?.topK !== undefined ? ragSettings.topK : citations.length);
              const displayedCitations = topKValue ? citations.slice(0, topKValue) : citations;
              
              return (
                <div className="space-y-3 pt-3 border-t border-border/20 overflow-x-hidden">
                  {/* Display Top-K label before Sources count - controlled by showSourceCount from citation formatting */}
                  {formatting.showSourceCount && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {topKValue !== undefined && topKValue !== null && (
                        <span className="text-xs font-medium opacity-70">
                          Top-K: {topKValue}
                        </span>
                      )}
                      <span className="text-xs font-medium opacity-70">
                        Sources ({displayedCitations.length}):
                      </span>
                    </div>
                  )}
                  {/* Always show source cards, even if showSourceCount is false */}
                  <div className={`${getLayoutClasses()} overflow-x-hidden`}>
                    {displayedCitations.map((source, index) => 
                      formatting.enableHover ? (
                        <div key={index} className={formatting.layout === 'grid' ? 'h-full' : ''}>
                          <HoverCard openDelay={300} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              {renderCitationCard(source, index)}
                            </HoverCardTrigger>
                            <HoverCardContent
                              className="w-80 max-h-60 overflow-y-auto"
                              side="top"
                              align="start"
                              sideOffset={5}
                            >
                              {renderHoverCardContent(source, index)}
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      ) : (
                        <div key={index} className={formatting.layout === 'grid' ? 'h-full' : ''}>
                          {renderCitationCard(source, index)}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })()}

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
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
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

