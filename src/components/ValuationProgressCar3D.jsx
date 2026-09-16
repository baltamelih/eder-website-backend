import { useEffect, useMemo, useState } from "react";
import "./valuation-progress-car-3d.css";

const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";
const AUDI_MODEL = "/models/eder-audi-r8.glb";

const CONDITION_POINTS = [
  {
    id: "hood",
    title: "Kaput",
    status: "BOYALI",
    detail: "Ön bölümde sürtme sonrası komple boya işlemi.",
    extra: "Çarpışma kaydı · Tramer 18.000 TL",
    color: "#ffb347",
    position: "0m 0.78m 1.55m",
    normal: "0m 1m 0m",
  },
  {
    id: "front-door",
    title: "Ön kapı",
    status: "LOKAL BOYA",
    detail: "Kapı alt bölümünde lokal boya düzeltmesi.",
    extra: "Yüzey işlemi · Panel doğrultma",
    color: "#ffd266",
    position: "-0.92m 0.78m 0.25m",
    normal: "-1m 0m 0m",
  },
  {
    id: "roof",
    title: "Tavan",
    status: "ORİJİNAL",
    detail: "Üst panelde boya ve değişen işlemi yok.",
    extra: "Yapısal kayıt yok",
    color: "#a9d2bd",
    position: "0m 1.32m 0m",
    normal: "0m 1m 0m",
  },
  {
    id: "rear-fender",
    title: "Arka çamurluk",
    status: "DEĞİŞEN",
    detail: "Arka sağ bölüm parça değişimi ile işlem görmüş.",
    extra: "Parça değişimi kayıtlı",
    color: "#ff6b3d",
    position: "0.92m 0.72m -1.42m",
    normal: "1m 0m 0m",
  },
];

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

function deriveMode(props) {
  const raw =
    props.mode ||
    props.variant ||
    props.scene ||
    props.stage ||
    props.view ||
    props.type ||
    "";

  const normalized = String(raw).toLowerCase();

  if (
    normalized.includes("condition") ||
    normalized.includes("damage") ||
    normalized.includes("body") ||
    normalized.includes("map") ||
    props.showHotspots ||
    props.damageMap ||
    props.hotspots
  ) {
    return "condition";
  }

  if (
    normalized.includes("identity") ||
    normalized.includes("vehicle") ||
    normalized.includes("intro") ||
    props.identitySummary ||
    props.selectedMake ||
    props.selectedModel
  ) {
    return "identity";
  }

  return "compact";
}

function LoadingCar() {
  return (
    <div className="valuation-real-audi__loading" aria-hidden>
      <span />
      <b>3D araç hazırlanıyor</b>
    </div>
  );
}

function AudiViewer({
  className = "",
  children = null,
  interactive = true,
  autoRotate = false,
  orbit = "38deg 70deg 108%",
  fieldOfView = "29deg",
  onLoad,
}) {
  return (
    <model-viewer
      className={`valuation-real-audi__viewer ${className}`.trim()}
      src={AUDI_MODEL}
      alt="Gerçekçi Audi R8 3D araç modeli"
      loading="eager"
      reveal="auto"
      interaction-prompt="none"
      camera-controls={interactive ? true : undefined}
      disable-zoom
      auto-rotate={autoRotate ? true : undefined}
      rotation-per-second="8deg"
      camera-orbit={orbit}
      field-of-view={fieldOfView}
      shadow-intensity="1.35"
      shadow-softness="0.82"
      exposure="0.92"
      environment-image="neutral"
      onLoad={onLoad}
    >
      {children}
    </model-viewer>
  );
}

function IdentityView(props) {
  const rows = useMemo(
    () => [
      { label: "01", name: "MARKA", value: props.selectedMake || "Seçildi" },
      { label: "02", name: "MODEL", value: props.selectedModel || "Seçildi" },
      { label: "03", name: "YIL", value: props.selectedYear || "Seçildi" },
      { label: "04", name: "VERSİYON", value: props.selectedTrim || "Seçildi" },
    ],
    [props.selectedMake, props.selectedModel, props.selectedYear, props.selectedTrim]
  );

  const [loaded, setLoaded] = useState(false);

  return (
    <div className="valuation-real-audi valuation-real-audi--identity">
      <div className="valuation-real-audi__eyebrow">EDER / VEHICLE IDENTITY</div>

      <div className="valuation-real-audi__identity-grid">
        {rows.map((row) => (
          <div key={row.label} className="valuation-real-audi__identity-cell">
            <span>{row.label}</span>
            <small>{row.name}</small>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="valuation-real-audi__stage">
        {!loaded && <LoadingCar />}
        <AudiViewer
          className="valuation-real-audi__viewer--identity"
          interactive
          autoRotate
          orbit="36deg 68deg 112%"
          fieldOfView="28deg"
          onLoad={() => setLoaded(true)}
        />
        <div className="valuation-real-audi__identity-note">
          <span>ARAÇ KİMLİĞİ</span>
          <strong>Marka · model · yıl · versiyon eşleşmesi</strong>
          <small>Sürükleyerek gerçek 3D aracı incele</small>
        </div>
      </div>
    </div>
  );
}

function ConditionHotspot({ item, active, onClick }) {
  return (
    <button
      type="button"
      slot={`hotspot-${item.id}`}
      data-position={item.position}
      data-normal={item.normal}
      className={`valuation-real-audi__hotspot${active ? " is-active" : ""}`}
      style={{ "--hotspot-color": item.color }}
      onClick={() => onClick(item.id)}
      aria-label={`${item.title} ${item.status}`}
    >
      <span className="valuation-real-audi__hotspot-dot" />
      <span className="valuation-real-audi__hotspot-label">
        <b>{item.title}</b>
        <em>{item.status}</em>
      </span>
    </button>
  );
}

function ConditionView(props) {
  const items = props.hotspots?.length ? props.hotspots : CONDITION_POINTS;
  const [activeId, setActiveId] = useState(items[0]?.id || null);
  const [loaded, setLoaded] = useState(false);
  const active = items.find((item) => item.id === activeId) || items[0];

  return (
    <div className="valuation-real-audi valuation-real-audi--condition">
      <div className="valuation-real-audi__eyebrow">EDER / CONDITION MAP</div>

      <div className="valuation-real-audi__stage valuation-real-audi__stage--condition">
        {!loaded && <LoadingCar />}

        <AudiViewer
          className="valuation-real-audi__viewer--condition"
          interactive
          orbit="42deg 68deg 116%"
          fieldOfView="31deg"
          onLoad={() => setLoaded(true)}
        >
          {items.map((item) => (
            <ConditionHotspot
              key={item.id}
              item={item}
              active={item.id === active.id}
              onClick={setActiveId}
            />
          ))}
        </AudiViewer>

        {active && (
          <div className="valuation-real-audi__record">
            <div className="valuation-real-audi__record-top">
              <span>ÖRNEK KAYIT</span>
              <em style={{ color: active.color }}>{active.status}</em>
            </div>
            <strong>{active.title}</strong>
            <p>{active.detail}</p>
            <b>{active.extra}</b>
          </div>
        )}
      </div>

      <div className="valuation-real-audi__legend">
        {[
          ["Orijinal", "#a9d2bd"],
          ["Boyalı", "#ffb347"],
          ["Lokal boya", "#ffd266"],
          ["Değişen", "#ff6b3d"],
        ].map(([label, color]) => (
          <span key={label}>
            <i style={{ background: color }} />
            {label}
          </span>
        ))}
        <small>Noktalar 3D araca bağlıdır; araç döndüğünde birlikte hareket eder.</small>
      </div>
    </div>
  );
}

function CompactView({ progress = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const railPosition = 7 + clamped * 86;

  return (
    <div
      className="valuation-real-audi__compact"
      aria-hidden
      style={{ "--eder-audi-progress": `${railPosition}%` }}
    >
      {!loaded && <span className="valuation-real-audi__compact-placeholder" />}
      <AudiViewer
        className="valuation-real-audi__viewer--compact"
        interactive={false}
        orbit="34deg 70deg 106%"
        fieldOfView="32deg"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function ValuationProgressCar3D(props) {
  const [viewerReady, setViewerReady] = useState(
    Boolean(customElements.get("model-viewer"))
  );

  useEffect(() => {
    let active = true;

    ensureModelViewer()
      .then(() => {
        if (active) setViewerReady(true);
      })
      .catch(() => {
        if (active) setViewerReady(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const mode = deriveMode(props);

  // Keep the compact rail node mounted immediately. model-viewer upgrades
  // the custom element in-place once its module is registered.
  if (mode === "compact") return <CompactView progress={props.progress} />;
  if (!viewerReady) return <LoadingCar />;

  if (mode === "identity") return <IdentityView {...props} />;
  if (mode === "condition") return <ConditionView {...props} />;
  return <CompactView progress={props.progress} />;
}
