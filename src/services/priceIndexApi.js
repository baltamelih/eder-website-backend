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

export const priceIndexApi = {
  health() {
    return apiFetch("/api/price-index/health");
  },

  overview(range = "1y") {
    return apiFetch(
      `/api/price-index/overview${query({ range })}`,
    );
  },

  brand(brandSlug, range = "1y") {
    return apiFetch(
      `/api/price-index/brand/${encodeURIComponent(
        String(brandSlug),
      )}${query({ range })}`,
    );
  },

  model(brandSlug, modelSlug, range = "1y") {
    const path = [brandSlug, modelSlug]
      .map((part) => encodeURIComponent(String(part)))
      .join("/");

    return apiFetch(
      `/api/price-index/model/${path}${query({ range })}`,
    );
  },
};

export default priceIndexApi;
