import { apiFetch } from "./api";

export const CatalogAPI = {
  brands: (q = "") => apiFetch(`/api/brands?q=${encodeURIComponent(q)}`),
  models: (brandId, q = "") =>
    apiFetch(`/api/models?brand_id=${brandId}&q=${encodeURIComponent(q)}`),
  years: (brandId, modelId) =>
    apiFetch(`/api/years?brand_id=${brandId}&model_id=${modelId}`),
  trims: (brandId, modelId, year, q = "") =>
    apiFetch(
      `/api/trims?brand_id=${brandId}&model_id=${modelId}&year=${year}&q=${encodeURIComponent(q)}`
    ),
};
