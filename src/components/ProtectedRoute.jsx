// components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../services/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading, ready } = useAuth();
  const location = useLocation();

  if (!ready || loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthed) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}
