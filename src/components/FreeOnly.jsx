import { useAuth } from "../services/AuthContext";

export default function FreeOnly({ children }) {
  const { adsDisabled, loading } = useAuth();

  if (loading) return null;
  if (adsDisabled) return null;

  return children;
}
