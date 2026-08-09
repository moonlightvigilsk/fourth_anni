import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { guides } from "./data/guides";
import { preloadPortrait } from "./lib/portraitCache";
import "./styles/tokens.css";
import "./styles/globals.css";

if (guides.kagura.artSrc) {
  void preloadPortrait(guides.kagura.id, guides.kagura.artSrc).catch(() => undefined);
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
