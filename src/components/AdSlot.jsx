import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
const ADS_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;

export default function AdSlot({ enabled, slot, style }) {
  const { adsDisabled } = useAuth();
  
  console.log('AdSlot Debug:', { enabled, slot, adsDisabled, ADS_CLIENT });
  
  if (adsDisabled) return null;

  const pushedRef = useRef(false);
  const loc = useLocation();
  
  useEffect(() => {
    pushedRef.current = false; // route değişince yeniden dene
  }, [loc.pathname]);

  useEffect(() => {
    if (!enabled || !ADS_CLIENT || !slot) return;
    if (pushedRef.current) return;

    const t = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (_) {}
    }, 100);

    return () => clearTimeout(t);
  }, [enabled, slot, loc.pathname]);

  if (!enabled || !ADS_CLIENT || !slot) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", minHeight: 140, ...style }}
      data-ad-client={ADS_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
