import { apiFetch } from "./api";

function secureApiBase() {
  const configured = String(import.meta.env.VITE_API_BASE || "")
    .trim()
    .replace(/\/+$/, "");

  if (configured) return configured;
  if (import.meta.env.DEV) return "http://127.0.0.1:5000";
  return "https://eder-backend.onrender.com";
}

async function securePriceCheckFetch(path, turnstileToken) {
  const response = await fetch(`${secureApiBase()}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Turnstile-Token": String(turnstileToken || "").trim(),
    },
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    let message =
      payload?.message ||
      payload?.error ||
      `İstek başarısız (${response.status})`;

    if (payload?.error === "human_verification_failed") {
      message =
        "Güvenli doğrulama tamamlanamadı. Lütfen doğrulamayı yenileyip tekrar dene.";
    } else if (payload?.error === "price_check_rate_limit") {
      message =
        payload?.message ||
        "Kısa sürede çok fazla fiyat kontrolü yapıldı. Lütfen biraz bekle.";
    } else if (payload?.error === "price_check_security_unavailable") {
      message =
        "Fiyat kontrolü güvenlik servisi şu anda kullanılamıyor. Lütfen biraz sonra tekrar dene.";
    }

    const error = new Error(message);
    error.status = response.status;
    error.code = payload?.error || "";
    error.retryAfterSeconds = Number(payload?.retry_after_seconds || 0);
    throw error;
  }

  return payload;
}

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

  priceCheck(brand, model, year, version, price, turnstileToken) {
    const encodedPath = [
      brand,
      model,
      year,
      version,
    ]
      .map((part) => encodeURIComponent(String(part)))
      .join("/");

    return securePriceCheckFetch(
      `/api/price-history/price-check/${encodedPath}${query({ price })}`,
      turnstileToken,
    );
  },

  compare(brand, model, year) {
    return apiFetch(
      `/api/price-history/compare${query({ brand, model, year })}`,
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
