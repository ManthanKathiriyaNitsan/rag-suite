/**
 * Mock authentication system for offline development
 * This bypasses all API calls and provides mock data
 */

export interface MockUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface MockAuthResponse {
  message: string;
  token: string;
  token_type: string;
  expiresAt: string;
  user: MockUser;
}

/**
 * Mock login function - always succeeds with demo user
 */
export function mockLogin(username: string, password: string): Promise<MockAuthResponse> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const mockResponse: MockAuthResponse = {
        message: "Login successful (MOCK)",
        token: "mock-token-" + Date.now(),
        token_type: "bearer",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: "mock-user-1",
          username: username || "demo",
          email: `${username || "demo"}@ragsuite.com`,
          name: username || "Demo User",
          role: "admin"
        }
      };
      resolve(mockResponse);
    }, 500); // 500ms delay to simulate real API
  });
}

/**
 * Mock API health check - always returns healthy
 */
export function mockHealthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "ok",
        message: "RAGSuite API is running (MOCK MODE)",
        timestamp: new Date().toISOString()
      });
    }, 100);
  });
}

/**
 * Mock search function - returns dummy results
 */
export function mockSearch(query: string): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        answer: `This is a mock response for query: "${query}". The API is currently offline for maintenance.`,
        sources: [
          {
            title: "Mock Document 1",
            url: "#",
            snippet: "This is a mock search result snippet for demonstration purposes."
          },
          {
            title: "Mock Document 2", 
            url: "#",
            snippet: "Another mock search result to show how the system would work."
          }
        ],
        message: "Search completed (MOCK MODE)",
        timestamp: new Date().toISOString(),
        request_id: "mock-" + Date.now()
      });
    }, 800);
  });
}

/**
 * Check if we're in mock mode
 */
export function isMockMode(): boolean {
  return process.env.NODE_ENV === 'development' && 
         (localStorage.getItem('mock-mode') === 'true' || 
          !localStorage.getItem('auth_token'));
}
