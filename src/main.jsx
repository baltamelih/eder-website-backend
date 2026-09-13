import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";

import "./index.css";
import "./App.css";

import { router } from "./app/routes";
import { theme } from "./app/theme";
import { AuthProvider } from "./services/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Buffer } from "buffer";

window.Buffer = window.Buffer || Buffer;
const STALE_CHUNK_RECOVERY_KEY = "eder:stale-chunk-recovery-at";
const STALE_CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

function recoverFromStaleChunk() {
  const now = Date.now();

  try {
    const previous = Number(
      window.sessionStorage.getItem(STALE_CHUNK_RECOVERY_KEY) || "0",
    );

    if (now - previous < 15000) {
      return;
    }

    window.sessionStorage.setItem(
      STALE_CHUNK_RECOVERY_KEY,
      String(now),
    );
  } catch {
    // Storage may be unavailable in restrictive browser modes.
  }

  window.location.reload();
}

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  recoverFromStaleChunk();
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message =
    reason instanceof Error ? reason.message : String(reason || "");

  if (!STALE_CHUNK_ERROR_PATTERN.test(message)) {
    return;
  }

  event.preventDefault();
  recoverFromStaleChunk();
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("EDER root element is missing.");
}

document.documentElement.dataset.ederEntry = "executed";
document.documentElement.dataset.ederRender = "requested";

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
