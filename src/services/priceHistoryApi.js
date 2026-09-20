import { apiFetch } from "./api";

function query(params) {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const value = search.toString();
  return value ? `?${value}` : "";
}

export const priceHistoryApi = {
  health() {
    return apiFetch("/api/price-history/health");
  },

  brands() {
    return apiFetch("/api/price-history/brands");
  },

  models(brand) {
    return apiFetch(
      `/api/price-history/models${query({ brand })}`,
    );
  },

  years(brand, model) {
    return apiFetch(
      `/api/price-history/years${query({ brand, model })}`,
    );
  },

  versions(brand, model, year) {
    return apiFetch(
      `/api/price-history/versions${query({ brand, model, year })}`,
    );
  },

  detail(
    brand,
    model,
    year,
    version,
    range = "1y",
    granularity = "weekly",
  ) {
    const encodedPath = [
      brand,
      model,
      year,
      version,
    ]
      .map((part) => encodeURIComponent(String(part)))
      .join("/");

    return apiFetch(
      `/api/price-history/detail/${encodedPath}${query({ range, granularity })}`,
    );
  },
};

export default priceHistoryApi;
