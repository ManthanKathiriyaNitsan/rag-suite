import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
// This will be the directory where vite.config.ts is located (project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use __dirname as project root - it's the most reliable in all environments
// In Vercel, the config file is in the project root, so __dirname will be correct
const projectRoot = __dirname;

/**
 * Safely loads the Replit Cartographer plugin only in development environments
 * Returns null if the plugin should not be loaded or if it fails to load
 */
async function maybeLoadReplitPlugin() {
  // Only load in non-production environments with REPL_ID
  if (process.env.NODE_ENV === "production" || process.env.REPL_ID === undefined) {
    return null;
  }

  try {
    const cartographerModule = await import("@replit/vite-plugin-cartographer");
    return cartographerModule.cartographer();
  } catch (error) {
    // Silently fail if plugin is not available (e.g., in production builds)
    console.warn("Replit Cartographer plugin not available:", error);
    return null;
  }
}

/**
 * Safely loads the runtime error overlay plugin
 * Returns null if the plugin is not available
 */
async function maybeLoadRuntimeErrorOverlay() {
  try {
    const runtimeErrorOverlayModule = await import("@replit/vite-plugin-runtime-error-modal");
    // The module exports a default function
    return runtimeErrorOverlayModule.default();
  } catch (error) {
    // Silently fail if plugin is not available
    console.warn("Runtime error overlay plugin not available:", error);
    return null;
  }
}

export default defineConfig(async () => {
  // Load plugins conditionally
  const plugins: any[] = [
    react(),
  ];

  // Conditionally load runtime error overlay (may not be available in production)
  const runtimeErrorOverlay = await maybeLoadRuntimeErrorOverlay();
  if (runtimeErrorOverlay) {
    plugins.push(runtimeErrorOverlay);
  }

  // Conditionally load Replit Cartographer plugin (dev only)
  const replitPlugin = await maybeLoadReplitPlugin();
  if (replitPlugin) {
    plugins.push(replitPlugin);
  }

  return {
    plugins,
    define: {
      __VUE_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "client", "src"),
        "@shared": path.resolve(projectRoot, "shared"),
        "@assets": path.resolve(projectRoot, "attached_assets"),
      },
      // Ensure React is properly deduplicated
      dedupe: ['react', 'react-dom'],
    },
    // Set root to client directory - Vite will automatically find index.html here
    // Using relative path from config file location (project root)
    root: "client",
    build: {
      // Output to dist/public (absolute path from project root)
      // IMPORTANT: When root is set, outDir is resolved relative to root, not project root
      // So we must use an absolute path to ensure output goes to project root/dist/public
      outDir: path.resolve(projectRoot, "dist", "public"),
      emptyOutDir: true,
      // Ensure proper module resolution and prevent duplicate React instances
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        // Don't set input explicitly - let Vite auto-detect from root
        // When root is set, Vite automatically looks for index.html in that directory
        output: {
          // Manual chunk splitting to reduce main bundle size and improve caching
          // IMPORTANT: React and react-dom must NOT be split - they must be in the main bundle
          // to avoid "useState is undefined" errors in production
          manualChunks: (id: string) => {
            // Split node_modules into vendor chunks
            if (id.includes('node_modules')) {
              // DO NOT split React or react-dom - they must stay in main bundle
              // This prevents "useState is undefined" errors
              if (id.includes('react') || id.includes('react-dom')) {
                return undefined; // Keep in main bundle
              }
              
              // Router (can be split, but loads early)
              if (id.includes('wouter')) {
                return 'router-vendor';
              }
              
              // UI component libraries
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              
              // Chart library
              if (id.includes('recharts')) {
                return 'chart-vendor';
              }
              
              // Query library
              if (id.includes('@tanstack/react-query')) {
                return 'query-vendor';
              }
              
              // Animation library
              if (id.includes('framer-motion')) {
                return 'motion-vendor';
              }
              
              // Form libraries
              if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod')) {
                return 'form-vendor';
              }
              
              // Other vendor dependencies
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      port: 5000,
      host: '0.0.0.0', // Bind to all network interfaces
      hmr: {
        port: 5000,
        host: '192.168.0.128' // Use your IP for HMR
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
