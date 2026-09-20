import { useEffect } from "react";

import {
  adRuntime,
  isAdSenseRuntimeReady,
} from "../../config/adSlots";

function isAdPreviewMode() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("adPreview") === "1";
}

export default function AdSenseRuntime() {
  useEffect(() => {
    if (import.meta.env.DEV || isAdPreviewMode()) return undefined;
    if (!isAdSenseRuntimeReady()) return undefined;

    const existing = document.querySelector(
      'script[data-eder-adsense-runtime="true"]',
    );

    if (existing) return undefined;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.ederAdsenseRuntime = "true";
    script.dataset.adClient = adRuntime.adsenseClient;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" +
      `?client=${encodeURIComponent(adRuntime.adsenseClient)}`;

    document.head.appendChild(script);

    return undefined;
  }, []);

  return null;
}
