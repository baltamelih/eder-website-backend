import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMockIsPremium } from "./mockSubscription";

const SubscriptionContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || "";

function getToken() {
  // Senin projende token farklı yerdeyse burayı güncelle
  return localStorage.getItem("token") || "";
}

function isFutureDate(dateStr) {
  if (!dateStr) return true; // expire_at yoksa "süresiz" gibi davranmak istersen true
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return false;
  return t > Date.now();
}

async function fetchMe() {
  const token = getToken();
  if (!API_BASE) throw new Error("VITE_API_BASE is missing");

  const res = await fetch(`${API_BASE}/api/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export function SubscriptionProvider({ children }) {
  const { isAuthed, loading: authLoading } = useAuth();

  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    isPremium: false,
    plan: "free",
    expiresAt: null,
    source: "init",
  });

  async function refreshSubscription() {
    setSubLoading(true);

    // Authed değilse direkt kapat
    if (!isAuthed) {
      setSubscription({ isPremium: false, plan: "free", expiresAt: null, source: "auth" });
      setSubLoading(false);
      return;
    }

    // 1) Önce gerçek backend'i dene
    try {
      const me = await fetchMe();
      const u = me?.user || {};

      const expiresAt = u.premium_expire_at || null;
      const premiumFlag = !!u.ispremium;
      const active = premiumFlag && isFutureDate(expiresAt);

      setSubscription({
        isPremium: active,
        plan: active ? (u.plan_type || "premium") : "free",
        expiresAt,
        source: "backend",
      });

      // checkout polling için küçük yardımcı
      window.__eder_isPremium = active;

      setSubLoading(false);
      return;
    } catch (e) {
      // Backend hazır değilse mock’a düş
      // (prod’da bu hata oluyorsa VITE_API_BASE veya /api/me sorunlu demektir)
      try {
        const isPremium = getMockIsPremium();
        setSubscription({
          isPremium,
          plan: isPremium ? "premium" : "free",
          expiresAt: null,
          source: "mock",
        });
        window.__eder_isPremium = isPremium;
      } finally {
        setSubLoading(false);
      }
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthed) {
      setSubscription({ isPremium: false, plan: "free", expiresAt: null, source: "auth" });
      setSubLoading(false);
      window.__eder_isPremium = false;
      return;
    }

    refreshSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, authLoading]);

  const value = useMemo(
    () => ({
      subscription,
      isPremium: !!subscription.isPremium,
      subLoading,
      refreshSubscription,
      // alias (PremiumCheckout gibi yerlerde daha anlaşılır)
      refresh: refreshSubscription,
    }),
    [subscription, subLoading]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
