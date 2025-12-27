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
  Globe,
  Smartphone,
  Save,
  RefreshCw,
  Upload,
  Check,
  HelpCircle,
  Sparkles,
  X,
  Copy,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  CheckSquare,
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
import { useBranding } from "@/contexts/BrandingContext";
import { useRAGSettings } from "@/contexts/RAGSettingsContext";
import { useSettingsAPI } from "@/hooks/useSettingsAPI";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import { useConfigModels, useAvailableChatModels, useAvailableEmbeddingModels, useAvailableModels } from "@/hooks/useConfigModels";
import { useSearchPrompt } from "@/hooks/useSearchPrompt";
import { useSearchActivation } from "@/hooks/useSearchActivation";
import { Slider } from "@/components/ui/slider";
import { FileText, Zap, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchBar } from "@/components/common/SearchBar";
import { EmbeddableWidget } from "@/components/common/EmbeddableWidget";
import { StickyLivePreview } from "@/components/ui/StickyLivePreview";
import { cn, copyToClipboard } from "@/lib/utils";
import { chatAPI, suggestionsAPI } from "@/services/api/api";
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
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

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
}

interface Conversation {
  sessionId: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  userName?: string;
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
  const { formatting, updateFormatting, resetFormatting } = useCitationFormatting();
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
    if (settingsSubTab === "chatbot-configuration" || settingsSubTab === "widget-customization") {
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
  } = useSearchActivation();

  // Search Prompt hook - for Overview tab real-time display
  const {
    promptString,
    isLoading: isLoadingPromptForOverview,
  } = useSearchPrompt();
  
  // Get current prompt text for Overview tab - real-time from API
  // Ensure it's always a string to prevent .split() errors
  const currentPrompt = typeof promptString === 'string' ? promptString : (promptString || "");

  // Training Tab State
  const [responseType, setResponseType] = useState<"long" | "short">("long");
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
  const { sessions, deleteSession } = useChatSessions();
  const [location] = useLocation();
  const [ragMessages, setRagMessages] = useState<Message[]>([
    {
      type: "assistant",
      content: "Welcome to the Search Test! Ask me anything about your documentation to test different retrieval and generation settings.",
      timestamp: new Date(),
    },
  ]);
  const [isLoadingRagHistory, setIsLoadingRagHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const ragMessagesEndRef = useRef<HTMLDivElement>(null);

  // Settings Tab State (CSP removed per user request)
  
  // Config Models hook
  const {
    configModels,
    isLoading: isLoadingConfigModels,
    saveConfigModelsAsync,
    isSaving: isSavingConfigModels,
  } = useConfigModels();
  
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
    { id: "default-1", name: "Default 1", emoji: "🤖" },
    { id: "default-2", name: "Default 2", emoji: "👤" },
    { id: "default-3", name: "Default 3", emoji: "👨" },
    { id: "default-4", name: "Default 4", emoji: "👩" }
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

  // Populate state from API data when chatbotSettings is loaded
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

  // Populate state from API data when configModels is loaded
  useEffect(() => {
    if (configModels) {
      if (configModels.model_provider) setModelProvider(configModels.model_provider);
      if (configModels.chat_model) setChatModel(configModels.chat_model);
      if (configModels.embedding_model) setEmbeddingModel(configModels.embedding_model);
      // Populate API key if it exists in the response (only on initial load)
      if (configModels.api_key && configModels.api_key.trim() !== '' && !hasPopulatedApiKey.current) {
        // Populate API key from API so user can see it exists
        setModelApiKey(configModels.api_key);
        hasPopulatedApiKey.current = true;
      }
      // Populate new model parameters
      if (configModels.chat_temperature !== undefined) setTemperature(configModels.chat_temperature);
      if (configModels.chat_top_p !== undefined) setTopP(configModels.chat_top_p);
      if (configModels.chat_best_of !== undefined) setBestOf(configModels.chat_best_of);
      if (configModels.chat_frequency_penalty !== undefined) setFrequencyPenalty(configModels.chat_frequency_penalty);
      if (configModels.chat_presence_penalty !== undefined) setPresencePenalty(configModels.chat_presence_penalty);
      if (configModels.chat_top_k !== undefined) setTopK(configModels.chat_top_k);
      if (configModels.chat_similarity_threshold !== undefined) setSimilarityThreshold(configModels.chat_similarity_threshold);
      if (configModels.chat_max_tokens !== undefined) setMaxTokens(configModels.chat_max_tokens);
      if (configModels.chat_use_reranker !== undefined) setUseReranker(configModels.chat_use_reranker);
    }
  }, [configModels]);
  
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

  const handleSaveTraining = useCallback(() => {
    toast({
      title: "Training Settings Saved",
      description: "Your training configuration has been saved successfully.",
      variant: "success",
    });
  }, [toast]);

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
    
    // Format as: "Jan 15, 2024, 2:30 PM" or similar
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
      const history = await chatAPI.getChatHistory();
      
      if (history && history.length > 0) {
        // Group messages by sessionId - CRITICAL: Only group messages with matching sessionIds
        const sessionMap = new Map<string, Conversation>();
        
        console.log('📜 Loading chat history, total items:', history.length);
        
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
          });
          conversation.messageCount += 1;
          
          // Update preview to first user message
          if (!conversation.preview && item.userMessage) {
            conversation.preview = item.userMessage.substring(0, 100);
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
      console.error('Failed to load chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setIsLoadingChatHistory(false);
    }
  }, [toast]);

  // Load chat history when tab is active (history tab or overview tab for preview) and poll for updates
  useEffect(() => {
    if (activeTab !== 'training' || (trainingSubTab !== 'history' && trainingSubTab !== 'overview')) {
      return;
    }

    // Initial load
    loadChatHistory();

    // Set up polling interval (refresh every 30 seconds for real-time updates)
    const intervalId = setInterval(() => {
      loadChatHistory();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [activeTab, trainingSubTab, loadChatHistory]);

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
      await chatAPI.deleteSession(sessionId);
      toast({
        title: "Deleted",
        description: "Conversation deleted successfully.",
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
      console.error('Failed to delete conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedSessionId, toast, loadChatHistory]);

  // Handle delete all selected
  const handleDeleteAll = useCallback(async () => {
    if (selectedSessionIds.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedSessionIds).map(sessionId =>
        chatAPI.deleteSession(sessionId)
      );
      await Promise.all(deletePromises);
      toast({
        title: "Deleted",
        description: `${selectedSessionIds.size} conversation(s) deleted successfully.`,
        variant: "success",
      });
      setSelectedSessionIds(new Set());
      await loadChatHistory();
      setSelectedSessionId(null);
    } catch (error) {
      console.error('Failed to delete conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete some conversations. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedSessionIds, toast, loadChatHistory]);

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

  // Load RAG chat history
  useEffect(() => {
    if (activeTab === 'search-test') {
      const loadChatHistory = async () => {
        try {
          setIsLoadingRagHistory(true);
          const history = await chatAPI.getChatHistory();
          if (history && history.length > 0) {
            const convertedMessages: Message[] = [];
            [...history].reverse().forEach((item: any) => {
              convertedMessages.push({
                type: "user",
                content: item.userMessage,
                timestamp: new Date(item.createdAt),
              });
              convertedMessages.push({
                type: "assistant",
                content: item.assistantResponse,
                timestamp: new Date(item.createdAt),
                messageId: item.messageId,
                sessionId: item.sessionId,
                citations: (Array.isArray(item.sources) && item.sources.length > 0)
                  ? item.sources
                      .filter((source: any) => source != null)
                      .map((source: any) => ({
                        title: source?.title || 'Untitled',
                        url: source?.url || '#',
                        snippet: source?.snippet || ''
                      }))
                  : undefined,
              });
            });
            setRagMessages([
              {
                type: "assistant",
                content: "Welcome to the Search Test! Ask me anything about your documentation to test different retrieval and generation settings.",
                timestamp: new Date(),
              },
              ...convertedMessages
            ]);
          }
        } catch (error) {
          console.warn('Failed to load chat history:', error);
        } finally {
          setIsLoadingRagHistory(false);
        }
      };
      loadChatHistory();
    }
  }, [activeTab]);

  // Auto-scroll for RAG messages
  useEffect(() => {
    if (isStreaming || isTyping) {
      ragMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ragMessages, streamingContent, isStreaming, isTyping]);

  // Handle RAG query
  const handleRagQuery = useCallback(async (query: string) => {
    const userMessage: Message = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };
    setRagMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setPendingResponse("Searching with RAG settings...");
    const startTime = Date.now();

    try {
      const searchResponse = await searchAsync(query, ragSettings);
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
      setIsStreaming(true);
      setStreamingContent("");
      setPendingResponse(null);

      const responseContent = searchResponse.answer || "No answer from API";
      await simulateStreamingResponse(responseContent, (content) => {
        setStreamingContent(content);
      });

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

      setRagMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
      setStreamingContent("");
    } catch (error) {
      console.error("Search API call failed:", error);
      setIsTyping(false);
      setIsStreaming(false);
      setPendingResponse(null);
      const errorMessage: Message = {
        type: "assistant",
        content: `Sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setRagMessages(prev => [...prev, errorMessage]);
    }
  }, [ragSettings, searchAsync, updateMetrics]);

  const clearRagChat = async () => {
    try {
      await chatAPI.deleteAllMessages();
    } catch (error) {
      console.error('Failed to delete messages:', error);
    }
    setRagMessages([
      {
        type: "assistant",
        content: "Welcome to the Search Test! Ask me anything about your documentation to test different retrieval and generation settings.",
        timestamp: new Date(),
      }
    ]);
    setCurrentSessionId(undefined);
  };

  // Fetch suggestions for RAG
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: suggestionsAPI.getSuggestions,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const exampleQueries = useMemo(() => {
    if (suggestionsData?.suggestions && suggestionsData.suggestions.length > 0) {
      return suggestionsData.suggestions;
    }
    return [
      "How do I configure authentication?",
      "What are the API rate limits?",
      "How to troubleshoot deployment issues?",
      "Best practices for data backup",
    ];
  }, [suggestionsData]);

  // Check if widget customization tab is active for overflow override
  const isWidgetCustomizationTab = settingsSubTab === 'widget-customization';
  
  return (
    <div className="relative">
      <div 
        className="relative z-10 space-y-6 w-full max-w-full min-w-0 p-0 sm:p-6" 
        style={{ 
          maxWidth: '92vw',
          overflow: isWidgetCustomizationTab ? 'visible' : 'hidden'
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
                          trainingSubTab === "status"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTrainingTabClick(e, "status")}
                        {...preventScrollOnClick}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        Active Status
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          trainingSubTab === "prompt"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTrainingTabClick(e, "prompt")}
                        {...preventScrollOnClick}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Prompt Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          trainingSubTab === "response"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTrainingTabClick(e, "response")}
                        {...preventScrollOnClick}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Response Config
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
                        Chat History
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
                            trainingSubTab === "status"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTrainingTabClick(e, "status")}
                          {...preventScrollOnClick}
                        >
                          <Power className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Status</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            trainingSubTab === "prompt"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTrainingTabClick(e, "prompt")}
                          {...preventScrollOnClick}
                        >
                          <Edit className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Prompt</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            trainingSubTab === "response"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTrainingTabClick(e, "response")}
                          {...preventScrollOnClick}
                        >
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Response</span>
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
                                    image.png                                      {typeof currentPrompt === 'string' ? (currentPrompt || "No prompt set") : "No prompt set"}
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
                                <div className="text-sm font-medium text-muted-foreground mb-2">Chat History</div>
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

                      {/* Active Status Tab */}
                      {trainingSubTab === "status" && (
                      <div className="space-y-6 w-full overflow-hidden">
            {/* Active Status */}
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
                            // Error toast is handled in the hook
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
                      </div>
                      )}

                      {/* Prompt Edit Tab */}
                      {trainingSubTab === "prompt" && (
                        <PromptEditTab />
                      )}

                      {/* Response Configuration Tab */}
                      {trainingSubTab === "response" && (
                      <div className="space-y-6 w-full overflow-hidden">
            {/* Response Config Options */}
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
                <div>
                  <Label htmlFor="response-type">Response Type</Label>
                  <Select value={responseType} onValueChange={(value: "long" | "short") => setResponseType(value)}>
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
                  {...preventScrollOnClick}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
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
                      Chat History
                    </CardTitle>
                    <CardDescription>
                      View and filter chat history logs
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAll}
                      disabled={selectedSessionIds.size === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Split Panel Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-450px)] min-h-[600px]">
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
                            Loading chat history...
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
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={selectedSessionIds.has(conversation.sessionId)}
                                    onCheckedChange={() => {
                                      handleToggleConversationSelection(conversation.sessionId);
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-2 mb-1">
                                    {conversation.preview || "New conversation"}
                                  </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex flex-col">
                                  <span>{formatDateTime(conversation.timestamp)}</span>
                                  <span className="text-[10px] opacity-75">{formatRelativeTime(conversation.timestamp)}</span>
                                </span>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{conversation.messageCount}</span>
                                </div>
                              </div>
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
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {selectedConversation.userName?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {selectedConversation.userName || "User"}
                              </h3>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConversation(selectedConversation.sessionId)}
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
                              .map((message: ConversationMessage, index: number) => (
                              <ChatMessage
                                key={message.messageId || index}
                                type={message.type}
                                content={message.content}
                                citations={message.citations}
                                timestamp={message.timestamp}
                                messageId={message.messageId}
                                sessionId={message.sessionId}
                                showFeedback={true}
                              />
                            ))}
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
                          settingsSubTab === "chatbot-configuration"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "chatbot-configuration")}
                        {...preventScrollOnClick}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Configuration
                      </Button>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                          settingsSubTab === "widget-customization"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                        )}
                        onClick={(e) => handleTabClick(e, "widget-customization")}
                        {...preventScrollOnClick}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                         Customization
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
                            settingsSubTab === "chatbot-configuration"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "chatbot-configuration")}
                          {...preventScrollOnClick}
                        >
                          <MessageSquare className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Config</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                            settingsSubTab === "widget-customization"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                          )}
                          onClick={(e) => handleTabClick(e, "widget-customization")}
                          {...preventScrollOnClick}
                        >
                          <Bot className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Custom</span>
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
                        <TabsTrigger value="chatbot-configuration">Configuration</TabsTrigger>
                        <TabsTrigger value="widget-customization">Widget Customization</TabsTrigger>
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

                              {/* Chatbot Configuration Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Chatbot Config</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Title:</span>
                                    <span className="font-semibold truncate max-w-[120px]">{chatbotTitle || "Not set"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Language:</span>
                                    <span className="font-semibold uppercase">{chatbotLanguage}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Widget Customization Preview - Real-time */}
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Widget</div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Position:</span>
                                    <span className="font-semibold capitalize">{widgetPosition.replace('-', ' ')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Avatar Size:</span>
                                    <span className="font-semibold">{widgetAvatarSize}px</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Show Logo:</span>
                                    <Badge variant={widgetShowLogo ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                                      {widgetShowLogo ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Show Date/Time:</span>
                                    <Badge variant={widgetShowDateTime ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                                      {widgetShowDateTime ? "Yes" : "No"}
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
                                        onValueChange={(value) => updateRAGSettings({ maxTokens: value[0] })}
                                        min={0}
                                        max={1000}
                                        step={50}
                                        data-testid="slider-max-tokens"
                                        className="flex-1"
                                      />
                                      <Badge variant="outline" className="text-xs w-20 text-center">{ragSettings.maxTokens === 0 ? "Unlimited" : ragSettings.maxTokens}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Maximum length of generated responses (0 = unlimited, max 1000)
                                    </p>
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
                                        chat_model: chatModel,
                                        embedding_model: embeddingModel,
                                        api_key: apiKeyToSave,
                                        chat_temperature: temperature,
                                        chat_top_p: topP,
                                        chat_best_of: bestOf,
                                        chat_frequency_penalty: frequencyPenalty,
                                        chat_presence_penalty: presencePenalty,
                                        chat_top_k: topK,
                                        chat_similarity_threshold: similarityThreshold,
                                        chat_max_tokens: maxTokens,
                                        chat_use_reranker: useReranker,
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
                {/* Citation Style */}
                <div>
                  <Label htmlFor="citation-style">Citation Style</Label>
                  <Select
                    value={formatting.style}
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Enable Hover Effects</Label>
                      <p className="text-xs text-muted-foreground">
                        Add hover animations
                      </p>
                    </div>
                    <Switch
                      checked={formatting.enableHover}
                      onCheckedChange={(checked: boolean) => updateFormatting({ enableHover: checked })}
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
                    onClick={() => {
                      toast({
                        title: "Citation settings saved",
                        description: "Your citation formatting preferences have been saved successfully.",
                        variant: "success"
                      });
                    }}
                    className="w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={resetFormatting} className="w-full sm:w-auto">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </GlassCard>
                      </TabsContent>

                      {/* Chatbot Configuration Tab */}
                      <TabsContent value="chatbot-configuration" className="space-y-6 w-full chatbot-configuration-tab">
                        <style>{`
                          .chatbot-configuration-tab button {
                            scroll-margin: 0 !important;
                          }
                          .chatbot-configuration-tab button:focus {
                            scroll-margin: 0 !important;
                          }
                          .chatbot-configuration-tab button:focus-visible {
                            scroll-margin: 0 !important;
                          }
                        `}</style>
                        <div ref={configurationRef} className="grid gap-6 grid-cols-1 lg:grid-cols-2 lg:items-start">
                          {/* Left: Configuration Controls */}
                          <div className="space-y-6">
                            <GlassCard>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <MessageSquare className="h-5 w-5" />
                                  Configuration
                                </CardTitle>
                                <CardDescription>
                                  Configure your chatbot's basic settings and behavior
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                <div>
                                  <Label htmlFor="chatbot-title">
                                    Chatbot Title
                                  </Label>
                                  <Input
                                    id="chatbot-title"
                                    type="text"
                                    value={chatbotTitle}
                                    onChange={(e) => setChatbotTitle(e.target.value)}
                                    placeholder="RAGSuite Demo"
                                    className="mt-2"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="bubble-message">
                                    Bubble Message
                                  </Label>
                                  <Input
                                    id="bubble-message"
                                    type="text"
                                    value={bubbleMessage}
                                    onChange={(e) => setBubbleMessage(e.target.value)}
                                    placeholder="Bubble Message"
                                    className="mt-2"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="welcome-message">
                                    Welcome Message
                                  </Label>
                                  <Input
                                    id="welcome-message"
                                    type="text"
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    placeholder="Hi, how can I help you?"
                                    className="mt-2"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="chatbot-language">
                                    Chatbot Language
                                  </Label>
                                  <Select value={chatbotLanguage} onValueChange={setChatbotLanguage}>
                                    <SelectTrigger id="chatbot-language" className="mt-2">
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

                                <Button
                                  type="button"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      // Save configuration to API
                                      await saveConfigurationAsync({
                                        chatbot_title: chatbotTitle,
                                        short_description: "",
                                        bubble_message: bubbleMessage,
                                        welcome_message: welcomeMessage,
                                        chatbot_language: chatbotLanguage,
                                      });
                                      
                                      // Note: orgName should come from Settings, not from Chatbot Configuration
                                      // Do not update BrandingContext orgName here
                                    } catch (error) {
                                      console.error("Failed to save configuration:", error);
                                      // Error toast is handled in the hook
                                    }
                                  }}
                                  {...preventScrollOnClick}
                                  className="w-auto min-w-[200px]"
                                  disabled={isSavingConfiguration || isLoadingChatbotSettings}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {isSavingConfiguration ? "Saving..." : "Save Configuration"}
                                </Button>
                              </CardContent>
                            </GlassCard>
                          </div>

                          {/* Right: Live Preview */}
                          <StickyLivePreview
                            isWidgetOpen={isWidgetOpen}
                            onWidgetToggle={() => setIsWidgetOpen(!isWidgetOpen)}
                            settingsSubTab={settingsSubTab}
                            previewOverrides={{
                              widgetLogoUrl,
                              widgetAvatar,
                              widgetAvatarSize,
                              widgetChatbotColor,
                              widgetShowLogo,
                              widgetShowDateTime,
                              widgetBottomSpace,
                              widgetFontSize,
                              widgetTriggerBorderRadius,
                              widgetPosition,
                              widgetZIndex,
                              widgetOffsetX,
                              widgetOffsetY,
                              orgName: orgNameGlobal,
                              chatbotTitle: chatbotTitle || undefined,
                              bubbleMessage: bubbleMessage || undefined,
                              welcomeMessage: welcomeMessage || undefined,
                            }}
                            minHeight={650}
                          />
                        </div>
                      </TabsContent>

                      {/* Widget Customization Tab */}
                      <TabsContent value="widget-customization" className="w-full widget-customization-tab" style={{ overflow: 'visible' }}>
                        <div ref={widgetCustomizationRef} className="grid gap-4 grid-cols-1 lg:grid-cols-2 items-start" style={{ overflow: 'visible' }}>
                          {/* Left: Customization Controls */}
                          <div className="space-y-3">
                                <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                              <CardHeader className="border-b border-border/50 pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-medium">
                                  Upload Logo
                      
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 pt-3">
                                <input
                                  ref={widgetLogoFileRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleWidgetLogoChange}
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      widgetLogoFileRef.current?.click();
                                    }}
                                    className="flex-shrink-0"
                                  >
                                    Choose file
                                  </Button>
                                  <Input
                                    type="text"
                                    readOnly
                                    value={widgetLogoFileName || "No file chosen"}
                                    className="flex-1 text-sm text-muted-foreground"
                                    placeholder="No file chosen"
                                  />
                                  {widgetLogoUrl && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveWidgetLogo();
                                      }}
                                      className="flex-shrink-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                {widgetLogoUrl && (
                                  <div className="mt-2 pt-2 border-t">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-xs text-muted-foreground">Preview:</Label>
                                      <div className="flex items-center justify-center p-1.5 border rounded bg-muted/30">
                                        <img
                                          src={widgetLogoUrl}
                                          alt="Widget logo preview"
                                          className="max-h-8 max-w-20 object-contain"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </GlassCard>

                            <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                              <CardHeader className="border-b border-border/50 pb-2">
                                <CardTitle className="text-base font-medium">Avatar</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 pt-3">
                                <div className="flex flex-wrap gap-1 items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {avatarOptions.map((avatar) => (
                                        <Button
                                          type="button"
                                          key={avatar.id}
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "h-10 w-10 p-0 relative rounded-full",
                                            widgetAvatar === avatar.id && "ring-2 ring-primary"
                                          )}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setWidgetAvatar(avatar.id);
                                            // Don't update BrandingContext - only update on save
                                          }}
                                          onMouseDown={(e) => {
                                            // Prevent focus which can cause scrolling
                                            e.preventDefault();
                                          }}
                                        >
                                        <span className="text-2xl">{avatar.emoji}</span>
                                      </Button>
                                    ))}
                                    {/* Show uploaded custom avatar as a selectable option */}
                                    {isCustomAvatar && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          "h-10 w-10 p-0 relative rounded-full overflow-hidden",
                                          isCustomAvatar && widgetAvatar && !widgetAvatar.startsWith("default-") && "ring-2 ring-primary"
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          // Keep the custom avatar selected
                                        }}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                        }}
                                        title="Custom avatar"
                                      >
                                        <img
                                          src={widgetAvatar}
                                          alt="Custom avatar"
                                          className="h-full w-full object-cover"
                                        />
                                      </Button>
                                    )}
                                    <input
                                      ref={widgetAvatarFileRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleWidgetAvatarChange}
                                    />
                                    <Button 
                                      type="button"
                                      variant="outline" 
                                      size="sm" 
                                      className="h-10 w-10 p-0 rounded-full"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        widgetAvatarFileRef.current?.click();
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                      }}
                                      onFocus={(e) => {
                                        e.target.blur();
                                      }}
                                    >
                                      <span className="text-2xl">+</span>
                                    </Button>
                                  </div>
                                  {isCustomAvatar && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveCustomAvatar();
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                      }}
                                      onFocus={(e) => {
                                        e.target.blur();
                                      }}
                                      className="h-10 w-10 p-0 text-destructive hover:text-destructive"
                                      title="Remove custom avatar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </GlassCard>

                            {/* Chatbot Color */}
                                <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                                  <CardHeader className="border-b border-border/50 pb-2">
                                    <CardTitle className="text-base font-medium">Chatbot Color</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3 pt-3">
                                    {/* Predefined Colors and Custom Color Picker */}
                                    <div className="flex gap-2 flex-wrap items-center">
                                      {chatbotColors.map((color) => (
                                        <Button
                                          type="button"
                                          key={color.value}
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "h-10 w-10 p-0 relative flex-shrink-0",
                                            widgetChatbotColor === color.value && "ring-2 ring-primary"
                                          )}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setWidgetChatbotColor(color.value);
                                            // Don't update BrandingContext - only update on save
                                          }}
                                          onMouseDown={(e) => {
                                            // Prevent focus which can cause scrolling
                                            e.preventDefault();
                                          }}
                                        >
                                          <div
                                            className="w-full h-full rounded"
                                            style={{
                                              backgroundColor: color.value === "gradient" ? undefined : color.color,
                                              backgroundImage: color.value === "gradient" ? color.color : undefined,
                                            }}
                                          />
                                          {widgetChatbotColor === color.value && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <Check className="h-4 w-4 text-white drop-shadow-lg" />
                                            </div>
                                          )}
                                        </Button>
                                      ))}
                                      {/* Custom Color Picker */}
                                      <input
                                        type="color"
                                        value={widgetChatbotColor.startsWith('#') ? widgetChatbotColor : '#1F2937'}
                                        onChange={(e) => {
                                          setWidgetChatbotColor(e.target.value);
                                        }}
                                        className="h-10 w-10 cursor-pointer rounded border border-input flex-shrink-0"
                                        style={{ 
                                          appearance: 'none',
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none',
                                        }}
                                        title="Pick custom color"
                                      />
                                    </div>
                                    
                                    {/* Custom Gradient Picker */}
                                    <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                                      <Label className="text-sm font-medium">Custom Gradient</Label>
                                      <div className="space-y-3">
                                        {/* Gradient Preview */}
                                        <div 
                                          className="w-full h-12 rounded border border-input"
                                          style={{
                                            backgroundImage: `linear-gradient(${customGradientAngle}deg, ${customGradientColor1} 0%, ${customGradientColor2} 100%)`
                                          }}
                                        />
                                        
                                        {/* Gradient Color Inputs */}
                                        <div className="flex gap-3 items-center">
                                          <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground mb-1.5 block">Color 1</Label>
                                            <div className="flex gap-2 items-center">
                                              <input
                                                type="color"
                                                value={customGradientColor1}
                                                onChange={(e) => setCustomGradientColor1(e.target.value)}
                                                className="h-8 w-12 cursor-pointer rounded border border-input flex-shrink-0"
                                                style={{ 
                                                  appearance: 'none',
                                                  WebkitAppearance: 'none',
                                                  MozAppearance: 'none',
                                                }}
                                                title="Gradient color 1"
                                              />
                                              <Input
                                                type="text"
                                                value={customGradientColor1}
                                                onChange={(e) => setCustomGradientColor1(e.target.value)}
                                                className="flex-1 h-8 text-xs font-mono"
                                                placeholder="#667eea"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground mb-1.5 block">Color 2</Label>
                                            <div className="flex gap-2 items-center">
                                              <input
                                                type="color"
                                                value={customGradientColor2}
                                                onChange={(e) => setCustomGradientColor2(e.target.value)}
                                                className="h-8 w-12 cursor-pointer rounded border border-input flex-shrink-0"
                                                style={{ 
                                                  appearance: 'none',
                                                  WebkitAppearance: 'none',
                                                  MozAppearance: 'none',
                                                }}
                                                title="Gradient color 2"
                                              />
                                              <Input
                                                type="text"
                                                value={customGradientColor2}
                                                onChange={(e) => setCustomGradientColor2(e.target.value)}
                                                className="flex-1 h-8 text-xs font-mono"
                                                placeholder="#764ba2"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Gradient Angle */}
                                        <div>
                                          <div className="flex items-center justify-between mb-1.5">
                                            <Label className="text-xs text-muted-foreground">Angle</Label>
                                            <span className="text-xs text-muted-foreground">{customGradientAngle}°</span>
                                          </div>
                                          <Slider
                                            value={[customGradientAngle]}
                                            onValueChange={(value) => setCustomGradientAngle(value[0])}
                                            min={0}
                                            max={360}
                                            step={1}
                                            className="w-full"
                                          />
                                        </div>
                                        
                                        {/* Apply Button */}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCustomGradientApply();
                                          }}
                                          className="w-full"
                                        >
                                          Apply Gradient
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </GlassCard>

                            {/* Chatbot Position */}
                                <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                                  <CardHeader className="border-b border-border/50 pb-2">
                                    <CardTitle className="text-base font-medium">Chatbot Position</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 pt-3">
                                    <div className="grid grid-cols-2 gap-1.5">
                                      <Button
                                        type="button"
                                        variant={widgetPosition === "bottom-left" ? "default" : "outline"}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setWidgetPosition("bottom-left");
                                          // Don't update BrandingContext - only update on save
                                        }}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                        }}
                                        onFocus={(e) => {
                                          e.target.blur();
                                        }}
                                        className="h-10 flex flex-row items-center justify-center gap-1.5 px-2"
                                      >
                                        <div className="w-5 h-5 border border-current rounded relative">
                                          <div className="absolute bottom-0 left-0 w-2 h-2 bg-current rounded-full" />
                                        </div>
                                        <span className="text-xs">Left</span>
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={widgetPosition === "bottom-right" ? "default" : "outline"}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setWidgetPosition("bottom-right");
                                          // Don't update BrandingContext - only update on save
                                        }}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                        }}
                                        onFocus={(e) => {
                                          e.target.blur();
                                        }}
                                        className="h-10 flex flex-row items-center justify-center gap-1.5 px-2"
                                      >
                                        <div className="w-5 h-5 border border-current rounded relative">
                                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-current rounded-full" />
                                        </div>
                                        <span className="text-xs">Right</span>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </GlassCard>

                            {/* Options */}
                                <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                                  <CardHeader className="border-b border-border/50 pb-2">
                                    <CardTitle className="text-base font-medium">Options</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 pt-3">
                                    <div className="flex items-center justify-between py-1">
                                      <Label className="text-sm">Show Logo</Label>
                                      <Switch
                                        checked={widgetShowLogo}
                                        onCheckedChange={(checked) => {
                                          setWidgetShowLogo(checked);
                                          // Don't update BrandingContext - only update on save
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                      <Label className="text-sm">Show Date & Time</Label>
                                      <Switch
                                        checked={widgetShowDateTime}
                                        onCheckedChange={(checked) => {
                                          setWidgetShowDateTime(checked);
                                          // Don't update BrandingContext - only update on save
                                        }}
                                      />
                                    </div>
                                  </CardContent>
                                </GlassCard>

                                <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                                  <CardHeader className="border-b border-border/50 pb-2">
                                    <CardTitle className="text-base font-medium">Widget Settings</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-6 pt-3">
                                    {/* Avatar Size */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm">Avatar Size: {widgetAvatarSize}px</Label>
                                      </div>
                                      <Slider
                                        value={[widgetAvatarSize]}
                                        onValueChange={(value) => {
                                          setWidgetAvatarSize(value[0]);
                                          // Don't update BrandingContext - only update on save
                                        }}
                                        min={15}
                                        max={200}
                                        step={1}
                                      />
                                    </div>

                                    {/* Widget Bottom Space */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm">Widget Bottom Space: {widgetBottomSpace}px</Label>
                                      </div>
                                      <Slider
                                        value={[widgetBottomSpace]}
                                        onValueChange={(value) => {
                                          setWidgetBottomSpace(value[0]);
                                          // Don't update BrandingContext - only update on save
                                        }}
                                        min={15}
                                        max={200}
                                        step={1}
                                      />
                                    </div>

                                    {/* Border Radius */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm">Border Radius: {widgetTriggerBorderRadius}px</Label>
                                      </div>
                                      <Slider
                                        value={[widgetTriggerBorderRadius]}
                                        onValueChange={(value) => {
                                          setWidgetTriggerBorderRadius(value[0]);
                                          // Don't update BrandingContext - only update on save
                                        }}
                                        min={0}
                                        max={50}
                                        step={1}
                                      />
                                    </div>
                                  </CardContent>
                                </GlassCard>

                            {/* Save Button */}

                            <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
                              <CardContent className="pt-3">
                                <Button
                                  type="button"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      // Save all widget customization settings to API
                                      await saveCustomizationAsync({
                                        widget_logo_url: widgetLogoUrl || "",
                                        widget_avatar: widgetAvatar,
                                        widget_avatar_size: widgetAvatarSize,
                                        widget_chatbot_color: widgetChatbotColor,
                                        widget_show_logo: widgetShowLogo,
                                        widget_show_date_time: widgetShowDateTime,
                                        widget_bottom_space: widgetBottomSpace,
                                        widget_trigger_border_radius: widgetTriggerBorderRadius,
                                        widget_position: widgetPosition,
                                        widget_z_index: widgetZIndex,
                                        widget_offset_x: widgetOffsetX,
                                        widget_offset_y: widgetOffsetY,
                                      });
                                      
                                      // Also update BrandingContext for backward compatibility
                                      setBranding({
                                        widgetLogoUrl,
                                        widgetAvatar,
                                        widgetAvatarSize,
                                        widgetChatbotColor,
                                        widgetShowLogo,
                                        widgetShowDateTime,
                                        widgetBottomSpace,
                                        widgetTriggerBorderRadius,
                                        widgetPosition,
                                        widgetZIndex,
                                        widgetOffsetX,
                                        widgetOffsetY,
                                      });
                                    } catch (error) {
                                      console.error("Failed to save widget customization:", error);
                                      // Error toast is handled in the hook
                                    }
                                  }}
                                  {...preventScrollOnClick}
                                  className="w-auto min-w-[200px]"
                                  disabled={isSavingCustomization || isLoadingChatbotSettings}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {isSavingCustomization ? "Saving..." : "Save Widget Customization"}
                                </Button>
                              </CardContent>
                            </GlassCard>
                          </div>

                          {/* Right: Live Preview */}
                          <StickyLivePreview
                            isWidgetOpen={isWidgetOpen}
                            onWidgetToggle={() => setIsWidgetOpen(!isWidgetOpen)}
                            settingsSubTab={settingsSubTab}
                            previewOverrides={{
                              widgetLogoUrl,
                              widgetAvatar,
                              widgetAvatarSize,
                              widgetChatbotColor,
                              widgetShowLogo,
                              widgetShowDateTime,
                              widgetBottomSpace,
                              widgetFontSize,
                              widgetTriggerBorderRadius,
                              widgetPosition,
                              widgetZIndex,
                              widgetOffsetX,
                              widgetOffsetY,
                              orgName: orgNameGlobal,
                            }}
                            minHeight={650}
                          />
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
          <TabsContent value="search-test" className="space-y-6 w-full overflow-hidden">
            <div className="relative lg:h-full lg:overflow-hidden">
              <div className="relative z-10 space-y-6 p-0">
                <div className="flex flex-col md:flex-row gap-5 md:gap-0 justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Search Test</h2>
                    <p className="text-muted-foreground">
                      Test your search configuration with different retrieval and generation settings
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearRagChat}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Chat
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 min-h-0">
                  {/* Query Interface */}
                  <div className="lg:col-span-2 space-y-4 min-h-0 flex flex-col">
                    <GlassCard>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Query Interface
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Suspense fallback={<div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
                          <LazySearchBar
                            placeholder="Ask about policies, docs, or how-tos..."
                            onSearch={handleRagQuery}
                            showSendButton
                            data-testid="rag-query-input"
                          />
                        </Suspense>

                        {isSearching && (
                          <TypingIndicator
                            message="Searching documentation with RAG settings..."
                            variant="wave"
                            size="md"
                          />
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Suggested Questions:</Label>
                          <div className="flex flex-wrap gap-2">
                            {isLoadingSuggestions && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading suggestions...</span>
                              </div>
                            )}
                            {!isLoadingSuggestions && exampleQueries.map((query, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleRagQuery(query)}
                                data-testid={`example-query-${index}`}
                                className="text-xs"
                                disabled={isSearching}
                              >
                                {query}
                              </Button>
                            ))}
                            {!isLoadingSuggestions && exampleQueries.length === 0 && (
                              <p className="text-sm text-muted-foreground">No suggestions available</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </GlassCard>

                    {/* Response Area */}
                    <GlassCard className="h-[500px] flex flex-col overflow-hidden">
                      <CardHeader>
                        <CardTitle>Response</CardTitle>
                      </CardHeader>
                      <CardContent className="min-h-0 flex-1 flex flex-col p-0">
                        <div
                          data-chat-scroll
                          className={`space-y-4 flex-1 p-6 ${(isStreaming || isTyping) ? "overflow-hidden" : "overflow-y-auto"}
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`}
                        >
                          {isLoadingRagHistory ? (
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Loading chat history...</span>
                            </div>
                          ) : ragMessages.map((message, index) => (
                            <Suspense key={message.messageId || `${message.timestamp?.getTime()}-${index}`} fallback={<div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>}>
                              <LazyChatMessage
                                key={message.messageId || `${message.timestamp?.getTime()}-${index}`}
                                type={message.type}
                                content={message.content}
                                citations={message.citations}
                                timestamp={message.timestamp}
                                showFeedback={message.type === "assistant"}
                                messageId={message.messageId}
                                sessionId={message.sessionId || currentSessionId}
                                ragSettings={message.ragSettings}
                                queryString={message.queryString}
                                serverMessage={message.serverMessage}
                                actualTopK={message.actualTopK}
                                actualReranker={message.actualReranker}
                              />
                            </Suspense>
                          ))}

                          {/* Typing Animation */}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="max-w-[80%]">
                                <TypingAnimation message={pendingResponse || "AI is thinking..."} />
                              </div>
                            </div>
                          )}

                          {/* Streaming Response */}
                          {isStreaming && streamingContent && (
                            <div className="flex justify-start">
                              <div className="max-w-[80%]">
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <div className="text-sm">
                                    {streamingContent}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={ragMessagesEndRef} />
                        </div>
                      </CardContent>
                    </GlassCard>
                  </div>

                  {/* Settings Panel */}
                  <div className="space-y-4">
                    <GlassCard>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          RAG Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Top-K Setting */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Top-K Results</Label>
                            <Badge variant="outline" className="text-xs">{ragSettings.topK}</Badge>
                          </div>
                          <Slider
                            value={[ragSettings.topK]}
                            onValueChange={(value) => updateRAGSettings({ topK: value[0] })}
                            min={1}
                            max={20}
                            step={1}
                            data-testid="slider-top-k"
                          />
                          <p className="text-xs text-muted-foreground">
                            Number of documents to retrieve from the vector database
                          </p>
                        </div>

                        {/* Similarity Threshold */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Similarity Threshold</Label>
                            <Badge variant="outline" className="text-xs">{ragSettings.similarityThreshold}</Badge>
                          </div>
                          <Slider
                            value={[ragSettings.similarityThreshold]}
                            onValueChange={(value) => updateRAGSettings({ similarityThreshold: value[0] })}
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            data-testid="slider-similarity"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum similarity score for document inclusion
                          </p>
                        </div>

                        {/* Max Answer Length */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Max Tokens</Label>
                            <Badge variant="outline" className="text-xs">{ragSettings.maxTokens === 0 ? "Unlimited" : ragSettings.maxTokens}</Badge>
                          </div>
                          <Slider
                            value={[ragSettings.maxTokens]}
                            onValueChange={(value) => updateRAGSettings({ maxTokens: value[0] })}
                            min={0}
                            max={1000}
                            step={50}
                            data-testid="slider-max-tokens"
                          />
                          <p className="text-xs text-muted-foreground">
                            Maximum length of generated responses (0 = unlimited, max 1000)
                          </p>
                        </div>

                        {/* Reranker Toggle */}
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
                      </CardContent>
                    </GlassCard>

                    {/* Performance Stats */}
                    <GlassCard>
                      <CardHeader>
                        <CardTitle>Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Latency</span>
                          <span className="font-medium">
                            {metrics ? `${metrics.latency}ms` : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tokens Used</span>
                          <span className="font-medium">
                            {metrics ? `${metrics.tokensUsed} / ${ragSettings.maxTokens === 0 ? "∞" : ragSettings.maxTokens}` : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Documents Retrieved</span>
                          <span className="font-medium">
                            {metrics ? metrics.documentsRetrieved : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Relevance Score</span>
                          <span className="font-medium">
                            {metrics ? metrics.relevanceScore.toFixed(2) : "—"}
                          </span>
                        </div>
                        {metrics && (
                          <div className="pt-2 border-t text-xs text-muted-foreground">
                            Last updated: {metrics.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </CardContent>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

