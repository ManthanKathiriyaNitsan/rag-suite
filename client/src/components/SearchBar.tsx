import * as React from "react";
import { useState, useCallback } from "react";
import { Search, Mic, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
          data-testid="input-search"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {showMicButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {/* Mic clicked */}}
              data-testid="button-mic"
              className="h-8 w-8"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          {showSendButton && (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={!query.trim()}
              data-testid="button-send"
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
});