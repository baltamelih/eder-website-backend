// services/auth.js
const TOKEN_COOKIE_NAME = "eder_token";
const REFRESH_TOKEN_COOKIE_NAME = "eder_refresh_token";

function isHttps() {
  if (typeof window === "undefined") return true;
  return window.location.protocol === "https:";
}

// Cookie yardımcı fonksiyonları
export function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const encoded = encodeURIComponent(value ?? "");

  // localhost http için secure basma (aksi halde cookie yazılmaz)
  const secure = isHttps() ? "; Secure" : "";
  // Strict bazen login/redirect akışlarını bozabiliyor; Lax daha stabil.
  const sameSite = "; SameSite=Lax";

  document.cookie = `${name}=${encoded}; Expires=${expires}; Path=/${secure}${sameSite}`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;

  const nameEQ = name + "=";
  const parts = document.cookie.split(";");

  for (let p of parts) {
    p = p.trim();
    if (p.indexOf(nameEQ) === 0) {
      const raw = p.substring(nameEQ.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

export function deleteCookie(name) {
  if (typeof document === "undefined") return;

  const secure = isHttps() ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/${secure}${sameSite}`;
}

// ✅ Tek yerden auth token yönetimi
export function setAuthTokens(accessToken, refreshToken = null) {
  // Access token
  if (!accessToken) {
    localStorage.removeItem("token");
    deleteCookie(TOKEN_COOKIE_NAME);
  } else {
    localStorage.setItem("token", accessToken);
    // İstersen access token cookie de tut (XSS riskini azaltmaz; sadece fallback)
    setCookie(TOKEN_COOKIE_NAME, accessToken, 7);
  }

  // Refresh token (tercihen cookie)
  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
    setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, 30);
  }
}

export function getAuthToken() {
  // Önce localStorage
  let token = localStorage.getItem("token");
  if (token) return token;

  // Fallback cookie
  token = getCookie(TOKEN_COOKIE_NAME);
  if (token) {
    localStorage.setItem("token", token);
    return token;
  }
  return null;
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token") || getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function clearAuthTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  deleteCookie(TOKEN_COOKIE_NAME);
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME);
}

// Auth API fonksiyonları
export async function login(email, password) {
  if (!email || !password) throw new Error("E-posta ve şifre gerekli.");

  const { apiFetch } = await import("./api");
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data?.token) setAuthTokens(data.token, data.refresh_token);
  return data;
}

export async function register({ email, password, full_name }) {
  if (!email || !password) throw new Error("E-posta ve şifre gerekli.");
  if (!full_name || full_name.trim().length < 3) throw new Error("Ad Soyad gerekli.");

  const { apiFetch } = await import("./api");
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name: full_name.trim() }),
  });

  if (data?.token) setAuthTokens(data.token, data.refresh_token);
  return data;
}

export async function logout() {
  try {
    clearAuthTokens();
    
  } catch (e) {
    console.warn("Logout API hatası:", e);
  } finally {
    clearAuthTokens();
  }
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Refresh token bulunamadı");

  const { apiFetch } = await import("./api");

  // Not: refresh endpoint'in 401'e düştüğünde döngüye girmemesi için api.js'te özel ele alacağız.
  const data = await apiFetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (data?.token) {
    setAuthTokens(data.token, data.refresh_token || refreshToken);
    return data.token;
  }

  clearAuthTokens();
  throw new Error("Token yenilenemedi");
}
