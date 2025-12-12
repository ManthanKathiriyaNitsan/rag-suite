import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Get __dirname equivalent in ES modules - works in both local and Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use process.cwd() as fallback for Vercel build environment
const projectRoot = process.cwd();
const clientDir = path.resolve(projectRoot, "client");
const distDir = path.resolve(projectRoot, "dist", "public");

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(clientDir, "src"),
      "@shared": path.resolve(projectRoot, "shared"),
      "@assets": path.resolve(projectRoot, "attached_assets"),
    },
  },
  root: clientDir,
  build: {
    outDir: distDir,
    emptyOutDir: true,
    // Explicitly set the entry point to ensure Vite finds index.html
    rollupOptions: {
      input: path.resolve(clientDir, "index.html"),
      output: {
        // Manual chunk splitting to reduce main bundle size and improve caching
        manualChunks: (id) => {
          // Split node_modules into vendor chunks
          if (id.includes('node_modules')) {
            // React and core dependencies
            if (id.includes('react') || id.includes('react-dom') || id.includes('wouter')) {
              return 'react-vendor';
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
});
