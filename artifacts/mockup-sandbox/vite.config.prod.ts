import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";
import { apiPlugin } from "./server/apiPlugin";

const port = Number(process.env.PORT) || 5000;

function securityHeadersPlugin(): Plugin {
  const apply = (res: any) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  };
  return {
    name: "nnc-security-headers",
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => { apply(res); next(); });
    },
    configureServer(server) {
      server.middlewares.use((_req, res, next) => { apply(res); next(); });
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [securityHeadersPlugin(), apiPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "prod.html"),
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
