import { apiFetch } from "./api";

export const ValuationAPI = {
  predict: (payload) =>
    apiFetch("/api/predict", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
