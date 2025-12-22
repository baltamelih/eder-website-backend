// src/services/valuationApi.js
const API = (import.meta.env.VITE_API_BASE || "").trim()
  .replace(/\/+$/, "") // sondaki / temizle
  .replace(/^https?:\/\/https?:\/\//, "https://"); // double protocol fix (senin api.js ile aynı)

async function httpGet(path, params = {}) {
  // path: "/api/brands" gibi
  const url = new URL(`${API}${path}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function httpPost(path, body = {}) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export const valuationApi = {
  getBrands: (q) => httpGet("/api/brands", { q }),
  getModels: (brand_id, q) => httpGet("/api/models", { brand_id, q }),
  getYears: (brand_id, model_id) => httpGet("/api/years", { brand_id, model_id }),
  getTrims: (brand_id, model_id, year) => httpGet("/api/trims", { brand_id, model_id, year }),
  predict: (payload) => httpPost("/api/predict", payload),
};
