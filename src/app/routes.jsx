import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "./PublicLayout";
import AppLayout from "./AppLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import ScrollToTop from "../components/ScrollToTop";

// Public Pages
import Home from "../pages/Home";
import Pricing from "../pages/Pricing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PublicValuation from "../pages/PublicValuation";

import Support from "../pages/Support";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import DeleteAccount from "../pages/DeleteAccount";
import NotFound from "../pages/NotFound";

// App Pages
import Dashboard from "../pages/Dashboard";
import Valuation from "../pages/Valuation";
import Account from "../pages/Account";
import Settings from "../pages/Settings";
import BlogIndex from "../pages/BlogIndex";
import BlogPost from "../pages/BlogPost";



export const router = createBrowserRouter([
  // 🌍 PUBLIC (login olmuş kullanıcı: /login /register’a giremez)
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <PublicLayout />
      </>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "/blog", element: <BlogIndex /> },
      { path: "/blog/:slug", element: <BlogPost /> },
      { path: "pricing", element: <Pricing /> },
      
      // ✅ Login/Register sadece "PublicRoute" ile sarılı
      {
        path: "login",
        element: (
          <PublicRoute redirectTo="/app/dashboard">
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute redirectTo="/app/dashboard">
            <Register />
          </PublicRoute>
        ),
      },

      { path: "support", element: <Support /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "delete-account", element: <DeleteAccount /> },

      { path: "*", element: <NotFound /> },
    ],
  },

  // 🔐 APP (giriş zorunlu)
  {
    path: "/app",
    element: (
      <>
        <ScrollToTop />
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </>
    ),
    children: [
      { index: true, element: <Dashboard /> }, // /app
      { path: "dashboard", element: <Dashboard /> },
      { path: "valuation", element: <Valuation /> },
      { path: "account", element: <Account /> },
      { path: "settings", element: <Settings /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
