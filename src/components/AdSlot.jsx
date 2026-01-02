import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const ADS_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;

export default function AdSlot({ enabled = true, slot, style }) {
  const { adsDisabled } = useAuth();
  const loc = useLocation();

  // ✅ Hook order safe: return-null check AFTER hooks are declared
  const canRender = useMemo(() => {
    if (adsDisabled) return false;
    if (!enabled) return false;
    if (!ADS_CLIENT) return false;
    if (!slot) return false;
    return true;
  }, [adsDisabled, enabled, slot]);

  const pushedRef = useRef(false);
  const insRef = useRef(null);

  // Debug sadece dev’de
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("AdSlot Debug:", {
        enabled,
        slot,
        adsDisabled,
        ADS_CLIENT,
        pathname: loc.pathname,
      });
    }
  }, [enabled, slot, adsDisabled, loc.pathname]);

  // route değişince yeniden dene
  useEffect(() => {
    pushedRef.current = false;
  }, [loc.pathname]);

  useEffect(() => {
    if (!canRender) return;
    if (pushedRef.current) return;

    const t = setTimeout(() => {
      try {
        // ✅ Aynı ins içine tekrar push etmeyi azalt
        const ins = insRef.current;
        if (!ins) return;

        // Eğer daha önce doldurulduysa tekrar push etme
        // (Google bazen içine iframe/script ekliyor)
        if (ins.getAttribute("data-adsbygoogle-status") === "done") {
          pushedRef.current = true;
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (_) {
        // sessiz geç
      }
    }, 150);

    return () => clearTimeout(t);
  }, [canRender, slot, loc.pathname]);

  if (!canRender) return null;

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block", minHeight: 140, ...style }}
      data-ad-client={ADS_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
