// services/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import { getAuthToken, clearAuthTokens } from "./auth";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // app boot loading
  const [ready, setReady] = useState(false);    // auth init complete

  const isAuthed = !!user;
  const adsDisabled = !!user?.is_ads_free || !!user?.is_premium;

  async function refreshMe() {
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setReady(true);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/auth/me");
      setUser(data.user || data);
    } catch (err) {
      console.warn("User fetch hatası:", err);
      clearAuthTokens();
      setUser(null);
    } finally {
      setReady(true);
      setLoading(false);
    }
  }

  async function loginUser(email, password) {
    const { login } = await import("./auth");
    const data = await login(email, password);
    await refreshMe();
    return data;
  }

  async function registerUser(userData) {
    const { register } = await import("./auth");
    const data = await register(userData);
    await refreshMe();
    return data;
  }

  async function logoutUser() {
    const { logout } = await import("./auth");
    await logout();
    setUser(null);
    setReady(true);
    setLoading(false);
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthed,
      loading,
      ready,
      adsDisabled,
      refreshMe,
      login: loginUser,
      register: registerUser,
      logout: logoutUser,
    }),
    [user, isAuthed, loading, ready, adsDisabled]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
