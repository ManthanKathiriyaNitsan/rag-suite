// Vercel serverless function wrapper for Express app
// This handles all API routes
import express, { type Request, type Response } from 'express';
import { registerRoutes } from '../server/routes';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors({
  origin: true, // Allow all origins on Vercel
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register API routes (without starting server)
registerRoutes(app).catch(console.error);

// Vercel serverless function handler
export default function handler(req: Request, res: Response) {
  // Only handle API routes
  if (req.url?.startsWith('/api')) {
    return app(req, res);
  }
  // For non-API routes, let Vercel serve static files
  res.status(404).json({ error: 'Not found' });
}

