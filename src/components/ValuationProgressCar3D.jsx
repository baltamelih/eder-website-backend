import { useEffect, useMemo, useState } from "react";
import "./valuation-progress-car-3d.css";

// EDER_03J20R1_REALISTIC_PRIMARY_3D_CAR
const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";
const REALISTIC_MODEL = "/models/eder-realistic-car.glb";

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
    const yaw = 42 - clamped * 18;
    return `${yaw}deg 72deg 108%`;
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
            src={REALISTIC_MODEL}
            alt=""
            loading="eager"
            reveal="auto"
            interaction-prompt="none"
            disable-zoom
            shadow-intensity="1.35"
            shadow-softness="0.82"
            exposure="0.72"
            camera-orbit={orbit}
            field-of-view="31deg"
            environment-image="neutral"
            onError={() => setFailed(true)}
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
