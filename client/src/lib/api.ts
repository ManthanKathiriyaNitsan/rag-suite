import axios from 'axios';

// 🌐 API Configuration - This sets up your API connection
const API_BASE_URL = 'http://192.168.0.117:8000/api/v1';

// 📡 Create axios instance - This is your API client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,           // Your API base URL
  timeout: 150000,                  // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',  // Tell server we're sending JSON
  },
});

// 🔍 Search API function - This calls your search endpoint
export const searchAPI = {
  // This function sends a search query to your API
  search: async (query: string) => {
    console.log('🚀 API Call - Searching for:', query);
    
    try {
      // Send POST request to /search endpoint
      const response = await apiClient.post('/search', {
        query: query,  // Send the user's question
      });
      
      console.log('✅ API Response:', response.data);
      return response.data;  // Return the answer from API
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;  // Let the calling function handle the error
    }
  },
};

// 📝 Type definitions - This tells TypeScript what your API returns
export interface SearchResponse {
  answer: string;           // The AI's answer
  sources?: Array<{        // Optional sources/citations
    title: string;
    url: string;
    snippet: string;
  }>;
}
