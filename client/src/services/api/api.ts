import axios from 'axios';

// 🌐 API Configuration - Unified API base URL for all endpoints
// For widget mode, use window.RAGSUITE_API_URL if available (set by widget-entry.tsx)
const getApiBaseUrl = () => {
  // Check if we're in widget mode (running on external website)
  if (typeof window !== 'undefined' && (window as any).RAGSUITE_API_URL) {
    return (window as any).RAGSUITE_API_URL;
  }
  // Default API URL for main app
  return 'http://192.168.0.101:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// 📡 Create axios instance - This is your unified API client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,           // Unified API base URL
  timeout: 3000000,                  // 30 seconds timeout (crawling can take longer)
  headers: {
    'Content-Type': 'application/json',  // Tell server we're sending JSON
  },
});

// 🔧 Add request interceptor for debugging and authentication
apiClient.interceptors.request.use(
  (config) => {
    // Update baseURL dynamically if widget API URL is set (for widget mode)
    if (typeof window !== 'undefined' && (window as any).RAGSUITE_API_URL) {
      config.baseURL = (window as any).RAGSUITE_API_URL;
    }

    // Add authentication token if available (check both token storage keys for compatibility)
    const token = localStorage.getItem('auth-token') || localStorage.getItem('auth_token');

    if (token) {
      // Always send token if it exists - let backend decide if it's valid
      // User will only be logged out when they explicitly click logout button
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔑 For widget mode: Include projectId in requests if available
    // This allows the backend to authenticate widget requests without requiring user login
    if (typeof window !== 'undefined' && (window as any).RAGSUITE_PROJECT_ID) {
      const projectId = (window as any).RAGSUITE_PROJECT_ID;
      // Add projectId as header (backend should check X-Project-ID header)
      config.headers['X-Project-ID'] = projectId;
      // Also add as query parameter for compatibility (some backends prefer query params)
      if (!config.params) {
        config.params = {};
      }
      config.params.project_id = projectId;
    }

    // Only log requests in development mode to reduce console spam
    if (import.meta.env.DEV && !config.url?.includes('/health') && !config.url?.includes('/status')) {
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 🔧 Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    // Only log responses in development mode and skip health/status endpoints
    if (import.meta.env.DEV && !response.config.url?.includes('/health') && !response.config.url?.includes('/status')) {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
    });
    }
    return response;
  },
  (error) => {
    // Suppress excessive error logging for CORB/CORS errors to prevent console spam
    const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
    const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
    
    // Track CORB/CORS errors to stop polling
    if (isCORBError || isCORSError) {
      // Mark that we have CORB/CORS issues
      if (typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
      // Log CORB/CORS errors only once to prevent spam
      if (!(window as any).__CORB_ERROR_LOGGED) {
        console.warn('⚠️ CORB/CORS Error: Cross-origin requests are being blocked. Please configure CORS headers on the backend server.');
        (window as any).__CORB_ERROR_LOGGED = true;
      }
      // Don't log every CORB/CORS error to reduce spam
      return Promise.reject(error);
    }
    
    // Only log non-CORB/CORS errors in development or for important endpoints
    if (import.meta.env.DEV || (error.response?.status && error.response.status >= 500)) {
      console.error('❌ API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
      });
    }

    if (error.code === 'ERR_NETWORK' && !isCORBError) {
      // Only log network errors once
      if (!(window as any).__NETWORK_ERROR_LOGGED) {
      console.error('🌐 Network Error: Cannot reach the server. Check if the API server is running at:', API_BASE_URL);
        (window as any).__NETWORK_ERROR_LOGGED = true;
      }
    }

    // Check if it's a 401 Unauthorized error
    if (error.response?.status === 401) {
      // Check if we're in widget mode
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      const isActivationEndpoint = error.config?.url?.includes('/activate') || error.config?.url?.includes('/activation');
      
      // In widget mode, 401s on activation endpoints are expected if backend doesn't support projectId yet
      // Suppress these errors to prevent console spam
      if (isWidgetMode && isActivationEndpoint) {
        // Don't log - this is expected behavior when backend doesn't support projectId authentication
        return Promise.reject(error);
      }
      
      // Don't automatically log out on 401 - let the user stay logged in
      // Only logout when user explicitly clicks logout button
      // If it's a login request that fails, that's expected and should be handled by the login component
      const isLoginRequest = error.config?.url?.includes('/login') || error.config?.url?.includes('/auth/login');
      
      if (isLoginRequest) {
        console.warn('🔐 Login failed - invalid credentials');
      } else {
        // Only log 401 errors in development mode to reduce console spam
        if (import.meta.env.DEV) {
        console.warn('🔐 Authentication failed (401) - request rejected but user remains logged in');
        }
      }
    }

    return Promise.reject(error);
  }
);


// 🔍 Search API function - This calls your search endpoint
export const searchAPI = {
  // This function sends a search query to your API
  search: async (query: string, ragSettings?: {
    topK?: number;
    similarityThreshold?: number;
    useReranker?: boolean;
    maxTokens?: number;
  }, responseType?: 'long' | 'short') => {
    console.log('🚀 API Call - Searching for:', query);
    console.log('⚙️ RAG Settings:', ragSettings);
    console.log('📝 Response Type:', responseType);
    console.log('🌐 Using real API at:', `${API_BASE_URL}/search`);

    try {
      // Send POST request to /search endpoint with RAG settings
      const requestBody: any = {
        query: query,  // Send the user's question
        topK: ragSettings?.topK || 5,
        similarityThreshold: ragSettings?.similarityThreshold || 0.2,
        useReranker: ragSettings?.useReranker || false,
        maxTokens: ragSettings?.maxTokens || 0,
      };
      
      // Include response_type if provided
      if (responseType) {
        requestBody.response_type = responseType;
      }
      
      const response = await apiClient.post('/search', requestBody);

      console.log('✅ API Response:', response.data);
      console.log('🔍 API Response structure:', response.data);

      // Backend returns: { success, data: { answer, sources, ... }, message, timestamp, request_id }
      // Extract the nested data object
      const responseData = response.data.data || response.data;
      console.log('🔍 Extracted data:', responseData);
      console.log('🔍 API Sources:', responseData.sources);

      // Map server response to expected format - use only real API data
      const mappedResponse = {
        success: response.data.success || true,
        answer: responseData.answer || '',
        sources: responseData.sources ? responseData.sources.map((source: any) => ({
          title: source.title || 'Untitled Source',
          url: source.url || '#',
          snippet: source.snippet || 'No snippet available'
        })) : [],
        message: response.data.message || '',
        timestamp: response.data.timestamp || new Date().toISOString(),
        request_id: response.data.request_id || '',
        message_id: responseData.message_id || '',
        session_id: responseData.session_id || ''
      };

      console.log('🔄 Mapped Response:', mappedResponse);
      return mappedResponse;
    } catch (error: any) {
      console.error('❌ API Error:', error);
      
      // Check if we're in widget mode (external website)
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      
      // If 401 in widget mode, backend may not support projectId for this endpoint yet
      // Return a default response to allow widget to function
      if (error?.response?.status === 401 && isWidgetMode) {
        console.log('ℹ️ Search 401 Unauthorized in widget mode - backend may not support projectId for this endpoint yet. Returning default response.');
        return {
          success: false,
          answer: 'Search is currently unavailable. Please check your project ID configuration.',
          sources: [],
          message: 'Search endpoint requires authentication',
          timestamp: new Date().toISOString(),
          request_id: '',
          message_id: '',
          session_id: ''
        };
      }
      
      // Throw error - no mock fallback
      throw error;
    }
  },

  // Get search configuration
  getSearchConfiguration: async () => {
    console.log('🔍 Search API - Getting search configuration');
    try {
      const response = await apiClient.get('/search/configuration');
      console.log('✅ Search configuration retrieved successfully:', response.data);
      // Handle nested response structure: { data: {...} } or direct {...}
      const configData = response.data?.data || response.data;
      console.log('🔍 Extracted configuration data:', configData);
      return configData;
    } catch (error) {
      console.error('❌ Get search configuration failed:', error);
      throw error;
    }
  },

  // Save search configuration
  saveSearchConfiguration: async (config: {
    title?: string;
    language?: string;
    styleOption?: string;
    searchIcon?: string;
    loaderType?: string;
    background?: string;
    borderRadius?: string;
    resultStyle?: string;
  }) => {
    console.log('🔍 Search API - Saving search configuration:', config);
    try {
      const response = await apiClient.post('/search/configuration', config);
      console.log('✅ Search configuration saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Save search configuration failed:', error);
      throw error;
    }
  },

  // Get search customization
  getSearchCustomization: async () => {
    console.log('🔍 Search API - Getting search customization');
    try {
      const response = await apiClient.get('/search/customization');
      console.log('✅ Search customization retrieved successfully:', response.data);
      // Handle nested response structure: { data: {...} } or direct {...}
      const customizationData = response.data?.data || response.data;
      console.log('🔍 Extracted customization data:', customizationData);
      return customizationData;
    } catch (error) {
      console.error('❌ Get search customization failed:', error);
      throw error;
    }
  },

  // Save search customization
  saveSearchCustomization: async (customization: {
    searchFormType?: string;
    buttonType?: string;
    searchButtonText?: string;
    searchInputPlaceholder?: string;
    recentSearch?: boolean;
    recentSearchTitle?: string;
    predefinedQuestions?: boolean;
    questionsPosition?: string;
    questionsLimit?: number;
    questions?: (string | { question: string; answer?: string })[];
    questionsAnswers?: Record<number, string>;
  }) => {
    console.log('🔍 Search API - Saving search customization:', customization);
    try {
      const response = await apiClient.post('/search/customization', customization);
      console.log('✅ Search customization saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Save search customization failed:', error);
      throw error;
    }
  },
  
  // Get response configuration
  getResponseConfig: async (): Promise<string> => {
    console.log('🔍 Search API - Getting response config');
    try {
      const response = await apiClient.get<{ success: boolean; data: { response_type: string }; message: string }>('/search/response-config');
      console.log('✅ Response config retrieved successfully:', response.data);
      // Server returns: { success: true, data: { response_type: "long" }, message: "..." }
      // Extract response_type from nested data structure
      const responseType = response.data?.data?.response_type || 'long';
      return responseType;
    } catch (error: any) {
      // Handle 401 Unauthorized in widget mode gracefully
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      if (isWidgetMode && error?.response?.status === 401) {
        console.log('ℹ️ Response config 401 Unauthorized in widget mode - backend may not support projectId for this endpoint yet. Returning default "long".');
        return 'long'; // Default to 'long' response type
      }
      console.error('❌ Get response config failed:', error);
      throw error;
    }
  },
  
  // Save response configuration
  saveResponseConfig: async (responseType: "long" | "short"): Promise<void> => {
    console.log('🔍 Search API - Saving response config:', responseType);
    try {
      await apiClient.post('/search/response-config', {
        response_type: responseType,
      });
      console.log('✅ Response config saved successfully');
    } catch (error) {
      console.error('❌ Save response config failed:', error);
      throw error;
    }
  },
  
  // Get search models configuration
  getSearchModels: async (): Promise<ConfigModelsData> => {
    console.log('🔍 Search API - Getting search models');
    try {
      const response = await apiClient.get<ConfigModelsResponse>('/search/models/');
      console.log('✅ Search models retrieved successfully:', response.data);
      
      // Parse data if it's a string (JSON stringified)
      let data: ConfigModelsData;
      if (typeof response.data.data === 'string') {
        try {
          data = JSON.parse(response.data.data);
        } catch {
          // If parsing fails, return default structure
          data = {
            model_provider: '',
            chat_model: '',
            embedding_model: '',
            api_key: '',
            chat_temperature: null,
            chat_top_p: null,
            chat_best_of: null,
            chat_frequency_penalty: null,
            chat_presence_penalty: null,
            chat_top_k: null,
            chat_similarity_threshold: null,
            chat_max_tokens: null,
            chat_use_reranker: null,
          };
        }
      } else {
        data = response.data.data as ConfigModelsData;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Get search models failed:', error);
      throw error;
    }
  },
  
  // Save search models configuration
  saveSearchModels: async (config: ConfigModelsRequest): Promise<ConfigModelsRequest> => {
    console.log('🔍 Search API - Saving search models:', config);
    try {
      const response = await apiClient.post<ConfigModelsResponse>('/search/models/', config);
      console.log('✅ Search models saved successfully:', response.data);
      return config; // Return the request data since backend might not return the full object
    } catch (error) {
      console.error('❌ Save search models failed:', error);
      throw error;
    }
  },
  
  // Get search citation settings
  getSearchCitation: async (): Promise<{
    citation_style: string;
    layout: string;
    numbering_style: string;
    color_scheme: string;
    show_snippets: boolean;
    show_urls: boolean;
    show_source_count: boolean;
    enable_hover_effects: boolean;
    max_snippet_length: number;
  }> => {
    console.log('🔍 Search API - Getting search citation settings');
    try {
      const response = await apiClient.get('/search/citation/');
      console.log('✅ Search citation settings retrieved successfully');
      console.log('🔍 Full response:', response);
      console.log('🔍 Response.data:', response.data);
      console.log('🔍 Response.data.data:', response.data?.data);
      console.log('🔍 Response.data.data type:', typeof response.data?.data);
      
      // Handle different response structures
      let rawData: any = null;
      
      // Check if response.data.data exists (nested structure)
      if (response.data?.data !== undefined) {
        rawData = response.data.data;
        console.log('🔍 Using nested response.data.data');
      } 
      // Check if response.data is the data directly
      else if (response.data && typeof response.data === 'object' && !response.data.success) {
        rawData = response.data;
        console.log('🔍 Using response.data directly');
      }
      // Check if response.data is a string
      else if (typeof response.data === 'string') {
        rawData = response.data;
        console.log('🔍 Response.data is a string');
      }
      
      console.log('🔍 Raw data to parse:', rawData);
      console.log('🔍 Raw data type:', typeof rawData);
      
      // Parse data if it's a string (JSON stringified)
      let data: any;
      if (typeof rawData === 'string') {
        try {
          const parsed = JSON.parse(rawData);
          console.log('🔍 Parsed citation data from string:', parsed);
          data = parsed;
        } catch (parseError) {
          console.error('❌ Failed to parse citation data as JSON:', parseError);
          console.log('🔍 Raw data string that failed to parse:', rawData);
          // If parsing fails, return default structure
          data = {
            citation_style: 'detailed',
            layout: 'vertical',
            numbering_style: 'brackets',
            color_scheme: 'default',
            show_snippets: true,
            show_urls: true,
            show_source_count: true,
            enable_hover_effects: true,
            max_snippet_length: 150,
          };
        }
      } else if (rawData && typeof rawData === 'object') {
        // If data is already an object, use it directly
        console.log('🔍 Data is already an object, using directly:', rawData);
        data = rawData;
      } else {
        // Fallback to defaults if data structure is unexpected
        console.warn('⚠️ Unexpected data structure, using defaults. Raw data:', rawData);
        data = {
          citation_style: 'detailed',
          layout: 'vertical',
          numbering_style: 'brackets',
          color_scheme: 'default',
          show_snippets: true,
          show_urls: true,
          show_source_count: true,
          enable_hover_effects: true,
          max_snippet_length: 150,
        };
      }
      
      // Ensure all required fields are present with defaults
      const finalData = {
        citation_style: data.citation_style || 'detailed',
        layout: data.layout || 'vertical',
        numbering_style: data.numbering_style || 'brackets',
        color_scheme: data.color_scheme || 'default',
        show_snippets: data.show_snippets !== undefined ? data.show_snippets : true,
        show_urls: data.show_urls !== undefined ? data.show_urls : true,
        show_source_count: data.show_source_count !== undefined ? data.show_source_count : true,
        enable_hover_effects: data.enable_hover_effects !== undefined ? data.enable_hover_effects : true,
        max_snippet_length: data.max_snippet_length || 150,
      };
      
      console.log('🔍 Final citation data to return:', finalData);
      return finalData;
    } catch (error: any) {
      // Check if we're in widget mode (external website)
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      
      // If 401 in widget mode, backend may not support projectId for this endpoint yet
      // Return default citation settings so widget can still function
      if (error?.response?.status === 401 && isWidgetMode) {
        console.log('ℹ️ Search citation 401 Unauthorized in widget mode - backend may not support projectId for this endpoint yet. Returning default citation settings.');
        return {
          citation_style: 'detailed',
          layout: 'vertical',
          numbering_style: 'brackets',
          color_scheme: 'default',
          show_snippets: true,
          show_urls: true,
          show_source_count: true,
          enable_hover_effects: true,
          max_snippet_length: 150,
        };
      }
      
      console.error('❌ Get search citation failed:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        config: error?.config,
      });
      throw error;
    }
  },
  
  // Save search citation settings
  saveSearchCitation: async (config: {
    citation_style: string;
    layout: string;
    numbering_style: string;
    color_scheme: string;
    show_snippets: boolean;
    show_urls: boolean;
    show_source_count: boolean;
    enable_hover_effects: boolean;
    max_snippet_length: number;
  }): Promise<void> => {
    console.log('🔍 Search API - Saving search citation settings:', config);
    try {
      await apiClient.post('/search/citation/', config);
      console.log('✅ Search citation settings saved successfully');
    } catch (error) {
      console.error('❌ Save search citation failed:', error);
      throw error;
    }
  },

  // Get search history
  getSearchHistory: async () => {
    console.log('📜 Search API - Getting search history');

    try {
      const response = await apiClient.get('/search/history');
      console.log('✅ Search History Response:', response.data);

      // Backend returns array of search history items
      const history = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      return history.map((item: any) => ({
        id: item.id,
        sessionId: item.session_id,
        messageId: item.message_id,
        userMessage: item.user_message,
        assistantResponse: item.assistant_response,
        messageType: item.message_type,
        feedback: item.feedback,
        sources: item.sources || [],
        createdAt: item.created_at,
        // Use top_k from API if available, otherwise calculate from sources length
        topK: item.top_k || item.topK || (item.sources?.length || 0),
      }));
    } catch (error) {
      console.error('❌ Search History Error:', error);
      throw error;
    }
  },

  // Delete a specific search session
  deleteSession: async (sessionId: string) => {
    console.log('🗑️ Search API - Deleting session:', sessionId);

    try {
      const response = await apiClient.delete(`/search/sessions/${sessionId}`);
      console.log('✅ Delete Search Session Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete Search Session Error:', error);
      throw error;
    }
  },

  // Delete all search history
  deleteAllSessions: async () => {
    console.log('🗑️ Search API - Deleting all search sessions');

    try {
      const response = await apiClient.delete('/search/messages');
      console.log('✅ Delete All Search Sessions Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete All Search Sessions Error:', error);
      throw error;
    }
  },
};

// 💬 Chat API functions - This handles chat functionality
export const chatAPI = {
  // Send a chat message
  sendMessage: async (message: string, sessionId?: string, ragSettings?: {
    topK?: number;
    similarityThreshold?: number;
    useReranker?: boolean;
    maxTokens?: number;
  }) => {
    console.log('💬 Chat API - Sending message:', message);
    console.log('⚙️ Chat RAG Settings:', ragSettings);

    try {
      // Backend ChatMessageRequest only accepts session_id and message
      // RAG settings are ignored (backend uses hardcoded CHAT_TOP_K = 3)
      const response = await apiClient.post('/chat/message', {
        message: message,
        session_id: sessionId,  // Backend expects session_id
      });

      console.log('✅ Chat Response:', response.data);
      console.log('🔍 Chat Response structure:', response.data);

      // Backend returns: { success, data: { answer, sources, session_id, message_id }, message, ... }
      // Extract the nested data object
      const responseData = response.data.data || response.data;
      console.log('🔍 Extracted chat data:', responseData);

      // Map server response to ChatResponse format - use only real API data
      const chatResponse: ChatResponse = {
        messageId: responseData.message_id || response.data.request_id || `msg-${Date.now()}`,
        response: responseData.answer || responseData.response || '',
        sessionId: responseData.session_id || sessionId || `session-${Date.now()}`,
        sources: responseData.sources ? responseData.sources.map((source: any) => ({
          title: source.title || 'Untitled Source',
          url: source.url || '#',
          snippet: source.snippet || 'No snippet available'
        })) : undefined
      };

      console.log('🔄 Mapped Chat Response:', chatResponse);
      return chatResponse;
    } catch (error) {
      console.error('❌ Chat Error:', error);
      throw error;
    }
  },

  // Get all chat sessions
  getSessions: async () => {
    console.log('📋 Chat API - Getting sessions');

    try {
      const response = await apiClient.get('/chat/sessions');
      console.log('✅ Sessions Response:', response.data);
      // Backend returns: { success, data: { sessions, count }, message, ... }
      const responseData = response.data.data || response.data;
      return responseData;
    } catch (error) {
      console.error('❌ Sessions Error:', error);
      throw error;
    }
  },

  // Delete a chat session
  deleteSession: async (sessionId: string, source: 'widget' | 'page' = 'widget') => {
    console.log('🗑️ Chat API - Deleting session:', sessionId, 'source:', source);

    try {
      const response = await apiClient.delete(`/chat/sessions/${sessionId}`, {
        params: { source }  // Pass source as query parameter
      });
      console.log('✅ Delete Session Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete Session Error:', error);
      throw error;
    }
  },

  // Submit feedback for a response
  submitFeedback: async (sessionId: string, messageId: string, feedback: 'positive' | 'negative') => {
    console.log('👍 Chat API - Submitting feedback:', { sessionId, messageId, feedback });

    try {
      // Backend expects: { session_id: str, message_id: str, feedback: bool }
      const response = await apiClient.post('/chat/feedback', {
        session_id: sessionId,  // Backend expects snake_case
        message_id: messageId,   // Backend expects snake_case
        feedback: feedback === 'positive',  // Backend expects boolean
      });
      console.log('✅ Feedback Response:', response.data);
      return response.data;
    } catch (error: any) {
      // Check if we're in widget mode (external website)
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      
      // If 401 in widget mode, backend doesn't support projectId for this endpoint yet
      // Silently fail - feedback is nice to have but not critical for widget functionality
      if (error?.response?.status === 401 && isWidgetMode) {
        console.log('ℹ️ Feedback submission 401 Unauthorized in widget mode - backend may not support projectId for this endpoint yet. Feedback not submitted.');
        return { success: false, message: 'Feedback submission not available in widget mode' };
      }
      
      console.error('❌ Feedback Error:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async () => {
    console.log('📜 Chat API - Getting chat history');

    try {
      const response = await apiClient.get('/chat/history');
      console.log('✅ Chat History Response:', response.data);

      // Backend returns array of chat messages
      const history = Array.isArray(response.data) ? response.data : [];

      return history.map((item: any) => ({
        id: item.id,
        sessionId: item.session_id,
        messageId: item.message_id,
        userMessage: item.user_message,
        assistantResponse: item.assistant_response,
        messageType: item.message_type,
        feedback: item.feedback,
        sources: item.sources || [],
        createdAt: item.created_at,
      }));
    } catch (error: any) {
      // Check if we're in widget mode (external website)
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      
      // If 401 in widget mode, backend doesn't support projectId for this endpoint yet
      // Return empty array so widget shows welcome message (chat history not available)
      if (error?.response?.status === 401 && isWidgetMode) {
        console.log('ℹ️ Chat history 401 Unauthorized in widget mode - backend may not support projectId for this endpoint yet. Returning empty history.');
        return [];
      }
      
      console.error('❌ Chat History Error:', error);
      throw error;
    }
  },

  // Delete all chat messages
  deleteAllMessages: async (source: 'widget' | 'page' = 'widget') => {
    console.log('🗑️ Chat API - Deleting all messages, source:', source);

    try {
      const response = await apiClient.delete('/chat/messages', {
        params: { source }  // Pass source as query parameter
      });
      console.log('✅ Delete All Messages Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete All Messages Error:', error);
      throw error;
    }
  },
};

// 🕷️ Crawl API functions - This handles all crawl functionality
export const crawlAPI = {
  // Helper to clean up URLs from stray quotes/backticks/whitespace
  normalizeUrl(input: string) {
    if (!input) return '';
    const trimmed = (input || '').toString().trim();
    // Remove enclosing quotes/backticks if present
    const unquoted = trimmed.replace(/^([`"'])(.*)\1$/, '$2');
    // Collapse internal whitespace
    const collapsed = unquoted.replace(/\s+/g, ' ');
    return collapsed;
  },
  // Add a new crawling target
  addSite: async (siteData: CrawlSiteData) => {
    console.log('🕷️ Crawl API - Adding site:', siteData);

    try {
      // Validate required fields
      if (!siteData.name || !siteData.url) {
        throw new Error('Name and URL are required');
      }

      // Transform frontend data to backend schema
      const backendData = {
        name: siteData.name,
        base_url: crawlAPI.normalizeUrl(siteData.url),
        description: siteData.description || '',
        depth: siteData.crawlDepth || 2,
        cadence: siteData.cadence || 'ONCE',
        headless_mode: siteData.headlessMode || 'AUTO',
        allowlist: Array.isArray(siteData.includePatterns) ? siteData.includePatterns : [],
        denylist: Array.isArray(siteData.excludePatterns) ? siteData.excludePatterns : []
      };

      const response = await apiClient.post('/crawl/sites', backendData);
      console.log('✅ Site added successfully:', response.data);

      // Ensure we return a valid response object
      if (!response || !response.data) {
        console.warn('⚠️ API returned invalid response, returning success object');
        return {
          id: `temp-${Date.now()}`,
          ...backendData
        };
      }

      return response.data;
    } catch (error) {
      console.error('❌ Add site failed:', error);

      // Handle authentication errors
      if ((error as any).response?.status === 401) {
        console.error('🔐 Authentication failed - please log in again');
        // Clear auth data and redirect to login (clear both token storage keys for compatibility)
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-user');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expires');
        window.location.href = '/login';
        throw new Error('Authentication failed. Please log in again.');
      }

      if ((error as any).response?.status === 403) {
        console.error('🔐 Access forbidden - insufficient permissions');
        throw new Error('Access forbidden. Please check your permissions.');
      }

      // Re-throw with a user-friendly message
      const errorMessage = (error as any).response?.data?.detail ||
        (error as any).message ||
        'Failed to add site. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Get all crawling targets
  getSites: async () => {
    console.log('🕷️ Crawl API - Getting sites');

    const response = await apiClient.get('/crawl/sites');
    const raw = response.data;

    // Always normalize into an array
    let list: any[] = [];

    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
      list = raw.data;
    } else {
      list = [];
    }

    return list.map((site: any) => ({
      id: site.id ?? "",
      name: site.name ?? "",
      url: crawlAPI.normalizeUrl(site.base_url ?? ""),
      description: site.description ?? "",
      status: (
        site.status === "READY" || site.status === "PENDING"
          ? "active"
          : site.status === "DISABLED"
            ? "inactive"
            : site.status === "CRAWLING" || site.status === "RUNNING"
              ? "crawling"
              : "error"
      ) as "active" | "inactive" | "crawling" | "error",
      lastCrawled: site.last_crawl_at ?? null,
      pagesCrawled: site.documents_count ?? 0,
      progress: site.progress_percentage ?? site.progress ?? undefined, // Include progress if backend provides it
      currentJobId: site.current_job_id ?? site.job_id ?? undefined, // Store job ID to fetch status if needed
      createdAt: site.created_at ?? new Date().toISOString(),
      updatedAt: site.updated_at ?? new Date().toISOString(),
      crawlDepth: site.depth ?? 2,
      cadence: site.cadence ?? "ONCE",
      headlessMode: site.headless_mode ?? "AUTO",
      includePatterns: site.allowlist ?? [],
      excludePatterns: site.denylist ?? [],
      trainedAt: site.trained_at ?? null, // Training timestamp from backend
      isTrained: !!site.trained_at, // Computed boolean from trainedAt
    }));
  },

  // Update crawl configuration
  updateSite: async (id: string, siteData: CrawlSiteData) => {
    console.log('🕷️ Crawl API - Updating site:', id, siteData);

    try {
      // Transform frontend data to backend schema
      const backendData = {
        name: siteData.name,
        base_url: crawlAPI.normalizeUrl(siteData.url),
        description: siteData.description || '',
        depth: siteData.crawlDepth || 2,
        cadence: siteData.cadence || 'ONCE',
        headless_mode: siteData.headlessMode || 'AUTO',
        allowlist: siteData.includePatterns || [],
        denylist: siteData.excludePatterns || []
      };

      const response = await apiClient.put(`/crawl/sites/${id}`, backendData);
      console.log('✅ Site updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update site failed:', error);
      throw error;
    }
  },

  // Remove crawling target
  deleteSite: async (id: string) => {
    console.log('🕷️ Crawl API - Deleting site:', id);

    try {
      const response = await apiClient.delete(`/crawl/sites/${id}`);
      console.log('✅ Site deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete site failed:', error);
      throw error;
    }
  },

  // Start crawling job
  startCrawl: async (id: string) => {
    console.log('🕷️ Crawl API - Starting crawl for site:', id);

    try {
      const response = await apiClient.post(`/crawl/start/${id}`);
      console.log('✅ Crawl started successfully. Response:', response.data);
      // Log the response structure to help debug
      if (response.data) {
        console.log('📋 Response keys:', Object.keys(response.data));
        console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Start crawl failed:', error);
      throw error;
    }
  },

  // Check crawling status
  getCrawlStatus: async (id: string) => {
    console.log('🕷️ Crawl API - Getting crawl status:', id);

    try {
      const response = await apiClient.get(`/crawl/status/${id}`);
      console.log('✅ Crawl status retrieved:', response.data);

      // Transform backend response to frontend format
      return {
        id: response.data.job_id,
        status: response.data.status === 'PENDING' ? 'pending' :
          response.data.status === 'RUNNING' ? 'running' :
            response.data.status === 'COMPLETED' ? 'completed' :
              response.data.status === 'FAILED' ? 'failed' : 'cancelled',
        progress: response.data.progress_percentage || 0, // Use percentage from backend (0-100)
        pagesFound: response.data.pages_fetched || 0,
        pagesCrawled: response.data.pages_fetched || 0,
        startedAt: response.data.started_at || response.data.queued_at,
        completedAt: response.data.finished_at,
        error: response.data.errors?.[0] || null,
        logs: response.data.errors || []
      };
    } catch (error) {
      console.error('❌ Get crawl status failed:', error);
      throw error;
    }
  },

  // Preview URL content
  previewUrl: async (url: string) => {
    console.log('🕷️ Crawl API - Previewing URL:', url);

    try {
      const response = await apiClient.put('/crawl/preview', { url });
      console.log('✅ URL preview retrieved:', response.data);

      // Transform backend response to frontend format
      return {
        url: response.data.url,
        title: response.data.meta?.title || 'No Title',
        content: response.data.html_sample || '',
        text: response.data.text_sample || '',
        links: [],
        images: [],
        metadata: response.data.meta || {},
        status: response.data.meta?.status_code || 200,
        responseTime: 0
      };
    } catch (error) {
      console.error('❌ Preview URL failed:', error);
      throw error;
    }
  },
};

// 🔐 Authentication API functions - This handles login functionality
export const authAPI = {
  // Admin login
  login: async (credentials: LoginCredentials) => {
    console.log('🔐 Auth API - Attempting login:', credentials.username);

    try {
      const response = await apiClient.post('/crawl/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });

      console.log('✅ Login successful:', response.data);

      // Transform response to match expected format
      // Handle different token field names: access_token, token, or auth_token
      const token = response.data.access_token ||
        response.data.token ||
        response.data.auth_token ||
        response.data.accessToken;

      // Handle different user object structures
      const userData = response.data.user || response.data;

      return {
        token: token || '',
        user: {
          id: userData?.id || userData?.user_id || '1',
          username: userData?.username || credentials.username,
          email: userData?.email || userData?.email_address || '',
          role: userData?.role || 'admin',
          permissions: userData?.permissions || ['read', 'write', 'admin']
        },
        expiresAt: response.data.expiresAt ||
          response.data.expires_at ||
          response.data.expires_in ?
          new Date(Date.now() + (response.data.expires_in * 1000)).toISOString() :
          new Date(Date.now() + 30 * 60 * 1000).toISOString() // Default: 30 minutes from now
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // User registration
  register: async (payload: { username: string; email: string; password: string }) => {
    console.log('🔐 Auth API - Attempting registration:', {
      username: payload.username,
      email: payload.email,
    });

    try {
      // Backend endpoint: POST /api/v1/crawl/auth/register
      const response = await apiClient.post('/crawl/auth/register', {
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });

      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      // Re-throw so callers can surface proper error messages
      throw error;
    }
  },

  // Logout (if needed)
  logout: async () => {
    console.log('🔐 Auth API - Logging out');

    try {
      const response = await apiClient.post('/crawl/auth/logout');
      console.log('✅ Logout successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  },

  // Verify token (if needed)
  verifyToken: async (token: string) => {
    console.log('🔐 Auth API - Verifying token');

    try {
      const response = await apiClient.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ Token verification successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      throw error;
    }
  },
};

// 📄 Document Management API functions - This handles all document operations
export const documentAPI = {
  // Get all documents
  getDocuments: async () => {
    console.log('📄 Document API - Getting documents');

    try {
      const response = await apiClient.get('/documents');
      console.log('✅ Documents retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get documents failed:', error);
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (file: File, metadata?: DocumentMetadata) => {
    console.log('📄 Document API - Uploading document:', file.name);
    console.log('📄 Metadata:', metadata);

    try {
      const formData = new FormData();

      // Your server expects 'files' as a List[UploadFile] = File(...)
      // Try multiple approaches to ensure the file is sent correctly

      // Method 1: Try with explicit filename
      formData.append('files', file, file.name);

      // Method 2: Also try without filename (commented out for now)
      // formData.append('files', file);

      // Add metadata fields as expected by your server
      if (metadata) {
        if (metadata.title) formData.append('title', metadata.title);
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.language) formData.append('language', metadata.language);
        if (metadata.source) formData.append('source', metadata.source);
      }

      // Log the FormData contents for debugging
      console.log('📄 FormData contents:');
      const entries = Array.from(formData.entries());
      for (const [key, value] of entries) {
        console.log(`${key}:`, value);
        if (value instanceof File) {
          console.log(`  File details: name=${value.name}, size=${value.size}, type=${value.type}`);
        }
      }

      // Create a separate axios instance for file uploads without default headers
      const uploadClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 150000,
        // No default headers - let axios handle FormData automatically
      });

      // Add authentication token to upload client
      const token = localStorage.getItem('auth-token') || localStorage.getItem('auth_token');
      if (token) {
        uploadClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await uploadClient.post('/documents/upload', formData);

      console.log('✅ Document uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload document failed:', error);

      // Log the detailed error response
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
        console.error('❌ Error headers:', error.response.headers);

        // Show the specific validation errors
        if (error.response.data.detail) {
          console.error('❌ Validation errors:', error.response.data.detail);
        }
      }

      throw error;
    }
  },

  // Update document metadata
  updateDocument: async (id: string, metadata: DocumentMetadata) => {
    console.log('📄 Document API - Updating document:', id);

    try {
      const response = await apiClient.put(`/documents/${id}`, metadata);
      console.log('✅ Document updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update document failed:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (id: string) => {
    console.log('📄 Document API - Deleting document:', id);

    try {
      const response = await apiClient.delete(`/documents/${id}`);
      console.log('✅ Document deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete document failed:', error);
      throw error;
    }
  },

  // Get document content
  getDocumentContent: async (id: string) => {
    console.log('📄 Document API - Getting document content:', id);

    try {
      const response = await apiClient.get(`/documents/${id}/content`);
      console.log('✅ Document content retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get document content failed:', error);
      throw error;
    }
  },
};

// 🔧 API Connection Test - Test if the API server is reachable
export const testAPIConnection = async () => {
  console.log('🔧 Testing API connection to:', API_BASE_URL);

  try {
    // Try to reach the server with a simple request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ API server is reachable');
      return { success: true, message: 'API server is running' };
    } else {
      console.log('⚠️ API server responded with status:', response.status);
      return { success: false, message: `API server responded with status: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API connection test failed:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: `Cannot reach API server at ${API_BASE_URL}. Please check if the server is running.`
      };
    }

    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// 🔧 Test Chat API connection specifically
export const testChatAPIConnection = async () => {
  console.log('🔧 Testing Chat API connection to:', API_BASE_URL);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout to 3 seconds

    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "test",
        topK: 5,
        maxTokens: 100,
        useReranker: false,
        similarityThreshold: 0.2
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Chat API connection successful');
      return {
        success: true,
        message: 'Chat API is accessible and working'
      };
    } else {
      console.log('❌ Chat API connection failed:', response.status);
      return {
        success: false,
        message: `Chat API returned status ${response.status}`
      };
    }
  } catch (error) {
    console.error('❌ Chat API connection error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: `Chat API timeout: Cannot reach server at ${API_BASE_URL}. Please check if the server is running.`
      };
    }

    return {
      success: false,
      message: `Chat API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string;
  keyPreview?: string;
  environment: string;
  rateLimit: number;
  expiresAt?: string | null;
  isActive: boolean;
  requestCount: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyPayload {
  name: string;
  description?: string;
  environment: string; // "Production", "Staging", or "Development"
  rate_limit?: number; // Optional, defaults to 100
  rateLimit?: number; // Alternative field name
  expiration?: string; // "Never expires", "30 days", "90 days", or "1 year"
}

export const apiKeysAPI = {
  create: async (payload: CreateApiKeyPayload): Promise<ApiKey> => {
    console.log('🔑 API Keys API - Creating API key with payload:', payload);

    try {
      // Ensure payload structure matches backend expectations
      // Backend expects:
      // - environment: "Production", "Staging", or "Development" (exact match required)
      // - expiration: "Never expires", "30 days", "90 days", or "1 year" (exact match required)

      // Normalize environment value
      let environment = payload.environment;
      if (environment) {
        // Convert common variations to exact enum values
        const envLower = environment.toLowerCase();
        if (envLower === 'production' || envLower === 'prod') {
          environment = 'Production';
        } else if (envLower === 'staging' || envLower === 'stage') {
          environment = 'Staging';
        } else if (envLower === 'development' || envLower === 'dev') {
          environment = 'Development';
        }
        // Ensure first letter is uppercase if it's already one of the values
        if (environment && environment !== 'Production' && environment !== 'Staging' && environment !== 'Development') {
          environment = environment.charAt(0).toUpperCase() + environment.slice(1).toLowerCase();
        }
      }

      // Normalize expiration value
      let expiration = payload.expiration || "Never expires";
      if (expiration) {
        const expLower = expiration.toLowerCase();
        if (expLower.includes('never') || expLower === 'never expires') {
          expiration = "Never expires";
        } else if (expLower.includes('30') || expLower === '30 days') {
          expiration = "30 days";
        } else if (expLower.includes('90') || expLower === '90 days') {
          expiration = "90 days";
        } else if (expLower.includes('1') && (expLower.includes('year') || expLower.includes('365'))) {
          expiration = "1 year";
        }
      }

      // Validate required fields
      if (!payload.name || !payload.name.trim()) {
        throw new Error('API key name is required');
      }

      const requestPayload = {
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        environment: environment || 'Development', // Default to Development if not provided
        rate_limit: typeof payload.rate_limit === 'number' ? payload.rate_limit : (typeof payload.rateLimit === 'number' ? payload.rateLimit : 100),
        expiration: expiration || "Never expires", // Must match APIKeyExpirationOption enum exactly
      };

      // Final validation to ensure enum values are correct
      const validEnvironments = ['Production', 'Staging', 'Development'];
      if (!validEnvironments.includes(requestPayload.environment)) {
        console.warn(`⚠️ Invalid environment "${requestPayload.environment}", defaulting to "Development"`);
        requestPayload.environment = 'Development';
      }

      const validExpirations = ['Never expires', '30 days', '90 days', '1 year'];
      if (!validExpirations.includes(requestPayload.expiration)) {
        console.warn(`⚠️ Invalid expiration "${requestPayload.expiration}", defaulting to "Never expires"`);
        requestPayload.expiration = 'Never expires';
      }

      console.log('🔑 API Keys API - Final request payload:', JSON.stringify(requestPayload, null, 2));
      console.log('🔑 API Keys API - Endpoint: POST /api-keys');

      const response = await apiClient.post('/api-keys', requestPayload);

      console.log('✅ API Keys API - Response received:', response);
      console.log('✅ API Keys API - Response data:', response.data);

      const raw = response.data;
      const data = raw.data || raw;

      const result = {
        id: data.id,
        name: data.name ?? '',
        description: data.description,
        key: data.key ?? '',
        keyPreview: data.key_preview ?? (typeof data.key === 'string' ? `${data.key.slice(0, 4)}…${data.key.slice(-4)}` : ''),
        environment: data.environment ?? 'Development',
        rateLimit: data.rate_limit ?? 0,
        expiresAt: data.expires_at ?? null,
        isActive: data.is_active ?? true,
        requestCount: data.request_count ?? 0,
        lastUsedAt: data.last_used_at ?? null,
        createdAt: data.created_at ?? new Date().toISOString(),
        updatedAt: data.updated_at ?? new Date().toISOString(),
      };

      console.log('✅ API Keys API - Mapped result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ API Keys API - Create failed:', error);
      console.error('❌ API Keys API - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      // Log the detailed validation errors if available
      if (error.response?.data?.detail) {
        console.error('❌ API Keys API - Validation errors:', JSON.stringify(error.response.data.detail, null, 2));
      }

      throw error;
    }
  },

  list: async (): Promise<ApiKey[]> => {
    console.log('🔑 API Keys API - Listing API keys');
    console.log('🔑 API Keys API - Endpoint: GET /api-keys');

    try {
      const response = await apiClient.get('/api-keys');
      console.log('✅ API Keys API - List response received:', response);

      const raw = response.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
      console.log('✅ API Keys API - Parsed list:', list);

      return list.map((data: any) => ({
        id: data.id,
        name: data.name ?? '',
        description: data.description,
        key: data.key ?? '',
        keyPreview: data.key_preview ?? '',
        environment: data.environment ?? 'Development',
        rateLimit: data.rate_limit ?? 0,
        expiresAt: data.expires_at ?? null,
        isActive: data.is_active ?? true,
        requestCount: data.request_count ?? 0,
        lastUsedAt: data.last_used_at ?? null,
        createdAt: data.created_at ?? new Date().toISOString(),
        updatedAt: data.updated_at ?? new Date().toISOString(),
      }));
    } catch (error: any) {
      console.error('❌ API Keys API - List failed:', error);
      console.error('❌ API Keys API - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  get: async (id: string): Promise<ApiKey> => {
    console.log('🔑 API Keys API - Getting API key:', id);
    console.log('🔑 API Keys API - Endpoint: GET /api-keys/' + id);

    try {
      const response = await apiClient.get(`/api-keys/${id}`);
      console.log('✅ API Keys API - Get response received:', response);

      const raw = response.data;
      const data = raw.data || raw;
      return {
        id: data.id,
        name: data.name ?? '',
        description: data.description,
        key: data.key ?? '',
        keyPreview: data.key_preview ?? '',
        environment: data.environment ?? 'Development',
        rateLimit: data.rate_limit ?? 0,
        expiresAt: data.expires_at ?? null,
        isActive: data.is_active ?? true,
        requestCount: data.request_count ?? 0,
        lastUsedAt: data.last_used_at ?? null,
        createdAt: data.created_at ?? new Date().toISOString(),
        updatedAt: data.updated_at ?? new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('❌ API Keys API - Get failed:', error);
      console.error('❌ API Keys API - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    console.log('🔑 API Keys API - Deleting API key:', id);
    console.log('🔑 API Keys API - Endpoint: DELETE /api-keys/' + id);

    try {
      await apiClient.delete(`/api-keys/${id}`);
      console.log('✅ API Keys API - Delete successful');
    } catch (error: any) {
      console.error('❌ API Keys API - Delete failed:', error);
      console.error('❌ API Keys API - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};

// 📊 Overview API functions - This handles overview dashboard data
export const overviewAPI = {
  // Get main overview dashboard data
  getOverview: async (): Promise<OverviewData> => {
    console.log('📊 Overview API - Getting overview data');
    console.log('🌐 Using endpoint: GET /overview');

    try {
      const response = await apiClient.get('/overview');
      console.log('✅ Overview API - Response:', response.data);

      // Extract data from response (handle both wrapped and unwrapped responses)
      const responseData = response.data.data || response.data;
      return responseData;
    } catch (error) {
      console.error('❌ Overview API - Get overview failed:', error);
      throw error;
    }
  },

  // Get query statistics for all modules
  getModuleQueries: async (): Promise<ModuleQueries[]> => {
    console.log('📊 Overview API - Getting module queries');
    console.log('🌐 Using endpoint: GET /overview/modules/queries');

    try {
      const response = await apiClient.get('/overview/modules/queries');
      console.log('✅ Overview API - Module queries response:', response.data);

      const responseData = response.data.data || response.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error('❌ Overview API - Get module queries failed:', error);
      throw error;
    }
  },

  // Get queries over time for graphs
  getQueriesOverTime: async (): Promise<QueryOverTime[]> => {
    console.log('📊 Overview API - Getting queries over time');
    console.log('🌐 Using endpoint: GET /overview/queries-over-time');

    try {
      const response = await apiClient.get('/overview/queries-over-time');
      console.log('✅ Overview API - Queries over time response:', response.data);

      const responseData = response.data.data || response.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error('❌ Overview API - Get queries over time failed:', error);
      throw error;
    }
  },

  // Get latest feedback entries
  getLatestFeedback: async (): Promise<LatestFeedback[]> => {
    console.log('📊 Overview API - Getting latest feedback');
    console.log('🌐 Using endpoint: GET /overview/feedback/latest');

    try {
      const response = await apiClient.get('/overview/feedback/latest');
      console.log('✅ Overview API - Latest feedback response:', response.data);

      const responseData = response.data.data || response.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error('❌ Overview API - Get latest feedback failed:', error);
      throw error;
    }
  },

  // Get feedback statistics (thumbs-up rate)
  getThumbsUpRate: async (): Promise<ThumbsUpRate> => {
    console.log('📊 Overview API - Getting thumbs-up rate');
    console.log('🌐 Using endpoint: GET /overview/feedback/thumbs-up-rate');

    try {
      const response = await apiClient.get('/overview/feedback/thumbs-up-rate');
      console.log('✅ Overview API - Thumbs-up rate response:', response.data);

      const responseData = response.data.data || response.data;
      return responseData;
    } catch (error) {
      console.error('❌ Overview API - Get thumbs-up rate failed:', error);
      throw error;
    }
  },

  // Get P95 latency metrics
  getP95Latency: async (): Promise<P95Latency> => {
    console.log('📊 Overview API - Getting P95 latency');
    console.log('🌐 Using endpoint: GET /overview/latency/p95-latency');

    try {
      const response = await apiClient.get('/overview/latency/p95-latency');
      console.log('✅ Overview API - P95 latency response:', response.data);

      const responseData = response.data.data || response.data;
      return responseData;
    } catch (error) {
      console.error('❌ Overview API - Get P95 latency failed:', error);
      throw error;
    }
  },

  // Get crawl errors
  getCrawlErrors: async (): Promise<CrawlError[]> => {
    console.log('📊 Overview API - Getting crawl errors');
    console.log('🌐 Using endpoint: GET /overview/crawl-errors');

    try {
      const response = await apiClient.get('/overview/crawl-errors');
      console.log('✅ Overview API - Crawl errors response:', response.data);

      const responseData = response.data.data || response.data;
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error('❌ Overview API - Get crawl errors failed:', error);
      throw error;
    }
  },
};

// 📝 Type definitions - This tells TypeScript what your API returns
export interface SearchResponse {
  success: boolean;
  answer: string;           // The AI's answer
  sources?: Array<{        // Optional sources/citations
    title?: string;
    url?: string;
    snippet?: string;
    // Handle server's additional properties
    additionalProp1?: string;
    additionalProp2?: string;
    additionalProp3?: string;
  }>;
  message?: string;
  timestamp?: string;
  request_id?: string;
  message_id?: string; // 💬 Message ID from backend response
  session_id?: string; // 💬 Session ID from backend response
}

// 💬 Chat type definitions
export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  lastMessage: string;
}

export interface ChatResponse {
  messageId: string;
  response: string;
  sessionId: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

// 🕷️ Crawl type definitions
export interface CrawlSiteData {
  name: string;
  url: string;
  description?: string;
  crawlDepth?: number;
  maxPages?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  crawlDelay?: number;
  respectRobotsTxt?: boolean;
  followRedirects?: boolean;
  customHeaders?: Record<string, string>;
  cadence?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  headlessMode?: 'AUTO' | 'ON' | 'OFF';
}

export interface CrawlSite {
  id: string;
  name: string;
  url: string;
  description?: string;
  status: 'active' | 'inactive' | 'crawling' | 'error';
  lastCrawled?: string;
  pagesFound?: number;
  pagesCrawled?: number;
  progress?: number; // Progress percentage (0-100) from backend
  currentJobId?: string; // Current crawl job ID to fetch status
  createdAt: string;
  updatedAt: string;
  crawlDepth?: number;
  maxPages?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  crawlDelay?: number;
  cadence?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  headlessMode?: 'AUTO' | 'ON' | 'OFF';
  respectRobotsTxt?: boolean;
  followRedirects?: boolean;
  customHeaders?: Record<string, string>;
  trainedAt?: string | null; // Timestamp when training completed, null if not trained yet
  isTrained?: boolean; // Boolean indicating if data is trained (computed from trainedAt)
}

export interface CrawlStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-100
  pagesFound: number;
  pagesCrawled: number;
  currentUrl?: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  logs?: string[];
  isTrained?: boolean; // Boolean indicating if data is trained
  trainedAt?: string | null; // Timestamp when training completed, null if not trained
}

export interface UrlPreview {
  url: string;
  title: string;
  content: string;
  text: string;
  links: string[];
  images: string[];
  metadata: Record<string, string>;
  status: number;
  responseTime: number;
}

// 🔐 Authentication type definitions
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role: string;
    permissions?: string[];
  };
  expiresAt: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  permissions?: string[];
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// 📄 Document type definitions
export interface DocumentMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  author?: string;
  source?: string;
  language?: string;
  priority?: 'low' | 'medium' | 'high';
  isPublic?: boolean;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: string;
  source: string;
  language: string;
  status: string;
  chunks: number;
  lastIndexed: string;
  url: string;
  checksum: string;
  size: string;
}

export interface DocumentContent {
  id: string;
  content: string;
  metadata: Record<string, any>;
  extractedText: string;
  sections?: Array<{
    title: string;
    content: string;
    pageNumber?: number;
  }>;
  summary?: string;
  keywords?: string[];
}

export interface UploadResponse {
  id: string;
  message: string;
  status: 'success' | 'processing' | 'failed';
  processingTime?: number;
}

// 📊 Overview API type definitions
export interface OverviewData {
  queriesToday?: number;
  queriesYesterday?: number;
  p95Latency?: number;
  thumbsUpRate?: number;
  crawlErrors?: number;
  totalDocuments?: number;
  totalSources?: number;
  [key: string]: any; // Allow additional fields
}

export interface ModuleQueries {
  module: string;
  queries: number;
  [key: string]: any;
}

export interface QueryOverTime {
  date: string;
  queries: number;
  [key: string]: any;
}

export interface LatestFeedback {
  id?: string;
  query: string;
  vote?: 'up' | 'down' | 'positive' | 'negative';
  reason?: string;
  time?: string;
  timestamp?: string;
  session_id?: string;
  message_id?: string;
  [key: string]: any;
}

export interface ThumbsUpRate {
  rate: number;
  total: number;
  positive: number;
  negative: number;
  [key: string]: any;
}

export interface P95Latency {
  latency: number;
  unit?: string;
  [key: string]: any;
}

export interface CrawlError {
  id?: string;
  url: string;
  error: string;
  timestamp?: string;
  source?: string;
  [key: string]: any;
}

// 🔌 Embed/Integrations API
export interface EmbedKey {
  id: string;
  label: string;
  keyPrefix: string;
  environment: string;
  rateLimit: number;
  expiresAt: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
}

export interface EmbedConfigPayload {
  publicId: string;
  keys: Partial<EmbedKey>[];
}

export interface EmbedConfigResponse {
  id: string;
  user_id: number;
  public_id: string;
  keys: EmbedKey[];
  created_at: string;
  updated_at: string;
}

export const embedAPI = {
  get: async (): Promise<EmbedConfigResponse> => {
    console.log('🔌 Embed API - Getting config');
    try {
      const response = await apiClient.get('/integrations/embed');
      console.log('✅ Embed API - Get successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Embed API - Get failed:', error);
      throw error;
    }
  },

  update: async (payload: EmbedConfigPayload): Promise<EmbedConfigResponse> => {
    console.log('🔌 Embed API - Updating config:', payload);
    try {
      const response = await apiClient.post('/integrations/embed', payload);
      console.log('✅ Embed API - Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Embed API - Update failed:', error);
      throw error;
    }
  },

  deleteKey: async (keyId: string): Promise<void> => {
    console.log('🔌 Embed API - Deleting key (key_id):', keyId);
    try {
      // Endpoint specified by user from backend code: DELETE /api/v1/integrations/embed/keys/{key_id}
      await apiClient.delete(`/integrations/embed/keys/${keyId}`);
      console.log('✅ Embed API - Delete key successful');
    } catch (error) {
      console.error('❌ Embed API - Delete key failed:', error);
      throw error;
    }
  }
};

// 📁 Project API type definitions
export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  active_project_id: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// 📁 Project API functions
export const projectAPI = {
  // Get all projects
  getProjects: async (): Promise<ProjectsResponse> => {
    console.log('📁 Project API - Getting projects');
    try {
      const response = await apiClient.get('/projects');
      console.log('✅ Projects retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get projects failed:', error);
      throw error;
    }
  },

  // Get single project
  getProject: async (projectId: string): Promise<Project> => {
    console.log('📁 Project API - Getting project:', projectId);
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      console.log('✅ Project retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get project failed:', error);
      throw error;
    }
  },

  // Create project
  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    console.log('📁 Project API - Creating project:', payload);
    try {
      const response = await apiClient.post('/projects', payload);
      console.log('✅ Project created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create project failed:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId: string, payload: UpdateProjectPayload): Promise<Project> => {
    console.log('📁 Project API - Updating project:', projectId, payload);
    try {
      const response = await apiClient.put(`/projects/${projectId}`, payload);
      console.log('✅ Project updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update project failed:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    console.log('📁 Project API - Deleting project:', projectId);
    try {
      await apiClient.delete(`/projects/${projectId}`);
      console.log('✅ Project deleted successfully');
    } catch (error) {
      console.error('❌ Delete project failed:', error);
      throw error;
    }
  },

  // Activate project
  activateProject: async (projectId: string): Promise<Project> => {
    console.log('📁 Project API - Activating project:', projectId);
    try {
      const response = await apiClient.post(`/projects/${projectId}/activate`);
      console.log('✅ Project activated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Activate project failed:', error);
      throw error;
    }
  },
};

// ==================== ONBOARDING API ====================

export interface OnboardingBranding {
  org_name: string;
  logo_data_url?: string | null;
  primary_color?: string | null;
}

export interface OnboardingProject {
  name: string;
  description: string;
}

export interface OnboardingDataSource {
  base_url: string;
  depth?: number;
  cadence?: string;
  headless_mode?: boolean;
}

export interface OnboardingTestQuery {
  project_id: string;
  query: string;
}

export interface OnboardingStatus {
  completed_steps: string[];
  current_step: string;
  project_id: string | null;
}

export interface SuggestionResponse {
  suggestions: string[];
}

// General suggestions API (for RAG Tuning, doesn't require projectId)
export const suggestionsAPI = {
  // Get general suggestions
  getSuggestions: async (): Promise<SuggestionResponse> => {
    console.log('💡 Suggestions API - Getting suggestions');
    try {
      const response = await apiClient.get('/suggestions');
      console.log('✅ Suggestions retrieved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // If 404 or error, return empty suggestions
      if (error?.response?.status === 404) {
        console.log('ℹ️ No suggestions found, returning empty array');
        return { suggestions: [] };
      }
      console.error('❌ Get suggestions failed:', error);
      // Return empty array on error instead of throwing
      return { suggestions: [] };
    }
  },
};

export interface OnboardingBrandingResponse {
  message: string;
  org_name: string;
  has_logo: boolean;
  has_color: boolean;
  logo_data_url?: string | null;
  primary_color?: string | null;
}

export interface OnboardingTestQueryResponse {
  success: boolean;
  query: string;
  answer: string;
  message_id?: string;
  session_id?: string;
}

export const onboardingAPI = {
  // Get branding (Step 1)
  getBranding: async (): Promise<OnboardingBrandingResponse> => {
    console.log('🎨 Onboarding API - Getting branding');
    try {
      const response = await apiClient.get('/onboarding/branding');
      console.log('✅ Branding retrieved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // If 404, return default branding
      if (error?.response?.status === 404) {
        console.log('ℹ️ No branding found, returning defaults');
        return {
          message: 'No branding configured',
          org_name: '',
          has_logo: false,
          has_color: false,
        };
      }
      console.error('❌ Get branding failed:', error);
      throw error;
    }
  },

  // Save branding (Step 1)
  saveBranding: async (branding: OnboardingBranding): Promise<OnboardingBrandingResponse> => {
    console.log('🎨 Onboarding API - Saving branding:', branding.org_name);
    try {
      const response = await apiClient.post('/onboarding/branding', branding);
      console.log('✅ Branding saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Save branding failed:', error);
      throw error;
    }
  },

  // Create onboarding project (Step 2)
  createProject: async (project: OnboardingProject): Promise<Project> => {
    console.log('📁 Onboarding API - Creating project:', project.name);
    try {
      const response = await apiClient.post('/onboarding/project', project);
      console.log('✅ Onboarding project created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create onboarding project failed:', error);
      throw error;
    }
  },

  // Create onboarding data source (Step 3)
  createDataSource: async (dataSource: OnboardingDataSource): Promise<CrawlSite> => {
    console.log('🌐 Onboarding API - Creating data source:', dataSource.base_url);
    try {
      const response = await apiClient.post('/onboarding/data-source', dataSource);
      console.log('✅ Onboarding data source created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create onboarding data source failed:', error);
      throw error;
    }
  },

  // Test onboarding query (Step 4)
  testQuery: async (testData: OnboardingTestQuery): Promise<OnboardingTestQueryResponse> => {
    console.log('🔍 Onboarding API - Testing query:', testData.query);
    try {
      const response = await apiClient.post('/onboarding/test-query', testData);
      console.log('✅ Test query executed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Test query failed:', error);
      throw error;
    }
  },

  // Get onboarding status
  getStatus: async (): Promise<OnboardingStatus> => {
    console.log('📊 Onboarding API - Getting status');
    try {
      const response = await apiClient.get('/onboarding/status');
      console.log('✅ Onboarding status retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get onboarding status failed:', error);
      throw error;
    }
  },

  // Get suggestions
  getSuggestions: async (projectId: string, limit: number = 4): Promise<SuggestionResponse> => {
    console.log('💡 Onboarding API - Getting suggestions for project:', projectId);
    try {
      const response = await apiClient.get('/onboarding/suggestions', {
        params: { project_id: projectId, limit },
      });
      console.log('✅ Suggestions retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get suggestions failed:', error);
      throw error;
    }
  },

  // Get crawl status for onboarding
  getCrawlStatus: async (): Promise<string> => {
    console.log('🕷️ Onboarding API - Getting crawl status');
    try {
      const response = await apiClient.get('/onboarding/crawl-status');
      console.log('✅ Crawl status retrieved successfully:', response.data);
      // Response is a string, return it directly
      return typeof response.data === 'string' ? response.data : response.data.status || '';
    } catch (error: any) {
      // If 404, return empty string
      if (error?.response?.status === 404) {
        console.log('ℹ️ No crawl status found');
        return '';
      }
      console.error('❌ Get crawl status failed:', error);
      throw error;
    }
  },

  // Complete onboarding (Final step)
  completeOnboarding: async (): Promise<{
    success: boolean;
    message: string;
    project: {
      id: string;
      name: string;
      description: string;
      is_active: boolean;
      created_at: string | null;
    };
    data_source: {
      id: string;
      name: string;
      base_url: string;
      status: string;
    };
    embeddings: {
      documents_count: number;
      status: string;
    };
    next_steps: string;
  }> => {
    console.log('🎉 Onboarding API - Completing onboarding');
    try {
      const response = await apiClient.post('/onboarding/complete');
      console.log('✅ Onboarding completed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Complete onboarding failed:', error);
      throw error;
    }
  },
};

// Settings API interfaces
export interface SettingsResponse {
  org_name: string;
  logo_data_url: string | null;
  primary_color: string;
}

export interface SettingsRequest {
  org_name: string;
  logo_data_url?: string | null;
  primary_color?: string;
}

export const settingsAPI = {
  // Get settings
  getSettings: async (): Promise<SettingsResponse> => {
    console.log('⚙️ Settings API - Getting settings');
    try {
      const response = await apiClient.get('/settings');
      console.log('✅ Settings retrieved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // Check if we're in widget mode (external website)
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      
      // If 404 or 401 in widget mode, return default settings (widget should still work)
      if (error?.response?.status === 404 || (error?.response?.status === 401 && isWidgetMode)) {
        const statusMsg = error?.response?.status === 401 ? '401 Unauthorized (backend may not accept projectId yet)' : '404 Not Found';
        console.log(`ℹ️ Settings ${statusMsg}, returning defaults for widget mode`);
        return {
          org_name: 'RAGSuite',
          logo_data_url: null,
          primary_color: '#1F6FEB',
        };
      }
      console.error('❌ Get settings failed:', error);
      throw error;
    }
  },

  // Save settings
  saveSettings: async (settings: SettingsRequest): Promise<SettingsResponse> => {
    console.log('⚙️ Settings API - Saving settings:', settings.org_name);
    try {
      const response = await apiClient.post('/settings', settings);
      console.log('✅ Settings saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Save settings failed:', error);
      throw error;
    }
  },
};

// System Health API interfaces
export interface ServiceHealth {
  status: string;
  uptime_percent: number;
  last_heartbeat_seconds: number;
  health_score: number;
  reason: string;
  predicted_failure_minutes: number;
}

export interface SystemHealthResponse {
  services: Record<string, ServiceHealth>;
  timestamp: string;
  overall_health_score: number;
  overall_status: string;
}

export const systemHealthAPI = {
  // Get system health
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    console.log('🏥 System Health API - Getting system health');
    try {
      const response = await apiClient.get('/system-health');
      console.log('✅ System health retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get system health failed:', error);
      throw error;
    }
  },
};

// Chatbot Configuration & Customization API interfaces
export interface ChatbotSettingsResponse {
  configuration: {
    chatbot_title: string;
    short_description: string;
    bubble_message: string;
    welcome_message: string;
    chatbot_language: string;
  };
  customization: {
    widget_logo_url: string;
    widget_avatar: string;
    widget_avatar_size: number;
    widget_chatbot_color: string;
    widget_show_logo: boolean;
    widget_show_date_time: boolean;
    widget_bottom_space: number;
    widget_font_size: number;
    widget_trigger_border_radius: number;
    widget_position: string;
    widget_z_index: number;
    widget_offset_x: number;
    widget_offset_y: number;
  };
}

export interface ChatbotConfigurationRequest {
  chatbot_title: string;
  short_description: string;
  bubble_message: string;
  welcome_message: string;
  chatbot_language: string;
}

export interface ChatbotCustomizationRequest {
  widget_logo_url: string;
  widget_avatar: string;
  widget_avatar_size: number;
  widget_chatbot_color: string;
  widget_show_logo: boolean;
  widget_show_date_time: boolean;
  widget_bottom_space: number;
  widget_font_size?: number;
  widget_trigger_border_radius: number;
  widget_position: string;
  widget_z_index: number;
  widget_offset_x: number;
  widget_offset_y: number;
}

export const chatbotAPI = {
  // Get chatbot settings (configuration + customization)
  getSettings: async (): Promise<ChatbotSettingsResponse> => {
    console.log('🤖 Chatbot API - Getting settings');
    try {
      const response = await apiClient.get('/chatbot/settings');
      console.log('✅ Chatbot settings retrieved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // Check if we're in widget mode (external website)
      const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
      
      // If 404 or 401 in widget mode, return default settings (widget should still work)
      if (error?.response?.status === 404 || (error?.response?.status === 401 && isWidgetMode)) {
        const statusMsg = error?.response?.status === 401 ? '401 Unauthorized (backend may not accept projectId yet)' : '404 Not Found';
        console.log(`ℹ️ Chatbot settings ${statusMsg}, returning defaults for widget mode`);
        return {
          configuration: {
            chatbot_title: '',
            short_description: '',
            bubble_message: '',
            welcome_message: '',
            chatbot_language: 'en',
          },
          customization: {
            widget_logo_url: '',
            widget_avatar: 'default-1',
            widget_avatar_size: 15,
            widget_chatbot_color: '#1F2937',
            widget_show_logo: true,
            widget_show_date_time: true,
            widget_bottom_space: 15,
            widget_font_size: 12,
            widget_trigger_border_radius: 50,
            widget_position: 'bottom-right',
            widget_z_index: 50,
            widget_offset_x: 0,
            widget_offset_y: 0,
          },
        };
      }
      console.error('❌ Get chatbot settings failed:', error);
      throw error;
    }
  },

  // Save chatbot configuration
  saveConfiguration: async (config: ChatbotConfigurationRequest): Promise<ChatbotConfigurationRequest> => {
    console.log('🤖 Chatbot API - Saving configuration:', config);
    try {
      const response = await apiClient.post('/chatbot/configuration', config);
      console.log('✅ Chatbot configuration saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Save chatbot configuration failed:', error);
      throw error;
    }
  },

  // Save chatbot customization
  saveCustomization: async (customization: ChatbotCustomizationRequest): Promise<ChatbotCustomizationRequest> => {
    console.log('🤖 Chatbot API - Saving customization:', customization);
    try {
      const response = await apiClient.post('/chatbot/customization', customization);
      console.log('✅ Chatbot customization saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Save chatbot customization failed:', error);
      throw error;
    }
  },

  // Get chatbot activation status
  getActivationStatus: async (): Promise<{ success: boolean; is_active: boolean }> => {
    const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
    
    // Only log in development mode
    if (import.meta.env.DEV) {
    console.log('⚙️ Chatbot API - Fetching activation status');
    }
    
    try {
      const response = await apiClient.get<{ success: boolean; is_active: boolean }>('/chatbot/activate');
      
      if (import.meta.env.DEV) {
      console.log('✅ Activation status fetched successfully:', response.data);
      }
      
      return response.data;
    } catch (error: any) {
      // If 401 in widget mode, backend doesn't support projectId for this endpoint yet
      // Default to true (show widget) - only hide if we explicitly know it's disabled
      // This allows the widget to work even if backend doesn't support activation endpoint with projectId
      // This is expected behavior - don't log as error
      if (error?.response?.status === 401 && isWidgetMode) {
        if (import.meta.env.DEV) {
        console.log('ℹ️ Activation status 401 Unauthorized in widget mode - backend may not support projectId for this endpoint yet. Defaulting to enabled (show widget).');
        }
        return { success: true, is_active: true };
      }
      
      // For other errors, only log in development mode
      if (import.meta.env.DEV) {
      console.error('❌ Get activation status failed:', error);
      }
      
      throw error;
    }
  },

  // Update chatbot activation status
  updateActivationStatus: async (isActive: boolean): Promise<{ success: boolean; message: string; is_active: boolean }> => {
    console.log('⚙️ Chatbot API - Updating activation status:', isActive);
    try {
      const response = await apiClient.put<{ success: boolean; message: string; is_active: boolean }>('/chatbot/activate', {
        is_active: isActive
      });
      console.log('✅ Activation status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update activation status failed:', error);
      throw error;
    }
  },
};

// 🔍 Search Activation API functions
export const searchActivationAPI = {
  // Get search activation status
  getActivationStatus: async (): Promise<{ is_active: boolean }> => {
    const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
    
    // Only log in development mode
    if (import.meta.env.DEV) {
    console.log('🔍 Search Activation API - Fetching activation status');
    }
    
    try {
      const response = await apiClient.get<{ success: boolean; data: { is_active: boolean }; message: string }>('/search/activate');
      
      if (import.meta.env.DEV) {
      console.log('✅ Search activation status fetched successfully:', response.data);
      }
      
      // Server returns: { success: true, data: { is_active: true/false }, message: "..." }
      // Extract the data object which contains is_active
      const responseData = response.data.data || { is_active: true };
      return responseData;
    } catch (error: any) {
      // In widget mode, if we get 401, return default active status
      // This ensures widget shows by default if backend doesn't support projectId for this endpoint
      // This is expected behavior - don't log as error
      if (isWidgetMode && error?.response?.status === 401) {
        if (import.meta.env.DEV) {
          console.log('ℹ️ Search activation API returned 401 in widget mode - backend may not support projectId authentication yet. Defaulting to active.');
        }
        return { is_active: true };
      }
      
      // For other errors, only log in development mode
      if (import.meta.env.DEV) {
        console.error('❌ Get search activation status failed:', error);
      }
      
      throw error;
    }
  },

  // Update search activation status
  updateActivationStatus: async (isActive: boolean): Promise<{ success: boolean; message?: string; data?: { is_active: boolean } }> => {
    console.log('🔍 Search Activation API - Updating activation status:', isActive);
    try {
      // Server expects: { "is_active": true/false } directly in the body
      const response = await apiClient.put<{ success: boolean; message?: string; data?: { is_active: boolean } }>('/search/activate', {
        is_active: isActive
      });
      console.log('✅ Search activation status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update search activation status failed:', error);
      throw error;
    }
  },
};

// Config Models API types
export interface ConfigModelsResponse {
  success: boolean;
  data: ConfigModelsData | string; // Backend returns string, but we'll parse it to ConfigModelsData
  message: string;
}

export interface ConfigModelsData {
  model_provider: string;
  chat_model?: string | null;
  search_model?: string | null; // API returns search_model for search configuration
  embedding_model: string;
  api_key: string;
  chat_temperature?: string | null;
  search_temperature?: string | null; // API returns search_temperature for search configuration
  chat_top_p?: string | null;
  search_top_p?: string | null; // API returns search_top_p for search configuration
  chat_best_of?: number | null;
  search_best_of?: number | null; // API returns search_best_of for search configuration
  chat_frequency_penalty?: string | null;
  search_frequency_penalty?: string | null; // API returns search_frequency_penalty for search configuration
  chat_presence_penalty?: string | null;
  search_presence_penalty?: string | null; // API returns search_presence_penalty for search configuration
  chat_top_k?: number | null;
  search_top_k?: number | null; // API returns search_top_k for search configuration
  chat_similarity_threshold?: number | null;
  search_similarity_threshold?: number | null; // API returns search_similarity_threshold for search configuration
  chat_max_tokens?: number | null;
  search_max_tokens?: number | null; // API returns search_max_tokens for search configuration
  chat_use_reranker?: boolean | null;
  search_use_reranker?: boolean | null; // API returns search_use_reranker for search configuration
  response_type?: string | null; // API returns response_type
}

export interface ConfigModelsRequest {
  model_provider: string;
  chat_model?: string | null;
  search_model?: string | null; // For search configuration
  embedding_model: string;
  api_key: string;
  chat_temperature?: string | null;
  search_temperature?: string | null; // For search configuration
  chat_top_p?: string | null;
  search_top_p?: string | null; // For search configuration
  chat_best_of?: number | null;
  search_best_of?: number | null; // For search configuration
  chat_frequency_penalty?: string | null;
  search_frequency_penalty?: string | null; // For search configuration
  chat_presence_penalty?: string | null;
  search_presence_penalty?: string | null; // For search configuration
  chat_top_k?: number | null;
  search_top_k?: number | null; // For search configuration
  chat_similarity_threshold?: number | null;
  search_similarity_threshold?: number | null; // For search configuration
  chat_max_tokens?: number | null;
  search_max_tokens?: number | null; // For search configuration
  chat_use_reranker?: boolean | null;
  search_use_reranker?: boolean | null; // For search configuration
  response_type?: string | null; // For search configuration
}

export interface AvailableModelsResponse {
  success: boolean;
  data: string[]; // Array of model names
  message: string;
}

export interface ModelInfo {
  name: string;
  value: string;
}

export interface ProviderModelInfo {
  provider: string;
  value: string;
  chat_models: ModelInfo[];
  embedding_models: ModelInfo[];
}

export const configModelsAPI = {
  // Get config models
  getConfigModels: async (): Promise<ConfigModelsData> => {
    console.log('⚙️ Config Models API - Fetching config models');
    try {
      const response = await apiClient.get<ConfigModelsResponse>('/config-models/');
      console.log('✅ Config models fetched successfully:', response.data);
      
      // Parse data if it's a string (JSON stringified)
      let data: ConfigModelsData;
      if (typeof response.data.data === 'string') {
        try {
          data = JSON.parse(response.data.data);
        } catch {
          // If parsing fails, return default structure
          data = {
            model_provider: '',
            chat_model: '',
            embedding_model: '',
            api_key: '',
            chat_temperature: null,
            chat_top_p: null,
            chat_best_of: null,
            chat_frequency_penalty: null,
            chat_presence_penalty: null,
            chat_top_k: null,
            chat_similarity_threshold: null,
            chat_max_tokens: null,
            chat_use_reranker: null,
          };
        }
      } else {
        data = response.data.data as ConfigModelsData;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Get config models failed:', error);
      throw error;
    }
  },

  // Get all available models (providers with their chat and embedding models)
  getAvailableModels: async (): Promise<ProviderModelInfo[]> => {
    console.log('⚙️ Config Models API - Fetching available models');
    try {
      const response = await apiClient.get<ProviderModelInfo[]>('/config-models/models');
      console.log('✅ Available models fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get available models failed:', error);
      return [];
    }
  },

  // Get available chat models for a specific provider
  getAvailableChatModels: async (provider?: string): Promise<string[]> => {
    console.log('⚙️ Config Models API - Fetching available chat models for provider:', provider);
    try {
      const allModels = await configModelsAPI.getAvailableModels();
      const providerInfo = allModels.find(p => p.value.toLowerCase() === provider?.toLowerCase());
      
      if (providerInfo && providerInfo.chat_models) {
        return providerInfo.chat_models.map(model => model.value);
      }
      
      return [];
    } catch (error) {
      console.error('❌ Get available chat models failed:', error);
      return [];
    }
  },

  // Get available embedding models for a specific provider
  getAvailableEmbeddingModels: async (provider?: string): Promise<string[]> => {
    console.log('⚙️ Config Models API - Fetching available embedding models for provider:', provider);
    try {
      const allModels = await configModelsAPI.getAvailableModels();
      const providerInfo = allModels.find(p => p.value.toLowerCase() === provider?.toLowerCase());
      
      if (providerInfo && providerInfo.embedding_models) {
        return providerInfo.embedding_models.map(model => model.value);
      }
      
      return [];
    } catch (error) {
      console.error('❌ Get available embedding models failed:', error);
      return [];
    }
  },

  // Save config models
  saveConfigModels: async (config: ConfigModelsRequest): Promise<ConfigModelsRequest> => {
    console.log('⚙️ Config Models API - Saving config models:', config);
    try {
      const response = await apiClient.post<ConfigModelsResponse>('/config-models/', config);
      console.log('✅ Config models saved successfully:', response.data);
      return config; // Return the request data since backend might not return the full object
    } catch (error) {
      console.error('❌ Save config models failed:', error);
      throw error;
    }
  },
};

// Prompt API types
export interface PromptResponse {
  success: boolean;
  data: {
    system_prompt: string;
  };
  message: string;
}

export interface PromptRequest {
  system_prompt: string;
}

// Prompt API
export const promptAPI = {
  // Get system prompt
  getPrompt: async (): Promise<PromptResponse['data']> => {
    console.log('⚙️ Prompt API - Fetching system prompt');
    try {
      const response = await apiClient.get<PromptResponse>('/prompt');
      console.log('✅ Prompt fetched successfully:', response.data);
      
      // Handle response - data could be nested or direct
      let data: PromptResponse['data'];
      if (response.data.data) {
        // If data is nested
        if (typeof response.data.data === 'string') {
          // If data is a stringified JSON
          try {
            data = JSON.parse(response.data.data);
          } catch {
            data = { system_prompt: response.data.data };
          }
        } else {
          data = response.data.data as PromptResponse['data'];
        }
      } else {
        // If data is at root level
        data = response.data as any;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Get prompt failed:', error);
      throw error;
    }
  },

  // Save system prompt
  savePrompt: async (prompt: PromptRequest): Promise<PromptRequest> => {
    console.log('⚙️ Prompt API - Saving system prompt:', prompt);
    try {
      const response = await apiClient.post<PromptResponse>('/prompt', prompt);
      console.log('✅ Prompt saved successfully:', response.data);
      return prompt;
    } catch (error) {
      console.error('❌ Save prompt failed:', error);
      throw error;
    }
  },
};

// 🔍 Search Prompt API functions
export const searchPromptAPI = {
  // Get search prompt (returns string)
  getPrompt: async (): Promise<string> => {
    console.log('🔍 Search Prompt API - Fetching search prompt');
    try {
      const response = await apiClient.get('/search/prompt');
      console.log('✅ Search prompt fetched successfully:', response.data);
      
      // Handle different response formats
      let promptString = '';
      
      if (typeof response.data === 'string') {
        // Direct string response
        promptString = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Object response - extract string from common fields
        promptString = (response.data as any).system_prompt || 
                      (response.data as any).data || 
                      (response.data as any).prompt ||
                      (response.data as any).message ||
                      '';
      } else {
        // Fallback: convert to string
        promptString = String(response.data || '');
      }
      
      return promptString;
    } catch (error) {
      console.error('❌ Get search prompt failed:', error);
      throw error;
    }
  },

  // Save search prompt
  savePrompt: async (prompt: { system_prompt: string }): Promise<string | { system_prompt: string }> => {
    console.log('🔍 Search Prompt API - Saving search prompt:', prompt);
    try {
      const response = await apiClient.post('/search/prompt', prompt);
      console.log('✅ Search prompt saved successfully:', response.data);
      
      // Handle different response formats
      // API might return string, object, or the prompt we sent
      if (typeof response.data === 'string') {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Return object if it has system_prompt, otherwise return what we sent
        return (response.data as any).system_prompt ? response.data : prompt;
      } else {
        // Return the prompt we sent as confirmation
        return prompt;
      }
    } catch (error) {
      console.error('❌ Save search prompt failed:', error);
      throw error;
    }
  },
};

// 📊 Analytics API interfaces
export interface AnalyticsOverviewData {
  total_queries: number;
  avg_response_time_ms: number;
  popular_terms: Array<{
    term: string;
    count: number;
  }>;
  system_health: {
    status: string;
    database: boolean;
    cache: boolean;
    version: string;
    uptime_seconds: number;
  };
  crawl_status: {
    active_jobs: number;
    failed_jobs: number;
    completed_jobs: number;
    pending_jobs: number;
    total_sources: number;
    total_documents: number;
  };
}

export interface AnalyticsQuery {
  id: string;
  query: string;
  mode: string;
  p95_latency: number;
  result_count: number;
  timestamp: string;
}

export interface AnalyticsQueriesResponse {
  queries: AnalyticsQuery[];
  total: number;
  limit: number;
  offset: number;
  date_range: Record<string, string>;
}

export interface PopularTerm {
  term: string;
  count: number;
}

export interface AnalyticsPopularResponse {
  terms: PopularTerm[];
  total_unique_terms: number;
  date_range: Record<string, string>;
}

export interface DailyQuery {
  date: string;
  queries: number;
}

export interface LatencyDataPoint {
  date: string;
  p95: number;
  p50: number;
}

export interface SatisfactionDataPoint {
  date: string;
  satisfaction: number;
}

export interface SourceCoverageItem {
  name: string;
  value: number;
  color: string;
}

export interface PopularQuery {
  query: string;
  count: number;
  satisfaction: number;
}

export interface HardQuery {
  query: string;
  attempts: number;
  satisfaction: number;
  avgLatency: string;
  lastAttempt: string;
}

export interface AnalyticsMetrics {
  totalQueries: number;
  totalQueriesChange: number;
  avgLatencyP95: number;
  avgLatencyP95Change: number;
  satisfactionRate: number;
  satisfactionRateChange: number;
  dailyAverage: number;
}

export interface AnalyticsDashboardResponse {
  metrics: AnalyticsMetrics;
  dailyQueries: DailyQuery[];
  latencyData: LatencyDataPoint[];
  satisfactionData: SatisfactionDataPoint[];
  sourceCoverage: SourceCoverageItem[];
  popularQueries: PopularQuery[];
  hardQueries: HardQuery[];
  timeRange: string;
}

export interface SatisfactionTimeSeriesResponse {
  data: SatisfactionDataPoint[];
  timeRange: string;
  averageSatisfaction: number;
}

export interface SourceCoverageResponse {
  sources: SourceCoverageItem[];
  totalSources: number;
}

export interface PopularQueriesResponse {
  queries: PopularQuery[];
  timeRange: string;
}

export interface HardQueriesResponse {
  queries: HardQuery[];
  timeRange: string;
}

// 📊 Analytics API functions
// 👤 User Profile API type definitions
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// 👤 User Profile API functions
export const userAPI = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    console.log('👤 User API - Getting profile');
    try {
      const response = await apiClient.get('/user/profile');
      console.log('✅ User profile retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get user profile failed:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    console.log('👤 User API - Updating profile:', payload);
    try {
      const response = await apiClient.put('/user/profile', payload);
      console.log('✅ User profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update user profile failed:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (payload: UpdatePasswordPayload): Promise<void> => {
    console.log('👤 User API - Updating password');
    try {
      const response = await apiClient.put('/user/profile/password', payload);
      console.log('✅ Password updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update password failed:', error);
      throw error;
    }
  },
};

export const analyticsAPI = {
  // Get analytics overview
  getOverview: async (): Promise<AnalyticsOverviewData> => {
    console.log('📊 Analytics API - Getting overview');
    try {
      const response = await apiClient.get('/analytics/overview');
      console.log('✅ Analytics API - Overview response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get overview failed:', error);
      throw error;
    }
  },

  // Get queries
  getQueries: async (params?: { limit?: number; offset?: number; start_date?: string; end_date?: string }): Promise<AnalyticsQueriesResponse> => {
    console.log('📊 Analytics API - Getting queries', params);
    try {
      const response = await apiClient.get('/analytics/queries', { params });
      console.log('✅ Analytics API - Queries response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get queries failed:', error);
      throw error;
    }
  },

  // Get popular terms
  getPopular: async (params?: { start_date?: string; end_date?: string }): Promise<AnalyticsPopularResponse> => {
    console.log('📊 Analytics API - Getting popular terms', params);
    try {
      const response = await apiClient.get('/analytics/popular', { params });
      console.log('✅ Analytics API - Popular response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get popular failed:', error);
      throw error;
    }
  },

  // Get dashboard data
  getDashboard: async (params?: { time_range?: string }): Promise<AnalyticsDashboardResponse> => {
    console.log('📊 Analytics API - Getting dashboard', params);
    try {
      const response = await apiClient.get('/analytics/dashboard', { params });
      console.log('✅ Analytics API - Dashboard response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get dashboard failed:', error);
      throw error;
    }
  },

  // Get satisfaction time series
  getSatisfactionTimeSeries: async (params?: { time_range?: string }): Promise<SatisfactionTimeSeriesResponse> => {
    console.log('📊 Analytics API - Getting satisfaction time series', params);
    try {
      const response = await apiClient.get('/analytics/satisfaction-time-series', { params });
      console.log('✅ Analytics API - Satisfaction time series response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get satisfaction time series failed:', error);
      throw error;
    }
  },

  // Get source coverage
  getSourceCoverage: async (): Promise<SourceCoverageResponse> => {
    console.log('📊 Analytics API - Getting source coverage');
    try {
      const response = await apiClient.get('/analytics/source-coverage');
      console.log('✅ Analytics API - Source coverage response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get source coverage failed:', error);
      throw error;
    }
  },

  // Get popular queries
  getPopularQueries: async (params?: { time_range?: string }): Promise<PopularQueriesResponse> => {
    console.log('📊 Analytics API - Getting popular queries', params);
    try {
      const response = await apiClient.get('/analytics/popular-queries', { params });
      console.log('✅ Analytics API - Popular queries response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get popular queries failed:', error);
      throw error;
    }
  },

  // Get hard queries
  getHardQueries: async (params?: { time_range?: string }): Promise<HardQueriesResponse> => {
    console.log('📊 Analytics API - Getting hard queries', params);
    try {
      const response = await apiClient.get('/analytics/hard-queries', { params });
      console.log('✅ Analytics API - Hard queries response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Analytics API - Get hard queries failed:', error);
      throw error;
    }
  },

  // Get latency time series
  getLatencyTimeSeries: async (params?: { time_range?: string }): Promise<string> => {
    console.log('📊 Analytics API - Getting latency time series', params);
    try {
      const response = await apiClient.get('/analytics/latency-time-series', { params });
      console.log('✅ Analytics API - Latency time series response:', response.data);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (error) {
      console.error('❌ Analytics API - Get latency time series failed:', error);
      throw error;
    }
  },

  // Export analytics data
  export: async (params?: { format?: string; time_range?: string }): Promise<string> => {
    console.log('📊 Analytics API - Exporting analytics', params);
    try {
      const response = await apiClient.get('/analytics/export', { params });
      console.log('✅ Analytics API - Export response:', response.data);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (error) {
      console.error('❌ Analytics API - Export failed:', error);
      throw error;
    }
  },

  // Get project analytics
  getProjectAnalytics: async (projectId: string): Promise<string> => {
    console.log('📊 Analytics API - Getting project analytics', projectId);
    try {
      const response = await apiClient.get(`/analytics/project/${projectId}`);
      console.log('✅ Analytics API - Project analytics response:', response.data);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (error) {
      console.error('❌ Analytics API - Get project analytics failed:', error);
      throw error;
    }
  },
};