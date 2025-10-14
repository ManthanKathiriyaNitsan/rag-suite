import React from 'react';
import { Loader2 } from 'lucide-react';
import { linkifyTextToNodes } from "@/utils/linkify";

interface TypingIndicatorProps {
  message?: string;
  variant?: 'dots' | 'pulse' | 'wave';
  size?: 'sm' | 'md' | 'lg';
}

function TypingIndicator({ 
  message = "AI is thinking...", 
  variant = 'dots',
  size = 'md' 
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'pulse') {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <div className={`${sizeClasses[size]} bg-primary/20 rounded-full animate-pulse`} />
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <div className="flex gap-1">
          <div className={`${sizeClasses[size]} bg-primary/40 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`${sizeClasses[size]} bg-primary/40 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`${sizeClasses[size]} bg-primary/40 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          {message}
        </span>
      </div>
    );
  }

  // Default dots variant
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary/60`} />
      <span className={`${textSizeClasses[size]} text-muted-foreground`}>
        {message}
      </span>
    </div>
  );
}

// 🎭 Typing Animation Component for Chat Messages
export function TypingAnimation({ 
  message = "AI is typing...", 
  speed = 50 
}: { 
  message?: string; 
  speed?: number; 
}) {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, message, speed, setDisplayText, setCurrentIndex]);

  React.useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [message, setDisplayText, setCurrentIndex]);

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-muted-foreground">
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  );
}

// 🌊 Streaming Response Component
export function StreamingResponse({ 
  content, 
  isStreaming = false,
  onComplete 
}: { 
  content: string; 
  isStreaming?: boolean;
  onComplete?: () => void;
}) {
  const [displayContent, setDisplayContent] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (isStreaming && currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20); // Fast typing speed

      return () => clearTimeout(timer);
    } else if (currentIndex >= content.length && isStreaming) {
      onComplete?.();
    }
  }, [currentIndex, content, isStreaming, onComplete, setDisplayContent, setCurrentIndex]);

  React.useEffect(() => {
    if (content !== displayContent) {
      setDisplayContent('');
      setCurrentIndex(0);
    }
  }, [content, setDisplayContent, setCurrentIndex]);

  return (
    <div className="space-y-2">
      <div className="text-sm">
        {linkifyTextToNodes(displayContent)}
        {isStreaming && <span className="animate-pulse">|</span>}
      </div>
    </div>
  );
}

export default TypingIndicator;
