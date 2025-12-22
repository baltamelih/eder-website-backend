// services/api.js
let API = (import.meta.env.VITE_API_BASE || "").trim();

// API URL temizleme
API = API.replace(/\/+$/, ""); // sondaki / temizle
API = API.replace(/^https?:\/\/https?:\/\//, "https://"); // double protocol fix

function isAuthPath(path) {
  return path.startsWith("/api/auth/");
}

async function handleResponse(res) {
  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// --- Refresh queue (single-flight) ---
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  // JSON body set
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  // ✅ Token'ı tek kaynaktan al
  const { getAuthToken, clearAuthTokens } = await import("./auth");
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API}${path}`;

  // fetch helper
  const doFetch = async (overrideHeaders) => {
    const res = await fetch(url, { ...options, headers: overrideHeaders ?? headers });
    return res;
  };

  try {
    const res = await doFetch();

    // 401 → refresh dene (auth endpointlerinde deneme, refresh endpointinde deneme)
    if (
      res.status === 401 &&
      token &&
      !isAuthPath(path) &&
      path !== "/api/auth/refresh"
    ) {
      if (isRefreshing) {
        // refresh sürüyor → sıraya gir
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(async (newToken) => {
            const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
            const retryRes = await doFetch(retryHeaders);
            return handleResponse(retryRes);
          });
      }

      isRefreshing = true;

      try {
        const { refreshAccessToken } = await import("./auth");
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);

        // orijinal isteği retry
        const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
        const retryRes = await doFetch(retryHeaders);
        return handleResponse(retryRes);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();

        if (typeof window !== "undefined") {
          // redirect loop önlemek için sadece login sayfasında değilsek yönlendir
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return handleResponse(res);
  } catch (e) {
    throw e;
  }
}
