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
        access_token: "demo-token-" + Date.now(),
        token_type: "bearer",
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
      description: "Introductory documentation",
      type: "pdf",
      source: "docs.company.com",
      language: "en",
      status: "indexed",
      chunks: 12,
      lastIndexed: new Date().toISOString(),
      url: "https://docs.company.com/getting-started.pdf",
      checksum: "abc123",
      size: "452 KB",
    },
    {
      id: "doc-002",
      title: "API Reference",
      description: "REST API endpoints and usage",
      type: "html",
      source: "api.company.com",
      language: "en",
      status: "indexed",
      chunks: 34,
      lastIndexed: new Date().toISOString(),
      url: "https://api.company.com/docs",
      checksum: "def456",
      size: "1.2 MB",
    },
  ];

  const documentContents: Record<string, any> = {
    "doc-001": {
      id: "doc-001",
      content: "Welcome to the Getting Started Guide...",
      metadata: { category: "onboarding" },
      extractedText: "Getting started content...",
      summary: "High-level overview of product onboarding",
      keywords: ["onboarding", "setup"],
    },
    "doc-002": {
      id: "doc-002",
      content: "API endpoints include /auth, /search, /documents...",
      metadata: { category: "api" },
      extractedText: "API details and examples...",
      summary: "Complete API reference",
      keywords: ["api", "reference"],
    },
  };

  // Documents: list
  app.get("/api/documents", (_req, res) => {
    res.json(documents);
  });

  // Documents: update metadata
  app.put("/api/documents/:id", (req, res) => {
    const { id } = req.params;
    const idx = documents.findIndex((d) => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    const { title, description, source, language } = req.body || {};
    const current = documents[idx];
    const updated: Doc = {
      ...current,
      title: title ?? current.title,
      description: description ?? current.description,
      source: source ?? current.source,
      language: language ?? current.language,
      lastIndexed: new Date().toISOString(),
    };
    documents[idx] = updated;
    return res.json(updated);
  });

  // Documents: delete
  app.delete("/api/documents/:id", (req, res) => {
    const { id } = req.params;
    const idx = documents.findIndex((d) => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ message: "Document not found" });
    }
    documents.splice(idx, 1);
    return res.json({ message: "Document deleted successfully" });
  });

  // Documents: get content
  app.get("/api/documents/:id/content", (req, res) => {
    const { id } = req.params;
    const content = documentContents[id];
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    return res.json(content);
  });

  // Documents: upload (mock)
  app.post("/api/documents/upload", (req, res) => {
    const { title, description, source, language } = req.body || {};
    const id = `doc-${Date.now()}`;
    const newDoc: Doc = {
      id,
      title: title || `Uploaded Document ${id}`,
      description,
      type: "pdf",
      source: source || "uploads",
      language: language || "en",
      status: "indexed",
      chunks: Math.floor(Math.random() * 10) + 1,
      lastIndexed: new Date().toISOString(),
      url: `https://uploads.local/${id}`,
      checksum: Math.random().toString(36).slice(2),
      size: `${Math.floor(Math.random() * 900) + 100} KB`,
    };
    documents.push(newDoc);
    documentContents[id] = {
      id,
      content: "Uploaded content placeholder",
      metadata: {},
      extractedText: "Extracted text placeholder",
    };
    return res.status(201).json({ id, message: "Upload successful", status: "success" });
  });

  // Mock crawl endpoints for testing
  app.get("/api/crawl/sites", (req, res) => {
    res.json([
      {
        id: "demo-site-1",
        name: "Example Site",
        base_url: "https://example.com",
        description: "Demo crawl site",
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
      html_sample: "<html><head><title>Preview</title></head><body>Preview content</body></html>",
      text_sample: "Preview content",
      meta: {
        title: "Preview Title",
        status_code: 200,
        links_found: 3
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
