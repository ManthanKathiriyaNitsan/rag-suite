import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

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
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Increase chunk size warning limit (gzipped size is 527 kB which is acceptable)
    // The main bundle is 1.6MB uncompressed but 527KB gzipped, which is reasonable
    chunkSizeWarningLimit: 600,
    rollupOptions: {
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
