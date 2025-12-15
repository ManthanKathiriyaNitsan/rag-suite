import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project paths
const repoRoot = __dirname;               // vite.config.ts is at repo root
const clientRoot = path.join(repoRoot, "client");
const indexHtmlPath = path.join(clientRoot, "index.html");

// Debug logging (safe to keep)
console.log("=== VITE CONFIG DEBUG ===");
console.log("__dirname:", __dirname);
console.log("process.cwd():", process.cwd());
console.log("repoRoot:", repoRoot);
console.log("clientRoot:", clientRoot);
console.log("indexHtmlPath:", indexHtmlPath);
console.log("index.html exists:", fs.existsSync(indexHtmlPath));
console.log("client dir exists:", fs.existsSync(clientRoot));
if (fs.existsSync(clientRoot)) {
  console.log("Files in client dir:", fs.readdirSync(clientRoot));
}
console.log("========================");

// Optional Replit plugins (safe for Vercel)
async function maybeLoadReplitPlugin() {
  if (process.env.NODE_ENV === "production" || process.env.REPL_ID === undefined) {
    return null;
  }
  try {
    const mod = await import("@replit/vite-plugin-cartographer");
    return mod.cartographer();
  } catch {
    return null;
  }
}

async function maybeLoadRuntimeErrorOverlay() {
  try {
    const mod = await import("@replit/vite-plugin-runtime-error-modal");
    return mod.default();
  } catch {
    return null;
  }
}

// Local IP helper (dev only)
function getNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;
    for (const iface of ifaceList) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

export default defineConfig(async () => {
  const networkIP = getNetworkIP();

  const plugins: any[] = [react()];

  const runtimeOverlay = await maybeLoadRuntimeErrorOverlay();
  if (runtimeOverlay) plugins.push(runtimeOverlay);

  const replitPlugin = await maybeLoadReplitPlugin();
  if (replitPlugin) plugins.push(replitPlugin);

  return {
    /** 🔴 THIS IS THE IMPORTANT FIX */
    base: "/", // REQUIRED for Vercel asset loading

    root: clientRoot,

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
      dedupe: ["react", "react-dom"],
    },

    optimizeDeps: {
      include: ["react", "react-dom"],
    },

    build: {
      outDir: path.join(repoRoot, "dist", "public"),
      emptyOutDir: true,
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom")
            ) {
              return undefined;
            }
            if (id.includes("node_modules")) {
              if (id.includes("recharts")) return "chart-vendor";
              if (id.includes("framer-motion")) return "motion-vendor";
            }
            return undefined;
          },
        },
      },
    },

    server: {
      port: 5000,
      host: "0.0.0.0",
      hmr: {
        port: 5000,
        host: networkIP,
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
