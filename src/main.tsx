import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { langFromPathname } from "./i18n/config";
import { ensureDict } from "./i18n/registry";
import "./fonts.css";
import "./qb.css";

// Register PWA Service Worker for all devices (Mobile, Tablet, Desktop)
if ("serviceWorker" in navigator && process.env.NODE_ENV !== "development") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("QuickBill POS PWA Service Worker registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("PWA Service Worker registration failed:", err);
      });
  });
}

const root = document.getElementById("root")!;

async function start() {
  // Load the language file for this URL first so the first render matches the prerendered HTML.
  await ensureDict(langFromPathname(window.location.pathname));

  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );

  // Pages prerendered at build time already contain the full HTML; attach to it instead of replacing it.
  if (root.hasAttribute("data-prerendered")) {
    ReactDOM.hydrateRoot(root, app);
  } else {
    ReactDOM.createRoot(root).render(app);
  }
}

start();