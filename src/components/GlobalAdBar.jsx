import { Card } from "antd";
import { useLocation, matchPath } from "react-router-dom";
import FreeOnly from "./FreeOnly";
import AdSlot from "./AdSlot";

const SLOT_GLOBAL = import.meta.env.VITE_ADS_SLOT_GLOBAL;

/**
 * AdSense policy-safe:
 * - Only show ads on content-heavy public pages.
 * - Never show on auth, app, valuation, or utility pages.
 */
function shouldShowGlobalAd(pathname) {
  // Hard deny list (explicit)
  const denyPrefixes = [
    "/",           // Ana sayfayı da engelle
    "/login",
    "/register",
    "/pricing",    // Zaten var, pricing engellenmiş
    "/support",
    "/privacy",
    "/terms",
    "/contact",
    "/faq",
    "/valuation",
    "/dashboard",
    "/account",
    "/settings",
    "/app",
    "/admin",
  ];

  if (denyPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return false;
  }

  // Allow list (sadece blog kalsın)
  if (pathname === "/blog") return true;

  // Allow blog post routes: /blog/:slug
  const isBlogPost = matchPath({ path: "/blog/:slug", end: true }, pathname);
  if (isBlogPost) return true;

  return false;
}

export default function GlobalAdBar() {
  const { pathname } = useLocation();

  // Slot missing -> don't render anything
  if (!SLOT_GLOBAL) return null;

  // Policy-safe routing
  if (!shouldShowGlobalAd(pathname)) return null;

  return (
    <FreeOnly>
      <div style={{ marginTop: 16 }}>
        <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 12 }}>
          <AdSlot enabled slot={SLOT_GLOBAL} style={{ minHeight: 120 }} />
        </Card>
      </div>
    </FreeOnly>
  );
}
