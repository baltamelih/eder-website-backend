import { useEffect, useRef, useState } from "react";
import "./trust-vehicle-visual.css";

const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";

const PRIMARY_MODEL = "/models/eder-realistic-car.glb";
const FALLBACK_MODEL = "/media/eder/3d/eder-premium-sedan.glb";

function ensureModelViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();

  const existing = document.querySelector('script[data-eder-model-viewer="1"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      if (customElements.get("model-viewer")) return resolve();
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

const HOTSPOTS = [
  {
    key: "hood",
    label: "Kaput",
    state: "Boyalı",
    tone: "painted",
    position: "0m 0.66m 1.55m",
    normal: "0m 1m 0m",
    reason: "Ön bölümde sürtme sonrası komple boya işlemi.",
    record: "Çarpışma kaydı · Tramer 18.000 TL",
  },
  {
    key: "roof",
    label: "Tavan",
    state: "Orijinal",
    tone: "clean",
    position: "0m 1.08m 0.18m",
    normal: "0m 1m 0m",
    reason: "Boya veya parça değişim kaydı görünmüyor.",
    record: "Orijinal yüzey",
  },
  {
    key: "door",
    label: "Ön kapı",
    state: "Lokal boya",
    tone: "local",
    position: "-1.18m 0.58m 0.30m",
    normal: "-1m 0m 0m",
    reason: "Dar alandaki çizik ve sürtme sonrası lokal boya.",
    record: "Kozmetik işlem · parça değişimi yok",
  },
  {
    key: "fender",
    label: "Arka çamurluk",
    state: "Değişen",
    tone: "changed",
    position: "1.10m 0.54m -1.28m",
    normal: "1m 0m 0m",
    reason: "Arka bölüm çarpışması sonrası parça değişimi.",
    record: "Parça değişimi · hasar kaydı mevcut",
  },
];

export default function TrustVehicleVisual({ mode = "identity" }) {
  const viewerRef = useRef(null);
  const [ready, setReady] = useState(() => Boolean(customElements.get("model-viewer")));
  const [failed, setFailed] = useState(false);
  const [modelSrc, setModelSrc] = useState(PRIMARY_MODEL);
  const [activeHotspot, setActiveHotspot] = useState("hood");

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

  const activeDetail = HOTSPOTS.find((item) => item.key === activeHotspot) ?? HOTSPOTS[0];
  const conditionMode = mode === "condition";

  return (
    <div
      className={`trust-vehicle trust-vehicle--${mode}`}
      aria-label={conditionMode ? "Örnek araç kondisyon görselleştirmesi" : "Araç kimliği 3D görselleştirmesi"}
    >
      <div className="trust-vehicle__studio">
        {ready && !failed ? (
          <model-viewer
            ref={viewerRef}
            src={modelSrc}
            alt="Gerçekçi premium 3D araç"
            loading="eager"
            reveal="auto"
            interaction-prompt="none"
            camera-controls
            disable-pan
            disable-zoom
            auto-rotate={conditionMode ? undefined : true}
            rotation-per-second="5deg"
            shadow-intensity="1.25"
            shadow-softness="0.9"
            exposure="1.02"
            camera-target={modelSrc === PRIMARY_MODEL ? "0m 0.50m 0.24m" : "0m 0.82m 0m"}
            camera-orbit={conditionMode ? "-35deg 70deg 110%" : "38deg 70deg 110%"}
            field-of-view="29deg"
            min-field-of-view="24deg"
            max-field-of-view="34deg"
            min-camera-orbit="auto auto 92%"
            max-camera-orbit="auto auto 138%"
            environment-image="neutral"
            onError={() => {
              if (modelSrc === PRIMARY_MODEL) {
                setModelSrc(FALLBACK_MODEL);
              } else {
                setFailed(true);
              }
            }}
          >
            {conditionMode
              ? HOTSPOTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    slot={`hotspot-${item.key}`}
                    data-position={item.position}
                    data-normal={item.normal}
                    className={`trust-vehicle__hotspot is-${item.tone} ${activeHotspot === item.key ? "is-active" : ""}`}
                    aria-label={`${item.label}: ${item.state}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveHotspot(item.key);
                    }}
                  >
                    <i />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.state}</small>
                    </span>
                  </button>
                ))
              : null}
          </model-viewer>
        ) : (
          <div className="trust-vehicle__fallback">
            <span />
            <strong>3D araç hazırlanıyor</strong>
          </div>
        )}

        {mode === "identity" ? (
          <>
            <div className="trust-vehicle__scan" />
            <div className="trust-vehicle__identity-label">
              <span>ARAÇ KİMLİĞİ</span>
              <strong>Marka · model · yıl · versiyon eşleşmesi</strong>
              <small>Sürükleyerek aracı incele</small>
            </div>
          </>
        ) : (
          <div className={`trust-vehicle__detail is-${activeDetail.tone}`} aria-live="polite">
            <div className="trust-vehicle__detail-head">
              <span>ÖRNEK KAYIT</span>
              <b>{activeDetail.state}</b>
            </div>
            <strong>{activeDetail.label}</strong>
            <p>{activeDetail.reason}</p>
            <small>{activeDetail.record}</small>
          </div>
        )}
      </div>

      {conditionMode ? (
        <div className="trust-vehicle__legend">
          <span><i className="is-clean" /> Orijinal</span>
          <span><i className="is-painted" /> Boyalı</span>
          <span><i className="is-local" /> Lokal boya</span>
          <span><i className="is-changed" /> Değişen</span>
          <em>Noktalar araca bağlıdır; aracı döndürdüğünde birlikte hareket eder.</em>
        </div>
      ) : null}
    </div>
  );
}
