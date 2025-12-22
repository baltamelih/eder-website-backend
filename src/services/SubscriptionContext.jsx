import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMockIsPremium } from "./mockSubscription";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { isAuthed, loading: authLoading } = useAuth();

  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    isPremium: false,
    plan: "free",
    expiresAt: null,
  });

  async function refreshSubscription() {
    // Backend yok: mock’tan oku
    const isPremium = getMockIsPremium();
    setSubscription({
      isPremium,
      plan: isPremium ? "premium" : "free",
      expiresAt: null,
    });
    setSubLoading(false);
  }

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthed) {
      setSubscription({ isPremium: false, plan: "free", expiresAt: null });
      setSubLoading(false);
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
    }),
    [subscription, subLoading]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
