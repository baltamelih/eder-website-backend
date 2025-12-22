// src/services/valuationApi.js
const API_BASE = import.meta.env.VITE_API_BASE_URL; // örn: http://127.0.0.1:5000/api

async function httpGet(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function httpPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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
  getBrands: (q) => httpGet("/brands", { q }),
  getModels: (brand_id, q) => httpGet("/models", { brand_id, q }),
  getYears: (brand_id, model_id) => httpGet("/years", { brand_id, model_id }),
  getTrims: (brand_id, model_id, year) => httpGet("/trims", { brand_id, model_id, year }),
  predict: (payload) => httpPost("/predict", payload),
};
