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
