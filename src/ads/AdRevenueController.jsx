import { useEffect } from "react";
import {
  ADSENSE_CLIENT_ID,
  DISPLAY_SLOT,
  MANUAL_ADS_ENABLED,
  MULTIPLEX_SLOT,
  ROUTE_POLICY,
  routeKind,
} from "./adInventory";
import "./adRevenue.css";

const MANAGED_SELECTOR = "[data-eder-manual-ad='true']";
const CONTROL_SELECTOR =
  "form,button,input,select,textarea,[role='button'],[data-turnstile],.cf-turnstile";

function pushAdsense() {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch {
    // Ad blockers/no-fill must never break EDER.
  }
}

function buildUnit(slot, { multiplex = false, article = false } = {}) {
  if (!slot) return null;

  const wrapper = document.createElement("aside");
  wrapper.dataset.ederManualAd = "true";
  wrapper.setAttribute("aria-label", "Reklam");
  wrapper.className = [
    "eder-manual-ad",
    article ? "eder-manual-ad--article" : "",
    multiplex ? "eder-manual-ad--multiplex" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = document.createElement("div");
  inner.className = "eder-manual-ad__inner";

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.style.display = "block";
  ins.dataset.adClient = ADSENSE_CLIENT_ID;
  ins.dataset.adSlot = slot;

  if (multiplex) {
    ins.dataset.adFormat = "autorelaxed";
  } else {
    ins.dataset.adFormat = "auto";
    ins.dataset.fullWidthResponsive = "true";
  }

  inner.appendChild(ins);
  wrapper.appendChild(inner);
  return wrapper;
}

function isSafeTarget(node) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.matches(CONTROL_SELECTOR) || node.querySelector(CONTROL_SELECTOR)) return false;
  const rect = node.getBoundingClientRect();
  return rect.height >= 48;
}

function injectAfter(node, unit) {
  if (!node || !unit || !node.parentNode) return false;
  node.parentNode.insertBefore(unit, node.nextSibling);
  pushAdsense();
  return true;
}

function candidateSections() {
  const main = document.querySelector("main") || document.querySelector("#root");
  if (!main) return [];
  return Array.from(main.querySelectorAll(":scope > section, :scope > div > section")).filter(isSafeTarget);
}

function injectSectionAds(maxUnits) {
  const sections = candidateSections();
  if (!sections.length) return 0;

  const preferred = [1, 3, 5, 7, 9];
  let inserted = 0;
  for (const idx of preferred) {
    if (inserted >= maxUnits) break;
    const target = sections[idx];
    if (target && injectAfter(target, buildUnit(DISPLAY_SLOT))) {
      inserted += 1;
    }
  }
  return inserted;
}

function articleRoot() {
  return (
    document.querySelector("article") ||
    document.querySelector("[data-blog-post]") ||
    document.querySelector("main")
  );
}

function injectArticleAds(maxUnits) {
  const article = articleRoot();
  if (!article) return 0;

  const paragraphs = Array.from(article.querySelectorAll("p")).filter((p) => {
    if (!isSafeTarget(p)) return false;
    const text = (p.textContent || "").trim();
    return text.length >= 120;
  });

  // Aggressive inventory with meaningful editorial spacing.
  const paragraphIndexes = [3, 7, 11, 16, 22, 29];
  let inserted = 0;

  for (const idx of paragraphIndexes) {
    if (inserted >= maxUnits) break;
    const target = paragraphs[idx];
    if (target && injectAfter(target, buildUnit(DISPLAY_SLOT, { article: true }))) {
      inserted += 1;
    }
  }

  if (MULTIPLEX_SLOT && article.parentNode) {
    const multiplex = buildUnit(MULTIPLEX_SLOT, {
      multiplex: true,
      article: true,
    });
    if (multiplex) {
      article.parentNode.insertBefore(multiplex, article.nextSibling);
      pushAdsense();
    }
  }

  return inserted;
}

function markProtectedVignetteLinks() {
  const protectedPrefixes = [
    "/valuation",
    "/login",
    "/register",
    "/account",
    "/settings",
  ];

  document.querySelectorAll("a[href]").forEach((link) => {
    try {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      if (
        url.origin === window.location.origin &&
        protectedPrefixes.some(
          (prefix) => url.pathname === prefix || url.pathname.startsWith(prefix + "/")
        )
      ) {
        link.setAttribute("data-google-vignette", "false");
      }
    } catch {
      // Ignore malformed/external href values.
    }
  });
}

function clearManagedAds() {
  document.querySelectorAll(MANAGED_SELECTOR).forEach((node) => node.remove());
}

function installHistorySignal() {
  if (window.__ederAdHistoryInstalled) return;
  window.__ederAdHistoryInstalled = true;

  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function patchedHistory(...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event("eder:navigation"));
      return result;
    };
  }
}

function applyInventory() {
  clearManagedAds();
  markProtectedVignetteLinks();

  if (!MANUAL_ADS_ENABLED || !DISPLAY_SLOT) return;

  const kind = routeKind(window.location.pathname);
  if (kind === "excluded") return;

  const policy = ROUTE_POLICY[kind] || ROUTE_POLICY.genericPublic;

  if (policy.mode === "article") {
    injectArticleAds(policy.maxDisplayUnits);
  } else {
    injectSectionAds(policy.maxDisplayUnits);
  }
}

export default function AdRevenueController() {
  useEffect(() => {
    installHistorySignal();

    let timer = null;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(applyInventory, 450);
    };

    schedule();
    window.addEventListener("popstate", schedule);
    window.addEventListener("eder:navigation", schedule);

    const observer = new MutationObserver(() => {
      // Only refresh if the route has rendered but our units are absent.
      if (
        MANUAL_ADS_ENABLED &&
        DISPLAY_SLOT &&
        !document.querySelector(MANAGED_SELECTOR)
      ) {
        schedule();
      }
    });
    observer.observe(document.getElementById("root") || document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("popstate", schedule);
      window.removeEventListener("eder:navigation", schedule);
      clearManagedAds();
    };
  }, []);

  return null;
}
