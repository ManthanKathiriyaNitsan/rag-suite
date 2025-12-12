import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Use the process working directory (repo root) as the authoritative root in CI.
// process.cwd() is the directory Netlify runs builds from (e.g. /opt/build/repo).
const repoRoot = process.cwd();

// Absolute path to client folder (Vite root)
const clientRoot = path.resolve(repoRoot, "client");

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
        "@": path.resolve(clientRoot, "src"),
        "@shared": path.resolve(repoRoot, "shared"),
        "@assets": path.resolve(repoRoot, "attached_assets"),
      },
      // Ensure React is properly deduplicated - prevent multiple React instances
      dedupe: ['react', 'react-dom'],
    },
    // Optimize dependencies to ensure React is pre-bundled correctly
    optimizeDeps: {
      include: ['react', 'react-dom'],
      force: false, // Don't force re-optimization unless needed
    },
    // Make Vite root absolute so it reliably locates client/index.html in CI
    root: clientRoot,
    build: {
      // Explicitly resolve outDir relative to the repository root (process.cwd()).
      // This creates: <repoRoot>/dist/public which matches Netlify's resolved publish path.
      outDir: path.resolve(repoRoot, "dist", "public"),
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
          // Simplified chunk splitting to prevent React "useState is undefined" errors
          // Strategy: Only split very large, independent libraries. Keep React and React-dependent code together.
          manualChunks: (id: string) => {
            // CRITICAL: Never split React or react-dom - they MUST stay in main bundle
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') ||
                id.includes('node_modules\\react\\') || id.includes('node_modules\\react-dom\\')) {
              // Additional check: make sure it's not react-something (like react-hook-form)
              if (!id.includes('react-') || id.includes('react-dom')) {
                return undefined; // Keep in main bundle
              }
            }
            
            // Only split large, independent libraries that don't depend on React at runtime
            if (id.includes('node_modules')) {
              // Chart library (large, mostly independent)
              if (id.includes('recharts')) {
                return 'chart-vendor';
              }
              
              // Animation library (large, independent)
              if (id.includes('framer-motion')) {
                return 'motion-vendor';
              }
              
              // Keep everything else (including React-dependent libraries) in main bundle
              // This prevents "useState is undefined" errors by ensuring React loads first
              return undefined;
            }
            
            // Application code stays in main bundle
            return undefined;
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
