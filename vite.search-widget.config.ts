import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = __dirname;
const clientRoot = path.join(repoRoot, "client");

/**
 * VITE SEARCH WIDGET BUILD CONFIGURATION
 * 
 * This configuration builds the EmbeddableSearchWidget as a standalone UMD bundle
 * that can be embedded on any website via a script tag.
 */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(clientRoot, "src/search-widget-entry.tsx"),
      name: "RAGSuiteSearchWidget",
      formats: ["umd"],
      fileName: () => "search-widget.umd.js",
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        name: "RAGSuiteSearchWidget",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "search-widget.css";
          }
          return assetInfo.name || "asset";
        },
      },
    },
    outDir: path.join(repoRoot, "dist", "search-widget"),
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    sourcemap: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(clientRoot, "src"),
      "@shared": path.join(repoRoot, "shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

