import { useEffect, useMemo, useState } from "react";
import "./valuation-progress-car-3d.css";

const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";

const PRIMARY_MODEL = "/models/eder-realistic-car.glb";
const FALLBACK_MODEL = "/media/eder/3d/eder-premium-sedan.glb";

function ensureModelViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();

  const existing = document.querySelector('script[data-eder-model-viewer="1"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      if (customElements.get("model-viewer")) {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SRC;
    script.dataset.ederModelViewer = "1";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function ValuationProgressCar3D({ progress = 0 }) {
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const [ready, setReady] = useState(Boolean(customElements.get("model-viewer")));
  const [modelSrc, setModelSrc] = useState(PRIMARY_MODEL);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    ensureModelViewer()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const orbit = useMemo(() => {
    const yaw = 38 - clamped * 16;
    return `${yaw}deg 70deg 108%`;
  }, [clamped]);

  return (
    <div
      className="valuation-car3d"
      style={{ "--eder-progress": `${clamped * 100}%` }}
      aria-hidden
    >
      <div className="valuation-car3d__glow" />

      <div className="valuation-car3d__model">
        {ready && !failed ? (
          <model-viewer
            src={modelSrc}
            alt=""
            loading="eager"
            reveal="auto"
            interaction-prompt="none"
            disable-zoom
            shadow-intensity="1.35"
            shadow-softness="0.82"
            exposure="0.92"
            camera-target={modelSrc === PRIMARY_MODEL ? "0m 0.50m 0.24m" : "0m 0.82m 0m"}
            camera-orbit={orbit}
            field-of-view="31deg"
            environment-image="neutral"
            onError={() => {
              if (modelSrc === PRIMARY_MODEL) {
                setModelSrc(FALLBACK_MODEL);
              } else {
                setFailed(true);
              }
            }}
          />
        ) : (
          <div className="valuation-car3d__fallback">
            <span />
            <i />
            <b />
          </div>
        )}
      </div>
    </div>
  );
}
