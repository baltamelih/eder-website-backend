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
