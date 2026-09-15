// services/api.js
// EDER_03F5_VEHICLE_VISUAL_AUTH_LOCAL_RECOVERY
function resolveApiBase() {
  let api = (import.meta.env.VITE_API_BASE || "").trim();

  if (!api && typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "127.0.0.1" || host === "localhost";
    if (isLocal) api = "http://127.0.0.1:5000";
  }

  api = api.replace(/\/+$/, "");
  api = api.replace(/^https?:\/\/https?:\/\//, "https://");
  return api;
}

const API = resolveApiBase();

function isAuthPath(path) {
  return path.startsWith("/api/auth/");
}

/**
 * Auth endpointleri içinde "yanlış şifre" gibi 401'ler refresh'e düşmemeli.
 * (Sen zaten auth path'leri refresh'ten hariç tutuyorsun.)
 */
function isLoginPath(path) {
  // senin route'un neyse burada onu yakalayalım (en yaygınlarını ekledim)
  return (
    path === "/api/auth/login" ||
    path === "/api/auth/signin" ||
    path === "/api/auth/token"
  );
}

function pickErrorMessage(data, status, path) {
  // backend tarafında bazen {error: "..."} bazen {message: "..."} olabiliyor
  const backendMsg =
    (typeof data?.error === "string" && data.error) ||
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.detail === "string" && data.detail) ||
    "";

  // ✅ Login'de 401 => kullanıcı dostu sabit mesaj
  if (status === 401 && isLoginPath(path)) {
    return "E-posta veya şifre hatalı.";
  }

  // ✅ Genel 401 (auth dışı) refresh ile çözülecek, ama buraya düşerse:
  if (status === 401 && !isAuthPath(path)) {
    return backendMsg || "Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.";
  }

  // ✅ Diğer durumlar
  return backendMsg || `HTTP ${status}`;
}

async function handleResponse(res, path = "") {
  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = pickErrorMessage(data, res.status, path);
    const error = new Error(msg);
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
    try {
      return await fetch(url, { ...options, headers: overrideHeaders ?? headers });
    } catch (cause) {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "localhost");

      const error = new Error(
        isLocal
          ? "Yerel API sunucusuna bağlanılamadı. Backend'in http://127.0.0.1:5000 adresinde çalıştığını kontrol et."
          : "Sunucuya bağlanılamadı. Lütfen birkaç saniye sonra tekrar deneyin."
      );
      error.code = "NETWORK_UNREACHABLE";
      error.cause = cause;
      throw error;
    }
  };

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
      }).then(async (newToken) => {
        const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
        const retryRes = await doFetch(retryHeaders);
        return handleResponse(retryRes, path);
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
      return handleResponse(retryRes, path);
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

  // ✅ auth login gibi yerlerde 401 vs: refresh yok, handleResponse kendi mesajını verir
  return handleResponse(res, path);
}
