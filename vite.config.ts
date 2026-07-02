import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

// GitHub Pages serves the site from /<repo>/ — the deploy workflow sets VITE_BASE.
// Locally the base stays "/".
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: new deploys activate on next launch (skipWaiting +
      // clientsClaim). A single-user app has no reason to gate updates behind a
      // toast — and a "prompt" registerType with no toast UI wired left the old
      // shell cached indefinitely on the installed iPhone PWA.
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "Akış — Turkish Grammar Feed",
        short_name: "Akış",
        description:
          "A scrollable Turkish grammar feed with real spaced repetition.",
        lang: "en",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        theme_color: "#f3ede0",
        background_color: "#f3ede0",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Precache the app shell AND all bundled content JSON (PDR §10).
        globPatterns: ["**/*.{js,css,html,json,png,svg,woff2}"],
      },
    }),
  ],
});
