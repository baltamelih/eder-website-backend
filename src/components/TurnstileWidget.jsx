import { useEffect, useRef } from "react";
import "./turnstile.css";

const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim();
const SCRIPT_ID = "eder-turnstile-script";

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);

    if (existing) {
      const started = Date.now();
      const timer = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(timer);
          resolve(window.turnstile);
        } else if (Date.now() - started > 10000) {
          window.clearInterval(timer);
          reject(new Error("Güvenli doğrulama yüklenemedi"));
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("Güvenli doğrulama yüklenemedi"));
    document.head.appendChild(script);
  });
}

export default function TurnstileWidget({ onToken, onUnavailable, action = "" }) {
  const hostRef = useRef(null);
  const widgetIdRef = useRef(null);
  const tokenCallbackRef = useRef(onToken);
  const unavailableCallbackRef = useRef(onUnavailable);

  useEffect(() => {
    tokenCallbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    unavailableCallbackRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    let cancelled = false;

    if (!SITE_KEY) {
      tokenCallbackRef.current?.("");
      unavailableCallbackRef.current?.(
        "Güvenlik doğrulaması henüz yapılandırılmadı."
      );
      return undefined;
    }

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !hostRef.current) return;

        if (widgetIdRef.current !== null) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch {
            // no-op
          }
        }

        widgetIdRef.current = turnstile.render(hostRef.current, {
          sitekey: SITE_KEY,
          theme: "light",
          size: "flexible",
          appearance: "interaction-only",
          ...(action ? { action } : {}),
          callback: (token) => tokenCallbackRef.current?.(token || ""),
          "expired-callback": () => tokenCallbackRef.current?.(""),
          "timeout-callback": () => tokenCallbackRef.current?.(""),
          "error-callback": () => {
            tokenCallbackRef.current?.("");
            unavailableCallbackRef.current?.(
              "Güvenlik doğrulaması tamamlanamadı."
            );
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          tokenCallbackRef.current?.("");
          unavailableCallbackRef.current?.(
            "Güvenlik doğrulaması yüklenemedi."
          );
        }
      });

    return () => {
      cancelled = true;

      try {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch {
        // no-op
      } finally {
        widgetIdRef.current = null;
      }
    };
  }, [action]);

  if (!SITE_KEY) {
    return (
      <div className="eder-turnstile eder-turnstile--missing" role="status">
        Güvenlik doğrulaması yapılandırılıyor.
      </div>
    );
  }

  return (
    <div
      className="eder-turnstile"
      ref={hostRef}
      aria-label="Güvenlik doğrulaması"
    />
  );
}
