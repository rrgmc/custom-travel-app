import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/800.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./styles.css";
import { App } from "./App";
import { trip } from "./data";
import { handleBackButton, isNative } from "./lib/native";
import { loadMarks } from "./lib/marks";

document.title = trip.title;
document.documentElement.lang = trip.language;
if (trip.accent) document.documentElement.style.setProperty("--accent", trip.accent);

handleBackButton();

// Offline support for the web/PWA version. The native app already has every file locally.
if (!isNative && import.meta.env.PROD) {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true }));
}

// Done/removed marks are read before the first render, so lists never jump into place.
loadMarks().finally(() =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
