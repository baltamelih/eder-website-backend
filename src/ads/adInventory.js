import { ADSENSE_APPROVAL_UNLOCKED } from "../config/adSlots";

export const ADSENSE_CLIENT_ID =
  import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-7415512901536849";

export const MANUAL_ADS_ENABLED =
  ADSENSE_APPROVAL_UNLOCKED &&
  String(import.meta.env.VITE_ADSENSE_MANUAL_ENABLED || "false").toLowerCase() === "true";

export const DISPLAY_SLOT = String(
  import.meta.env.VITE_ADSENSE_SLOT_DISPLAY || ""
).trim();

export const MULTIPLEX_SLOT = String(
  import.meta.env.VITE_ADSENSE_SLOT_MULTIPLEX || ""
).trim();

export const ROUTE_POLICY = Object.freeze({
  excludedPrefixes: [
    "/valuation",
    "/login",
    "/register",
    "/account",
    "/settings",
    "/privacy",
    "/terms",
    "/delete-account",
    "/reset-password",
    "/forgot-password",
  ],
  // Aggressive, but in-flow only and intentionally separated from controls.
  home: { maxDisplayUnits: 3, mode: "sections" },
  blogIndex: { maxDisplayUnits: 4, mode: "sections" },
  blogPost: { maxDisplayUnits: 6, mode: "article" },
  faq: { maxDisplayUnits: 3, mode: "sections" },
  genericPublic: { maxDisplayUnits: 2, mode: "sections" },
});

export function routeKind(pathname) {
  const path = pathname || "/";
  if (ROUTE_POLICY.excludedPrefixes.some((prefix) => path === prefix || path.startsWith(prefix + "/"))) {
    return "excluded";
  }
  if (path === "/") return "home";
  if (path === "/blog") return "blogIndex";
  if (path.startsWith("/blog/")) return "blogPost";
  if (path === "/faq" || path.startsWith("/faq/")) return "faq";
  return "genericPublic";
}
