import { apiFetch } from "./api";

function encodePart(value) {
  return encodeURIComponent(String(value ?? "").trim());
}

export const lifecycleApi = {
  health() {
    return apiFetch("/api/lifecycle/health");
  },

  version(brand, model, year, version) {
    const path = [brand, model, year, version]
      .map(encodePart)
      .join("/");

    return apiFetch(`/api/lifecycle/version/${path}`);
  },
};
