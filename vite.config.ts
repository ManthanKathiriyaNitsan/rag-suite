import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple strategies to find the correct paths
const repoRoot = __dirname; // vite.config.ts is at repo root
const clientRoot = path.join(repoRoot, "client");
const indexHtmlPath = path.join(clientRoot, "index.html");

// Debug logging
console.log("=== VITE CONFIG DEBUG ===");
console.log("__dirname:", __dirname);
console.log("process.cwd():", process.cwd());
console.log("repoRoot:", repoRoot);
console.log("clientRoot:", clientRoot);
console.log("indexHtmlPath:", indexHtmlPath);
console.log("index.html exists:", fs.existsSync(indexHtmlPath));
console.log("client dir exists:", fs.existsSync(clientRoot));

// List files in client directory if it exists
if (fs.existsSync(clientRoot)) {
  console.log("Files in client dir:", fs.readdirSync(clientRoot));
}
console.log("========================");

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

/**
 * Gets the local network IP address (non-localhost)
 * Returns the first IPv4 address found on network interfaces
 */
function getNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;
    
    for (const iface of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  // Fallback to localhost if no network IP found
  return "127.0.0.1";
}

export default defineConfig(async () => {
  // Get network IP for HMR
  const networkIP = getNetworkIP();

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
        "@": path.join(clientRoot, "src"),
        "@shared": path.join(repoRoot, "shared"),
        "@assets": path.join(repoRoot, "attached_assets"),
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
      // Explicitly resolve outDir relative to the repository root.
      outDir: path.join(repoRoot, "dist", "public"),
      emptyOutDir: true,
      // Ensure proper module resolution and prevent duplicate React instances
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        // Explicitly set input - use relative path since root is set to clientRoot
        input: "index.html",
        output: {
          // Simplified chunk splitting to prevent React "useState is undefined" errors
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
      host: '0.0.0.0',
      hmr: {
        port: 5000,
        host: networkIP
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});