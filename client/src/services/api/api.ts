import axios from 'axios';

// 🌐 API Configuration - Unified API base URL for all endpoints
const API_BASE_URL = 'http://192.168.0.112:8000/api/v1';

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
    // Add authentication token if available (check both token storage keys for compatibility)
    const token = localStorage.getItem('auth-token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
    });
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
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
    });
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Cannot reach the server. Check if the API server is running at:', API_BASE_URL);
    }
    
    // Check if it's a 401 Unauthorized error
    if (error.response?.status === 401) {
      console.warn('🔐 Authentication failed - redirecting to login');
      // Clear auth data and redirect to login (clear both token storage keys for compatibility)
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth-user');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      window.location.href = '/login';
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
  }) => {
    console.log('🚀 API Call - Searching for:', query);
    console.log('⚙️ RAG Settings:', ragSettings);
    console.log('🌐 Using real API at:', `${API_BASE_URL}/search`);
    
    try {
      // Send POST request to /search endpoint with RAG settings
      const response = await apiClient.post('/search', {
        query: query,  // Send the user's question
        topK: ragSettings?.topK || 5,
        similarityThreshold: ragSettings?.similarityThreshold || 0.2,
        useReranker: ragSettings?.useReranker || false,
        maxTokens: ragSettings?.maxTokens || 0,
      });
      
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
    } catch (error) {
      console.error('❌ API Error:', error);
      // Throw error - no mock fallback
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
  deleteSession: async (sessionId: string) => {
    console.log('🗑️ Chat API - Deleting session:', sessionId);
    
    try {
      const response = await apiClient.delete(`/chat/sessions/${sessionId}`);
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
    } catch (error) {
      console.error('❌ Feedback Error:', error);
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
      createdAt: site.created_at ?? new Date().toISOString(),
      updatedAt: site.updated_at ?? new Date().toISOString(),
      crawlDepth: site.depth ?? 2,
      cadence: site.cadence ?? "ONCE",
      headlessMode: site.headless_mode ?? "AUTO",
      includePatterns: site.allowlist ?? [],
      excludePatterns: site.denylist ?? [],
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
    console.log('🕷️ Crawl API - Starting crawl:', id);
    
    try {
      const response = await apiClient.post(`/crawl/start/${id}`);
      console.log('✅ Crawl started successfully:', response.data);
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
        progress: response.data.pages_fetched || 0,
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
