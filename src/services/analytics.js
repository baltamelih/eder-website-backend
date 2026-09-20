const MEASUREMENT_ID = String(
  import.meta.env.VITE_GA_MEASUREMENT_ID || "",
).trim();

const DEBUG_PARAM = "analyticsPreview";
const EVENT_BUS_NAME = "eder:analytics";

let gaBootstrapped = false;
let lastPageSignature = "";
let lastPageAt = 0;

const BLOCKED_PARAM_KEYS = new Set([
  "email",
  "phone",
  "name",
  "full_name",
  "first_name",
  "last_name",
  "user_id",
  "uid",
  "token",
  "password",
]);

function analyticsPreviewEnabled() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return (
    params.get(DEBUG_PARAM) === "1" ||
    window.localStorage?.getItem("eder_analytics_preview") === "1"
  );
}

function safeScalar(value) {
  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  return String(value).slice(0, 100);
}

function sanitizeParams(params = {}) {
  const clean = {};

  Object.entries(params).forEach(([key, value]) => {
    const safeKey = String(key)
      .trim()
      .toLowerCase();

    if (!safeKey || BLOCKED_PARAM_KEYS.has(safeKey)) {
      return;
    }

    const safeValue = safeScalar(value);

    if (safeValue !== undefined) {
      clean[safeKey] = safeValue;
    }
  });

  return clean;
}

function dispatchDebugEvent(name, params) {
  if (typeof window === "undefined") return;

  const detail = {
    name,
    params,
    at: new Date().toISOString(),
    transport: MEASUREMENT_ID ? "ga4" : "debug-only",
  };

  window.dispatchEvent(
    new CustomEvent(EVENT_BUS_NAME, { detail }),
  );

  if (analyticsPreviewEnabled()) {
    console.info("[EDER analytics]", detail);
  }
}

function ensureGa4() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !MEASUREMENT_ID
  ) {
    return false;
  }

  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  if (!gaBootstrapped) {
    gaBootstrapped = true;

    const existing = document.querySelector(
      `script[data-eder-ga4="${MEASUREMENT_ID}"]`,
    );

    if (!existing) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        MEASUREMENT_ID,
      )}`;
      script.dataset.ederGa4 = MEASUREMENT_ID;
      document.head.appendChild(script);
    }

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }

  return true;
}

export function analyticsStatus() {
  return {
    measurementIdConfigured: Boolean(MEASUREMENT_ID),
    debugPreview: analyticsPreviewEnabled(),
    eventBus: EVENT_BUS_NAME,
  };
}

export function trackEvent(name, params = {}) {
  const eventName = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 40);

  if (!eventName) return false;

  const safeParams = sanitizeParams(params);

  dispatchDebugEvent(eventName, safeParams);

  if (ensureGa4()) {
    window.gtag("event", eventName, safeParams);
    return true;
  }

  return false;
}

export function trackPageView(path, title) {
  if (typeof window === "undefined") return false;

  const cleanPath = String(path || window.location.pathname)
    .split("?")[0]
    .slice(0, 180);

  const signature = `${cleanPath}|${String(title || "").slice(0, 120)}`;
  const now = Date.now();

  if (
    signature === lastPageSignature &&
    now - lastPageAt < 500
  ) {
    return false;
  }

  lastPageSignature = signature;
  lastPageAt = now;

  return trackEvent("page_view", {
    page_path: cleanPath,
    page_title: String(title || document.title || "EDER").slice(0, 120),
  });
}

export function trackValuationCta(source) {
  return trackEvent("valuation_cta_click", {
    source,
    destination: "/valuation",
  });
}
