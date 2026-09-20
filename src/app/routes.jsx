import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import PublicLayout from "./PublicLayout";
import AppLayout from "./AppLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import ScrollToTop from "../components/ScrollToTop";
import Valuation from "../pages/Valuation";

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Support = lazy(() => import("../pages/Support"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Terms = lazy(() => import("../pages/Terms"));
const CookiePolicy = lazy(() => import("../pages/CookiePolicy"));
const Kvkk = lazy(() => import("../pages/Kvkk"));
const About = lazy(() => import("../pages/About"));
const DeleteAccount = lazy(() => import("../pages/DeleteAccount"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Contact = lazy(() => import("../pages/Contact"));
const Faq = lazy(() => import("../pages/Faq"));
const BlogIndex = lazy(() => import("../pages/BlogIndex"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const PriceHistory = lazy(() => import("../pages/PriceHistory"));
const PriceIndex = lazy(() => import("../pages/PriceIndex"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Account = lazy(() => import("../pages/Account"));
const Settings = lazy(() => import("../pages/Settings"));
const Cars = lazy(() => import("../pages/Cars"));
const FeedbackHistory = lazy(() => import("../pages/FeedbackHistory"));
const FeedbackReview = lazy(() => import("../pages/FeedbackReview"));

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

      // Canonical public routes
      { path: "arac-degerleme", element: withSuspense(<Valuation />) },
      {
        path: "arac-fiyat-gecmisi",
        element: withSuspense(<PriceHistory />),
      },
      {
        path: "arac-fiyat-gecmisi/:brand",
        element: withSuspense(<PriceHistory />),
      },
      {
        path: "arac-fiyat-gecmisi/:brand/:model",
        element: withSuspense(<PriceHistory />),
      },
      {
        path: "arac-fiyat-gecmisi/:brand/:model/:year",
        element: withSuspense(<PriceHistory />),
      },
      {
        path: "arac-fiyat-gecmisi/:brand/:model/:year/:version",
        element: withSuspense(<PriceHistory />),
      },
      {
        path: "fiyat-endeksi",
        element: withSuspense(<PriceIndex />),
      },
      { path: "blog", element: withSuspense(<BlogIndex />) },
      { path: "blog/:slug", element: withSuspense(<BlogPost />) },
      { path: "hakkimizda", element: withSuspense(<About />) },
      { path: "sss", element: withSuspense(<Faq />) },
      { path: "destek", element: withSuspense(<Support />) },
      { path: "iletisim", element: withSuspense(<Contact />) },
      { path: "gizlilik-politikasi", element: withSuspense(<Privacy />) },
      { path: "kvkk-aydinlatma-metni", element: withSuspense(<Kvkk />) },
      { path: "cerez-politikasi", element: withSuspense(<CookiePolicy />) },
      { path: "kullanim-kosullari", element: withSuspense(<Terms />) },

      // Backward-compatible aliases. Firebase also returns permanent redirects
      // for direct requests so indexed legacy URLs converge on one canonical URL.
      { path: "valuation", element: <Navigate to="/arac-degerleme" replace /> },
      { path: "pricing", element: <Navigate to="/arac-degerleme" replace /> },
      { path: "faq", element: <Navigate to="/sss" replace /> },
      { path: "support", element: <Navigate to="/destek" replace /> },
      { path: "contact", element: <Navigate to="/iletisim" replace /> },
      { path: "privacy", element: <Navigate to="/gizlilik-politikasi" replace /> },
      { path: "terms", element: <Navigate to="/kullanim-kosullari" replace /> },

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
      { path: "delete-account", element: withSuspense(<DeleteAccount />) },
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
      { path: "cars", element: withSuspense(<Cars />) },
      { path: "feedback", element: withSuspense(<FeedbackHistory />) },
      { path: "feedback-review", element: withSuspense(<FeedbackReview />) },
      { path: "valuation", element: <Navigate to="/arac-degerleme" replace /> },
      { path: "account", element: withSuspense(<Account />) },
      { path: "settings", element: withSuspense(<Settings />) },
      { path: "premium", element: <Navigate to="/arac-degerleme" replace /> },
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
]);
