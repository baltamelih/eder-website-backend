// components/PublicRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function PublicRoute({ children, redirectTo = "/app/dashboard" }) {
  const { isAuthed, loading, ready } = useAuth();
  const location = useLocation();

  // Auth init bitene kadar public sayfayı göstermek sorun değil.
  // (İstersen burada spinner da koyabiliriz.)
  if (!ready || loading) return children;

  if (isAuthed) {
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
}
