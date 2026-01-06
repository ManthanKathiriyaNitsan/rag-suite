import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project paths - same structure as main vite.config.ts
const repoRoot = __dirname;
const clientRoot = path.join(repoRoot, "client");

/**
 * VITE WIDGET BUILD CONFIGURATION
 * 
 * This configuration builds the EmbeddableWidget as a standalone UMD bundle
 * that can be embedded on any website via a script tag.
 * 
 * Key Features:
 * - Builds as UMD (Universal Module Definition) format - works in browser, Node, AMD
 * - Bundles React and all dependencies into one file
 * - Outputs to dist/widget/ directory
 * - Creates widget.umd.js and widget.css files
 */
export default defineConfig({
  build: {
    // Library mode - builds as a library instead of an app
    lib: {
      // Entry point - this is where the widget starts
      entry: path.resolve(clientRoot, "src/widget-entry.tsx"),
      // Name exposed to window object (window.RAGSuiteWidget)
      name: "RAGSuiteWidget",
      // UMD format works everywhere (browser, Node.js, AMD)
      formats: ["umd"],
      // Output filename
      fileName: () => "widget.umd.js",
    },
    rollupOptions: {
      // Don't externalize anything - bundle React and all deps
      // This makes the widget self-contained
      external: [],
      output: {
        // Global variable name when loaded in browser
        globals: {},
        // Ensure consistent naming
        name: "RAGSuiteWidget",
        // Asset file naming
        assetFileNames: (assetInfo) => {
          // CSS files get named widget.css
          if (assetInfo.name === "style.css") {
            return "widget.css";
          }
          return assetInfo.name || "asset";
        },
      },
    },
    // Output directory for widget files
    outDir: path.join(repoRoot, "dist", "widget"),
    // Clear output directory before building
    emptyOutDir: true,
    // Bundle all CSS into one file (not split)
    cssCodeSplit: false,
    // Minify with terser for smaller file size
    minify: "terser",
    terserOptions: {
      compress: {
        // Keep console.log for debugging (remove in production)
        drop_console: false,
      },
    },
    // Generate source maps for debugging
    sourcemap: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      // Same aliases as main config for consistency
      "@": path.resolve(clientRoot, "src"),
      "@shared": path.join(repoRoot, "shared"),
    },
    // Dedupe React to avoid multiple versions
    dedupe: ["react", "react-dom"],
  },
  define: {
    // Set NODE_ENV for production builds
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

