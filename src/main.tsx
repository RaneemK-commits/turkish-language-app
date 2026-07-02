import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
// Self-hosted fonts — latin + latin-ext subsets cover ş ğ ı İ ö ü ç.
import "@fontsource-variable/schibsted-grotesk/index.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-ext-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-ext-600.css";
import "@/app/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
