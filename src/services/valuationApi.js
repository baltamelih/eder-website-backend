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

async function httpGet(path, params = {}) {
  const url = new URL(`${API}${path}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  return parseResponse(res, "GET", path);
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
