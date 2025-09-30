import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static mock API routes for demo purposes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    // Simple mock authentication
    if (email === "admin@ragsuite.com" && password === "demo123") {
      res.json({
        message: "Login successful",
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

  const httpServer = createServer(app);
  return httpServer;
}
