import { apiFetch } from "./api";

export const UserCarsAPI = {
  list: () => apiFetch("/api/user/cars"),
  getLatest: () => apiFetch("/api/user/car"),
  upsert: (payload) =>
    apiFetch("/api/user/car", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
