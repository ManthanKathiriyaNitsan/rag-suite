import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://192.168.0.117:8000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "RAGSuite API is running",
      timestamp: new Date().toISOString()
    });
  });

  // Authentication routes
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    // Simple mock authentication
    if (username === "admin" && password === "demo123") {
      res.json({
        message: "Login successful",
        token: "demo-token-" + Date.now(),
        token_type: "bearer",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        user: {
          id: "demo-user-1",
          username: "admin", 
          email: "admin@ragsuite.com",
          role: "admin",
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logout successful" });
  });

  // 🎯 SEARCH ENDPOINT - This is what your frontend is calling
  app.post("/api/v1/search", (req, res) => {
    const { query, topK = 5, maxTokens = 500, useReranker = false } = req.body;
    
    console.log("🔍 Search request:", { query, topK, maxTokens, useReranker });
    
    // Check if query is about development timeline
    const isTimelineQuery = /development.*timeline|timeline.*development|phases.*development|development.*phases/i.test(query);
    
    let mockResponse;
    
    if (isTimelineQuery) {
      mockResponse = {
        success: true,
        answer: `# 🚀 Development Timeline Overview

The development timeline consists of **three main phases**, each building upon the previous one:

## 📋 Phase 1: Backend API Development
*Duration: 4-6 weeks*

### 🛠️ Core Components
- **FastAPI Application Setup** - Robust API framework with async support
- **Database Schema & Migrations** - Structured data models with version control
- **Authentication & Security Layer** - JWT tokens, OAuth, and role-based access
- **Content Crawling & Processing APIs** - Web scraping and data extraction
- **Search & Chat Service APIs** - RAG implementation with vector databases

### 🎯 Key Deliverables
- ✅ RESTful API endpoints
- ✅ Database models and relationships
- ✅ Authentication middleware
- ✅ Content processing pipeline
- ✅ Search and chat functionality

---

## 🎨 Phase 2: Frontend Application Development
*Duration: 5-7 weeks*

### 🖥️ User Interface Components
- **React Admin Dashboard** - Comprehensive management interface
- **Embedded Widget Components** - Reusable React components
- **API Integration & State Management** - Redux/Zustand for state handling
- **Responsive Design Implementation** - Mobile-first approach
- **Theme & Customization System** - Dark/light modes and branding

### 🎯 Key Deliverables
- ✅ Admin dashboard with full functionality
- ✅ Embeddable widgets for external sites
- ✅ Responsive design across all devices
- ✅ Theme system with customization options
- ✅ Real-time updates and notifications

---

## 🔧 Phase 3: Integration & Testing
*Duration: 3-4 weeks*

### 🧪 Quality Assurance
- **End-to-End Integration Testing** - Complete workflow validation
- **Performance Optimization** - Load testing and bottleneck resolution
- **Security Hardening** - Vulnerability assessment and fixes
- **Documentation Completion** - API docs, user guides, and deployment guides
- **Deployment Automation & Packaging** - CI/CD pipelines and containerization

### 🎯 Key Deliverables
- ✅ Comprehensive test suite
- ✅ Performance benchmarks
- ✅ Security audit report
- ✅ Complete documentation
- ✅ Production-ready deployment

---

## 📊 Timeline Summary

| Phase | Duration | Status | Key Focus |
|-------|----------|--------|-----------|
| **Backend API** | 4-6 weeks | 🔄 In Progress | Core functionality |
| **Frontend App** | 5-7 weeks | ⏳ Planned | User experience |
| **Integration** | 3-4 weeks | ⏳ Planned | Quality & deployment |

## 🎯 Success Metrics

- **📈 Performance**: < 200ms API response times
- **🔒 Security**: Zero critical vulnerabilities
- **📱 Compatibility**: 100% mobile responsiveness
- **👥 User Experience**: 95%+ user satisfaction

**Total Estimated Duration: 12-17 weeks** ⏱️`,
        sources: [
          {
            title: "📋 Development Timeline Documentation",
            url: "https://example.com/docs/timeline",
            snippet: "Comprehensive development timeline with detailed phases, deliverables, and success metrics for RAGSuite project.",
            additionalProp1: "Timeline Documentation",
            additionalProp2: "https://example.com/docs/timeline",
            additionalProp3: "Detailed breakdown of development phases with timelines, deliverables, and progress tracking."
          },
          {
            title: "🚀 Project Management Guide",
            url: "https://example.com/guides/project-management",
            snippet: "Best practices for managing complex software development projects with timeline tracking and milestone management.",
            additionalProp1: "Project Management",
            additionalProp2: "https://example.com/guides/project-management",
            additionalProp3: "Comprehensive guide to project management methodologies and timeline optimization techniques."
          },
          {
            title: "📊 Progress Tracking Dashboard",
            url: "https://example.com/dashboard/progress",
            snippet: "Real-time progress tracking dashboard showing development milestones, completion rates, and team productivity metrics.",
            additionalProp1: "Progress Dashboard",
            additionalProp2: "https://example.com/dashboard/progress",
            additionalProp3: "Interactive dashboard for monitoring development progress across all project phases and teams."
          }
        ],
        message: "Development timeline retrieved successfully",
        timestamp: new Date().toISOString(),
        request_id: "search-" + Date.now()
      };
    } else {
      // Default enhanced search response
      mockResponse = {
        success: true,
        answer: `# 🔍 Search Results for "${query}"

Based on your query, here are the comprehensive findings:

## 📋 Main Points

- **🎯 Key Finding 1**: This is a crucial insight related to your search with detailed explanations
- **💡 Key Finding 2**: Another highly relevant piece of information that adds value
- **🚀 Key Finding 3**: Additional context that supports and enhances your query understanding

## 🛠️ Technical Implementation

Here's the technical breakdown of the implementation:

\`\`\`javascript
// Enhanced search functionality
function advancedSearchFunction(query, options = {}) {
  const { topK = 5, useReranker = false, maxTokens = 500 } = options;
  
  return {
    results: query.split(' ').map(term => ({
      term: term.toLowerCase(),
      relevance: calculateRelevance(term),
      context: getContext(term)
    })),
    totalCount: query.split(' ').length,
    processingTime: Date.now(),
    confidence: 0.95
  };
}
\`\`\`

## 📊 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Response Time** | 150ms | ✅ Excellent |
| **Accuracy** | 95% | ✅ High |
| **Coverage** | 100% | ✅ Complete |

## 🎯 Summary

Your search for **"${query}"** returned comprehensive results covering multiple aspects of the topic with enhanced formatting and detailed insights.`,
        sources: [
          {
            title: "Documentation - Search Implementation",
            url: "https://example.com/docs/search",
            snippet: "This document covers the implementation details of the search functionality, including query processing and result ranking algorithms.",
            additionalProp1: "Search Implementation Guide",
            additionalProp2: "https://example.com/docs/search",
            additionalProp3: "Comprehensive guide to implementing search functionality with examples and best practices."
          },
          {
            title: "API Reference - Search Endpoints",
            url: "https://example.com/api/search",
            snippet: "Complete API reference for search endpoints, including parameters, response formats, and error handling.",
            additionalProp1: "API Reference",
            additionalProp2: "https://example.com/api/search", 
            additionalProp3: "Detailed API documentation with examples and response schemas."
          },
          {
            title: "Best Practices - Search Optimization",
            url: "https://example.com/guides/optimization",
            snippet: "Learn how to optimize search performance and improve result relevance through various techniques.",
            additionalProp1: "Optimization Guide",
            additionalProp2: "https://example.com/guides/optimization",
            additionalProp3: "Advanced techniques for improving search performance and user experience."
          }
        ],
        message: "Search completed successfully",
        timestamp: new Date().toISOString(),
        request_id: "search-" + Date.now()
      };
    }
    
    res.json(mockResponse);
  });

  // 🎯 CHAT ENDPOINT - This is what your frontend is calling
  app.post("/api/v1/chat/message", (req, res) => {
    const { message, topK = 5, maxTokens = 500, useReranker = false } = req.body;
    
    console.log("💬 Chat request:", { message, topK, maxTokens, useReranker });
    
    // Check if it's a greeting
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up)$/i.test(message.trim());
    
    if (isGreeting) {
      const greetingResponse = {
        success: true,
        answer: `# 👋 Hello! Welcome to RAGSuite

I'm your intelligent AI assistant, ready to help you with all your questions and tasks!

## 🚀 My Capabilities

- **📚 Answer Questions** - About your documents and knowledge base
- **📝 Provide Summaries** - Quick overviews of complex information  
- **🔍 Find Details** - Specific information and data points
- **💡 Explain Concepts** - Break down complex topics into simple terms
- **🛠️ Technical Support** - Help with implementation and troubleshooting

## 🎯 How to Get Started

1. **💬 Ask Me Anything** - I can help with various topics and domains
2. **📋 Be Specific** - The more details you provide, the better I can assist
3. **🔄 Follow Up** - Feel free to ask for clarification or dive deeper
4. **⭐ Rate Responses** - Help me improve with your feedback

## 🎨 What Makes Me Special

| Feature | Description | Benefit |
|---------|-------------|---------|
| **🧠 Smart Understanding** | Advanced NLP processing | More accurate responses |
| **📊 Rich Formatting** | Markdown, tables, code blocks | Better readability |
| **🔗 Source Attribution** | Citations and references | Trustworthy information |
| **⚡ Fast Responses** | Optimized processing | Quick answers |

**How can I assist you today?** 🚀`,
        sources: null,
        message: "Greeting response generated",
        timestamp: new Date().toISOString(),
        request_id: "chat-" + Date.now()
      };
      
      return res.json(greetingResponse);
    }
    
    // Regular chat response with enhanced markdown
    const chatResponse = {
      success: true,
      answer: `# 💬 Response to: "${message}"

Thank you for your excellent question! Here's my comprehensive analysis:

## 🎯 Key Information

- **🔍 Main Point**: This directly addresses the core of your question with detailed insights
- **💡 Additional Context**: Supporting information that enhances your understanding
- **🚀 Related Insights**: Connected concepts that provide broader perspective

## 📋 Detailed Breakdown

Your question about **"${message}"** is important and deserves a thorough response. Let me break this down systematically:

### 🛠️ Technical Implementation

\`\`\`javascript
// Example implementation
function processQuestion(question) {
  const analysis = {
    intent: analyzeIntent(question),
    complexity: assessComplexity(question),
    context: gatherContext(question),
    response: generateResponse(question)
  };
  
  return {
    ...analysis,
    confidence: 0.95,
    sources: ['knowledge_base', 'technical_docs'],
    timestamp: new Date().toISOString()
  };
}
\`\`\`

### 📊 Analysis Summary

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Clarity** | ⭐⭐⭐⭐⭐ | Well-structured question |
| **Complexity** | Medium | Requires detailed explanation |
| **Relevance** | High | Directly applicable |

## 🎯 Next Steps

1. **📚 Review** the information provided above
2. **🔧 Apply** the concepts to your specific use case
3. **❓ Ask** follow-up questions for clarification
4. **🔄 Iterate** based on your implementation needs

**Is there anything specific you'd like me to elaborate on?** 🤔`,
      sources: [
        {
          title: "Knowledge Base - General Information",
          url: "https://example.com/kb/general",
          snippet: "Comprehensive knowledge base covering general topics and frequently asked questions.",
          additionalProp1: "General Knowledge",
          additionalProp2: "https://example.com/kb/general",
          additionalProp3: "Extensive collection of information covering various topics and domains."
        },
        {
          title: "FAQ - Common Questions",
          url: "https://example.com/faq",
          snippet: "Frequently asked questions and their answers, organized by topic and category.",
          additionalProp1: "FAQ Section",
          additionalProp2: "https://example.com/faq",
          additionalProp3: "Common questions and detailed answers to help users find information quickly."
        }
      ],
      message: "Chat response generated successfully",
      timestamp: new Date().toISOString(),
      request_id: "chat-" + Date.now()
    };
    
    res.json(chatResponse);
  });

  // In-memory mock documents for demo purposes
  type Doc = {
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
  };

  const documents: Doc[] = [
    {
      id: "doc-001",
      title: "Getting Started Guide",
      description: "Complete guide to getting started with the platform",
      type: "PDF",
      source: "Documentation",
      language: "English",
      status: "Indexed",
      chunks: 45,
      lastIndexed: "2024-01-15T10:30:00Z",
      url: "https://example.com/docs/getting-started",
      checksum: "abc123def456",
      size: "2.3 MB"
    },
    {
      id: "doc-002", 
      title: "API Reference",
      description: "Complete API documentation and examples",
      type: "HTML",
      source: "Documentation",
      language: "English",
      status: "Indexed",
      chunks: 78,
      lastIndexed: "2024-01-14T15:45:00Z",
      url: "https://example.com/api/reference",
      checksum: "def456ghi789",
      size: "1.8 MB"
    },
    {
      id: "doc-003",
      title: "Best Practices",
      description: "Recommended practices and guidelines",
      type: "Markdown",
      source: "Documentation", 
      language: "English",
      status: "Indexed",
      chunks: 32,
      lastIndexed: "2024-01-13T09:15:00Z",
      url: "https://example.com/guides/best-practices",
      checksum: "ghi789jkl012",
      size: "945 KB"
    }
  ];

  // Documents endpoints
  app.get("/api/documents", (req, res) => {
    res.json(documents);
  });

  app.get("/api/documents/:id", (req, res) => {
    const { id } = req.params;
    const doc = documents.find(d => d.id === id);
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  });

  // Crawl endpoints
  app.get("/api/crawl/sites", (req, res) => {
    res.json([
      {
        id: "site-001",
        name: "Example Documentation",
        base_url: "https://example.com/docs",
        description: "Main documentation site",
        status: "ACTIVE",
        is_active: true,
        created_at: "2024-01-10T08:00:00Z",
        updated_at: "2024-01-15T14:30:00Z",
        last_crawl_at: "2024-01-15T14:30:00Z",
        documents_count: 15,
        depth: 2,
        max_pages: 100,
        allowlist: [],
        denylist: []
      }
    ]);
  });

  app.post("/api/crawl/sites", (req, res) => {
    const { name, base_url, description, depth } = req.body;
    res.status(201).json({
      id: "demo-site-" + Date.now(),
      name,
      base_url,
      description,
      status: "READY",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_crawl_at: null,
      documents_count: 0,
      depth: depth || 2,
      max_pages: 100,
      allowlist: [],
      denylist: []
    });
  });

  app.put("/api/crawl/sites/:id", (req, res) => {
    const { id } = req.params;
    const { name, base_url, description } = req.body;
    res.json({
      id,
      name,
      base_url,
      description,
      status: "READY",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_crawl_at: null,
      documents_count: 0,
      depth: 2,
      max_pages: 100,
      allowlist: [],
      denylist: []
    });
  });

  app.delete("/api/crawl/sites/:id", (req, res) => {
    res.json({ message: "Site deleted successfully" });
  });

  app.post("/api/crawl/start/:id", (req, res) => {
    const { id } = req.params;
    res.json({
      job_id: "demo-job-" + Date.now(),
      queued_at: new Date().toISOString()
    });
  });

  app.get("/api/crawl/status/:id", (req, res) => {
    const { id } = req.params;
    res.json({
      job_id: id,
      status: "COMPLETED",
      pages_fetched: 5,
      errors: [],
      queued_at: new Date(Date.now() - 30000).toISOString(),
      started_at: new Date(Date.now() - 25000).toISOString(),
      finished_at: new Date().toISOString()
    });
  });

  app.put("/api/crawl/preview", (req, res) => {
    const { url } = req.body;
    res.json({
      url,
      title: "Preview Title",
      content: "This is a preview of the content that would be crawled from the provided URL.",
      status: "success"
    });
  });

  return createServer(app);
}
