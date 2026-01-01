import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { HelpCircle, Search, X, Loader2, Sparkles, Filter, ScanSearch } from 'lucide-react';
import ChatMessage from '@/components/common/ChatMessage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { safeStringConversion } from '@/utils/safeStringConversion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { TypingAnimation } from '@/components/common/TypingIndicator';

interface SearchBarLivePreviewProps {
  settingsSubTab: string;
  previewOverrides: {
    title?: string;
    styleOption?: string;
    searchIcon?: string;
    loaderType?: string;
    secondaryColor?: string;
    textColor?: string;
    borderRadius?: string;
    resultStyle?: string;
    searchFormType?: string;
    buttonType?: string;
    searchButtonText?: string;
    searchInputPlaceholder?: string;
    recentSearch?: boolean;
    recentSearchTitle?: string;
    predefinedQuestions?: boolean;
    questionsList?: string[];
    questionsPosition?: string;
    questionsLimit?: number;
    citationFormatting?: {
      colorScheme?: 'default' | 'primary' | 'muted' | 'accent';
      layout?: 'vertical' | 'grid';
      showSourceCount?: boolean;
    };
  };
  minHeight?: number;
}

export const SearchBarLivePreview: React.FC<SearchBarLivePreviewProps> = ({
  settingsSubTab,
  previewOverrides,
  minHeight = 400,
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [previewSearchInput, setPreviewSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [showTestMessage, setShowTestMessage] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Helper function to get citation color scheme classes
  const getCitationColorSchemeClasses = () => {
    const colorScheme = previewOverrides.citationFormatting?.colorScheme || 'default';
    switch (colorScheme) {
      case 'primary': return "border-primary/20 bg-primary/5";
      case 'muted': return "border-muted bg-muted/30";
      case 'accent': return "border-accent/20 bg-accent/5";
      default: return "border-border/20 bg-muted/30";
    }
  };
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get border radius value based on setting
  const getBorderRadiusValue = (borderRadius: string) => {
    switch (borderRadius) {
      case 'rounded':
        return '12px';
      case 'medium-rounded':
        return '10px';
      case 'semi-rounded':
        return '8px';
      case 'square':
        return '0px';
      default:
        return '8px';
    }
  };

  const borderRadiusValue = getBorderRadiusValue(previewOverrides.borderRadius || 'semi-rounded');
  const searchFormType = previewOverrides.searchFormType || 'default';
  const showSendButton = searchFormType === 'withBtn' || searchFormType === 'iconOnly';
  const showSearchIcon = searchFormType === 'default'; // Show icon on left when default
  const placeholder = previewOverrides.searchInputPlaceholder || 'Search using AI...';
  const buttonType = previewOverrides.buttonType || 'icon';
  const buttonText = previewOverrides.searchButtonText || 'Search';
  const showButtonLabel = buttonType === 'withLabel';

  // Always use the same colors as search test for consistency
  // Match exact colors from search test implementation
  const wrapperBgColor = isDarkMode ? 'var(--tab-bg-default)' : '#f5f5f5';
  const innerBgColor = isDarkMode ? '#121212' : '#ffffff';
  
  // Use custom colors when customize style is selected
  const isCustomizedStyle = previewOverrides.styleOption === 'plugin';
  const inputTextColor = isCustomizedStyle && previewOverrides.textColor 
    ? previewOverrides.textColor 
    : (isDarkMode ? '#f9fafb' : '#374151');
  const buttonBgColor = isCustomizedStyle && previewOverrides.secondaryColor 
    ? previewOverrides.secondaryColor 
    : (isDarkMode ? '#3b82f6' : '#1e3a8a');
  const buttonTextColor = isCustomizedStyle && previewOverrides.textColor 
    ? previewOverrides.textColor 
    : '#ffffff';

  // Questions and response state
  const questionsList = previewOverrides.questionsList || [];
  const questionsLimit = previewOverrides.questionsLimit || 5;
  const displayQuestions = questionsList.slice(0, questionsLimit);

  // Sample response with full markdown and citations
  const sampleResponse = {
    type: 'assistant' as const,
    content: `Based on the information available, I can help you understand the key topics covered in the guide. The document provides comprehensive insights into using Claude Code with TYPO3, including practical examples and best practices for developers.

## Key Topics Covered

1. **Integration Setup**: Step-by-step guide for integrating Claude Code with TYPO3
2. **Best Practices**: Recommended approaches for optimal performance
3. **Code Examples**: Real-world examples and use cases
4. **Troubleshooting**: Common issues and their solutions

The guide is designed to help developers quickly get started with implementing Claude Code in their TYPO3 projects.`,
    citations: [
      {
        title: 'Claude Code & TYPO3: A Practical Developer Guide',
        url: '#',
        snippet: 'This guide covers key topics including integration setup, best practices, code examples, and troubleshooting common issues.'
      },
      {
        title: 'TYPO3 Documentation',
        url: '#',
        snippet: 'Official TYPO3 documentation provides additional context and reference materials.'
      }
    ],
    timestamp: new Date(),
  };

  const simulateSearch = async (query: string) => {
    setPreviewSearchInput(query);
    setIsSearching(true);
    setIsTyping(true);
    setShowResponse(false);
    setStreamingContent("");

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsTyping(false);
    setIsStreaming(true);

    // Simulate streaming response
    const words = sampleResponse.content.split(' ');
    let currentContent = '';
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      setStreamingContent(currentContent);
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    setIsStreaming(false);
    setShowResponse(true);
    setIsSearching(false);
  };

  const handleQuestionClick = (question: string) => {
    // Show message in response area instead of performing search
    setPreviewSearchInput(question);
    setIsSearching(true);
    setIsTyping(true);
    setShowResponse(false);
    setShowTestMessage(false);
    setStreamingContent("");
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setShowTestMessage(true);
      setIsSearching(false);
    }, 500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewSearchInput.trim().length >= 3) {
      // Show message in response area instead of performing search
      setIsSearching(true);
      setIsTyping(true);
      setShowResponse(false);
      setShowTestMessage(false);
      setStreamingContent("");
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        setShowTestMessage(true);
        setIsSearching(false);
      }, 500);
    }
  };

  const handleClearSearch = () => {
    setPreviewSearchInput("");
    setShowResponse(false);
    setShowTestMessage(false);
    setIsTyping(false);
    setIsStreaming(false);
    setStreamingContent("");
  };

  return (
    <div
      style={{
        position: isLargeScreen ? 'sticky' : 'relative',
        top: isLargeScreen ? '24px' : 'auto',
        alignSelf: 'flex-start',
        width: '100%',
        overflow: 'visible',
        zIndex: isLargeScreen ? 10 : 'auto',
        height: isLargeScreen ? 'fit-content' : 'auto',
        maxHeight: isLargeScreen ? 'calc(100vh - 48px)' : 'none',
      }}
      className="sticky-live-preview-wrapper"
    >
      <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            Real-time preview of your search box configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-6 w-full min-w-0 max-w-full"
            style={{
              minHeight: `${minHeight}px`,
            }}
          >
            {/* Search Box Section - Exact replica of search test */}
            <GlassCard>
              <CardContent className="space-y-4 pt-6">
                {/* Title with Icon - Show when title is provided */}
                {previewOverrides.title && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      {/* Title always uses Search icon with Sparkles, doesn't change with searchIcon setting */}
                      <Search className="h-5 w-5 text-foreground" />
                      <Sparkles className="h-2.5 w-2.5 text-foreground absolute -top-0.5 -right-0.5" fill="currentColor" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{previewOverrides.title}</h3>
                  </div>
                )}
                <form onSubmit={handleSearchSubmit} className="space-y-4 w-full min-w-0">
                  <div className="rag-search-form-wrapper w-full min-w-0" style={{
                    backgroundColor: wrapperBgColor,
                    borderRadius: borderRadiusValue,
                    padding: '8px',
                    boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="rag-search-form-inner w-full min-w-0" style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: innerBgColor,
                      borderRadius: borderRadiusValue,
                      border: 'none',
                      overflow: 'hidden',
                      width: '100%',
                      position: 'relative'
                    }}>
                      {/* Search Icon on Left - Show when form type is default */}
                      {showSearchIcon && (
                        <div style={{
                          position: 'absolute',
                          left: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 1,
                          pointerEvents: 'none'
                        }}>
                          {previewOverrides.searchIcon === 'scan' ? (
                            <ScanSearch className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                          ) : previewOverrides.searchIcon === 'sparkles' ? (
                            <Sparkles className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                          ) : (
                            <Search className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                          )}
                        </div>
                      )}
                      <input
                        type="text"
                        className="rag-search-input-field"
                        style={{
                          flex: '1',
                          minWidth: '0',
                          border: 'none',
                          outline: 'none',
                          padding: '12px 16px 12px 16px',
                          paddingLeft: showSearchIcon ? '48px' : '16px', // Add left padding when icon is shown
                          paddingRight: showSendButton 
                            ? (showButtonLabel 
                              ? (previewSearchInput ? '150px' : '110px') 
                              : (previewSearchInput ? '106px' : '66px'))
                            : (previewSearchInput ? '50px' : '16px'), // Right padding for clear button or none
                          backgroundColor: 'transparent',
                          color: inputTextColor,
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                        placeholder={placeholder}
                        value={previewSearchInput}
                        onChange={(e) => setPreviewSearchInput(e.target.value)}
                        maxLength={150}
                        minLength={3}
                        autoComplete="off"
                      />
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0',
                        flexShrink: 0,
                        position: 'absolute',
                        right: '0',
                        height: '100%'
                      }}>
                        {previewSearchInput && !showSendButton && (
                          <button
                            type="button"
                            className="rag-search-clear-button"
                            style={{
                              width: '50px',
                              height: '100%',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0',
                              margin: '0',
                              flexShrink: 0,
                              borderRadius: '0 8px 8px 0'
                            }}
                            onClick={handleClearSearch}
                            aria-label="Clear Search"
                          >
                            <X className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                          </button>
                        )}
                        {previewSearchInput && showSendButton && (
                          <button
                            type="button"
                            className="rag-search-clear-button"
                            style={{
                              width: '50px',
                              height: '100%',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0',
                              margin: '0',
                              flexShrink: 0,
                              borderRadius: '8px 0 0 8px'
                            }}
                            onClick={handleClearSearch}
                            aria-label="Clear Search"
                          >
                            <X className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                          </button>
                        )}
                        {showSendButton && (
                          <button
                            type="submit"
                            className="rag-search-submit-button"
                            style={{
                              width: showButtonLabel ? 'auto' : '80px',
                              minWidth: showButtonLabel ? '100px' : '80px',
                              height: '100%',
                              border: 'none',
                              background: buttonBgColor,
                              borderRadius: previewSearchInput ? (showButtonLabel ? '0 8px 8px 0' : '0 8px 8px 0') : borderRadiusValue,
                              cursor: previewSearchInput.trim().length < 3 || isSearching ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: showButtonLabel ? '0 16px' : '0',
                              margin: '0',
                              gap: showButtonLabel ? '8px' : '0',
                              opacity: (previewSearchInput.trim().length < 3 || isSearching) ? 0.6 : 1,
                              transition: 'opacity 0.2s, background-color 0.2s, border-radius 0.2s',
                              flexShrink: 0,
                              boxShadow: 'none'
                            }}
                            disabled={isSearching || previewSearchInput.trim().length < 3}
                            aria-label="Search"
                            onMouseEnter={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.opacity = '0.9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.opacity = (previewSearchInput.trim().length < 3 || isSearching) ? '0.6' : '1';
                              }
                            }}
                          >
                            {isSearching ? (
                              <Loader2 className="h-5 w-5 animate-spin" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                            ) : (
                              <>
                                {showButtonLabel ? (
                                  <>
                                    <Search className="h-4 w-4" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                                    <span style={{ color: buttonTextColor, fontSize: '14px', fontWeight: '500' }}>{buttonText}</span>
                                  </>
                                ) : (
                                  <Search className="h-5 w-5" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                                )}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>

                {/* Suggested Questions - Exact replica */}
                {previewOverrides.predefinedQuestions && displayQuestions.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-4 w-full min-w-0">
                    <p className="text-sm font-semibold text-foreground">Suggested Questions</p>
                    <div className="flex flex-wrap gap-3 w-full">
                      {displayQuestions.map((query, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 border border-border cursor-pointer transition-all hover:shadow-sm w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-full"
                          style={{
                            borderRadius: borderRadiusValue
                          }}
                          onClick={() => handleQuestionClick(query)}
                          data-testid={`example-query-${index}`}
                        >
                          <span className="text-sm font-medium text-foreground flex-1 break-words overflow-wrap-anywhere">{query}</span>
                          <HelpCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </GlassCard>

            {/* Search Results Section - Exact replica */}
            {(showResponse || showTestMessage || isTyping || isStreaming) && (
              <GlassCard>
                <CardContent className="pt-6">
                  {/* Loading - Skeleton or Typing Loader based on loaderType */}
                  {(isTyping || (isStreaming && !streamingContent)) && !showTestMessage && (
                    <>
                      {previewOverrides.loaderType === "typing" ? (
                        <TypingAnimation message="AI is thinking..." speed={50} />
                      ) : (
                        <div className="space-y-3">
                          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6"></div>
                          <div className="h-4 bg-muted/50 rounded animate-pulse w-2/3"></div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Test Message */}
                  {showTestMessage && (
                    <div className="space-y-4">
                      <div className="space-y-4 w-full min-w-0 max-w-full overflow-x-hidden">
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground prose-p:break-words prose-p:overflow-wrap-anywhere prose-headings:break-words prose-headings:overflow-wrap-anywhere prose-li:break-words prose-li:overflow-wrap-anywhere"
                        >
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-foreground mb-2">
                              <strong>Note:</strong> This is a live preview. To test your search functionality, please navigate to the <strong>"Search Testing"</strong> tab.
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The live preview shows how your search box will look, but actual search queries can only be tested in the Search Testing section.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results Display - Exact replica with markdown */}
                  {!isTyping && !showTestMessage && (isStreaming || showResponse) && (
                    <div className="space-y-4">
                      <div className="space-y-4 w-full min-w-0 max-w-full overflow-x-hidden">
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground prose-p:break-words prose-p:overflow-wrap-anywhere prose-headings:break-words prose-headings:overflow-wrap-anywhere prose-li:break-words prose-li:overflow-wrap-anywhere"
                          style={isCustomizedStyle && previewOverrides.textColor ? {
                            color: previewOverrides.textColor,
                          } : undefined}
                        >
                          <style>{isCustomizedStyle && previewOverrides.textColor ? `
                            .prose p { color: ${previewOverrides.textColor} !important; }
                            .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 { color: ${previewOverrides.textColor} !important; }
                            .prose strong { color: ${previewOverrides.textColor} !important; }
                            .prose li { color: ${previewOverrides.textColor} !important; }
                            .prose code:not(pre code) { color: ${previewOverrides.textColor} !important; }
                          ` : ''}</style>
                          {isStreaming && streamingContent ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                code: ({ node, className, children, ...props }: any) => {
                                  const isInline = !className?.includes('language-');
                                  if (isInline) {
                                    return (
                                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : 'text';
                                  return (
                                    <div className="my-4">
                                      <SyntaxHighlighter
                                        language={language}
                                        style={isDarkMode ? oneDark : oneLight}
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
                                blockquote: ({ children, ...props }) => (
                                  <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" {...props}>
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {safeStringConversion(streamingContent)}
                            </ReactMarkdown>
                          ) : showResponse ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                code: ({ node, className, children, ...props }: any) => {
                                  const isInline = !className?.includes('language-');
                                  if (isInline) {
                                    return (
                                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : 'text';
                                  return (
                                    <div className="my-4">
                                      <SyntaxHighlighter
                                        language={language}
                                        style={isDarkMode ? oneDark : oneLight}
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
                                blockquote: ({ children, ...props }) => (
                                  <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" {...props}>
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {safeStringConversion(sampleResponse.content)}
                            </ReactMarkdown>
                          ) : null}
                        </div>
                        {/* Citations - Exact replica */}
                        {showResponse && sampleResponse.citations && sampleResponse.citations.length > 0 && (
                          <div className="pt-4 border-t border-border space-y-3 w-full min-w-0">
                            {previewOverrides.citationFormatting?.showSourceCount !== false && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Sources ({sampleResponse.citations.length}):
                                </span>
                              </div>
                            )}
                            <div className={`grid gap-3 w-full min-w-0 ${previewOverrides.citationFormatting?.layout === 'vertical' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                              {sampleResponse.citations.map((citation, index) => (
                                <Card key={index} className={`p-3 w-full min-w-0 border ${getCitationColorSchemeClasses()}`}>
                                  <div className="space-y-2 w-full min-w-0">
                                    <div className="flex items-start gap-2 w-full min-w-0">
                                      <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">{index + 1}.</span>
                                      <div className="flex-1 min-w-0 overflow-hidden">
                                        <h4 className="text-sm font-medium text-foreground break-words overflow-wrap-anywhere">{citation.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">{citation.snippet}</p>
                                        <a
                                          href={citation.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1 break-all"
                                        >
                                          View Source
                                          <span>→</span>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
};
