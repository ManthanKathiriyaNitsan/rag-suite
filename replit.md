# RAG-Powered AI Platform

## Overview

This is an enterprise-grade RAG (Retrieval-Augmented Generation) powered AI search and chatbot platform. The platform consists of an admin dashboard for managing content sources, tuning AI responses, and monitoring analytics, plus an embeddable widget that provides AI-powered search and chat functionality for end users.

The system enables organizations to index their documentation, knowledge bases, and other content sources, then provide intelligent search and conversational AI experiences. Key features include web crawling, document upload, RAG parameter tuning, user feedback collection, and comprehensive analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens supporting light/dark themes
- **State Management**: TanStack Query for server state management, React Context for theme and onboarding state
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom component library following enterprise design patterns inspired by Linear and Notion

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript for type safety across the stack
- **API Pattern**: RESTful API design with `/api` prefix for all endpoints
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL configured via DATABASE_URL environment variable
- **Connection**: Neon Database serverless connection pool with WebSocket support
- **Schema Management**: Drizzle Kit for migrations and schema management

### Authentication & Session Management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Session Configuration**: Express session middleware with secure cookie settings

### Development Tools
- **Build System**: Vite with React plugin and custom configuration for monorepo structure
- **Type Checking**: Shared TypeScript configuration across client/server/shared modules
- **Path Aliases**: Configured path mapping for clean imports (@/, @shared/, etc.)
- **Hot Reload**: Vite HMR integration with Express middleware in development

### Deployment Architecture
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines
- **Static Assets**: Client assets built to dist/public, served statically in production
- **Server Bundle**: ESM format server bundle with external dependencies
- **Environment**: Development/production environment detection with appropriate middleware

### Embeddable Widget
- **Integration**: Standalone React component designed for embedding in third-party websites
- **Functionality**: Dual-mode support for search and chat interfaces with live preview
- **Customization**: Theme customization with host site integration capabilities

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL with connection pooling and WebSocket support
- **Drizzle ORM**: Database operations with automatic migrations

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible, unstyled React components
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design system

### Development & Build Tools
- **Vite**: Fast build tool with HMR and optimized bundling
- **TypeScript**: Static type checking across the entire codebase
- **ESBuild**: Fast JavaScript bundler for server-side code

### Data Visualization
- **Recharts**: React charting library for analytics dashboards and data visualization

### Form Management
- **React Hook Form**: Performant forms with minimal re-renders
- **Hookform Resolvers**: Validation integration

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **class-variance-authority**: Component variant management

### Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions