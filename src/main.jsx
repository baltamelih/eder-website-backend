import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";

import { router } from "./app/routes";
import { theme } from "./app/theme";
import { AuthProvider } from "./services/AuthContext";
import { SubscriptionProvider } from "./services/SubscriptionContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <SubscriptionProvider>
          <RouterProvider router={router} />
        </SubscriptionProvider>
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
);
