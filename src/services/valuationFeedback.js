import { apiFetch } from "./api";

// EDER_03F6B_VALUATION_FEEDBACK_SERVICE
// EDER_03F6C_FEEDBACK_HISTORY_REVIEW_SERVICE
export const ValuationFeedbackAPI = {
  saveExpectation: (payload) =>
    apiFetch("/api/valuation-feedback/expectation", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  reportSale: (feedbackId, payload) =>
    apiFetch(`/api/valuation-feedback/${feedbackId}/sale`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMine: () => apiFetch("/api/valuation-feedback/mine"),

  reviewAccess: () => apiFetch("/api/valuation-feedback/review/access"),

  reviewQueue: (status = "pending") =>
    apiFetch(`/api/valuation-feedback/review/queue?status=${encodeURIComponent(status)}`),

  reviewFeedback: (feedbackId, decision, note = "") =>
    apiFetch(`/api/valuation-feedback/${feedbackId}/review`, {
      method: "POST",
      body: JSON.stringify({ decision, note }),
    }),

  verifiedInsights: () => apiFetch("/api/valuation-feedback/verified-insights"),
};
