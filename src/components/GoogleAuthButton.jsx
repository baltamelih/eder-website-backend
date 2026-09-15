import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { setAuthTokens } from "../services/auth";
import { useAuth } from "../services/AuthContext";
import "./google-auth-button.css";

// EDER_03F2B_V1_3_EXACT_GOOGLE_AUTH
const GIS_SCRIPT_ID = "eder-google-identity-services";
const GIS_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleIdentityServices() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existing = document.getElementById(GIS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google giriş servisi yüklenemedi.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google giriş servisi yüklenemedi."));
    document.head.appendChild(script);
  });
}

export default function GoogleAuthButton({ mode = "login" }) {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshMe } = useAuth();

  const [state, setState] = useState({
    loading: true,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        setState({ loading: true, error: "" });

        const [google, config] = await Promise.all([
          loadGoogleIdentityServices(),
          apiFetch("/api/auth/google/config"),
        ]);

        if (cancelled) return;

        const clientId = String(config?.client_id || "").trim();
        if (!clientId) {
          throw new Error("Google web istemci kimliği yapılandırılmamış.");
        }

        google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (response) => {
            try {
              const credential = String(response?.credential || "").trim();
              if (!credential) {
                throw new Error("Google kimlik bilgisi alınamadı.");
              }

              const data = await apiFetch("/api/auth/google", {
                method: "POST",
                body: JSON.stringify({ id_token: credential }),
              });

              if (!data?.token) {
                throw new Error("Google oturumu oluşturulamadı.");
              }

              setAuthTokens(data.token, data.refresh_token || null);
              await refreshMe?.();

              const params = new URLSearchParams(window.location.search);
              const requestedNext = params.get("next");
              const routeStateFrom = location.state?.from;
              const destination =
                (typeof requestedNext === "string" && requestedNext.startsWith("/")
                  ? requestedNext
                  : null) ||
                (typeof routeStateFrom === "string" && routeStateFrom.startsWith("/")
                  ? routeStateFrom
                  : null) ||
                "/app/dashboard";

              navigate(destination, { replace: true });
            } catch (error) {
              setState({
                loading: false,
                error: error?.message || "Google ile giriş tamamlanamadı.",
              });
            }
          },
        });

        if (!buttonRef.current) return;

        buttonRef.current.innerHTML = "";
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "register" ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.min(420, Math.max(280, buttonRef.current.clientWidth || 360)),
        });

        setState({ loading: false, error: "" });
      } catch (error) {
        if (cancelled) return;
        setState({
          loading: false,
          error: error?.message || "Google ile giriş hazırlanamadı.",
        });
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, [location.state, mode, navigate, refreshMe]);

  return (
    <div className="eder-google-auth">
      <div className="eder-google-auth__head">
        <span>{mode === "register" ? "HIZLI KAYIT" : "HIZLI GİRİŞ"}</span>
        <strong>
          {mode === "register"
            ? "Google hesabınla saniyeler içinde başla"
            : "Google hesabınla güvenli şekilde devam et"}
        </strong>
      </div>

      <div
        ref={buttonRef}
        className={`eder-google-auth__button-shell${state.loading ? " is-loading" : ""}`}
        aria-busy={state.loading}
      >
        {state.loading ? <span>Google hazırlanıyor...</span> : null}
      </div>

      {state.error ? (
        <p className="eder-google-auth__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="eder-google-auth__divider" aria-hidden>
        <span />
        <small>veya e-posta ile</small>
        <span />
      </div>
    </div>
  );
}
