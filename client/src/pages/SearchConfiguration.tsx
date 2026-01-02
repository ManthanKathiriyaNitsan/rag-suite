import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Bot,
  Settings,
  Code,
  Power,
  Edit,
  MessageSquare,
  Cpu,
  Key,
  Calendar,
  Filter,
  Search,
  ScanSearch,
  Sparkles,
  Globe,
  Smartphone,
  Save,
  RefreshCw,
  Upload,
  Check,
  HelpCircle,
  X,
  Copy,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  CheckSquare,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCitationFormatting } from "@/contexts/CitationFormattingContext";
import { useSearchCitation } from "@/hooks/useSearchCitation";
import { useBranding } from "@/contexts/BrandingContext";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { useSettingsAPI } from "@/hooks/useSettingsAPI";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import { useConfigModels, useSearchConfigModels, useAvailableChatModels, useAvailableEmbeddingModels, useAvailableModels } from "@/hooks/useConfigModels";
import { useSearchPrompt } from "@/hooks/useSearchPrompt";
import { useSearchActivation } from "@/hooks/useSearchActivation";
import { Slider } from "@/components/ui/slider";
import { FileText, Zap, Trash2, CheckCircle2, Circle, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchBar } from "@/components/common/SearchBar";
import { EmbeddableWidget } from "@/components/common/EmbeddableWidget";
import { StickyLivePreview } from "@/components/ui/StickyLivePreview";
import { SearchBarLivePreview } from "@/components/ui/SearchBarLivePreview";
import { cn, copyToClipboard } from "@/lib/utils";
import { chatAPI, searchAPI } from "@/services/api/api";
import ChatMessage from "@/components/common/ChatMessage";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Suspense, lazy } from "react";
import { TypingAnimation } from "@/components/common/TypingIndicator";
import TypingIndicator from "@/components/common/TypingIndicator";
import { useSearch } from "@/hooks/useSearch";
import { useChat, useChatSessions } from "@/hooks/useChat";
import { usePerformanceMetrics } from "@/contexts/RAGSettingsContext";
import { Message } from "@/types/components";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import "@/components/common/EmbeddableWidgetStyles.css";
// 📝 Import markdown support for proper formatting
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { safeStringConversion } from "@/utils/safeStringConversion";
// 🎨 Import syntax highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/contexts/ThemeContext";

// Lazy load heavy chat components for search test tab
const LazySearchBar = lazy(() => import("@/components/common/SearchBar"));
const LazyChatMessage = lazy(() => import("@/components/common/ChatMessage"));

interface ChatHistory {
  id: string;
  date: string;
  category: string;
  query: string;
  response: string;
  status: "success" | "error" | "pending";
}

interface ConversationMessage {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  messageId?: string;
  sessionId?: string;
  citations?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  topK?: number; // Top-K value from API or calculated from citations
}

interface Conversation {
  sessionId: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  userName?: string;
  messageType?: string;
  messages: ConversationMessage[];
}

// Prompt Edit Tab Component - isolated to use prompt API only here
function PromptEditTab() {
  const [localPrompt, setLocalPrompt] = useState("You are a helpful AI assistant...");
  
  // Search Prompt hook - used for Search Configuration prompt
  const {
    promptString,
    isLoading: isLoadingPrompt,
    savePromptAsync,
    isSaving: isSavingPrompt,
  } = useSearchPrompt();
  
  // Get current prompt text for Overview tab display
  const currentPrompt = promptString || "";

  // Populate local prompt from API data when promptString is loaded
  useEffect(() => {
    if (promptString && typeof promptString === 'string') {
      setLocalPrompt(promptString);
    } else if (promptString && typeof promptString === 'object') {
      // Handle case where API returns object instead of string
      const extractedString = (promptString as any).system_prompt || (promptString as any).data || String(promptString);
      if (typeof extractedString === 'string') {
        setLocalPrompt(extractedString);
      }
    }
  }, [promptString]);

  const handleSavePrompt = useCallback(async () => {
    try {
      await savePromptAsync({
        system_prompt: localPrompt,
      });
    } catch (error) {
      console.error("Failed to save prompt:", error);
      // Error toast is handled in the hook
    }
  }, [localPrompt, savePromptAsync]);

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Prompt Edit */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Prompt Edit
          </CardTitle>
            <CardDescription>
              Customize the system prompt for your search configuration
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPrompt ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading prompt...
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={typeof localPrompt === 'string' ? localPrompt : String(localPrompt || '')}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  className="mt-2 min-h-[200px] font-mono text-sm"
                  placeholder="Enter your system prompt..."
                  disabled={isSavingPrompt}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt defines the chatbot's behavior and personality
                </p>
              </div>
              <Button 
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await handleSavePrompt();
                }}
                disabled={isSavingPrompt || isLoadingPrompt}
              >
                {isSavingPrompt ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Prompt
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}

export default function SearchConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // 🎨 Get theme for syntax highlighting and search bar styling
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Citation formatting - use search citation API for Search Configuration tab
  const {
    formatting: searchCitationFormatting,
    isLoading: isLoadingSearchCitation,
    updateFormatting: updateSearchCitation,
    saveCitationAsync,
    isSaving: isSavingSearchCitation,
    refetch: refetchSearchCitation,
  } = useSearchCitation();
  
  // Keep the original context for other uses (like ChatMessage component)
  const { formatting: contextFormatting, updateFormatting: updateContextFormatting, resetFormatting } = useCitationFormatting();
  
  // Use search citation for the Citation Formatting tab, context for other components
  const formatting = searchCitationFormatting || contextFormatting;
  const updateFormatting = (newFormatting: any) => {
    if (searchCitationFormatting) {
      updateSearchCitation(newFormatting);
    } else {
      updateContextFormatting(newFormatting);
    }
  };
  const {
    orgName: orgNameGlobal,
    widgetZIndex: widgetZIndexGlobal,
    widgetPosition: widgetPositionGlobal,
    widgetOffsetX: widgetOffsetXGlobal,
    widgetOffsetY: widgetOffsetYGlobal,
    widgetLogoUrl: widgetLogoUrlGlobal,
    widgetAvatar: widgetAvatarGlobal,
    widgetAvatarSize: widgetAvatarSizeGlobal,
    widgetChatbotColor: widgetChatbotColorGlobal,
    widgetShowLogo: widgetShowLogoGlobal,
    widgetShowDateTime: widgetShowDateTimeGlobal,
    widgetBottomSpace: widgetBottomSpaceGlobal,
    widgetFontSize: widgetFontSizeGlobal,
    widgetTriggerBorderRadius: widgetTriggerBorderRadiusGlobal,
    setBranding,
  } = useBranding();
  const { settings: ragSettings, updateSettings: updateRAGSettings } = useRAGSettings();
  const { saveSettingsAsync, isSaving } = useSettingsAPI();
  const { 
    settings: chatbotSettings, 
    isLoading: isLoadingChatbotSettings,
    saveConfigurationAsync,
    saveCustomizationAsync,
    isSavingConfiguration,
    isSavingCustomization,
    refetchSettings,
  } = useChatbotSettings();
  const [activeTab, setActiveTab] = useState("training");
  const [settingsSubTab, setSettingsSubTab] = useState("overview");
  const [trainingSubTab, setTrainingSubTab] = useState("overview");
  
  // Widget preview state
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  
  // Ref for widget customization tab content
  const widgetCustomizationRef = useRef<HTMLDivElement>(null);

  // Auto-open widget preview when entering configuration or customization tabs
  useEffect(() => {
    if (settingsSubTab === "search-configuration" || settingsSubTab === "search-customization") {
      setIsWidgetOpen(true);
    }
  }, [settingsSubTab]);

  // Prevent scrolling when tab changes
  useEffect(() => {
    // Save scroll position before any potential scroll
    const scrollY = window.scrollY;
    
    // Use requestAnimationFrame to restore scroll position after React updates
    const timeoutId = setTimeout(() => {
      if (window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY);
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [settingsSubTab, trainingSubTab]);

  // Helper function to prevent scrolling on button clicks for settings tabs
  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, tab: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Save current scroll position
    const scrollY = window.scrollY;
    setSettingsSubTab(tab);
    // Restore scroll position immediately after state update
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  // Helper function to prevent scrolling on button clicks for training tabs
  const handleTrainingTabClick = (e: React.MouseEvent<HTMLButtonElement>, tab: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Save current scroll position
    const scrollY = window.scrollY;
    setTrainingSubTab(tab);
    // Restore scroll position immediately after state update
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  const preventScrollOnClick = {
    onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.target.blur();
    },
  };

  // Handle Tabs component value change to prevent scrolling
  const handleTabsValueChange = (value: string) => {
    const scrollY = window.scrollY;
    setSettingsSubTab(value);
    // Restore scroll position after tab change
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  // Chatbot Activation hook
  const {
    isActive,
    isLoading: isLoadingActivation,
    updateActivationAsync,
    isUpdating: isUpdatingActivation,
    refetchActivation,
  } = useSearchActivation();

  // Search Prompt hook - for Overview tab real-time display
  const {
    promptString,
    isLoading: isLoadingPromptForOverview,
    refetchPrompt,
  } = useSearchPrompt();
  
  // Get current prompt text for Overview tab - real-time from API
  // Ensure it's always a string to prevent .split() errors
  const currentPrompt = typeof promptString === 'string' ? promptString : (promptString || "");

  // Training Tab State
  const [responseType, setResponseType] = useState<"long" | "short">("long");
  
  /**
   * Validates maxTokens based on response type
   * @param maxTokens - The maxTokens value to validate (can be null/undefined/0)
   * @param responseType - The selected response type ('long' | 'short')
   * @returns Error message string if invalid, null if valid
   */
  const validateMaxTokens = useCallback((
    maxTokens: number | null | undefined, 
    responseType: 'long' | 'short'
  ): string | null => {
    // If maxTokens is 0, null, or undefined, validation passes (backend will use defaults)
    if (maxTokens === null || maxTokens === undefined || maxTokens === 0) {
      return null;
    }
    
    // Validate based on response type
    if (responseType === 'long' && maxTokens < 400) {
      return `maxTokens for LONG response must be at least 400. You provided ${maxTokens}. Please increase maxTokens to at least 400.`;
    }
    
    if (responseType === 'short' && maxTokens < 200) {
      return `maxTokens for SHORT response must be at least 200. You provided ${maxTokens}. Please increase maxTokens to at least 200.`;
    }
    
    return null; // Valid
  }, []);
  
  // Fetch response config from API
  const { data: responseConfig, isLoading: isLoadingResponseConfig, refetch: refetchResponseConfig } = useQuery({
    queryKey: ['responseConfig'],
    queryFn: async () => {
      const config = await searchAPI.getResponseConfig();
      const configValue = typeof config === 'string' ? config : (config as any)?.response_type || 'long';
      return configValue;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Sync responseType state with query data whenever it changes
  useEffect(() => {
    if (responseConfig) {
      const configValue = typeof responseConfig === 'string' ? responseConfig : (responseConfig as any)?.response_type || 'long';
      setResponseType(configValue as "long" | "short");
    }
  }, [responseConfig]);
  
  const [chatHistorySearch, setChatHistorySearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Chat History State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Search Test Tab State (RAG Tuning)
  const { metrics, updateMetrics } = usePerformanceMetrics();
  const { searchAsync, isSearching } = useSearch();
  const { sendMessageAsync, isSending } = useChat();
  // Note: useChatSessions is kept for chat functionality, but search uses searchAPI.getSearchHistory
  // const { sessions, deleteSession } = useChatSessions();
  const [location] = useLocation();
  const [ragMessages, setRagMessages] = useState<Message[]>([]); // Start with empty - only show last query/response
  const [isLoadingRagHistory, setIsLoadingRagHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const ragMessagesEndRef = useRef<HTMLDivElement>(null);
  const ragSearchInputRef = useRef<HTMLInputElement>(null);
  const [ragSearchInput, setRagSearchInput] = useState("");
  const [ragSearchFocused, setRagSearchFocused] = useState(false);
  const [ragSearchError, setRagSearchError] = useState("");
  const [localSearchHistory, setLocalSearchHistory] = useState<string[]>([]); // Track local searches for immediate feedback
  const [maxTokensError, setMaxTokensError] = useState<string | null>(null);

  // Settings Tab State (CSP removed per user request)
  
  // Config Models hook (for chatbot - keep as is)
  const {
    configModels: chatbotConfigModels,
    isLoading: isLoadingChatbotConfigModels,
    saveConfigModelsAsync: saveChatbotConfigModelsAsync,
    isSaving: isSavingChatbotConfigModels,
  } = useConfigModels();
  
  // Search Config Models hook (for search configuration)
  const {
    configModels,
    isLoading: isLoadingConfigModels,
    saveConfigModelsAsync,
    isSaving: isSavingConfigModels,
    refetchConfigModels,
  } = useSearchConfigModels();
  
  // Model settings state - populated from API
  const [modelProvider, setModelProvider] = useState("openai");
  const [chatModel, setChatModel] = useState("gpt-4");
  const [embeddingModel, setEmbeddingModel] = useState("");
  const [modelApiKey, setModelApiKey] = useState("");
  const hasPopulatedApiKey = useRef(false); // Track if we've populated API key from API
  
  // Model parameters state
  const [temperature, setTemperature] = useState<string | null>(null);
  const [topP, setTopP] = useState<string | null>(null);
  const [bestOf, setBestOf] = useState<number | null>(null);
  const [frequencyPenalty, setFrequencyPenalty] = useState<string | null>(null);
  const [presencePenalty, setPresencePenalty] = useState<string | null>(null);
  const [topK, setTopK] = useState<number | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState<number | null>(null);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [useReranker, setUseReranker] = useState<boolean | null>(null);
  
  // Get all available models (providers list)
  const { providers, isLoading: isLoadingProviders } = useAvailableModels();
  
  // Get available chat models for the selected provider
  const {
    availableModels: availableChatModels,
  } = useAvailableChatModels(modelProvider);
  
  // Get available embedding models for the selected provider
  const {
    availableModels: availableEmbeddingModels,
  } = useAvailableEmbeddingModels(modelProvider);
  
  // Widget positioning state
  const [widgetZIndex, setWidgetZIndex] = useState(widgetZIndexGlobal || 50);
  const [widgetPosition, setWidgetPosition] = useState(widgetPositionGlobal || "bottom-right");
  const [widgetOffsetX, setWidgetOffsetX] = useState(widgetOffsetXGlobal || 0);
  const [widgetOffsetY, setWidgetOffsetY] = useState(widgetOffsetYGlobal || 0);
  
  // Widget customization state
  const [widgetLogoUrl, setWidgetLogoUrl] = useState<string | null>(widgetLogoUrlGlobal || null);
  const [widgetLogoFileName, setWidgetLogoFileName] = useState<string>("");
  const [widgetAvatar, setWidgetAvatar] = useState(widgetAvatarGlobal || "default-1");
  const [widgetAvatarSize, setWidgetAvatarSize] = useState(widgetAvatarSizeGlobal || 38);
  const [widgetChatbotColor, setWidgetChatbotColor] = useState(widgetChatbotColorGlobal || "#1F2937");
  const [widgetShowLogo, setWidgetShowLogo] = useState(widgetShowLogoGlobal !== undefined ? widgetShowLogoGlobal : true);
  const [widgetShowDateTime, setWidgetShowDateTime] = useState(widgetShowDateTimeGlobal !== undefined ? widgetShowDateTimeGlobal : true);
  const [widgetBottomSpace, setWidgetBottomSpace] = useState(widgetBottomSpaceGlobal || 15);
  const [widgetFontSize, setWidgetFontSize] = useState(widgetFontSizeGlobal || 14);
  const [widgetTriggerBorderRadius, setWidgetTriggerBorderRadius] = useState(widgetTriggerBorderRadiusGlobal || 50); // Default 50px for circular

  // Chatbot configuration state (for new Configuration tab)
  const [chatbotTitle, setChatbotTitle] = useState(orgNameGlobal || "RAGSuite Demo");
  const [bubbleMessage, setBubbleMessage] = useState("Bubble Message");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi, how can I help you?");
  const [chatbotLanguage, setChatbotLanguage] = useState("en");
  
  // Fetch search configuration from API
  const { data: searchConfigData, isLoading: isLoadingSearchConfig, refetch: refetchSearchConfig } = useQuery({
    queryKey: ['search-configuration'],
    queryFn: () => searchAPI.getSearchConfiguration(),
    refetchOnWindowFocus: false,
  });

  // Fetch search customization from API
  const { data: searchCustomizationData, isLoading: isLoadingSearchCustomization, refetch: refetchSearchCustomization } = useQuery({
    queryKey: ['search-customization'],
    queryFn: () => searchAPI.getSearchCustomization(),
    refetchOnWindowFocus: false,
  });

  // Search configuration state - Load from API or use defaults
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLanguage, setSearchLanguage] = useState("en");
  const [searchStyleOption, setSearchStyleOption] = useState("default");
  const [searchIcon, setSearchIcon] = useState("search");
  const [searchLoaderType, setSearchLoaderType] = useState("skeleton");
  const [showLoaderPreview, setShowLoaderPreview] = useState(false);
  const prevSearchLoaderTypeRef = useRef("skeleton");
  const [searchBackgroundColor, setSearchBackgroundColor] = useState("#d5d4d4");
  const [searchBorderRadius, setSearchBorderRadius] = useState("semi-rounded");
  const [searchResultStyle, setSearchResultStyle] = useState("list");
  
  // Saved search configuration state - Only updated when save is clicked
  const [savedSearchTitle, setSavedSearchTitle] = useState("");
  const [savedSearchLanguage, setSavedSearchLanguage] = useState("en");
  const [savedSearchStyleOption, setSavedSearchStyleOption] = useState("default");
  const [savedSearchIcon, setSavedSearchIcon] = useState("search");
  const [savedSearchLoaderType, setSavedSearchLoaderType] = useState("skeleton");
  const [savedSearchBackgroundColor, setSavedSearchBackgroundColor] = useState("#d5d4d4");
  const [savedSearchBorderRadius, setSavedSearchBorderRadius] = useState("semi-rounded");
  const [savedSearchResultStyle, setSavedSearchResultStyle] = useState("list");
  
  // Search customization state - Load from API or use defaults
  const [searchFormType, setSearchFormType] = useState("default");
  const [searchButtonType, setSearchButtonType] = useState("icon");
  const [buttonTypeError, setButtonTypeError] = useState<string>("");
  const [searchIconError, setSearchIconError] = useState<string>("");
  const [searchButtonText, setSearchButtonText] = useState("Search");
  const [searchInputPlaceholder, setSearchInputPlaceholder] = useState("");
  const [searchRecentSearch, setSearchRecentSearch] = useState(false);
  const [searchRecentSearchTitle, setSearchRecentSearchTitle] = useState("");
  const [showRecentSearchPreview, setShowRecentSearchPreview] = useState(false);
  const prevSearchRecentSearchRef = useRef(false);
  const [searchPredefinedQuestions, setSearchPredefinedQuestions] = useState(false);
  const [searchQuestionsPosition, setSearchQuestionsPosition] = useState("below-search");
  const [searchQuestionsLimit, setSearchQuestionsLimit] = useState(5);
  const [searchQuestionsList, setSearchQuestionsList] = useState<string[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  
  // Saved search customization state - Only updated when save is clicked
  const [savedSearchFormType, setSavedSearchFormType] = useState("default");
  const [savedSearchButtonType, setSavedSearchButtonType] = useState("icon");
  const [savedSearchButtonText, setSavedSearchButtonText] = useState("Search");
  const [savedSearchInputPlaceholder, setSavedSearchInputPlaceholder] = useState("");
  const [savedSearchRecentSearch, setSavedSearchRecentSearch] = useState(false);
  const [savedSearchRecentSearchTitle, setSavedSearchRecentSearchTitle] = useState("");
  const [savedSearchPredefinedQuestions, setSavedSearchPredefinedQuestions] = useState(false);
  const [savedSearchQuestionsPosition, setSavedSearchQuestionsPosition] = useState("below-search");
  const [savedSearchQuestionsLimit, setSavedSearchQuestionsLimit] = useState(5);
  const [savedSearchQuestionsList, setSavedSearchQuestionsList] = useState<string[]>([]);

  // Load configuration data from API
  useEffect(() => {
    if (searchConfigData) {
      setSearchTitle(searchConfigData.title || "");
      setSearchLanguage(searchConfigData.language || "en");
      setSearchStyleOption(searchConfigData.styleOption || "default");
      setSearchIcon(searchConfigData.searchIcon || "search");
      setSearchLoaderType(searchConfigData.loaderType || "skeleton");
      setSearchBackgroundColor(searchConfigData.background || "#d5d4d4");
      setSearchBorderRadius(searchConfigData.borderRadius || "semi-rounded");
      setSearchResultStyle(searchConfigData.resultStyle || "list");
      
      // Also initialize saved state with same values
      setSavedSearchTitle(searchConfigData.title || "");
      setSavedSearchLanguage(searchConfigData.language || "en");
      setSavedSearchStyleOption(searchConfigData.styleOption || "default");
      setSavedSearchIcon(searchConfigData.searchIcon || "search");
      setSavedSearchLoaderType(searchConfigData.loaderType || "skeleton");
      setSavedSearchBackgroundColor(searchConfigData.background || "#d5d4d4");
      setSavedSearchBorderRadius(searchConfigData.borderRadius || "semi-rounded");
      setSavedSearchResultStyle(searchConfigData.resultStyle || "list");
    }
  }, [searchConfigData]);

  // Load customization data from API
  useEffect(() => {
    if (searchCustomizationData) {
      setSearchFormType(searchCustomizationData.searchFormType || "default");
      setSearchButtonType(searchCustomizationData.buttonType || "icon");
      setSearchButtonText(searchCustomizationData.searchButtonText || "Search");
      setSearchInputPlaceholder(searchCustomizationData.searchInputPlaceholder || "");
      setSearchRecentSearch(searchCustomizationData.recentSearch ?? false);
      setSearchRecentSearchTitle(searchCustomizationData.recentSearchTitle || "");
      setSearchPredefinedQuestions(searchCustomizationData.predefinedQuestions ?? false);
      setSearchQuestionsPosition(searchCustomizationData.questionsPosition || "below-search");
      setSearchQuestionsLimit(searchCustomizationData.questionsLimit || 5);
      setSearchQuestionsList(searchCustomizationData.questions || []);
      
      // Also initialize saved state with same values
      setSavedSearchFormType(searchCustomizationData.searchFormType || "default");
      setSavedSearchButtonType(searchCustomizationData.buttonType || "icon");
      setSavedSearchButtonText(searchCustomizationData.searchButtonText || "Search");
      setSavedSearchInputPlaceholder(searchCustomizationData.searchInputPlaceholder || "");
      setSavedSearchRecentSearch(searchCustomizationData.recentSearch ?? false);
      setSavedSearchRecentSearchTitle(searchCustomizationData.recentSearchTitle || "");
      setSavedSearchPredefinedQuestions(searchCustomizationData.predefinedQuestions ?? false);
      setSavedSearchQuestionsPosition(searchCustomizationData.questionsPosition || "below-search");
      setSavedSearchQuestionsLimit(searchCustomizationData.questionsLimit || 5);
      setSavedSearchQuestionsList(searchCustomizationData.questions || []);
    }
  }, [searchCustomizationData]);

  // Mutation for saving search configuration
  const saveConfigMutation = useMutation({
    mutationFn: (config: {
      title?: string;
      language?: string;
      styleOption?: string;
      searchIcon?: string;
      loaderType?: string;
      background?: string;
      borderRadius?: string;
      resultStyle?: string;
    }) => searchAPI.saveSearchConfiguration(config),
    onSuccess: () => {
      // Update saved state with current values
      setSavedSearchTitle(searchTitle);
      setSavedSearchLanguage(searchLanguage);
      setSavedSearchStyleOption(searchStyleOption);
      setSavedSearchIcon(searchIcon);
      setSavedSearchLoaderType(searchLoaderType);
      setSavedSearchBackgroundColor(searchBackgroundColor);
      setSavedSearchBorderRadius(searchBorderRadius);
      setSavedSearchResultStyle(searchResultStyle);
      
      toast({
        title: "Configuration Saved",
        description: "Search box configuration has been saved successfully.",
        variant: "success",
      });
      refetchSearchConfig();
    },
    onError: (error) => {
      console.error("Failed to save search configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save search configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for saving search customization
  const saveCustomizationMutation = useMutation({
    mutationFn: (customization: {
      searchFormType?: string;
      buttonType?: string;
      searchButtonText?: string;
      searchInputPlaceholder?: string;
      recentSearch?: boolean;
      recentSearchTitle?: string;
      predefinedQuestions?: boolean;
      questionsPosition?: string;
      questionsLimit?: number;
      questions?: string[];
    }) => searchAPI.saveSearchCustomization(customization),
    onSuccess: () => {
      // Update saved state with current values
      setSavedSearchFormType(searchFormType);
      setSavedSearchButtonType(searchButtonType);
      setSavedSearchButtonText(searchButtonText);
      setSavedSearchInputPlaceholder(searchInputPlaceholder);
      setSavedSearchRecentSearch(searchRecentSearch);
      setSavedSearchRecentSearchTitle(searchRecentSearchTitle);
      setSavedSearchPredefinedQuestions(searchPredefinedQuestions);
      setSavedSearchQuestionsPosition(searchQuestionsPosition);
      setSavedSearchQuestionsLimit(searchQuestionsLimit);
      setSavedSearchQuestionsList(searchQuestionsList);
      
      toast({
        title: "Customization Saved",
        description: "Search box customization has been saved successfully.",
        variant: "success",
      });
      refetchSearchCustomization();
    },
    onError: (error) => {
      console.error("Failed to save search customization:", error);
      toast({
        title: "Error",
        description: "Failed to save search customization. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Ref for configuration tab content
  const configurationRef = useRef<HTMLDivElement>(null);
  
  const widgetLogoFileRef = useRef<HTMLInputElement>(null);
  const widgetAvatarFileRef = useRef<HTMLInputElement>(null);
  
  // Custom color and gradient state
  const [customColor, setCustomColor] = useState("#1F2937");
  const [customGradientColor1, setCustomGradientColor1] = useState("#667eea");
  const [customGradientColor2, setCustomGradientColor2] = useState("#764ba2");
  const [customGradientAngle, setCustomGradientAngle] = useState(135);
  const [colorMode, setColorMode] = useState<"predefined" | "custom" | "gradient">("predefined");
  
  // Avatar options (you can add more or use image URLs)
  const avatarOptions = [
    { id: "default-1", name: "Default 1", image: "/avatars/avatar-1.png" },
    { id: "default-2", name: "Default 2", image: "/avatars/avatar-2.png" },
    { id: "default-3", name: "Default 3", image: "/avatars/avatar-3.png" },
    { id: "default-4", name: "Default 4", image: "/avatars/avatar-4.png" }
  ];
  
  // Chatbot color options
  const chatbotColors = [
    { value: "#1F2937", name: "Dark Gray", color: "#1F2937" },
    { value: "#10B981", name: "Green", color: "#10B981" },
    { value: "#F59E0B", name: "Orange", color: "#F59E0B" },
    { value: "#8B5CF6", name: "Purple", color: "#8B5CF6" },
    { value: "#3B82F6", name: "Blue", color: "#3B82F6" },
    { value: "gradient", name: "Gradient", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  ];
  
  const handleWidgetLogoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWidgetLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setWidgetLogoUrl(result);
      // Don't update BrandingContext - only update on save
      toast({ title: "Widget logo uploaded", description: "Widget logo will be saved when you click Save.", variant: "success" });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveWidgetLogo = () => {
    setWidgetLogoUrl(null);
    setWidgetLogoFileName("");
    // Don't update BrandingContext - only update on save
    if (widgetLogoFileRef.current) widgetLogoFileRef.current.value = "";
  };
  
  const handleWidgetAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setWidgetAvatar(result); // Store as data URL
      toast({ title: "Custom avatar uploaded", description: "Custom avatar will be saved when you click Save.", variant: "success" });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveCustomAvatar = () => {
    // Reset to default avatar
    setWidgetAvatar("default-1");
    if (widgetAvatarFileRef.current) widgetAvatarFileRef.current.value = "";
  };
  
  const isCustomAvatar = widgetAvatar && !widgetAvatar.startsWith("default-") && (widgetAvatar.startsWith("http") || widgetAvatar.startsWith("data:"));
  
  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setWidgetChatbotColor(color);
    setColorMode("custom");
  };
  
  const handleCustomGradientApply = () => {
    const gradient = `linear-gradient(${customGradientAngle}deg, ${customGradientColor1} 0%, ${customGradientColor2} 100%)`;
    setWidgetChatbotColor(gradient);
    setColorMode("gradient");
  };
  
  const isCustomGradient = widgetChatbotColor && widgetChatbotColor.startsWith("linear-gradient");
  
  // Auto-detect current mode based on selected color
  useEffect(() => {
    if (isCustomGradient) {
      setColorMode("gradient");
      // Parse existing gradient if any
      const match = widgetChatbotColor.match(/linear-gradient\((\d+)deg,\s*([^)]+)\)/);
      if (match) {
        setCustomGradientAngle(parseInt(match[1]));
        const colors = match[2].split(',').map(c => c.trim());
        if (colors[0]) setCustomGradientColor1(colors[0].split(' ')[0]);
        if (colors[1]) setCustomGradientColor2(colors[1].split(' ')[0]);
      }
    } else if (!chatbotColors.some(c => c.value === widgetChatbotColor)) {
      setColorMode("custom");
      setCustomColor(widgetChatbotColor);
    } else {
      setColorMode("predefined");
    }
  }, [widgetChatbotColor]);

  // Populate state from API data when chatbotSettings is loaded - Real-time sync
  useEffect(() => {
    if (chatbotSettings) {
      // Populate configuration state - ONLY from chatbot settings, never from prompt
      // IMPORTANT: System prompt is completely separate and must NEVER affect these fields
      if (chatbotSettings.configuration) {
        const config = chatbotSettings.configuration;
        // Filter out prompt-like text from title (safeguard against backend issues)
        if (config.chatbot_title) {
          const cleanTitle = config.chatbot_title.trim();
          if (cleanTitle && !cleanTitle.toLowerCase().includes('_prompt') && !cleanTitle.toLowerCase().startsWith('pretend you are')) {
            setChatbotTitle(cleanTitle);
          }
        }
        if (config.bubble_message !== undefined) setBubbleMessage(config.bubble_message);
        if (config.welcome_message !== undefined) setWelcomeMessage(config.welcome_message);
        if (config.chatbot_language) setChatbotLanguage(config.chatbot_language);
      }

      // Populate customization state
      if (chatbotSettings.customization) {
        const custom = chatbotSettings.customization;
        if (custom.widget_logo_url !== undefined) setWidgetLogoUrl(custom.widget_logo_url || null);
        if (custom.widget_avatar !== undefined) setWidgetAvatar(custom.widget_avatar);
        if (custom.widget_avatar_size !== undefined) setWidgetAvatarSize(custom.widget_avatar_size);
        if (custom.widget_chatbot_color !== undefined) setWidgetChatbotColor(custom.widget_chatbot_color);
        if (custom.widget_show_logo !== undefined) setWidgetShowLogo(custom.widget_show_logo);
        if (custom.widget_show_date_time !== undefined) setWidgetShowDateTime(custom.widget_show_date_time);
        if (custom.widget_bottom_space !== undefined) setWidgetBottomSpace(custom.widget_bottom_space);
        if (custom.widget_font_size !== undefined) setWidgetFontSize(custom.widget_font_size);
        if (custom.widget_trigger_border_radius !== undefined) setWidgetTriggerBorderRadius(custom.widget_trigger_border_radius);
        if (custom.widget_position !== undefined) {
          const validPositions = ["bottom-right", "bottom-left", "top-right", "top-left"] as const;
          if (validPositions.includes(custom.widget_position as typeof validPositions[number])) {
            setWidgetPosition(custom.widget_position as typeof validPositions[number]);
          }
        }
        if (custom.widget_z_index !== undefined) setWidgetZIndex(custom.widget_z_index);
        if (custom.widget_offset_x !== undefined) setWidgetOffsetX(custom.widget_offset_x);
        if (custom.widget_offset_y !== undefined) setWidgetOffsetY(custom.widget_offset_y);
      }
    }
  }, [chatbotSettings]);
  
  // Refetch chatbot settings when Settings Overview tab becomes active for real-time updates
  useEffect(() => {
    if (activeTab === 'settings' && settingsSubTab === 'overview' && refetchSettings) {
      refetchSettings();
    }
  }, [activeTab, settingsSubTab, refetchSettings]);
  
  // Refetch all Training Overview data when Training Overview tab becomes active for real-time updates
  useEffect(() => {
    if (activeTab === 'training' && trainingSubTab === 'overview') {
      // Refetch activation status
      if (refetchActivation) refetchActivation();
      // Refetch prompt
      if (refetchPrompt) refetchPrompt();
      // Refetch response config
      if (refetchResponseConfig) refetchResponseConfig();
      // Refetch citation formatting (for Settings Overview, but also available here)
      if (refetchSearchCitation) refetchSearchCitation();
    }
  }, [activeTab, trainingSubTab, refetchActivation, refetchPrompt, refetchResponseConfig, refetchSearchCitation]);

  // Populate state from API data when configModels is loaded - Real-time sync
  useEffect(() => {
    if (configModels) {
      if (configModels.model_provider) setModelProvider(configModels.model_provider);
      // Use search_model if available, otherwise fall back to chat_model
      const modelToUse = configModels.search_model || configModels.chat_model;
      if (modelToUse) setChatModel(modelToUse);
      if (configModels.embedding_model) setEmbeddingModel(configModels.embedding_model);
      // Populate API key if it exists in the response (only on initial load, but allow updates if key changes)
      if (configModels.api_key && configModels.api_key.trim() !== '') {
        // Only update if the key actually changed to avoid overwriting user edits
        if (modelApiKey !== configModels.api_key) {
          setModelApiKey(configModels.api_key);
          hasPopulatedApiKey.current = true;
        }
      }
      // Populate response_type
      if (configModels.response_type && (configModels.response_type === "long" || configModels.response_type === "short")) {
        setResponseType(configModels.response_type);
      }
      // Populate new model parameters - Use search_* fields if available, otherwise fall back to chat_* fields
      const temperatureToUse = configModels.search_temperature !== undefined ? configModels.search_temperature : configModels.chat_temperature;
      if (temperatureToUse !== undefined) setTemperature(temperatureToUse);
      const topPToUse = configModels.search_top_p !== undefined ? configModels.search_top_p : configModels.chat_top_p;
      if (topPToUse !== undefined) setTopP(topPToUse);
      const bestOfToUse = configModels.search_best_of !== undefined ? configModels.search_best_of : configModels.chat_best_of;
      if (bestOfToUse !== undefined) setBestOf(bestOfToUse);
      const frequencyPenaltyToUse = configModels.search_frequency_penalty !== undefined ? configModels.search_frequency_penalty : configModels.chat_frequency_penalty;
      if (frequencyPenaltyToUse !== undefined) setFrequencyPenalty(frequencyPenaltyToUse);
      const presencePenaltyToUse = configModels.search_presence_penalty !== undefined ? configModels.search_presence_penalty : configModels.chat_presence_penalty;
      if (presencePenaltyToUse !== undefined) setPresencePenalty(presencePenaltyToUse);
      
      // Populate RAG settings from search_* fields
      if (configModels.search_top_k !== undefined && configModels.search_top_k !== null) {
        updateRAGSettings({ topK: configModels.search_top_k });
      }
      if (configModels.search_similarity_threshold !== undefined && configModels.search_similarity_threshold !== null) {
        updateRAGSettings({ similarityThreshold: configModels.search_similarity_threshold });
      }
      if (configModels.search_max_tokens !== undefined && configModels.search_max_tokens !== null) {
        updateRAGSettings({ maxTokens: configModels.search_max_tokens });
      }
      if (configModels.search_use_reranker !== undefined && configModels.search_use_reranker !== null) {
        updateRAGSettings({ useReranker: configModels.search_use_reranker });
      }
      
      // Fallback to chat_* fields if search_* fields are not available
      if (configModels.chat_top_k !== undefined && configModels.search_top_k === undefined) {
        setTopK(configModels.chat_top_k);
      }
      if (configModels.chat_similarity_threshold !== undefined && configModels.search_similarity_threshold === undefined) {
        setSimilarityThreshold(configModels.chat_similarity_threshold);
      }
      if (configModels.chat_max_tokens !== undefined && configModels.search_max_tokens === undefined) {
        setMaxTokens(configModels.chat_max_tokens);
      }
      if (configModels.chat_use_reranker !== undefined && configModels.search_use_reranker === undefined) {
        setUseReranker(configModels.chat_use_reranker);
      }
    }
  }, [configModels, updateRAGSettings]);
  
  // Refetch model settings when Settings Overview tab becomes active for real-time updates
  useEffect(() => {
    if (activeTab === 'settings' && settingsSubTab === 'overview' && refetchConfigModels) {
      refetchConfigModels();
    }
  }, [activeTab, settingsSubTab, refetchConfigModels]);
  
  // Reset chat model when provider changes (if current model is not in the new provider's list)
  useEffect(() => {
    if (modelProvider && availableChatModels.length > 0 && !availableChatModels.includes(chatModel)) {
      // Reset to first available model or empty if no models available
      setChatModel(availableChatModels[0] || "");
    }
  }, [modelProvider, availableChatModels, chatModel]); // Only run when provider or availableChatModels change
  
  // Reset embedding model when provider changes (if current model is not in the new provider's list)
  useEffect(() => {
    if (modelProvider && availableEmbeddingModels.length > 0 && embeddingModel && !availableEmbeddingModels.includes(embeddingModel)) {
      // Reset to first available model or empty if no models available
      setEmbeddingModel(availableEmbeddingModels[0] || "");
    }
  }, [modelProvider, availableEmbeddingModels, embeddingModel]); // Only run when provider or availableEmbeddingModels change
  
  // Auto-populate API key when provider is ollama
  useEffect(() => {
    if (modelProvider && modelProvider.toLowerCase() === "ollama") {
      // Set static API key for ollama provider (only if field is empty)
      if (!modelApiKey || modelApiKey.trim() === "") {
        setModelApiKey("rag-suite_6f7jmIv8KzzTrpgxYSwyxDbz5GfWX5jp4YovLEHWJ4naao1R");
      }
    } else if (modelProvider && modelProvider.toLowerCase() !== "ollama") {
      // Clear API key when switching away from ollama (only if it was the static ollama key)
      if (modelApiKey === "rag-suite_6f7jmIv8KzzTrpgxYSwyxDbz5GfWX5jp4YovLEHWJ4naao1R") {
        setModelApiKey("");
      }
    }
  }, [modelProvider]); // Only run when provider changes

  // Integrations Tab State
  const [webScript, setWebScript] = useState(`<!-- Chatbot Widget Script -->
<script>
  (function() {
    // Chatbot initialization code
    window.ChatbotWidget = {
      init: function(config) {
        // Initialize chatbot
      }
    };
  })();
</script>`);
  const [mobileScript, setMobileScript] = useState(`// Mobile SDK Integration
import ChatbotSDK from '@company/chatbot-sdk';

const chatbot = new ChatbotSDK({
  apiKey: 'YOUR_API_KEY',
  endpoint: 'https://api.example.com'
});

chatbot.init();`);

  // Mock chat history data
  const mockChatHistory: ChatHistory[] = [
    {
      id: "1",
      date: "2024-01-15",
      category: "General",
      query: "What is AI?",
      response: "AI stands for Artificial Intelligence...",
      status: "success",
    },
    {
      id: "2",
      date: "2024-01-14",
      category: "Technical",
      query: "How does machine learning work?",
      response: "Machine learning is a subset of AI...",
      status: "success",
    },
    {
      id: "3",
      date: "2024-01-13",
      category: "Support",
      query: "Help with configuration",
      response: "I can help you configure...",
      status: "success",
    },
  ];

  const filteredChatHistory = useMemo(() => {
    let filtered = mockChatHistory;
    
    if (chatHistorySearch) {
      filtered = filtered.filter(
        (item) =>
          item.query.toLowerCase().includes(chatHistorySearch.toLowerCase()) ||
          item.response.toLowerCase().includes(chatHistorySearch.toLowerCase())
      );
    }
    
    if (dateFilter !== "all") {
      filtered = filtered.filter((item) => item.date === dateFilter);
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }
    
    return filtered;
  }, [chatHistorySearch, dateFilter, categoryFilter]);

  const [isSavingResponseConfig, setIsSavingResponseConfig] = useState(false);
  
  const handleSaveTraining = useCallback(async () => {
    try {
      setIsSavingResponseConfig(true);
      await searchAPI.saveResponseConfig(responseType);
      // Invalidate query cache to force fresh fetch
      queryClient.invalidateQueries({ queryKey: ['responseConfig'] });
      // Refetch to update UI
      await refetchResponseConfig();
      toast({
        title: "Response Configuration Saved",
        description: `Response type set to ${responseType === "long" ? "long" : "short"} responses.`,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to save response config:", error);
      toast({
        title: "Failed to Save",
        description: error?.response?.data?.message || "Failed to save response configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingResponseConfig(false);
    }
  }, [responseType, toast, refetchResponseConfig, queryClient]);

  const handleSaveSettings = useCallback(() => {
    toast({
      title: "Settings Saved",
      description: "Your chatbot settings have been saved successfully.",
      variant: "success",
    });
  }, [toast]);

  // Helper function to format date and time
  const formatDateTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Unknown';
    
    // Format as: "26 Dec 2025 12:32" (day month year hour:minute)
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }, []);

  // Helper function to format relative time for display (e.g., "1 months ago")
  const formatRelativeTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }, []);

  // Date filter options
  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "year", label: "Last Year" },
  ];

  // Load chat history from API and group by session
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoadingChatHistory(true);
      const history = await searchAPI.getSearchHistory();
      
      if (history && history.length > 0) {
        // Group messages by sessionId - CRITICAL: Only group messages with matching sessionIds
        const sessionMap = new Map<string, Conversation>();
        
        console.log('📜 Loading Search history, total items:', history.length);
        
        history.forEach((item: any) => {
          // Get sessionId - check both camelCase and snake_case formats
          const sessionId = item.sessionId || item.session_id || null;
          
          // CRITICAL: Skip items without a valid sessionId to prevent mixing sessions
          if (!sessionId || sessionId === 'unknown' || sessionId === 'null' || sessionId === 'undefined') {
            console.warn('⚠️ Skipping message with invalid sessionId:', { item, sessionId });
            return;
          }
          
          // Convert to string for consistent comparison
          const sessionIdStr = String(sessionId);
          
          // Initialize conversation for this sessionId if it doesn't exist
          if (!sessionMap.has(sessionIdStr)) {
            sessionMap.set(sessionIdStr, {
              sessionId: sessionIdStr,
              preview: item.userMessage || '',
              timestamp: new Date(item.createdAt),
              messageCount: 0,
              messageType: item.messageType || 'plugin',
              messages: [],
            });
          }
          
          const conversation = sessionMap.get(sessionIdStr)!;
          
          // CRITICAL: Double-check sessionId matches before adding messages
          // Verify the item's sessionId matches the conversation's sessionId
          const itemSessionId = String(item.sessionId || item.session_id || '');
          if (itemSessionId !== sessionIdStr) {
            console.warn('🚫 Mismatched sessionId - skipping message:', {
              itemSessionId,
              conversationSessionId: sessionIdStr,
              messageContent: item.userMessage?.substring(0, 50)
            });
            return;
          }
          
          // CRITICAL: Only add messages that have BOTH user query AND assistant answer
          // Skip incomplete conversations (queries without answers or answers without queries)
          if (!item.userMessage || !item.assistantResponse) {
            console.warn('⚠️ Skipping incomplete message pair (missing query or answer):', {
              hasUserMessage: !!item.userMessage,
              hasAssistantResponse: !!item.assistantResponse,
              sessionId: sessionIdStr
            });
            return;
          }
          
          // Only add complete message pairs (query + answer)
          conversation.messages.push({
            type: 'user',
            content: item.userMessage,
            timestamp: new Date(item.createdAt),
            messageId: item.messageId || item.message_id,
            sessionId: sessionIdStr, // Store the validated sessionId string
          });
          conversation.messageCount += 1;
          
          conversation.messages.push({
            type: 'assistant',
            content: item.assistantResponse,
            timestamp: new Date(item.createdAt),
            messageId: item.messageId || item.message_id,
            sessionId: sessionIdStr, // Store the validated sessionId string
            citations: item.sources && item.sources.length > 0 
              ? item.sources.map((source: any) => ({
                  title: source.title || 'Untitled',
                  url: source.url || '#',
                  snippet: source.snippet || '',
                }))
              : undefined,
            // Store topK from API response (item.topK is already set from API mapping)
            topK: item.topK || (item.sources?.length || 0),
          });
          conversation.messageCount += 1;
          
          // Update preview to first user message (full text, not truncated)
          if (!conversation.preview && item.userMessage) {
            conversation.preview = item.userMessage;
          }
          
          // Update timestamp to earliest message
          const itemDate = new Date(item.createdAt);
          if (itemDate < conversation.timestamp) {
            conversation.timestamp = itemDate;
          }
        });
        
        // Sort conversations by timestamp (newest first)
        const sortedConversations = Array.from(sessionMap.values()).sort(
          (a: Conversation, b: Conversation) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        
        // Sort messages within each conversation by timestamp (oldest first, newest last)
        // This ensures old messages show at top and new messages show at bottom
        sortedConversations.forEach(conv => {
          // CRITICAL: Filter out any messages that don't match the conversation's sessionId before sorting
          conv.messages = conv.messages.filter(msg => {
            const matches = msg.sessionId === conv.sessionId;
            if (!matches) {
              console.warn(`🚫 Removing message with mismatched sessionId from conversation ${conv.sessionId}:`, {
                msgSessionId: msg.sessionId,
                convSessionId: conv.sessionId,
                messageContent: msg.content?.substring(0, 50)
              });
            }
            return matches;
          });
          conv.messages.sort((a: ConversationMessage, b: ConversationMessage) => a.timestamp.getTime() - b.timestamp.getTime());
        });
        
        setConversations(sortedConversations);
        
        // Auto-select first conversation if none selected
        setSelectedSessionId(prev => {
          if (!prev && sortedConversations.length > 0) {
            return sortedConversations[0].sessionId;
          }
          return prev;
        });
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load Search history:', error);
      toast({
        title: "Error",
        description: "Failed to load Search history. Please try again.",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setIsLoadingChatHistory(false);
    }
  }, [toast]);

  // Load chat history when tab is active (history tab or overview tab for preview) or search-test tab (for recent searches)
  useEffect(() => {
    if ((activeTab === 'training' && (trainingSubTab === 'history' || trainingSubTab === 'overview')) || 
        (activeTab === 'search-test' && savedSearchRecentSearch)) {

    // Initial load
    loadChatHistory();

    // Set up polling interval (refresh every 30 seconds for real-time updates)
    const intervalId = setInterval(() => {
      loadChatHistory();
    }, 30000);

    return () => clearInterval(intervalId);
    }
  }, [activeTab, trainingSubTab, loadChatHistory, savedSearchRecentSearch]);

  // Show recent search preview for 1-2 seconds when toggle is activated
  useEffect(() => {
    const prevValue = prevSearchRecentSearchRef.current;
    prevSearchRecentSearchRef.current = searchRecentSearch;
    
    // If toggle changed from false to true, show preview temporarily
    if (!prevValue && searchRecentSearch) {
      setShowRecentSearchPreview(true);
      // Hide after 1.5 seconds
      const timer = setTimeout(() => {
        setShowRecentSearchPreview(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [searchRecentSearch]);

  // Show loader preview for 1-2 seconds when loader type changes
  useEffect(() => {
    const prevValue = prevSearchLoaderTypeRef.current;
    
    // If loader type changed, show preview temporarily
    if (prevValue !== searchLoaderType && prevValue !== "") {
      prevSearchLoaderTypeRef.current = searchLoaderType;
      setShowLoaderPreview(true);
      // Hide after 1.5 seconds
      const timer = setTimeout(() => {
        setShowLoaderPreview(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    } else {
      prevSearchLoaderTypeRef.current = searchLoaderType;
    }
  }, [searchLoaderType]);

  // Validate button type - should only work when form type is "withBtn"
  useEffect(() => {
    if (searchFormType !== "withBtn" && searchButtonType) {
      setButtonTypeError("Button Type only works when Search Form Type is set to 'With Button'");
    } else {
      setButtonTypeError("");
    }
  }, [searchFormType, searchButtonType]);

  // Validate search icon - should only work when form type is "default"
  useEffect(() => {
    if (searchFormType !== "default" && searchIcon) {
      setSearchIconError("Search Icon only works when Search Form Type is set to 'Default'");
    } else {
      setSearchIconError("");
    }
  }, [searchFormType, searchIcon]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
  }, []);

  // Handle checkbox selection
  const handleToggleConversationSelection = useCallback((sessionId: string) => {
    setSelectedSessionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedSessionIds.size === conversations.length) {
      setSelectedSessionIds(new Set());
    } else {
      setSelectedSessionIds(new Set(conversations.map(c => c.sessionId)));
    }
  }, [conversations, selectedSessionIds]);

  // Handle delete conversation
  const handleDeleteConversation = useCallback(async (sessionId: string) => {
    try {
      await searchAPI.deleteSession(sessionId); 
      toast({
        title: "Deleted",
        description: "Search history deleted successfully.",
        variant: "success",
      });
      await loadChatHistory();
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
      setSelectedSessionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete search history:', error);
      toast({
        title: "Error",
        description: "Failed to delete search history. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedSessionId, toast, loadChatHistory]);

  // Handle delete all selected
  const handleDeleteAll = useCallback(async () => {
    // If selected specific items, delete those
    if (selectedSessionIds.size > 0 && selectedSessionIds.size < conversations.length) {
      try {
        const deletePromises = Array.from(selectedSessionIds).map(sessionId =>
          searchAPI.deleteSession(sessionId)
        );
        await Promise.all(deletePromises);
        toast({
          title: "Deleted",
          description: `${selectedSessionIds.size} search(es) deleted successfully.`,
          variant: "success",
        });
        setSelectedSessionIds(new Set());
        await loadChatHistory();
        setSelectedSessionId(null);
      } catch (error) {
        console.error('Failed to delete searches:', error);
        toast({
          title: "Error",
          description: "Failed to delete some searches. Please try again.",
          variant: "destructive",
        });
      }
    } 
    // If nothing selected or all selected, confirm delete all
    else {
      if (!confirm("Are you sure you want to delete ALL search history? This cannot be undone.")) {
        return;
      }
      
      try {
        await searchAPI.deleteAllSessions();
        toast({
          title: "Deleted",
          description: "All search history deleted successfully.",
          variant: "success",
        });
        setSelectedSessionIds(new Set());
        await loadChatHistory();
        setSelectedSessionId(null);
      } catch (error) {
        console.error('Failed to delete all search history:', error);
        toast({
          title: "Error",
          description: "Failed to delete all search history. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [selectedSessionIds, conversations.length, toast, loadChatHistory]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Search filter
    if (chatHistorySearch) {
      filtered = filtered.filter(conv =>
        conv.preview.toLowerCase().includes(chatHistorySearch.toLowerCase()) ||
        conv.messages.some((msg: ConversationMessage) => msg.content.toLowerCase().includes(chatHistorySearch.toLowerCase()))
      );
    }
    
    // Date filter by time ranges
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case "month":
          filterDate.setDate(filterDate.getDate() - 30);
          break;
        case "year":
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(conv => {
        const convDate = new Date(conv.timestamp);
        return convDate >= filterDate && convDate <= now;
      });
    }
    
    return filtered;
  }, [conversations, chatHistorySearch, dateFilter]);

  // Get recent searches from history for Search Test tab
  const recentSearches = useMemo(() => {
    // Combine local history and conversation history
    const allSources = [...localSearchHistory];
    
    if (conversations && conversations.length > 0) {
      for (const conv of conversations) {
        if (conv.preview && conv.preview.trim()) {
          allSources.push(conv.preview.trim());
        }
      }
    }

    // Extract unique queries
    const uniqueQueries = new Set<string>();
    const result: string[] = [];
    
    for (const query of allSources) {
      const trimmed = query.trim();
      if (trimmed && !uniqueQueries.has(trimmed)) {
        uniqueQueries.add(trimmed);
        result.push(trimmed);
      }
      if (result.length >= 2) break; 
    }
    
    return result.slice(0, 2);
  }, [conversations, localSearchHistory]);

  // Get selected conversation messages - CRITICAL: Use strict sessionId matching
  const selectedConversation = useMemo(() => {
    if (!selectedSessionId) return null;
    // Use strict string comparison to ensure exact session match
    const found = conversations.find(c => String(c.sessionId) === String(selectedSessionId)) || null;
    if (found) {
      console.log(`✅ Selected conversation ${selectedSessionId} with ${found.messages.length} messages (before filtering)`);
      // Ensure all messages belong to this session
      const validMessages = found.messages.filter(msg => String(msg.sessionId) === String(selectedSessionId));
      if (validMessages.length !== found.messages.length) {
        console.warn(`⚠️ Filtered out ${found.messages.length - validMessages.length} messages with mismatched sessionId`);
        found.messages = validMessages;
        found.messageCount = validMessages.length;
      }
    }
    return found;
  }, [conversations, selectedSessionId]);

  // Auto-scroll to bottom when conversation or messages change (new messages at bottom)
  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedConversation, selectedConversation?.messages?.length]);

  // RAG Tuning Functions and Effects
  const simulateStreamingResponse = async (content: string, onUpdate: (content: string) => void) => {
    const words = content.split(' ');
    let currentContent = '';
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      onUpdate(currentContent);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const extractTopKFromMessage = (message: string): { topK: number; reranker: boolean } => {
    const topKMatch = message.match(/topK=(\d+)/);
    const rerankerMatch = message.match(/reranker=(on|off)/);
    return {
      topK: topKMatch ? parseInt(topKMatch[1]) : 5,
      reranker: rerankerMatch ? rerankerMatch[1] === 'on' : false
    };
  };

  // Load RAG chat history - Don't load history, only show last query/response
  // Load RAG chat history
  useEffect(() => {
    if (activeTab === 'search-test') {
      // Don't load history - just ensure loading state is false
      setIsLoadingRagHistory(false);
      // Removed setRagMessages([]) to persist messages across tab switches
    }
  }, [activeTab]);

  // Auto-scroll for RAG messages
  useEffect(() => {
    if (isStreaming || isTyping) {
      ragMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ragMessages, streamingContent, isStreaming, isTyping]);

  // Handle RAG query - Only show last query and response
  const handleRagQuery = useCallback(async (query: string) => {
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };
    // Replace all messages with just the new user message (show only last query)
    setRagMessages([userMessage]);
    
    // Update local search history immediately
    setLocalSearchHistory(prev => {
      const newHistory = [query, ...prev];
      // Keep only unique and top 2 locally to avoid unbounded growth
      return Array.from(new Set(newHistory)).slice(0, 2);
    });
    
    // Client-side validation before API call
    const validationError = validateMaxTokens(ragSettings.maxTokens, responseType);
    if (validationError) {
      setMaxTokensError(validationError);
      setIsTyping(false);
      const errorMessage: Message = {
        type: "assistant",
        content: `Validation Error: ${validationError}`,
        timestamp: new Date(),
      };
      setRagMessages([userMessage, errorMessage]);
      return;
    }
    
    // Clear any previous errors
    setMaxTokensError(null);
    setRagSearchError("");
    
    setIsTyping(true);
    setPendingResponse("Searching with RAG settings...");
    const startTime = Date.now();

    try {
      const searchResponse = await searchAsync(query, ragSettings, responseType);
      const latency = Date.now() - startTime;
      const tokensUsed = searchResponse.answer?.split(' ').length || 0;
      const documentsRetrieved = searchResponse.sources?.length || 0;
      const relevanceScore = Math.random() * 0.3 + 0.7;

      updateMetrics({
        latency,
        tokensUsed,
        documentsRetrieved,
        relevanceScore,
        timestamp: new Date(),
      });

      setIsTyping(false);
      setPendingResponse(null);

      const responseContent = searchResponse.answer || "No answer from API";
      const serverMessage = searchResponse.message || "";
      const { topK: actualTopK, reranker: actualReranker } = extractTopKFromMessage(serverMessage);
      const ragSources = searchResponse.sources || [];
      const mappedRagSources = ragSources.map((source: any) => ({
        title: source.title || "Unknown Source",
        url: source.url || "#",
        snippet: source.snippet || "No snippet available",
      }));

      const assistantMessage: Message = {
        type: "assistant",
        content: responseContent,
        citations: mappedRagSources,
        timestamp: new Date(),
        ragSettings: ragSettings,
        queryString: query,
        serverMessage: serverMessage,
        actualTopK: actualTopK,
        actualReranker: actualReranker,
        messageId: searchResponse.message_id,
        sessionId: searchResponse.session_id,
      };

      // Replace messages with just user message and new assistant response (show immediately)
      setRagMessages([userMessage, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");
    } catch (error: any) {
      console.error("Search API call failed:", error);
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);
      
      // Handle backend validation errors (400 status)
      let errorContent = `Sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
      
      if (error?.response?.status === 400) {
        const errorDetail = error?.response?.data?.detail || error?.message;
        if (errorDetail) {
          errorContent = `Validation Error: ${errorDetail}`;
          setMaxTokensError(errorDetail);
        }
      }
      
      const errorMessage: Message = {
        type: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      // Replace messages with just user message and error message (show only last response)
      setRagMessages([userMessage, errorMessage]);
    }
  }, [ragSettings, searchAsync, updateMetrics, validateMaxTokens, responseType]);

  const clearRagChat = async () => {
    try {
      await chatAPI.deleteAllMessages('page');  // Pass 'page' for hard delete (permanent)
    } catch (error) {
      console.error('Failed to delete messages:', error);
    }
    // Clear messages - start with empty state (only show last query/response)
    setRagMessages([]);
    setCurrentSessionId(undefined);
  };


  // Handle search input validation
  const handleRagSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRagSearchInput(value);
    if (value.length > 0 && value.length < 3) {
      setRagSearchError("Please enter at least 3 characters");
    } else {
      setRagSearchError("");
    }
  }, []);

  // Handle search submit
  const handleRagSearchSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Blur input to close suggestions
    if (ragSearchInputRef.current) {
      ragSearchInputRef.current.blur();
    }
    
    const query = ragSearchInput.trim();
    if (query.length < 3) {
      setRagSearchError("Please enter at least 3 characters");
      return;
    }
    setRagSearchError("");
    handleRagQuery(query);
  }, [ragSearchInput, handleRagQuery]);

  // Handle clear search
  const handleRagSearchClear = useCallback(() => {
    setRagSearchInput("");
    setRagSearchError("");
  }, []);

  // Suggestions removed - no API connectivity
  // Keep UI place but don't fetch from API
  const isLoadingSuggestions = false;
  const exampleQueries: string[] = [];

  // Check if widget customization tab is active for overflow override
  const isWidgetCustomizationTab = settingsSubTab === 'search-customization';
  const isConfigurationTab = settingsSubTab === 'search-configuration';
  const shouldShowOverflow = isWidgetCustomizationTab || isConfigurationTab;
  
  return (
    <div className="relative">
      <div 
        className="relative z-10 space-y-6 w-full max-w-full min-w-0 p-0 sm:p-6" 
        style={{ 
          maxWidth: '92vw',
          overflow: shouldShowOverflow ? 'visible' : 'hidden'
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          
              Search Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure and manage your search training, settings, and integrations
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto mb-3 pb-1">
            <TabsList className="inline-flex flex-nowrap">
              <TabsTrigger value="training" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <MessageSquare className="h-4 w-4" />
                Training
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <Code className="h-4 w-4" />
                Integrations Scripts
              </TabsTrigger>
              <TabsTrigger value="search-test" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <Search className="h-4 w-4" />
                Search Test
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6 w-full overflow-hidden">
            <Tabs value={trainingSubTab} onValueChange={setTrainingSubTab} className="w-full">
              <div className="relative z-10 flex">
                {/* Desktop Sidebar Navigation */}
                <div className="w-64 bg-background/80 backdrop-blur-sm border-r border-border/50 hidden lg:block">
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Training</div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          trainingSubTab === "overview"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTrainingTabClick(e, "overview")}
                        {...preventScrollOnClick}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Overview
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          trainingSubTab === "config"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTrainingTabClick(e, "config")}
                        {...preventScrollOnClick}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Active Config
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          trainingSubTab === "history"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTrainingTabClick(e, "history")}
                        {...preventScrollOnClick}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Search History
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Mobile Tab Navigation */}
                  <div className="lg:hidden border-b bg-background/80 backdrop-blur-sm">
                    <div className="px-4 py-3">
                      <div className="text-sm font-medium text-muted-foreground mb-3">Training</div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            trainingSubTab === "overview"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTrainingTabClick(e, "overview")}
                          {...preventScrollOnClick}
                        >
                          <LayoutDashboard className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Overview</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            trainingSubTab === "config"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTrainingTabClick(e, "config")}
                          {...preventScrollOnClick}
                        >
                          <Settings className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Config</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            trainingSubTab === "history"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTrainingTabClick(e, "history")}
                          {...preventScrollOnClick}
                        >
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">History</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-0 pt-3 lg:p-6">
                      {/* Overview Tab */}
                      {trainingSubTab === "overview" && (
                      <div className="space-y-6 w-full overflow-hidden">
                        <GlassCard>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Bot className="h-5 w-5" />
                              Training Configuration Preview
                            </CardTitle>
                            <CardDescription>
                              Live preview of all training configurations
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                              {/* Active Status Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Active Status</div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-lg font-semibold">
                                    {isActive ? "Active" : "Inactive"}
                                  </span>
                                  <Badge variant={isActive ? "default" : "secondary"}>
                                    {isActive ? "Enabled" : "Disabled"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {isUpdatingActivation ? (
                                    <div className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Updating...</span>
                                    </div>
                                  ) : (
                                    <span>Status: {isActive ? "Search is live" : "Search is offline"}</span>
                                  )}
                                </div>
                              </div>

                              {/* Prompt Preview - Real-time from API */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">System Prompt</div>
                                {isLoadingPromptForOverview ? (
                                  <div className="text-sm text-muted-foreground">Loading prompt...</div>
                                ) : (
                                  <>
                                    <div className="text-sm line-clamp-2 font-mono">
                                      {typeof currentPrompt === 'string' ? (currentPrompt || "No prompt set") : "No prompt set"}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                      <div className="flex justify-between">
                                        <span>Length:</span>
                                        <span className="font-semibold">{typeof currentPrompt === 'string' ? currentPrompt.length : 0} chars</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Words:</span>
                                        <span className="font-semibold">{typeof currentPrompt === 'string' && currentPrompt ? currentPrompt.split(/\s+/).filter(Boolean).length : 0}</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Response Type Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Response Type</div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-lg font-semibold capitalize">
                                    {responseType}
                                  </span>
                                  <Badge variant="outline">
                                    {responseType === "long" ? "Detailed" : "Brief"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {responseType === "long" 
                                    ? "Chatbot provides comprehensive, detailed responses" 
                                    : "Chatbot provides concise, brief responses"}
                                </div>
                              </div>

                              {/* Chat History Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50 md:col-span-2 lg:col-span-1">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Search History</div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-lg font-semibold">
                                    {filteredConversations.length} conversations
                                  </span>
                                  <Badge variant="outline">
                                    {conversations.length} total
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-0.5">
                                  <div className="flex justify-between">
                                    <span>Total Messages:</span>
                                    <span className="font-semibold">
                                      {filteredConversations.reduce((sum, conv) => sum + conv.messageCount, 0)}
                                    </span>
                                  </div>
                                  {(dateFilter !== "all" || chatHistorySearch) && (
                                    <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                      Filtered: {dateFilter !== "all" && dateFilter} {chatHistorySearch && `"${chatHistorySearch}"`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </GlassCard>
                      </div>
                      )}

                      {/* Config Tab (Merged Status, Prompt, Response) */}
                      {trainingSubTab === "config" && (
                        <div className="space-y-6 w-full overflow-hidden">
                          {/* Active Status Section */}
                          <GlassCard>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Power className="h-5 w-5" />
                                Active Status
                              </CardTitle>
                              <CardDescription>
                                Enable or disable the search service
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {isLoadingActivation ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  Loading activation status...
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <Label className="text-base">Search Status</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {isActive ? "Search is currently active" : "Search is currently inactive"}
                                      </p>
                                    </div>
                                    <Switch
                                      checked={isActive}
                                      onCheckedChange={async (checked) => {
                                        try {
                                          await updateActivationAsync(checked);
                                        } catch (error) {
                                          console.error("Failed to update activation status:", error);
                                        }
                                      }}
                                      disabled={isUpdatingActivation}
                                    />
                                  </div>
                                  {isActive && (
                                    <Badge variant="default" className="w-fit">
                                      Active
                                    </Badge>
                                  )}
                                  {isUpdatingActivation && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Updating status...
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </GlassCard>

                          {/* Prompt Edit Section */}
                          <PromptEditTab />

                          {/* Response Config Section */}
                          <GlassCard>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Response Configuration
                              </CardTitle>
                              <CardDescription>
                                Configure how the chatbot responds to queries
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {isLoadingResponseConfig ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  <span className="text-sm text-muted-foreground">Loading response configuration...</span>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <Label htmlFor="response-type">Response Type</Label>
                                    <Select 
                                      value={responseType} 
                                      onValueChange={(value: "long" | "short") => {
                                        const newType = value as "long" | "short";
                                        setResponseType(newType);
                                        
                                        // If maxTokens is set and below new minimum, auto-adjust to minimum
                                        if (ragSettings.maxTokens !== null && ragSettings.maxTokens !== undefined && ragSettings.maxTokens > 0) {
                                          const minRequired = newType === 'long' ? 400 : 200;
                                          
                                          if (ragSettings.maxTokens < minRequired) {
                                            // Auto-adjust to minimum
                                            updateRAGSettings({ maxTokens: minRequired });
                                            setMaxTokensError(null); // Clear error after auto-adjust
                                          } else {
                                            // Validate the current value with new type
                                            const validationError = validateMaxTokens(ragSettings.maxTokens, newType);
                                            if (validationError) {
                                              setMaxTokensError(validationError);
                                            } else {
                                              setMaxTokensError(null);
                                            }
                                          }
                                        }
                                      }}
                                      disabled={isSavingResponseConfig}
                                    >
                                      <SelectTrigger id="response-type" className="mt-2">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="long">Long Responses</SelectItem>
                                        <SelectItem value="short">Short Responses</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {responseType === "long"
                                        ? "Chatbot will provide detailed, comprehensive responses"
                                        : "Chatbot will provide concise, brief responses"}
                                    </p>
                                  </div>
                                  <Button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSaveTraining();
                                    }}
                                    disabled={isSavingResponseConfig}
                                    {...preventScrollOnClick}
                                  >
                                    {isSavingResponseConfig ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Configuration
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </CardContent>
                          </GlassCard>
                        </div>
                      )}

                      {/* Chat History Tab */}
                      {trainingSubTab === "history" && (
                      <div className="space-y-6 w-full overflow-hidden">
            <GlassCard>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Search History
                    </CardTitle>
                    <CardDescription>
                      View and filter Search history logs
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleDeleteAll}
                      disabled={selectedSessionIds.size === 0}
                      className="bg-destructive text-destructive-foreground border border-destructive-border"
                      style={{
                        backgroundColor: 'hsl(var(--destructive)) !important',
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.setProperty('background-color', 'hsl(var(--destructive))', 'important');
                        target.style.setProperty('border-color', 'hsl(var(--destructive-border))', 'important');
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.setProperty('background-color', 'hsl(var(--destructive))', 'important');
                        target.style.setProperty('border-color', 'hsl(var(--destructive-border))', 'important');
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {selectedSessionIds.size > 0 ? `Delete Selected (${selectedSessionIds.size})` : "Delete All"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Split Panel Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[400px]">
                  {/* Left Panel - Conversation List */}
                  <div className="lg:col-span-1 border flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm" style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}>
                    {/* Search and Date Filter */}  
                    <div className="p-4 border-b space-y-2 bg-muted/30">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search conversations..."
                          value={chatHistorySearch}
                          onChange={(e) => setChatHistorySearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="flex-shrink-0"
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Select All
                        </Button>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Filter by date" />
                          </SelectTrigger>
                          <SelectContent>
                            {dateFilterOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                   
                      </div>
                    </div>

                    {/* Conversation List */}
                    <ScrollArea className="flex-1">
                      <div className="p-2">
                        {isLoadingChatHistory ? (
                          <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading Search history...
                          </div>
                        ) : filteredConversations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No conversations found
                          </div>
                        ) : (
                          filteredConversations.map((conversation) => (
                            <div
                              key={conversation.sessionId}
                              className={cn(
                                "p-3 mb-2 cursor-pointer transition-all border hover-elevate",
                                selectedSessionId === conversation.sessionId
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                                  : "bg-background/30 backdrop-blur-sm border-border/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                              )}
                              style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                              onClick={() => handleSelectConversation(conversation.sessionId)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  {/* Search Query - Full text */}
                                  <p className="text-sm font-medium mb-2 break-words">
                                    {conversation.preview || "New conversation"}
                                  </p>
                                  {/* Date and Time */}
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {formatDateTime(conversation.timestamp)}
                                  </div>
                                  {/* Search From and Count */}
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div>Search From: {conversation.messageType || 'plugin'}</div>
                                    <div>Number of times words searched: {conversation.messageCount}</div>
                                  </div>
                                </div>
                                {/* Checkbox on the right */}
                                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                  <Checkbox
                                    checked={selectedSessionIds.has(conversation.sessionId)}
                                    onCheckedChange={() => {
                                      handleToggleConversationSelection(conversation.sessionId);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right Panel - Chat Messages */}
                  <div className="lg:col-span-2 border flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm" style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}>
                    {selectedConversation ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-muted/30 backdrop-blur-sm">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base break-words">
                              {selectedConversation.preview || "Search Query"}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConversation(selectedConversation.sessionId)}
                            className="flex-shrink-0 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1">
                          <div className="p-4 space-y-4">
                            {[...selectedConversation.messages]
                              .filter(msg => {
                                // CRITICAL: Strict filter - only messages with exact sessionId match
                                const matches = msg.sessionId === selectedConversation.sessionId;
                                if (!matches) {
                                  console.warn('🚫 Filtering out message with mismatched sessionId:', {
                                    msgSessionId: msg.sessionId,
                                    selectedSessionId: selectedConversation.sessionId,
                                    message: msg.content
                                  });
                                }
                                return matches;
                              })
                              .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                              // CRITICAL: Only show messages that are part of complete pairs (query + answer)
                              .filter((msg, index, arr) => {
                                // For user messages, check if there's a corresponding assistant message with same messageId
                                if (msg.type === 'user') {
                                  const hasAnswer = arr.some(m => 
                                    m.type === 'assistant' && 
                                    m.messageId === msg.messageId &&
                                    m.sessionId === msg.sessionId
                                  );
                                  if (!hasAnswer) {
                                    console.warn('⚠️ Filtering out user message without answer:', msg.content?.substring(0, 50));
                                  }
                                  return hasAnswer;
                                }
                                // For assistant messages, check if there's a corresponding user message with same messageId
                                if (msg.type === 'assistant') {
                                  const hasQuery = arr.some(m => 
                                    m.type === 'user' && 
                                    m.messageId === msg.messageId &&
                                    m.sessionId === msg.sessionId
                                  );
                                  if (!hasQuery) {
                                    console.warn('⚠️ Filtering out assistant message without query');
                                  }
                                  return hasQuery;
                                }
                                return true;
                              })
                              .map((message: ConversationMessage, index: number) => {
                                // Use topK from message if available, otherwise calculate from citations length
                                // This represents the actual Top-K value used when the message was created
                                const actualTopK = message.type === 'assistant' 
                                  ? (message.topK || (message.citations ? message.citations.length : undefined))
                                  : undefined;
                                
                                return (
                                  <ChatMessage
                                    key={message.messageId || index}
                                    type={message.type}
                                    content={message.content}
                                    citations={message.citations}
                                    timestamp={message.timestamp}
                                    messageId={message.messageId}
                                    sessionId={message.sessionId}
                                    showFeedback={true}
                                    ragSettings={ragSettings}
                                    actualTopK={actualTopK}
                                    citationFormatting={searchCitationFormatting}
                                  />
                                );
                              })}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a conversation to view messages
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </GlassCard>
                      </div>
                      )}
                  </div>
                </div>
              </div>
            </Tabs>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 w-full">
            <Tabs defaultValue="overview" className="w-full">
              <div className="relative z-10 flex">
                {/* Desktop Sidebar Navigation */}
                <div className="w-64 bg-background/80 backdrop-blur-sm border-r border-border/50 hidden lg:block">
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Settings</div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "overview"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "overview")}
                        {...preventScrollOnClick}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Overview
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "models"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "models")}
                        {...preventScrollOnClick}
                      >
                        <Cpu className="h-4 w-4 mr-2" />
                        Models Setting
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "citations"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "citations")}
                        {...preventScrollOnClick}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Citation Formatting
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "search-configuration"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "search-configuration")}
                        {...preventScrollOnClick}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Configuration
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "search-customization"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "search-customization")}
                        {...preventScrollOnClick}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                         Customization
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "questions"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "questions")}
                        {...preventScrollOnClick}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                         Questions
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Mobile Tab Navigation */}
                  <div className="lg:hidden border-b bg-background/80 backdrop-blur-sm">
                    <div className="px-4 py-3">
                      <div className="text-sm font-medium text-muted-foreground mb-3">Settings</div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "overview"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "overview")}
                          {...preventScrollOnClick}
                        >
                          <LayoutDashboard className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Overview</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "models"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "models")}
                          {...preventScrollOnClick}
                        >
                          <Cpu className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Models</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "citations"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "citations")}
                          {...preventScrollOnClick}
                        >
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Citations</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "search-configuration"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "search-configuration")}
                          {...preventScrollOnClick}
                        >
                          <Search className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Config</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "search-customization"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "search-customization")}
                          {...preventScrollOnClick}
                        >
                          <Settings className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Custom</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "questions"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "questions")}
                          {...preventScrollOnClick}
                        >
                          <HelpCircle className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Questions</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-0 pt-3 lg:p-6">
                    <Tabs value={settingsSubTab} onValueChange={handleTabsValueChange} className={`w-full ${isWidgetCustomizationTab ? 'widget-customization-tabs-root' : ''}`}>
                      <TabsList className="hidden">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="models">Models Setting</TabsTrigger>
                        <TabsTrigger value="citations">Citation Formatting</TabsTrigger>
                        <TabsTrigger value="search-configuration">Configuration</TabsTrigger>
                        <TabsTrigger value="search-customization">Customization</TabsTrigger>
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="space-y-6 w-full overflow-hidden">
                        <GlassCard>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="h-5 w-5" />
                              Settings Configuration Preview
                            </CardTitle>
                            <CardDescription>
                              Live preview of all settings configurations
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                              {/* Models Setting Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Models</div>
                                <div className="space-y-1">
                                  <div className="text-sm font-semibold capitalize">{modelProvider || "Not set"}</div>
                                  <div className="text-xs text-muted-foreground">Chat: {chatModel || "Not set"}</div>
                                  {embeddingModel && (
                                    <div className="text-xs text-muted-foreground">Embedding: {embeddingModel}</div>
                                  )}
                                  {modelApiKey && (
                                    <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                      <span className="opacity-75">API Key: </span>
                                      <span className="font-mono">{modelApiKey.substring(0, 8)}...</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Citation Formatting Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Citations</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Style:</span>
                                    <span className="font-semibold capitalize">{formatting.style}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Layout:</span>
                                    <span className="font-semibold capitalize">{formatting.layout}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Numbering:</span>
                                    <span className="font-semibold capitalize">{formatting.numbering}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Search Configuration Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Search Config</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Title:</span>
                                    <span className="font-semibold truncate max-w-[120px]">{searchTitle || "Not set"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Language:</span>
                                    <span className="font-semibold uppercase">{searchLanguage}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Style:</span>
                                    <span className="font-semibold capitalize">{searchStyleOption}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Icon:</span>
                                    <span className="font-semibold capitalize">{searchIcon}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Search Customization Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Customization</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Form Type:</span>
                                    <span className="font-semibold capitalize">{searchFormType === 'withBtn' ? 'With Button' : 'Default'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Button Type:</span>
                                    <span className="font-semibold capitalize">{searchButtonType === 'withLabel' ? 'With Label' : 'Icon Only'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Recent Search:</span>
                                    <Badge variant={searchRecentSearch ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                                      {searchRecentSearch ? "Enabled" : "Disabled"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Questions:</span>
                                    <Badge variant={searchPredefinedQuestions ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                                      {searchPredefinedQuestions ? "Enabled" : "Disabled"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </GlassCard>
                      </TabsContent>

                      {/* Models Setting Tab */}
                      <TabsContent value="models" className="space-y-6 w-full overflow-hidden">
                        <GlassCard>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Cpu className="h-5 w-5" />
                              Models Setting
                            </CardTitle>
                            <CardDescription>
                              Configure AI model provider and model selection
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {isLoadingConfigModels ? (
                              <div className="text-center py-8 text-muted-foreground">
                                Loading model settings...
                              </div>
                            ) : (
                              <>
                                <div>
                                  <Label htmlFor="model-provider">Model Provider</Label>
                                  <Select 
                                    value={modelProvider} 
                                    onValueChange={setModelProvider}
                                    disabled={isLoadingProviders}
                                  >
                                    <SelectTrigger id="model-provider" className="mt-2">
                                      <SelectValue placeholder={isLoadingProviders ? "Loading providers..." : "Select provider"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {providers.map((provider: any) => (
                                        <SelectItem key={provider.value} value={provider.value}>
                                          {provider.provider}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="chat-model">Chat Model</Label>
                                  <Select 
                                    value={chatModel} 
                                    onValueChange={setChatModel}
                                    disabled={!modelProvider || availableChatModels.length === 0}
                                  >
                                    <SelectTrigger id="chat-model" className="mt-2">
                                      <SelectValue placeholder={
                                        !modelProvider 
                                          ? "Select a provider first"
                                          : availableChatModels.length === 0
                                          ? "No models available"
                                          : "Select a model"
                                      } />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableChatModels.map((model: string) => {
                                        // Find the display name for this model
                                        const providerInfo = providers.find((p: any) => p.value.toLowerCase() === modelProvider.toLowerCase());
                                        const modelInfo = providerInfo?.chat_models.find((m: any) => m.value === model);
                                        const displayName = modelInfo?.name || model;
                                        
                                        return (
                                          <SelectItem key={model} value={model}>
                                            {displayName}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    The model used for chat/completion tasks
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="embedding-model">Embedding Model</Label>
                                  {availableEmbeddingModels.length > 0 ? (
                                    <Select 
                                      value={embeddingModel || "__none__"} 
                                      onValueChange={(value) => setEmbeddingModel(value === "__none__" ? "" : value)}
                                      disabled={!modelProvider}
                                    >
                                      <SelectTrigger id="embedding-model" className="mt-2">
                                        <SelectValue placeholder={
                                          !modelProvider 
                                            ? "Select a provider first"
                                            : "Select an embedding model (optional)"
                                        } />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">None (Optional)</SelectItem>
                                        {availableEmbeddingModels.map((model: string) => {
                                          // Find the display name for this model
                                          const providerInfo = providers.find((p: any) => p.value.toLowerCase() === modelProvider.toLowerCase());
                                          const modelInfo = providerInfo?.embedding_models.find((m: any) => m.value === model);
                                          const displayName = modelInfo?.name || model;
                                          
                                          return (
                                            <SelectItem key={model} value={model}>
                                              {displayName}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      id="embedding-model"
                                      value={embeddingModel}
                                      onChange={(e) => setEmbeddingModel(e.target.value)}
                                      className="mt-2"
                                      placeholder="No embedding models available for this provider"
                                      disabled={!modelProvider}
                                    />
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    The model used for embeddings (optional)
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="model-api-key">API Key</Label>
                                  <Input
                                    id="model-api-key"
                                    type="password"
                                    value={modelApiKey}
                                    onChange={(e) => setModelApiKey(e.target.value)}
                                    className="mt-2 font-mono"
                                    placeholder={modelProvider?.toLowerCase() === "ollama" ? "Auto-filled for Ollama" : "Enter API key"}
                                    disabled={modelProvider?.toLowerCase() === "ollama"}
                                    readOnly={modelProvider?.toLowerCase() === "ollama"}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {modelProvider?.toLowerCase() === "ollama" 
                                      ? "API key is automatically set for Ollama provider"
                                      : "API key for the selected provider"}
                                  </p>
                                </div>

                                {/* Model Parameters */}
                                <div className="pt-4 border-t space-y-4">
                                  <div>
                                    <Label htmlFor="temperature">
                                      Temperature
                                      <span className="text-xs text-muted-foreground ml-2">(chatgpt.openai_temperature [string])</span>
                                    </Label>
                                    <Input
                                      id="temperature"
                                      type="number"
                                      value={temperature ?? ''}
                                      onChange={(e) => setTemperature(e.target.value || null)}
                                      className="mt-2"
                                      placeholder="0.7"
                                      step="0.1"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="top-p">
                                      Top P
                                      <span className="text-xs text-muted-foreground ml-2">(chatgpt.openai_top_p [string])</span>
                                    </Label>
                                    <Input
                                      id="top-p"
                                      type="number"
                                      value={topP ?? ''}
                                      onChange={(e) => setTopP(e.target.value || null)}
                                      className="mt-2"
                                      placeholder="0.01"
                                      step="0.01"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="best-of">
                                      Best Of
                                      <span className="text-xs text-muted-foreground ml-2">(chatgpt.openai_best_of [int+])</span>
                                    </Label>
                                    <Input
                                      id="best-of"
                                      type="number"
                                      value={bestOf ?? ''}
                                      onChange={(e) => setBestOf(e.target.value ? parseInt(e.target.value) : null)}
                                      className="mt-2"
                                      placeholder="1"
                                      min="1"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="frequency-penalty">
                                      Frequency Penalty
                                      <span className="text-xs text-muted-foreground ml-2">(chatgpt.openai_frequency_penalty [string])</span>
                                    </Label>
                                    <Input
                                      id="frequency-penalty"
                                      type="number"
                                      value={frequencyPenalty ?? ''}
                                      onChange={(e) => setFrequencyPenalty(e.target.value || null)}
                                      className="mt-2"
                                      placeholder="0.01"
                                      step="0.01"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="presence-penalty">
                                      Presence Penalty
                                      <span className="text-xs text-muted-foreground ml-2">(chatgpt.openai_presence_penalty [string])</span>
                                    </Label>
                                    <Input
                                      id="presence-penalty"
                                      type="number"
                                      value={presencePenalty ?? ''}
                                      onChange={(e) => setPresencePenalty(e.target.value || null)}
                                      className="mt-2"
                                      placeholder="0.01"
                                      step="0.01"
                                    />
                                  </div>
                                </div>

                                {/* RAG Settings */}
                                <div className="pt-4 border-t space-y-6">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Top-K Results</Label>
                                    <div className="flex items-center gap-2">
                                      <Slider
                                        value={[ragSettings.topK]}
                                        onValueChange={(value) => updateRAGSettings({ topK: value[0] })}
                                        min={1}
                                        max={20}
                                        step={1}
                                        data-testid="slider-top-k"
                                        className="flex-1"
                                      />
                                      <Badge variant="outline" className="text-xs w-16 text-center">{ragSettings.topK}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Number of documents to retrieve from the vector database
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Similarity Threshold</Label>
                                    <div className="flex items-center gap-2">
                                      <Slider
                                        value={[ragSettings.similarityThreshold]}
                                        onValueChange={(value) => updateRAGSettings({ similarityThreshold: value[0] })}
                                        min={0.1}
                                        max={1.0}
                                        step={0.1}
                                        data-testid="slider-similarity"
                                        className="flex-1"
                                      />
                                      <Badge variant="outline" className="text-xs w-16 text-center">{ragSettings.similarityThreshold}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Minimum similarity score for document inclusion
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Max Tokens</Label>
                                    <div className="flex items-center gap-2">
                                      <Slider
                                        value={[ragSettings.maxTokens]}
                                        onValueChange={(value) => {
                                          const newValue = value[0];
                                          updateRAGSettings({ maxTokens: newValue });
                                          // Clear error when user changes value
                                          if (maxTokensError) {
                                            const validationError = validateMaxTokens(newValue, responseType);
                                            if (!validationError) {
                                              setMaxTokensError(null);
                                            }
                                          }
                                        }}
                                        min={responseType === 'long' ? 400 : 200}
                                        max={1000}
                                        step={50}
                                        data-testid="slider-max-tokens"
                                        className="flex-1"
                                      />
                                      <Badge variant="outline" className="text-xs w-20 text-center">{ragSettings.maxTokens === 0 ? "Unlimited" : ragSettings.maxTokens}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {responseType === 'long' 
                                        ? 'Minimum: 400 tokens (for LONG responses). 0 = unlimited, max 1000'
                                        : 'Minimum: 200 tokens (for SHORT responses). 0 = unlimited, max 1000'
                                      }
                                    </p>
                                    {maxTokensError && (
                                      <p className="text-xs text-destructive mt-1" role="alert">
                                        ⚠️ {maxTokensError}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <Label className="text-sm font-medium">Use Reranker</Label>
                                      <p className="text-xs text-muted-foreground">
                                        Improve result relevance with reranking
                                      </p>
                                    </div>
                                    <Switch
                                      checked={ragSettings.useReranker}
                                      onCheckedChange={(checked) => updateRAGSettings({ useReranker: checked })}
                                      data-testid="switch-reranker"
                                    />
                                  </div>
                                </div>

                                <Button 
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      // Store the API key value before saving to preserve it
                                      const apiKeyToSave = modelApiKey;
                                      await saveConfigModelsAsync({
                                        model_provider: modelProvider,
                                        search_model: chatModel, // Use search_model for search configuration
                                        embedding_model: embeddingModel,
                                        api_key: apiKeyToSave,
                                        search_temperature: temperature, // Use search_temperature for search configuration
                                        search_top_p: topP, // Use search_top_p for search configuration
                                        search_best_of: bestOf, // Use search_best_of for search configuration
                                        search_frequency_penalty: frequencyPenalty, // Use search_frequency_penalty for search configuration
                                        search_presence_penalty: presencePenalty, // Use search_presence_penalty for search configuration
                                        search_top_k: ragSettings.topK, // Use search_top_k from RAG settings
                                        search_similarity_threshold: ragSettings.similarityThreshold, // Use search_similarity_threshold from RAG settings
                                        search_max_tokens: ragSettings.maxTokens, // Use search_max_tokens from RAG settings
                                        search_use_reranker: ragSettings.useReranker, // Use search_use_reranker from RAG settings
                                        response_type: responseType, // Include response_type
                                      });
                                      // Keep the API key in state after saving
                                      // This ensures it remains visible even after the query refetches
                                      if (apiKeyToSave) {
                                        setModelApiKey(apiKeyToSave);
                                      }
                                    } catch (error) {
                                      console.error("Failed to save model settings:", error);
                                      // Error toast is handled in the hook
                                    }
                                  }}
                                  {...preventScrollOnClick}
                                  disabled={isSavingConfigModels || isLoadingConfigModels}
                                  className="w-auto min-w-[200px]"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {isSavingConfigModels ? "Saving..." : "Save Model Settings"}
                                </Button>
                              </>
                            )}
                          </CardContent>
                        </GlassCard>
                      </TabsContent>

                      {/* Citation Formatting Tab */}
                      <TabsContent value="citations" className="space-y-6 w-full overflow-hidden">
                        <GlassCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Citation Formatting
                </CardTitle>
                <CardDescription>
                  Configure how citations are displayed in chatbot responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSearchCitation ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading citation settings...</span>
                  </div>
                ) : formatting ? (
                  <>
                {/* Citation Style */}
                <div>
                  <Label htmlFor="citation-style">Citation Style</Label>
                  <Select
                    value={formatting.style || 'detailed'}
                    onValueChange={(value: any) => updateFormatting({ style: value })}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose how citations are displayed
                  </p>
                </div>

                {/* Layout */}
                <div>
                  <Label htmlFor="citation-layout">Layout</Label>
                  <Select
                    value={formatting.layout}
                    onValueChange={(value: any) => updateFormatting({ layout: value })}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    How citations are arranged
                  </p>
                </div>

                {/* Numbering Style */}
                <div>
                  <Label htmlFor="citation-numbering">Numbering Style</Label>
                  <Select
                    value={formatting.numbering}
                    onValueChange={(value: any) => updateFormatting({ numbering: value })}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brackets">[1] [2] [3]</SelectItem>
                      <SelectItem value="parentheses">(1) (2) (3)</SelectItem>
                      <SelectItem value="dots">1. 2. 3.</SelectItem>
                      <SelectItem value="numbers">1 2 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    How citations are numbered
                  </p>
                </div>

                {/* Color Scheme */}
                <div>
                  <Label htmlFor="citation-colors">Color Scheme</Label>
                  <Select
                    value={formatting.colorScheme}
                    onValueChange={(value: any) => updateFormatting({ colorScheme: value })}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="muted">Muted</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Citation color theme
                  </p>
                </div>

                {/* Display Options */}
                <div className="space-y-4">
                  <h4 className="font-medium">Display Options</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show Snippets</Label>
                      <p className="text-xs text-muted-foreground">
                        Display content snippets
                      </p>
                    </div>
                    <Switch
                      checked={formatting.showSnippets}
                      onCheckedChange={(checked: boolean) => updateFormatting({ showSnippets: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show URLs</Label>
                      <p className="text-xs text-muted-foreground">
                        Display source links
                      </p>
                    </div>
                    <Switch
                      checked={formatting.showUrls}
                      onCheckedChange={(checked: boolean) => updateFormatting({ showUrls: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Show Source Count</Label>
                      <p className="text-xs text-muted-foreground">
                        Display number of sources
                      </p>
                    </div>
                    <Switch
                      checked={formatting.showSourceCount}
                      onCheckedChange={(checked: boolean) => updateFormatting({ showSourceCount: checked })}
                    />
                  </div>

                </div>

                {/* Snippet Length */}
                <div>
                  <Label htmlFor="snippet-length">Max Snippet Length</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="25"
                      value={formatting.maxSnippetLength}
                      onChange={(e) => updateFormatting({ maxSnippetLength: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-16">
                      {formatting.maxSnippetLength} chars
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum length of content snippets
                  </p>

                  {/* Live Preview */}
                  <div className="mt-3 p-3 bg-muted rounded-[2px] border">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {`This is a sample citation snippet that demonstrates how the text will be truncated when it exceeds the maximum length you've set. `.repeat(3).substring(0, formatting.maxSnippetLength)}
                      {formatting.maxSnippetLength < `This is a sample citation snippet that demonstrates how the text will be truncated when it exceeds the maximum length you've set. `.repeat(3).length && "..."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-start gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        if (formatting) {
                          await saveCitationAsync(formatting);
                        }
                      } catch (error) {
                        console.error("Failed to save citation settings:", error);
                        // Error toast is handled in the hook
                      }
                    }}
                    disabled={isSavingSearchCitation || !formatting}
                    className="w-full sm:w-auto"
                  >
                    {isSavingSearchCitation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Reset to default values
                      updateFormatting({
                        style: 'detailed',
                        layout: 'vertical',
                        numbering: 'brackets',
                        colorScheme: 'default',
                        showSnippets: true,
                        showUrls: true,
                        showSourceCount: true,
                        enableHover: true,
                        maxSnippetLength: 150,
                      });
                    }} 
                    className="w-full sm:w-auto"
                    disabled={isSavingSearchCitation || !formatting}
                  >
                    Reset
                  </Button>
                </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No citation settings available
                  </div>
                )}
              </CardContent>
            </GlassCard>
                      </TabsContent>

                      {/* Search Configuration Tab */}
                      <TabsContent value="search-configuration" className="w-full search-configuration-tab" style={{ overflow: 'visible' }}>
                        <div ref={configurationRef} className="grid gap-4 grid-cols-1 lg:grid-cols-2 items-start" style={{ overflow: 'visible' }}>
                          {/* Left: Configuration Controls */}
                          <div className="space-y-6">
                            <GlassCard>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Search className="h-5 w-5" />
                                  Search Box Configuration
                                  {isLoadingSearchConfig && (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                  )}
                                </CardTitle>
                                <CardDescription>
                                  Configure your search box settings and appearance
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {isLoadingSearchConfig ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading configuration...</span>
                                  </div>
                                ) : (
                                  <>
                              <div>
                                <Label htmlFor="search-title">
                                  Title
                                </Label>
                                <Input
                                  id="search-title"
                                  type="text"
                                  value={searchTitle}
                                  onChange={(e) => setSearchTitle(e.target.value)}
                                  placeholder="Search Box"
                                  className="mt-2"
                                />
                              </div>

                              <div>
                                <Label htmlFor="search-language">
                                  Language
                                </Label>
                                <Select value={searchLanguage} onValueChange={setSearchLanguage}>
                                  <SelectTrigger id="search-language" className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="ja">Japanese</SelectItem>
                                    <SelectItem value="zh">Chinese</SelectItem>
                                    <SelectItem value="pt">Portuguese</SelectItem>
                                    <SelectItem value="it">Italian</SelectItem>
                                    <SelectItem value="ru">Russian</SelectItem>
                                    <SelectItem value="ar">Arabic</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="search-style-option">
                                  Select Style
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1 mb-2">
                                  Select Style of the search box and results (Default style is the default as per existing website color scheme)
                                </p>
                                <Select value={searchStyleOption} onValueChange={setSearchStyleOption}>
                                  <SelectTrigger id="search-style-option" className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="plugin">Customize Style</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>


                              <div>
                                <Label htmlFor="search-icon">
                                  Search Icon
                                </Label>
                                <Select value={searchIcon} onValueChange={setSearchIcon}>
                                  <SelectTrigger id="search-icon" className="mt-2">
                                    <SelectValue>
                                      <div className="flex items-center gap-2">
                                        {searchIcon === 'search' && <Search className="h-4 w-4" />}
                                        {searchIcon === 'scan' && <ScanSearch className="h-4 w-4" />}
                                        {searchIcon === 'sparkles' && <Sparkles className="h-4 w-4" />}
                                        <span>{searchIcon === 'search' ? 'Search' : searchIcon === 'scan' ? 'Scan' : 'Sparkles'}</span>
                                      </div>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="search">
                                      <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        <span>Search</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="scan">
                                      <div className="flex items-center gap-2">
                                        <ScanSearch className="h-4 w-4" />
                                        <span>Scan</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="sparkles">
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Sparkles</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {searchIconError && (
                                  <p className="text-sm text-destructive mt-2">{searchIconError}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="search-loader-type">
                                  Select Loader
                                </Label>
                                <Select value={searchLoaderType} onValueChange={setSearchLoaderType}>
                                  <SelectTrigger id="search-loader-type" className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="skeleton">Skeleton</SelectItem>
                                    <SelectItem value="typing">Typing Loader</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="search-background-color">
                                  Background
                                </Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="color"
                                    value={searchBackgroundColor}
                                    onChange={(e) => setSearchBackgroundColor(e.target.value)}
                                    className="h-10 w-16 cursor-pointer rounded border border-input"
                                    style={{ 
                                      appearance: 'none',
                                      WebkitAppearance: 'none',
                                      MozAppearance: 'none',
                                    }}
                                  />
                                  <Input
                                    id="search-background-color"
                                    type="text"
                                    value={searchBackgroundColor}
                                    onChange={(e) => setSearchBackgroundColor(e.target.value)}
                                    className="flex-1 font-mono"
                                    placeholder="#d5d4d4"
                                  />
                                </div>
                              </div>


                              <div>
                                <Label htmlFor="search-border-radius">
                                  Border Radius
                                </Label>
                                <Select value={searchBorderRadius} onValueChange={setSearchBorderRadius}>
                                  <SelectTrigger id="search-border-radius" className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="rounded">Rounded</SelectItem>
                                    <SelectItem value="medium-rounded">Medium Rounded</SelectItem>
                                    <SelectItem value="semi-rounded">Semi Rounded</SelectItem>
                                    <SelectItem value="square">Square</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <Button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  saveConfigMutation.mutate({
                                    title: searchTitle,
                                    language: searchLanguage,
                                    styleOption: searchStyleOption,
                                    searchIcon: searchIcon,
                                    loaderType: searchLoaderType,
                                    background: searchBackgroundColor,
                                    borderRadius: searchBorderRadius,
                                    resultStyle: searchResultStyle,
                                  });
                                }}
                                {...preventScrollOnClick}
                                className="w-auto min-w-[200px]"
                                disabled={saveConfigMutation.isPending || isLoadingSearchConfig}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                              </Button>
                                  </>
                                )}
                            </CardContent>
                          </GlassCard>
                          </div>

                          {/* Right: Live Preview - Sticky */}
                          <div
                            style={{
                              position: 'sticky',
                              top: '24px',
                              alignSelf: 'flex-start',
                              width: '100%',
                              overflow: 'visible',
                              zIndex: 10,
                              height: 'fit-content',
                              maxHeight: 'calc(100vh - 48px)',
                            }}
                            className="sticky-live-preview-wrapper"
                          >
                            <SearchBarLivePreview
                              settingsSubTab={settingsSubTab}
                              previewOverrides={{
                                title: searchTitle,
                                styleOption: searchStyleOption,
                                searchIcon: searchIcon,
                                loaderType: searchLoaderType,
                                secondaryColor: searchBackgroundColor,
                                borderRadius: searchBorderRadius,
                                resultStyle: searchResultStyle,
                                searchFormType: searchFormType,
                                buttonType: searchButtonType,
                                searchButtonText: searchButtonText,
                                searchInputPlaceholder: searchInputPlaceholder,
                                recentSearch: searchRecentSearch,
                                recentSearchTitle: searchRecentSearchTitle,
                                predefinedQuestions: searchPredefinedQuestions,
                                questionsList: searchQuestionsList,
                                questionsPosition: searchQuestionsPosition,
                                questionsLimit: searchQuestionsLimit,
                                showRecentSearchPreview: showRecentSearchPreview,
                                showLoaderPreview: showLoaderPreview,
                                citationFormatting: searchCitationFormatting ? {
                                  colorScheme: searchCitationFormatting.colorScheme,
                                  layout: searchCitationFormatting.layout,
                                  showSourceCount: searchCitationFormatting.showSourceCount,
                                } : undefined,
                              }}
                              minHeight={650}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Search Customization Tab */}
                      <TabsContent value="search-customization" className="w-full search-customization-tab" style={{ overflow: 'visible' }}>
                        <div ref={widgetCustomizationRef} className="grid gap-4 grid-cols-1 lg:grid-cols-2 items-start" style={{ overflow: 'visible' }}>
                          {/* Left: Customization Controls */}
                          <div className="space-y-6">
                            <GlassCard>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Settings className="h-5 w-5" />
                                  Search Box Customization
                                  {isLoadingSearchCustomization && (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                  )}
                                </CardTitle>
                                <CardDescription>
                                  Customize your search box form and behavior settings
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {isLoadingSearchCustomization ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading customization...</span>
                                  </div>
                                ) : (
                                  <>
                              <div>
                                <Label htmlFor="search-form-type">
                                  Search Form Type
                                </Label>
                                <Select value={searchFormType} onValueChange={setSearchFormType}>
                                  <SelectTrigger id="search-form-type" className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="withBtn">With Button</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="search-button-type">
                                  Button Type
                                </Label>
                                <Select value={searchButtonType} onValueChange={setSearchButtonType}>
                                  <SelectTrigger id="search-button-type" className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="icon">Search Icon</SelectItem>
                                    <SelectItem value="withLabel">With Label</SelectItem>
                                  </SelectContent>
                                </Select>
                                {buttonTypeError && (
                                  <p className="text-sm text-destructive mt-2">{buttonTypeError}</p>
                                )}
                              </div>

                              {searchButtonType === "withLabel" && (
                                <div>
                                  <Label htmlFor="search-button-text">
                                    Search Button Text
                                  </Label>
                                  <Input
                                    id="search-button-text"
                                    type="text"
                                    value={searchButtonText}
                                    onChange={(e) => setSearchButtonText(e.target.value)}
                                    placeholder="Search"
                                    className="mt-2"
                                  />
                                </div>
                              )}

                              <div>
                                <Label htmlFor="search-input-placeholder">
                                  Search Input Placeholder
                                </Label>
                                <Input
                                  id="search-input-placeholder"
                                  type="text"
                                  value={searchInputPlaceholder}
                                  onChange={(e) => setSearchInputPlaceholder(e.target.value)}
                                  placeholder="Search using AI..."
                                  className="mt-2"
                                />
                              </div>

                              <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                  <Label htmlFor="search-recent-search">
                                    Recent Search
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Enable recent search history
                                  </p>
                                </div>
                                <Switch
                                  id="search-recent-search"
                                  checked={searchRecentSearch}
                                  onCheckedChange={setSearchRecentSearch}
                                />
                              </div>

                              {searchRecentSearch && (
                                <div>
                                  <Label htmlFor="search-recent-search-title">
                                    Recent Search Title
                                  </Label>
                                  <Input
                                    id="search-recent-search-title"
                                    type="text"
                                    value={searchRecentSearchTitle}
                                    onChange={(e) => setSearchRecentSearchTitle(e.target.value)}
                                    placeholder="Recent Searches"
                                    className="mt-2"
                                  />
                                </div>
                              )}



                              <Button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  saveCustomizationMutation.mutate({
                                    searchFormType: searchFormType,
                                    buttonType: searchButtonType,
                                    searchButtonText: searchButtonText,
                                    searchInputPlaceholder: searchInputPlaceholder,
                                    recentSearch: searchRecentSearch,
                                    recentSearchTitle: searchRecentSearchTitle,
                                    predefinedQuestions: searchPredefinedQuestions,
                                    questionsPosition: searchQuestionsPosition,
                                    questionsLimit: searchQuestionsLimit,
                                    questions: searchQuestionsList,
                                  });
                                }}
                                {...preventScrollOnClick}
                                className="w-auto min-w-[200px]"
                                disabled={saveCustomizationMutation.isPending || isLoadingSearchCustomization}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {saveCustomizationMutation.isPending ? "Saving..." : "Save Customization"}
                              </Button>
                                  </>
                                )}
                            </CardContent>
                          </GlassCard>
                          </div>

                          {/* Right: Live Preview - Sticky */}
                          <div
                            style={{
                              position: 'sticky',
                              top: '24px',
                              alignSelf: 'flex-start',
                              width: '100%',
                              overflow: 'visible',
                              zIndex: 10,
                              height: 'fit-content',
                              maxHeight: 'calc(100vh - 48px)',
                            }}
                            className="sticky-live-preview-wrapper"
                          >
                            <SearchBarLivePreview
                              settingsSubTab={settingsSubTab}
                              previewOverrides={{
                                title: searchTitle,
                                styleOption: searchStyleOption,
                                searchIcon: searchIcon,
                                loaderType: searchLoaderType,
                                secondaryColor: searchBackgroundColor,
                                borderRadius: searchBorderRadius,
                                resultStyle: searchResultStyle,
                                searchFormType: searchFormType,
                                buttonType: searchButtonType,
                                searchButtonText: searchButtonText,
                                searchInputPlaceholder: searchInputPlaceholder,
                                recentSearch: searchRecentSearch,
                                recentSearchTitle: searchRecentSearchTitle,
                                predefinedQuestions: searchPredefinedQuestions,
                                questionsList: searchQuestionsList,
                                questionsPosition: searchQuestionsPosition,
                                questionsLimit: searchQuestionsLimit,
                                showRecentSearchPreview: showRecentSearchPreview,
                                showLoaderPreview: showLoaderPreview,
                                citationFormatting: searchCitationFormatting ? {
                                  colorScheme: searchCitationFormatting.colorScheme,
                                  layout: searchCitationFormatting.layout,
                                  showSourceCount: searchCitationFormatting.showSourceCount,
                                } : undefined,
                              }}
                              minHeight={650}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Questions Tab */}
                      <TabsContent value="questions" className="w-full search-customization-tab" style={{ overflow: 'visible' }}>
                        <div ref={widgetCustomizationRef} className="grid gap-4 grid-cols-1 lg:grid-cols-2 items-start" style={{ overflow: 'visible' }}>
                          {/* Left: Questions Configuration */}
                          <div className="space-y-6">
                            <GlassCard>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <HelpCircle className="h-5 w-5" />
                                  Predefined Questions Configuration
                                </CardTitle>
                                <CardDescription>
                                  Manage suggested questions for users to select
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {isLoadingSearchCustomization ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between py-2">
                                      <div className="space-y-0.5">
                                        <Label htmlFor="search-predefined-questions-tab">
                                          Enable Predefined Questions
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                          Show suggested questions in the search bar
                                        </p>
                                      </div>
                                      <Switch
                                        id="search-predefined-questions-tab"
                                        checked={searchPredefinedQuestions}
                                        onCheckedChange={setSearchPredefinedQuestions}
                                      />
                                    </div>

                                    {/* Predefined Questions Configuration - Show when enabled */}
                                    {searchPredefinedQuestions && (
                                      <div className="space-y-6 pt-4 border-t">
                                        {/* No. of questions limit */}
                                        <div>
                                          <Label htmlFor="search-questions-limit-tab">
                                            No. of questions limit
                                          </Label>
                                          <div className="relative mt-2">
                                            <Input
                                              id="search-questions-limit-tab"
                                              type="number"
                                              value={searchQuestionsLimit}
                                              onChange={(e) => setSearchQuestionsLimit(parseInt(e.target.value) || 0)}
                                              min={1}
                                              max={50}
                                              className="pr-8"
                                            />
                                            {searchQuestionsLimit > 0 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                                onClick={() => setSearchQuestionsLimit(0)}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        {/* Questions List Management */}
                                        <div>
                                          <Label>
                                            Questions
                                          </Label>
                                          <div className="mt-2 space-y-2">
                                            {/* Add Question Input */}
                                            <div className="flex gap-2">
                                              <Input
                                                placeholder="Enter a question..."
                                                value={newQuestionText}
                                                onChange={(e) => setNewQuestionText(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter' && newQuestionText.trim()) {
                                                    e.preventDefault();
                                                    setSearchQuestionsList([...searchQuestionsList, newQuestionText.trim()]);
                                                    setNewQuestionText("");
                                                  }
                                                }}
                                              />
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                  if (newQuestionText.trim()) {
                                                    setSearchQuestionsList([...searchQuestionsList, newQuestionText.trim()]);
                                                    setNewQuestionText("");
                                                  }
                                                }}
                                                disabled={!newQuestionText.trim()}
                                              >
                                                <Plus className="h-4 w-4" />
                                              </Button>
                                            </div>

                                            {/* Questions List */}
                                            {searchQuestionsList.length > 0 && (
                                              <div className="border rounded-lg">
                                                <div className="max-h-60 overflow-y-auto">
                                                  {searchQuestionsList.map((question, index) => (
                                                    <div
                                                      key={index}
                                                      className={`flex items-center gap-2 p-2 border-b last:border-b-0 hover:bg-muted/50 ${
                                                        selectedQuestionIndex === index ? 'bg-muted' : ''
                                                      }`}
                                                      onClick={() => setSelectedQuestionIndex(index)}
                                                    >
                                                      <div className="flex-1 text-sm">{question}</div>
                                                      <div className="flex items-center gap-1">
                                                        <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-7 w-7"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (index > 0) {
                                                              const newList = [...searchQuestionsList];
                                                              [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
                                                              setSearchQuestionsList(newList);
                                                              setSelectedQuestionIndex(index - 1);
                                                            }
                                                          }}
                                                          disabled={index === 0}
                                                        >
                                                          <ChevronUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-7 w-7"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (index < searchQuestionsList.length - 1) {
                                                              const newList = [...searchQuestionsList];
                                                              [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
                                                              setSearchQuestionsList(newList);
                                                              setSelectedQuestionIndex(index + 1);
                                                            }
                                                          }}
                                                          disabled={index === searchQuestionsList.length - 1}
                                                        >
                                                          <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-7 w-7 text-destructive hover:text-destructive"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newList = searchQuestionsList.filter((_, i) => i !== index);
                                                            setSearchQuestionsList(newList);
                                                            setSelectedQuestionIndex(null);
                                                          }}
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <Button
                                      type="button"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        saveCustomizationMutation.mutate({
                                          searchFormType: searchFormType,
                                          buttonType: searchButtonType,
                                          searchButtonText: searchButtonText,
                                          searchInputPlaceholder: searchInputPlaceholder,
                                          recentSearch: searchRecentSearch,
                                          recentSearchTitle: searchRecentSearchTitle,
                                          predefinedQuestions: searchPredefinedQuestions,
                                          questionsPosition: searchQuestionsPosition,
                                          questionsLimit: searchQuestionsLimit,
                                          questions: searchQuestionsList,
                                        });
                                      }}
                                      {...preventScrollOnClick}
                                      className="w-auto min-w-[200px] mt-4"
                                      disabled={saveCustomizationMutation.isPending || isLoadingSearchCustomization}
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      {saveCustomizationMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </>
                                )}
                              </CardContent>
                            </GlassCard>
                          </div>

                          {/* Right: Live Preview - Sticky */}
                          <div
                            style={{
                              position: 'sticky',
                              top: '24px',
                              alignSelf: 'flex-start',
                              width: '100%',
                              overflow: 'visible',
                              zIndex: 10,
                              height: 'fit-content',
                              maxHeight: 'calc(100vh - 48px)',
                            }}
                            className="sticky-live-preview-wrapper"
                          >
                            <SearchBarLivePreview
                              settingsSubTab={settingsSubTab}
                              previewOverrides={{
                                title: searchTitle,
                                styleOption: searchStyleOption,
                                searchIcon: searchIcon,
                                loaderType: searchLoaderType,
                                secondaryColor: searchBackgroundColor,
                                borderRadius: searchBorderRadius,
                                resultStyle: searchResultStyle,
                                searchFormType: searchFormType,
                                buttonType: searchButtonType,
                                searchButtonText: searchButtonText,
                                searchInputPlaceholder: searchInputPlaceholder,
                                recentSearch: searchRecentSearch,
                                recentSearchTitle: searchRecentSearchTitle,
                                predefinedQuestions: searchPredefinedQuestions,
                                questionsList: searchQuestionsList,
                                questionsPosition: searchQuestionsPosition,
                                questionsLimit: searchQuestionsLimit,
                                showRecentSearchPreview: showRecentSearchPreview,
                                showLoaderPreview: showLoaderPreview,
                                citationFormatting: searchCitationFormatting ? {
                                  colorScheme: searchCitationFormatting.colorScheme,
                                  layout: searchCitationFormatting.layout,
                                  showSourceCount: searchCitationFormatting.showSourceCount,
                                } : undefined,
                              }}
                              minHeight={650}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </Tabs>
          </TabsContent>

          {/* Integrations Scripts Tab */}
          <TabsContent value="integrations" className="space-y-6 w-full overflow-hidden">
            {/* Web Integration */}
            <GlassCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Web Integration
                </CardTitle>
                <CardDescription>
                  Embed the chatbot widget on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="web-script">Web Widget Script</Label>
                  <div className="relative group rounded-lg overflow-hidden bg-[#1e1e1e] border border-border shadow-sm mt-2">
                    <div className="absolute right-4 top-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground bg-background hover:bg-accent border border-border shadow-sm transform transition-all active:scale-95"
                        onClick={async () => {
                          const ok = await copyToClipboard(webScript);
                          if (ok) {
                            toast({
                              title: "Copied",
                              description: "Web script copied to clipboard",
                              variant: "success",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-[#d4d4d4]">
                      {webScript}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

            {/* Mobile Integration */}
            <GlassCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile Integration
                </CardTitle>
                <CardDescription>
                  Integrate the chatbot SDK in your mobile app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mobile-script">Mobile SDK Code</Label>
                  <div className="relative group rounded-lg overflow-hidden bg-[#1e1e1e] border border-border shadow-sm mt-2">
                    <div className="absolute right-4 top-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground bg-background hover:bg-accent border border-border shadow-sm transform transition-all active:scale-95"
                        onClick={async () => {
                          const ok = await copyToClipboard(mobileScript);
                          if (ok) {
                            toast({
                              title: "Copied",
                              description: "Mobile SDK code copied to clipboard",
                              variant: "success",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-[#d4d4d4]">
                      {mobileScript}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Installation Instructions:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Install the SDK: npm install @company/chatbot-sdk</li>
                    <li>Import and initialize the SDK in your app</li>
                    <li>Configure API key and endpoint</li>
                    <li>Start using the chatbot in your mobile app</li>
                  </ul>
                </div>
              </CardContent>
            </GlassCard>
          </TabsContent>

          {/* Search Test Tab */}
          <TabsContent value="search-test" className="space-y-6 w-full overflow-visible">
            <div className="space-y-6 w-full min-w-0 max-w-full">
              {/* Search Box Section */}
              <GlassCard className="overflow-visible">
                <CardContent className="space-y-4 pt-6">
                  {/* Title from configuration */}
                  {searchTitle && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative">
                        <Search className="h-5 w-5 text-foreground" />
                        <Sparkles className="h-2.5 w-2.5 text-foreground absolute -top-0.5 -right-0.5" fill="currentColor" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{searchTitle}</h3>
                    </div>
                  )}

                  <form onSubmit={handleRagSearchSubmit} className="space-y-4 w-full min-w-0 relative">
                    {/* Get border radius value */}
                    {(() => {
                      const getBorderRadiusValue = (borderRadius: string) => {
                        switch (borderRadius) {
                          case 'rounded': return '12px';
                          case 'medium-rounded': return '10px';
                          case 'semi-rounded': return '8px';
                          case 'square': return '0px';
                          default: return '8px';
                        }
                      };
                      // Use saved values in test search
                      const borderRadiusValue = getBorderRadiusValue(savedSearchBorderRadius || 'semi-rounded');
                      const searchFormType = savedSearchFormType || 'default';
                      const showSendButton = searchFormType === 'withBtn';
                      const showSearchIcon = searchFormType === 'default';
                      const buttonType = savedSearchButtonType || 'icon';
                      const showButtonLabel = buttonType === 'withLabel';
                      const buttonText = savedSearchButtonText || 'Search';
                      const placeholder = savedSearchInputPlaceholder || 'Search using AI...';
                      
                      // Use custom colors when customize style is selected
                      const isCustomizedStyle = savedSearchStyleOption === 'plugin';
                      // Wrapper always uses default colors (not custom backgroundColor)
                      const wrapperBgColor = isDarkMode ? 'var(--tab-bg-default)' : '#f5f5f5';
                      const innerBgColor = isDarkMode ? '#121212' : '#ffffff';
                      const inputTextColor = isDarkMode ? '#f9fafb' : '#374151';
                      // Button uses custom backgroundColor when customized
                      const buttonBgColor = isCustomizedStyle && savedSearchBackgroundColor 
                        ? savedSearchBackgroundColor 
                        : (isDarkMode ? '#3b82f6' : '#1e3a8a');
                      const buttonTextColor = '#ffffff';

                      // Calculate padding based on icons and buttons
                      const paddingLeft = showSearchIcon ? '48px' : '16px';
                      const paddingRight = showSendButton
                        ? (showButtonLabel
                          ? (ragSearchInput ? '150px' : '110px')
                          : (ragSearchInput ? '106px' : '66px'))
                        : (ragSearchInput ? '50px' : '16px');

                      // Get search icon component - Use saved value
                      const SearchIconComponent = savedSearchIcon === 'scan' ? ScanSearch : savedSearchIcon === 'sparkles' ? Sparkles : Search;

                      return (
                        <div className="rag-search-form-wrapper w-full min-w-0" style={{
                          backgroundColor: wrapperBgColor,
                          borderRadius: borderRadiusValue,
                          padding: '12px',
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
                            position: 'relative',
                            minHeight: '56px'
                          }}>
                            {/* Left search icon when form type is default */}
                            {showSearchIcon && (
                              <div style={{
                                position: 'absolute',
                                left: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                zIndex: 1,
                                pointerEvents: 'none'
                              }}>
                                <SearchIconComponent className="h-5 w-5" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                              </div>
                            )}
                            <input
                              ref={ragSearchInputRef}
                              type="text"
                              className="rag-search-input-field"
                              style={{
                                flex: '1',
                                minWidth: '0',
                                border: 'none',
                                outline: 'none',
                                paddingLeft: paddingLeft,
                                paddingRight: paddingRight,
                                paddingTop: '14px',
                                paddingBottom: '14px',
                                backgroundColor: 'transparent',
                                color: inputTextColor,
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                lineHeight: '1.5'
                              }}
                              placeholder={placeholder}
                              value={ragSearchInput}
                              onChange={handleRagSearchInputChange}
                              onFocus={() => setRagSearchFocused(true)}
                              onBlur={() => setTimeout(() => setRagSearchFocused(false), 200)}
                              maxLength={150}
                              minLength={3}
                              autoComplete="off"
                              data-testid="rag-query-input"
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
                              {ragSearchInput && (
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
                                    borderRadius: showSendButton ? '8px 0 0 8px' : '8px'
                                  }}
                                  onClick={handleRagSearchClear}
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
                                    minWidth: showButtonLabel ? '110px' : '80px',
                                    height: '100%',
                                    border: 'none',
                                    background: buttonBgColor,
                                    borderRadius: ragSearchInput ? `0 ${borderRadiusValue} ${borderRadiusValue} 0` : borderRadiusValue,
                                    cursor: ragSearchInput.trim().length < 3 || isSearching ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: showButtonLabel ? '0 16px' : '0',
                                    gap: showButtonLabel ? '8px' : '0',
                                    margin: '0',
                                    opacity: (ragSearchInput.trim().length < 3 || isSearching) ? 0.6 : 1,
                                    transition: 'opacity 0.2s, background-color 0.2s, border-radius 0.2s',
                                    flexShrink: 0,
                                    boxShadow: 'none'
                                  }}
                                  disabled={isSearching || ragSearchInput.trim().length < 3}
                                  aria-label="Search"
                                >
                                  {isSearching ? (
                                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                                  ) : (
                                    <>
                                      {showButtonLabel ? (
                                        <>
                                          <span style={{ color: buttonTextColor, fontSize: '14px', fontWeight: '500' }}>{buttonText}</span>
                                        </>
                                      ) : (
                                        <SearchIconComponent className="h-5 w-5" style={{ color: buttonTextColor, strokeWidth: '2.5' }} />
                                      )}
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {ragSearchError && (
                      <div className="text-sm text-destructive">
                        {ragSearchError}
                      </div>
                    )}

                    {/* Recent Searches Dropdown - Show when enabled, focused, AND Predefined Questions are ON */}
                    {savedSearchRecentSearch && searchPredefinedQuestions && ragSearchFocused && recentSearches.length > 0 && (() => {
                      // Get border radius value
                      const getBorderRadiusValue = (borderRadius: string) => {
                        switch (borderRadius) {
                          case 'rounded': return '12px';
                          case 'medium-rounded': return '10px';
                          case 'semi-rounded': return '8px';
                          case 'square': return '0px';
                          default: return '8px';
                        }
                      };
                      const borderRadiusValue = getBorderRadiusValue(searchBorderRadius || 'semi-rounded');
                      return (
                        <div 
                          className="absolute left-0 right-0 top-full mt-2 z-[100] bg-background border border-border shadow-lg overflow-hidden"
                          style={{
                            borderRadius: borderRadiusValue
                          }}
                        >
                          <div className="p-3 border-b border-border bg-muted/30">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {savedSearchRecentSearchTitle || "Recent Searches"}
                            </p>
                          </div>
                          <div className="flex flex-col w-full">
                            {recentSearches.map((query, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setRagSearchInput(query);
                                  handleRagQuery(query);
                                  // Blur input to close suggestions
                                  if (ragSearchInputRef.current) {
                                    ragSearchInputRef.current.blur();
                                  }
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent blur
                                }}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-sm font-medium text-foreground truncate">{query}</span>
                                </div>
                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </form>

                  {/* Predefined Questions - Only show if enabled */}
                  {searchPredefinedQuestions && searchQuestionsList.length > 0 && (() => {
                    // Get border radius value
                    const getBorderRadiusValue = (borderRadius: string) => {
                      switch (borderRadius) {
                        case 'rounded': return '12px';
                        case 'medium-rounded': return '10px';
                        case 'semi-rounded': return '8px';
                        case 'square': return '0px';
                        default: return '8px';
                      }
                    };
                    const borderRadiusValue = getBorderRadiusValue(searchBorderRadius || 'semi-rounded');
                    return (
                      <div className="pt-4 border-t border-border space-y-4 w-full min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Suggestions
                        </p>
                        <div className="flex flex-wrap gap-3 w-full">
                          {savedSearchQuestionsList.slice(0, savedSearchQuestionsLimit || 5).map((query, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 border border-border cursor-pointer transition-all hover:shadow-sm w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-full"
                              style={{
                                borderRadius: borderRadiusValue
                              }}
                              onClick={() => {
                                setRagSearchInput(query);
                                handleRagQuery(query);
                                // Blur input to close suggestions
                                if (ragSearchInputRef.current) {
                                  ragSearchInputRef.current.blur();
                                }
                              }}
                              data-testid={`example-query-${index}`}
                            >
                              <span className="text-sm font-medium flex-1 break-words overflow-wrap-anywhere">
                                {query}
                              </span>
                              <HelpCircle className="h-4 w-4 flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Recent Searches Block - Show when enabled AND Predefined Questions are OFF */}
                  {savedSearchRecentSearch && !searchPredefinedQuestions && recentSearches.length > 0 && (() => {
                    return (
                      <div className="pt-4 border-t border-border space-y-4 w-full min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {savedSearchRecentSearchTitle || "Recent Search"}
                        </p>
                        <div className="flex flex-col w-full border border-border rounded-lg overflow-hidden">
                          {recentSearches.slice(0, 3).map((query, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                              onClick={() => {
                                setRagSearchInput(query);
                                handleRagQuery(query);
                                // Blur input to close suggestions
                                if (ragSearchInputRef.current) {
                                  ragSearchInputRef.current.blur();
                                }
                              }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium text-foreground truncate">{query}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">Just now</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </GlassCard>

              {/* Search Results Section */}
              {(ragMessages.length > 0 || isTyping || isStreaming) && (
                <GlassCard>
                  <CardContent className="pt-6">
                    {/* Loading - Skeleton or Typing Loader based on savedSearchLoaderType */}
                    {(isTyping || (isStreaming && !streamingContent)) && (
                      <>
                        {savedSearchLoaderType === "typing" ? (
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

                    {/* Results Display */}
                    {isLoadingRagHistory ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading chat history...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ragMessages
                          .filter((message) => message.type === "assistant")
                          .map((message, index) => {
                            const isLastMessage = index === ragMessages.filter((m) => m.type === "assistant").length - 1;
                            return (
                              <Suspense key={message.messageId || `${message.timestamp?.getTime()}-${index}`} fallback={<div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>}>
                                <div className="space-y-4 w-full min-w-0 max-w-full overflow-x-hidden">
                                  <div className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-muted-foreground prose-p:break-words prose-p:overflow-wrap-anywhere prose-headings:break-words prose-headings:overflow-wrap-anywhere prose-li:break-words prose-li:overflow-wrap-anywhere">
                                    {isStreaming && isLastMessage && streamingContent ? (
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
                                    ) : (
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
                                        {safeStringConversion(message.content)}
                                      </ReactMarkdown>
                                    )}
                                  </div>
                                  {message.citations && message.citations.length > 0 && (() => {
                                    const topKValue = message.actualTopK !== undefined ? message.actualTopK : (message.ragSettings?.topK !== undefined ? message.ragSettings.topK : message.citations.length);
                                    const displayedCitations = topKValue ? message.citations.slice(0, topKValue) : message.citations;
                                    const citationFormatting = searchCitationFormatting || { showSourceCount: true, layout: 'grid', colorScheme: 'default' };
                                    
                                    // Helper function to get citation color scheme classes
                                    const getCitationColorSchemeClasses = () => {
                                      const colorScheme = citationFormatting.colorScheme || 'default';
                                      switch (colorScheme) {
                                        case 'primary': return "border-primary/20 bg-primary/5";
                                        case 'muted': return "border-muted bg-muted/30";
                                        case 'accent': return "border-accent/20 bg-accent/5";
                                        default: return "border-border/20 bg-muted/30";
                                      }
                                    };
                                    
                                    return (
                                      <div className="pt-4 border-t border-border space-y-3 w-full min-w-0">
                                        {citationFormatting.showSourceCount && (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-medium text-muted-foreground">
                                              Sources ({displayedCitations.length}):
                                            </span>
                                          </div>
                                        )}
                                        <div className={`grid gap-3 w-full min-w-0 ${citationFormatting.layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                          {displayedCitations.map((citation, index) => (
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
                                    );
                                  })()}
                                </div>
                              </Suspense>
                            );
                          })}
                        <div ref={ragMessagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                </GlassCard>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

