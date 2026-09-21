function envBoolean(value) {
  return String(value || "").trim().toLowerCase() === "true";
}

function envString(value) {
  return String(value || "").trim();
}

// Production safety lock.
// Keep false until AdSense approval is explicitly confirmed and a dedicated
// activation release intentionally changes this source-level gate.
export const ADSENSE_APPROVAL_UNLOCKED = false;

export const adRuntime = Object.freeze({
  enabled:
    ADSENSE_APPROVAL_UNLOCKED &&
    envBoolean(import.meta.env.VITE_ADS_ENABLED),
  provider: envString(import.meta.env.VITE_AD_PROVIDER || "none").toLowerCase(),
  adsenseClient: envString(import.meta.env.VITE_ADSENSE_CLIENT),
});

export const ADSENSE_MANUAL_SLOT_IDS = Object.freeze({
  priceHistoryTopLeaderboard: envString(
    import.meta.env.VITE_ADSENSE_SLOT_PH_TOP,
  ),
  priceHistoryAfterSelector: envString(
    import.meta.env.VITE_ADSENSE_SLOT_PH_AFTER_SELECTOR,
  ),
  priceHistoryInContent: envString(
    import.meta.env.VITE_ADSENSE_SLOT_PH_IN_CONTENT,
  ),
});

export const ADSENSE_AUTO_FORMATS = Object.freeze({
  anchor: true,
  sideRail: true,
  vignette: true,
});

export const AD_SLOT_DEFINITIONS = Object.freeze({
  priceHistoryTopLeaderboard: {
    id: "eder-ph-top-leaderboard",
    placement: "price_history_top_leaderboard",
    format: "leaderboard",
    delivery: "manual",
    desktop: "970×90",
    mobile: "320×100",
    label: "Üst banner",
  },

  priceHistoryAfterSelector: {
    id: "eder-ph-after-selector",
    placement: "price_history_after_selector",
    format: "leaderboard",
    delivery: "manual",
    desktop: "970×90",
    mobile: "320×100",
    label: "Araç seçimi sonrası",
  },

  priceHistoryInContent: {
    id: "eder-ph-in-content",
    placement: "price_history_in_content",
    format: "in-content",
    delivery: "manual",
    desktop: "970×180",
    mobile: "320×180",
    label: "İçerik içi",
  },

  priceHistoryLeftRail: {
    id: "eder-ph-left-rail",
    placement: "price_history_left_rail",
    format: "rail",
    delivery: "adsense-auto",
    desktop: "160×600",
    mobile: null,
    label: "Sol dikey",
    autoFormat: "sideRail",
  },

  priceHistoryRightRail: {
    id: "eder-ph-right-rail",
    placement: "price_history_right_rail",
    format: "rail",
    delivery: "adsense-auto",
    desktop: "160×600",
    mobile: null,
    label: "Sağ dikey",
    autoFormat: "sideRail",
  },

  priceHistoryMobileSticky: {
    id: "eder-ph-mobile-sticky",
    placement: "price_history_mobile_sticky",
    format: "mobile-sticky",
    delivery: "adsense-auto",
    desktop: null,
    mobile: "320×50",
    label: "Mobil sabit",
    autoFormat: "anchor",
  },

  priceHistoryStepTransition: {
    id: "eder-ph-step-transition",
    placement: "price_history_step_transition",
    format: "interstitial-reserved",
    delivery: "adsense-auto",
    desktop: "tam ekran",
    mobile: "tam ekran",
    label: "AdSense vinyet",
    autoFormat: "vignette",
    reserved: true,
  },
});

export function getAdSlotDefinition(slot) {
  return AD_SLOT_DEFINITIONS[slot] || null;
}

export function getAdSenseManualSlotId(slot) {
  return ADSENSE_MANUAL_SLOT_IDS[slot] || "";
}

export function isValidAdSenseClient(value = adRuntime.adsenseClient) {
  return /^ca-pub-\d{10,}$/.test(String(value || "").trim());
}

export function isAdSenseRuntimeReady() {
  return (
    ADSENSE_APPROVAL_UNLOCKED &&
    adRuntime.enabled &&
    adRuntime.provider === "adsense" &&
    isValidAdSenseClient()
  );
}
