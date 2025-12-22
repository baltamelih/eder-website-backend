import { api } from "./api";

// beklenen örnek response:
// { isPremium: true, plan: "monthly", expiresAt: "2026-01-20T00:00:00Z" }
export async function getSubscriptionStatus() {
  return await api("/api/subscription/status", { method: "GET" });
}
