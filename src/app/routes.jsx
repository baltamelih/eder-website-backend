import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import PublicLayout from "./PublicLayout";
import AppLayout from "./AppLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import ScrollToTop from "../components/ScrollToTop";

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Support = lazy(() => import("../pages/Support"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Terms = lazy(() => import("../pages/Terms"));
const DeleteAccount = lazy(() => import("../pages/DeleteAccount"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Contact = lazy(() => import("../pages/Contact"));
const Faq = lazy(() => import("../pages/Faq"));
const BlogIndex = lazy(() => import("../pages/BlogIndex"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Valuation = lazy(() => import("../pages/Valuation"));

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Account = lazy(() => import("../pages/Account"));
const Settings = lazy(() => import("../pages/Settings"));

function RouteLoading() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="route-loader__mark" aria-hidden />
      <div>
        <strong>EDER hazırlanıyor</strong>
        <span>Sayfa yükleniyor…</span>
      </div>
    </div>
  );
}

function withSuspense(element) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <PublicLayout />
      </>
    ),
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: "valuation", element: withSuspense(<Valuation />) },
      { path: "blog", element: withSuspense(<BlogIndex />) },
      { path: "blog/:slug", element: withSuspense(<BlogPost />) },
      { path: "pricing", element: <Navigate to="/valuation" replace /> },
      { path: "forgot-password", element: withSuspense(<ForgotPassword />) },
      { path: "reset-password", element: withSuspense(<ResetPassword />) },
      {
        path: "login",
        element: (
          <PublicRoute redirectTo="/app/dashboard">
            {withSuspense(<Login />)}
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute redirectTo="/app/dashboard">
            {withSuspense(<Register />)}
          </PublicRoute>
        ),
      },
      { path: "support", element: withSuspense(<Support />) },
      { path: "privacy", element: withSuspense(<Privacy />) },
      { path: "terms", element: withSuspense(<Terms />) },
      { path: "delete-account", element: withSuspense(<DeleteAccount />) },
      { path: "contact", element: withSuspense(<Contact />) },
      { path: "faq", element: withSuspense(<Faq />) },
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
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
      { index: true, element: withSuspense(<Dashboard />) },
      { path: "dashboard", element: withSuspense(<Dashboard />) },
      { path: "valuation", element: <Navigate to="/valuation" replace /> },
      { path: "account", element: withSuspense(<Account />) },
      { path: "settings", element: withSuspense(<Settings />) },
      { path: "premium", element: <Navigate to="/valuation" replace /> },
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
]);
