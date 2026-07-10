// import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { VitePWA } from "vite-plugin-pwa";

const buildPlugins = (command: "serve" | "build") => {
  const plugins = [react(), tailwindcss()];

  // Keep Manus runtime only for local development preview tooling.
  if (command === "serve") {
    plugins.push(vitePluginManusRuntime());
  }

  plugins.push(
    VitePWA({
      injectRegister: null,
      registerType: "autoUpdate",
      includeAssets: [
        "apple-touch-icon.png",
        "icon.svg",
        "icon-192.png",
        "icon-512.png",
        "maskable-icon-512.png",
      ],
      manifest: false,
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        /* Шрифты tahoma нужны для всех документов — кладём в precache.
           Тяжёлый воркер pdfjs (.mjs) НЕ в precache: он кэшируется при первом
           открытии PDF-документа (правило /assets/*.mjs ниже) — установка легче. */
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webmanifest,webp,json,woff2}",
        ],
        globIgnores: ["**/udostoverenie-bg.png", "**/udostoverenie-back-bg.png"],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:js|mjs|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-assets",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            /* PDF-шаблоны документов — кэшируем навсегда, работают офлайн */
            urlPattern: /\.pdf$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "document-pdfs",
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            /* Шрифты для рендера PDF (tahoma, стандартные pdfjs) */
            urlPattern: /\/pdfjs-fonts\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "pdf-fonts",
              expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico|woff2|woff|ttf|otf)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "app-images",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/.*$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "app-pages",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    })
  );

  return plugins;
};

export default defineConfig(({ command }) => {
  return {
    plugins: buildPlugins(command),
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      strictPort: false, // Will find next available port if 3000 is busy
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
        ".ngrok-free.app",
        ".ngrok.io",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
