let API = (import.meta.env.VITE_API_BASE || "").trim();

API = API.replace(/\/+$/, "");
API = API.replace(/^https?:\/\/https?:\/\//, "https://");

async function parseResponse(res, method, path) {
  const text = await res.text().catch(() => "");
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      `${method} ${path} başarısız (${res.status})`;

    const error = new Error(msg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// EDER_03F1_V2_PRODUCT_FLOW_RECOVERY
const GET_CACHE_TTL_MS = 10 * 60 * 1000;
const memoryGetCache = new Map();
const pendingGetRequests = new Map();

function readSessionCache(key) {
  try {
    const raw = window.sessionStorage.getItem(`eder:valuation:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      window.sessionStorage.removeItem(`eder:valuation:${key}`);
      return null;
    }
    return parsed.value;
  } catch { return null; }
}

function writeSessionCache(key, value) {
  try {
    window.sessionStorage.setItem(`eder:valuation:${key}`, JSON.stringify({ expiresAt: Date.now() + GET_CACHE_TTL_MS, value }));
  } catch { /* storage optional */ }
}

async function httpGet(path, params = {}) {
  const url = new URL(`${API}${path}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) url.searchParams.set(k, v);
  });
  const key = url.toString();
  const memory = memoryGetCache.get(key);
  if (memory && memory.expiresAt > Date.now()) return memory.value;
  const session = readSessionCache(key);
  if (session !== null) {
    memoryGetCache.set(key, { expiresAt: Date.now() + GET_CACHE_TTL_MS, value: session });
    return session;
  }
  if (pendingGetRequests.has(key)) return pendingGetRequests.get(key);
  const request = (async () => {
    const res = await fetch(key, { headers: { Accept: "application/json" } });
    const data = await parseResponse(res, "GET", path);
    memoryGetCache.set(key, { expiresAt: Date.now() + GET_CACHE_TTL_MS, value: data });
    writeSessionCache(key, data);
    return data;
  })();
  pendingGetRequests.set(key, request);
  try { return await request; } finally { pendingGetRequests.delete(key); }
}

async function httpPost(path, body = {}, { turnstileToken = "" } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (turnstileToken) headers["X-Turnstile-Token"] = turnstileToken;

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  return parseResponse(res, "POST", path);
}

export const valuationApi = {
  getBrands: (q) => httpGet("/api/brands", { q }),
  getModels: (brand_id, q) => httpGet("/api/models", { brand_id, q }),
  getYears: (brand_id, model_id) => httpGet("/api/years", { brand_id, model_id }),
  getTrims: (brand_id, model_id, year) => httpGet("/api/trims", { brand_id, model_id, year }),
  predict: (payload, turnstileToken) =>
    httpPost("/api/predict", payload, { turnstileToken }),
};
