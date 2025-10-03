import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Mic, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showMicButton?: boolean;
  showSendButton?: boolean;
  className?: string;
}

export const SearchBar = React.memo(function SearchBar({
  placeholder = "Ask about policies, docs, or how-tos...",
  onSearch,
  showMicButton = false,
  showSendButton = false,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const latestQueryRef = useRef<string>("");
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
    // Submit search on Enter key press as well as send button
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      const q = query.trim();
      if (q) onSearch(q);
    }
  }, [onSearch, query]);

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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Voice input unavailable",
        description: "Your browser does not support speech recognition.",
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

      let finalTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: event?.error ? String(event.error) : "Failed to capture voice input.",
          variant: "destructive",
        });
      };

      recognition.onresult = (event: any) => {
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
        if (combined) {
          setQuery(combined);
          scheduleSuggestions(combined);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const text = finalTranscript.trim();
        if (text) {
          setQuery(text);
          scheduleSuggestions(text);
          // Do not trigger search automatically; only explicit send button
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
    if (isListening) {
      stopRecognition();
    } else {
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
    setQuery(val);
    scheduleSuggestions(val);
  }, [scheduleSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        const chosen = suggestions[highlightedIndex];
        setQuery(chosen);
        setShowSuggestions(false);
        if (onSearch) onSearch(chosen.trim());
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, highlightedIndex, onSearch]);

  const handleSuggestionClick = useCallback((text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    // Do not trigger search automatically
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
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
        />
        <div className="absolute right-2 flex items-center gap-1">
          {showMicButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              data-testid="button-mic"
              className={`h-8 w-8 ${isListening ? "text-red-500 animate-pulse" : ""}`}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          {showSendButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!query.trim()}
              data-testid="button-send"
              className="h-8 w-8"
              onClick={() => {
                if (query.trim() && onSearch) {
                  onSearch(query.trim());
                  setShowSuggestions(false);
                }
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border bg-popover shadow-md">
            <ul className="max-h-56 overflow-auto text-sm">
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
      </div>
    </form>
  );
});



