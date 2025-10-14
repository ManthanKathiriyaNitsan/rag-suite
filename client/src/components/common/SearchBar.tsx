import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Mic, Send, History } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { PointerTypes } from "@/components/ui/AnimatedPointer";
import { ComponentErrorBoundary } from "@/components/error";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showMicButton?: boolean;
  showSendButton?: boolean;
  enableHistory?: boolean;
  className?: string;
}

// Add ref interface for clearing
export interface SearchBarRef {
  clear: () => void;
}

export const SearchBar = React.forwardRef<SearchBarRef, SearchBarProps>(function SearchBar({
  placeholder = "Ask about policies, docs, or how-tos...",
  onSearch,
  showMicButton = false,
  showSendButton = false,
  enableHistory = true,
  className = "",
}, ref) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // 📚 Query History State
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const latestQueryRef = useRef<string>("");
  
  // 📚 Load query history from sessionStorage on mount
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem('query-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setQueryHistory(parsedHistory);
      }
    } catch (error) {
      console.warn('Failed to load query history:', error);
    }
  }, []); // Empty dependency array - runs only on mount
  
  // 📚 Save query to history
  const saveQueryToHistory = useCallback((queryText: string) => {
    if (!queryText.trim()) return;
    
    setQueryHistory(prev => {
      const newHistory = [queryText, ...prev.filter(q => q !== queryText)].slice(0, 10); // Keep last 10 queries
      try {
        sessionStorage.setItem('query-history', JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save query history:', error);
      }
      return newHistory;
    });
  }, []);
  
  // Local suggestion seeds to avoid API calls on keyup
  const BASE_SUGGESTIONS = [
    "Getting started",
    "API reference",
    "Troubleshooting",
    "Installation guide",
    "Configuration options",
    "Authentication",
    "Rate limits",
    "Error codes",
    "Best practices",
    "FAQ",
  ];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    // Submit search on form submission (Enter key or send button)
    e.preventDefault();
    setShowSuggestions(false);
    setShowHistory(false);
    if (onSearch) {
      const q = query.trim();
      if (q) {
        console.log("🔍 Form submitted, query:", q);
        if (enableHistory) {
          saveQueryToHistory(q); // 📚 Save to history
        }
        onSearch(q);
        setQuery(""); // 🧹 Clear the search bar after search
        console.log("🧹 Search bar cleared");
      }
    }
  }, [onSearch, query, saveQueryToHistory, enableHistory]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }
    setIsLoadingSuggestions(true);
    latestQueryRef.current = q;
    try {
      const lower = q.toLowerCase();
      let items = BASE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(lower));
      // Include the raw query itself as a candidate at the top
      items = [q, ...items];
      const unique = Array.from(new Set(items)).slice(0, 5);
      if (latestQueryRef.current === q) {
        setSuggestions(unique);
        setShowSuggestions(unique.length > 0);
        setHighlightedIndex(unique.length > 0 ? 0 : -1);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [BASE_SUGGESTIONS]);

  const scheduleSuggestions = useCallback((q: string) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(q);
    }, 300);
  }, [fetchSuggestions]);

  const startRecognition = useCallback(() => {
    console.log('🎤 Starting speech recognition...');
    
    // Check if we're on HTTPS (required for microphone access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      toast({
        title: "HTTPS Required",
        description: "Microphone access requires HTTPS. Please use https:// or localhost.",
        variant: "destructive",
      });
      return;
    }

    // Check if microphone is blocked
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        console.log('🎤 Microphone permission state:', result.state);
        if (result.state === 'denied') {
          toast({
            title: "Microphone Blocked",
            description: "Please click the microphone icon in your browser's address bar and select 'Allow'.",
            variant: "destructive",
          });
          return;
        }
      });
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('🎤 SpeechRecognition available:', !!SpeechRecognition);
    
    if (!SpeechRecognition) {
      console.log('🎤 Speech recognition not supported');
      toast({
        title: "Voice input unavailable",
        description: "Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      // Use browser locale if available
      recognition.lang = (navigator.language || "en-US");
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      
      console.log('🎤 Speech recognition configured, starting...');

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening to your voice.",
        });
      };

      recognition.onerror = (event: any) => {
        console.log('🎤 Speech recognition error:', event?.error);
        setIsListening(false);
        
        let errorMessage = "Failed to capture voice input.";
        let errorTitle = "Voice recognition error";
        
        switch (event?.error) {
          case 'not-allowed':
            errorTitle = "Microphone Access Denied";
            errorMessage = "Click the microphone icon in your browser's address bar and select 'Allow', then try again.";
            break;
          case 'no-speech':
            errorTitle = "No Speech Detected";
            errorMessage = "Please speak clearly into your microphone.";
            break;
          case 'audio-capture':
            errorTitle = "Microphone Error";
            errorMessage = "Please check your microphone connection.";
            break;
          case 'network':
            errorTitle = "Network Error";
            errorMessage = "Please check your internet connection.";
            break;
          case 'service-not-allowed':
            errorTitle = "Speech Service Not Allowed";
            errorMessage = "Please check your browser's speech recognition settings.";
            break;
          default:
            errorMessage = event?.error ? String(event.error) : "Failed to capture voice input.";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognition.onresult = (event: any) => {
        console.log('🎤 Speech recognition result:', event);
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        const combined = (finalTranscript + " " + interim).trim();
        console.log('🎤 Combined transcript:', combined);
        if (combined) {
          setQuery(combined);
          scheduleSuggestions(combined);
        }
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended, final transcript:', finalTranscript);
        setIsListening(false);
        const text = finalTranscript.trim();
        if (text) {
          console.log('🎤 Setting query to:', text);
          setQuery(text);
          scheduleSuggestions(text);
          toast({
            title: "Voice captured!",
            description: `"${text}" - Click send to search.`,
          });
        } else {
          console.log('🎤 No speech detected');
          toast({
            title: "No speech detected",
            description: "Please try speaking more clearly.",
            variant: "destructive",
          });
        }
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      toast({
        title: "Unable to start microphone",
        description: err?.message ? String(err.message) : "Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [onSearch, toast]);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    try {
      if (rec) rec.stop();
    } catch {
      // ignore
    }
  }, []);

  const handleMicClick = useCallback(() => {
    console.log('🎤 Microphone button clicked, isListening:', isListening);
    if (isListening) {
      console.log('🎤 Stopping recognition...');
      stopRecognition();
    } else {
      console.log('🎤 Starting recognition...');
      startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    console.log("🔍 Input changed to:", val); 
    setQuery(val);
    // Only schedule suggestions if we have enough characters
    if (val.trim().length >= 2) {
      scheduleSuggestions(val);
    } else {
      setShowSuggestions(false);
    }
  }, [scheduleSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("🔍 Key pressed:", e.key, "showHistory:", showHistory, "showSuggestions:", showSuggestions);
    
    // 🎯 Handle ESC key for both suggestions and history (always active)
    if (e.key === "Escape") {
      console.log("🎯 ESC key detected, closing dropdowns");
      setShowSuggestions(false);
      setShowHistory(false);
      return;
    }
    
    // 🎯 Handle Enter key - ALWAYS work, regardless of suggestions
    if (e.key === "Enter") {
      e.preventDefault();
      const currentQuery = query.trim();
      if (currentQuery) {
        console.log("🔍 Enter pressed, submitting query:", currentQuery);
        setShowSuggestions(false);
        setShowHistory(false);
        if (onSearch) {
          if (enableHistory) {
            saveQueryToHistory(currentQuery);
          }
          onSearch(currentQuery);
          setQuery(""); // Clear the search bar after search
        }
      }
      return;
    }
    
    // 🎯 Handle arrow keys and selection only when suggestions are showing
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Tab") {
      // Accept the currently highlighted suggestion on Tab without submitting
      e.preventDefault();
      const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
      const chosen = suggestions[idx];
      if (chosen) {
        setQuery(chosen);
        setShowSuggestions(false);
      }
    }
  }, [showSuggestions, suggestions, highlightedIndex, onSearch, query, enableHistory, saveQueryToHistory]);

  const handleSuggestionClick = useCallback((text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    // Do not trigger search automatically
  }, []);
  
  // 📚 Handle query history click
  const handleHistoryClick = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    setShowSuggestions(false);
  }, []);
  
  // 📚 Toggle history display
  const toggleHistory = useCallback(() => {
    setShowHistory(!showHistory);
    setShowSuggestions(false);
  }, [showHistory]);

  // 🔍 Debug query state changes
  useEffect(() => {
    console.log("🔍 Query state changed to:", query);
  }, [query]);

  // 🎯 Global ESC key handler as backup
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (showHistory || showSuggestions)) {
        console.log("🎯 Global ESC key detected, closing dropdowns");
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showHistory, showSuggestions]);

  // 🎯 Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (showHistory || showSuggestions) {
        // Check if click is outside the search bar container
        if (!target.closest('[data-testid="search-bar-container"]')) {
          console.log("🎯 Click outside detected, closing dropdowns");
          setShowSuggestions(false);
          setShowHistory(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHistory, showSuggestions]);

  // 🧹 Clear function for external use
  const clear = useCallback(() => {
    console.log("🧹 External clear called, current query:", query);
    setQuery("");
    setShowSuggestions(false);
    setShowHistory(false);
  }, [query]);

  // Expose clear function via ref
  React.useImperativeHandle(ref, () => ({
    clear,
  }), [clear]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} data-testid="search-bar-container">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <div className="relative w-full">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay closing to allow click
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className="pl-10 pr-20"
            data-testid="input-search"
            aria-label="Search input"
            aria-describedby="search-hints"
            aria-expanded={showSuggestions || showHistory}
            aria-autocomplete="list"
            role="combobox"
            aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
          />
          <PointerTypes.Search className="absolute inset-0" />
        </div>
        <div className="absolute right-2 flex items-center gap-1">
          {/* 📚 History Button */}
          {enableHistory && queryHistory.length > 0 && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleHistory}
                data-testid="button-history"
                className="h-8 w-8"
                title="Show search history"
                aria-label="Show search history"
                aria-expanded={showHistory}
                aria-controls="history-list"
                tabIndex={0}
              >
                <History className="h-4 w-4" aria-hidden="true" />
              </Button>
              <PointerTypes.Click className="absolute inset-0" />
            </div>
          )}
          
          {showMicButton && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                data-testid="button-mic"
                className={`h-8 w-8 ${isListening ? "text-red-500 animate-pulse" : ""}`}
                title={isListening ? "Stop listening" : "Start voice input"}
                aria-label={isListening ? "Stop voice recording" : "Start voice input"}
                aria-pressed={isListening}
                tabIndex={0}
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
              </Button>
              <PointerTypes.Click className="absolute inset-0" />
            </div>
          )}
          {showSendButton && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!query.trim()}
                data-testid="button-send"
                className="h-8 w-8"
                onClick={() => {
                  if (query.trim() && onSearch) {
                    console.log("🧹 Send button clicked, clearing search bar, current query:", query);
                    if (enableHistory) {
                      saveQueryToHistory(query.trim()); // 📚 Save to history
                    }
                    onSearch(query.trim());
                    setQuery(""); // 🧹 Clear the search bar after search
                    setShowSuggestions(false);
                    console.log("🧹 Send button - search bar cleared");
                  }
                }}
                aria-label="Send search query"
                tabIndex={0}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
              <PointerTypes.Send className="absolute inset-0" />
            </div>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border bg-popover shadow-md"
            role="listbox"
            aria-label="Search suggestions"
            id="suggestions-list"
          >
            <ul className="max-h-56 overflow-auto text-sm" role="list">
              {suggestions.map((s, idx) => (
                <li
                  key={`${s}-${idx}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  className={`cursor-pointer px-3 py-2 ${idx === highlightedIndex ? "bg-muted" : "hover:bg-muted"}`}
                  onMouseDown={(e) => {
                    // use onMouseDown to fire before blur
                    e.preventDefault();
                    handleSuggestionClick(s);
                  }}
                  data-testid={`suggestion-item-${idx}`}
                >
                  {s}
                </li>
              ))}
              {isLoadingSuggestions && (
                <li className="px-3 py-2 text-muted-foreground">Loading suggestions...</li>
              )}
            </ul>
            <div className="flex items-center justify-between px-3 py-2 border-t bg-popover text-xs text-muted-foreground" data-testid="suggestion-hints">
              <span>Tab: accept suggestion</span>
              <span>Enter: submit</span>
              <span>Esc: close</span>
            </div>
          </div>
        )}
        
        {/* 📚 Query History Display */}
        {enableHistory && showHistory && queryHistory.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border bg-popover shadow-md"
            role="listbox"
            aria-label="Search history"
            id="history-list"
          >
            <div className="px-3 py-2 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              Recent Searches
            </div>
            <ul className="max-h-56 overflow-auto text-sm" role="list">
              {queryHistory.map((historyQuery, idx) => (
                <li
                  key={`history-${idx}`}
                  className="cursor-pointer px-3 py-2 hover:bg-muted flex items-center gap-2"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleHistoryClick(historyQuery);
                  }}
                  data-testid={`history-item-${idx}`}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleHistoryClick(historyQuery);
                    }
                  }}
                >
                  <Search className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{historyQuery}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between px-3 py-2 border-t bg-popover text-xs text-muted-foreground">
              <span>Click to reuse</span>
              <span>Esc: close</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
});

// Wrap SearchBar with error boundary
export default function SearchBarWithErrorBoundary(props: SearchBarProps) {
  return (
    <ComponentErrorBoundary componentName="SearchBar" size="medium">
      <SearchBar {...props} />
    </ComponentErrorBoundary>
  );
}
