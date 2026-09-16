import React, { useMemo, useState } from "react";
import identityCar from "../assets/eder_audi_identity.svg";
import conditionCar from "../assets/eder_audi_condition.svg";

const panel = {
  background:
    "linear-gradient(180deg, rgba(12,16,22,0.98) 0%, rgba(10,13,18,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 28,
  boxShadow:
    "0 24px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
  overflow: "hidden",
  position: "relative",
  color: "#f4f1ea",
};

const gridBackground = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const caption = {
  color: "rgba(244,241,234,0.72)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const defaultConditionHotspots = [
  {
    id: "hood",
    title: "Kaput",
    status: "BOYALI",
    detail: "Ön bölümde sürtme sonrası komple boya işlemi.",
    extra: "Çarpışma kaydı · Tramer 18.000 TL",
    x: 28,
    y: 56,
    color: "#ffb347",
  },
  {
    id: "frontDoor",
    title: "Ön kapı",
    status: "LOKAL BOYA",
    detail: "Kapı alt bölümünde lokal boya düzeltmesi.",
    extra: "Yüzey işlemi · Panel doğrultma",
    x: 49,
    y: 51,
    color: "#ffd266",
  },
  {
    id: "roof",
    title: "Tavan",
    status: "ORİJİNAL",
    detail: "Üst panelde boya ve değişen işlemi yok.",
    extra: "Yapısal kayıt yok",
    x: 43,
    y: 34,
    color: "#b9d9c7",
  },
  {
    id: "rearFender",
    title: "Arka çamurluk",
    status: "DEĞİŞEN",
    detail: "Arka sağ bölüm parça değişimi ile işlem görmüş.",
    extra: "Parça değişimi kayıtlı",
    x: 69,
    y: 46,
    color: "#ff6b3d",
  },
];


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

  if (
    normalized.includes("compact") ||
    normalized.includes("progress") ||
    normalized.includes("valuation")
  ) {
    return "compact";
  }

  return "compact";
}

function StatusDot({ color }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        background: color,
        boxShadow: `0 0 0 4px ${color}22`,
        display: "inline-block",
      }}
    />
  );
}

function Hotspot({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      style={{
        position: "absolute",
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: "translate(-50%, -50%)",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        zIndex: 3,
      }}
      aria-label={`${item.title} ${item.status}`}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          display: "block",
          background: item.color,
          border: "3px solid rgba(255,255,255,0.9)",
          boxShadow: `0 0 0 ${active ? 10 : 7}px ${item.color}26`,
          transition: "all 160ms ease",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 18,
          top: -8,
          whiteSpace: "nowrap",
          background: "rgba(0,0,0,0.88)",
          color: "#f5f1ea",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "10px 12px",
          textAlign: "left",
          minWidth: 126,
          boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ display: "block", fontSize: 14, fontWeight: 800 }}>
          {item.title}
        </span>
        <span
          style={{
            display: "block",
            marginTop: 2,
            fontSize: 12,
            fontWeight: 800,
            color: item.color,
            letterSpacing: "0.04em",
          }}
        >
          {item.status}
        </span>
      </span>
    </button>
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

  return (
    <div style={{ ...panel, padding: 24 }}>
      <div style={{ ...gridBackground, position: "absolute", inset: 0, opacity: 0.88 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 52% 77%, rgba(255,107,61,0.18), transparent 24%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={caption}>EDER / VEHICLE IDENTITY</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 0,
            marginTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.09)",
            borderBottom: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                padding: "26px 18px",
                borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{ color: "#ff6b3d", fontSize: 18, fontWeight: 800, marginBottom: 8 }}
              >
                {row.label}
              </div>
              <div style={{ color: "rgba(244,241,234,0.62)", fontSize: 12, fontWeight: 800 }}>
                {row.name}
              </div>
              <div style={{ color: "#f7f5ef", fontSize: 18, fontWeight: 800, marginTop: 8 }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 16,
            borderRadius: 26,
            border: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
            minHeight: 465,
            overflow: "hidden",
          }}
        >
          <div style={{ ...gridBackground, position: "absolute", inset: 0, opacity: 0.45 }} />
          <img
            src={identityCar}
            alt="Audi benzeri premium araç kimlik görseli"
            style={{
              width: "66%",
              maxWidth: 520,
              minWidth: 300,
              position: "absolute",
              left: "50%",
              top: "55%",
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.35))",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 20,
              bottom: 20,
              maxWidth: 290,
              background: "rgba(0,0,0,0.82)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 14px 38px rgba(0,0,0,0.38)",
            }}
          >
            <div style={{ color: "#ff6b3d", fontSize: 13, fontWeight: 800, letterSpacing: "0.08em" }}>
              ARAÇ KİMLİĞİ
            </div>
            <div style={{ color: "#f7f5ee", fontSize: 20, fontWeight: 800, marginTop: 6 }}>
              Marka · model · yıl · versiyon eşleşmesi
            </div>
            <div style={{ color: "rgba(244,241,234,0.66)", fontSize: 14, marginTop: 6 }}>
              Sürükleyerek aracı incele
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionView(props) {
  const items = props.hotspots?.length ? props.hotspots : defaultConditionHotspots;
  const [activeId, setActiveId] = useState(items[0]?.id || null);
  const active = items.find((item) => item.id === activeId) || items[0];

  return (
    <div style={{ ...panel, padding: 24 }}>
      <div style={{ ...gridBackground, position: "absolute", inset: 0, opacity: 0.88 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 52% 64%, rgba(255,107,61,0.18), transparent 24%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={caption}>EDER / CONDITION MAP</div>
        <div
          style={{
            marginTop: 18,
            minHeight: 610,
            borderRadius: 26,
            border: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ ...gridBackground, position: "absolute", inset: 0, opacity: 0.5 }} />
          <img
            src={conditionCar}
            alt="Audi benzeri condition map araç görseli"
            style={{
              width: "74%",
              maxWidth: 760,
              minWidth: 380,
              position: "absolute",
              left: "50%",
              top: "47%",
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 22px 46px rgba(0,0,0,0.34))",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            {items.map((item) => (
              <Hotspot
                key={item.id}
                item={item}
                active={item.id === active.id}
                onClick={setActiveId}
              />
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 24,
              width: "min(340px, calc(100% - 48px))",
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,107,61,0.35)",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.38)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ color: "#ff7a48", fontSize: 13, fontWeight: 800, letterSpacing: "0.08em" }}>
                ÖRNEK KAYIT
              </div>
              <div style={{ color: active.color, fontSize: 13, fontWeight: 800, letterSpacing: "0.08em" }}>
                {active.status}
              </div>
            </div>
            <div style={{ color: "#f5f1ea", fontSize: 20, fontWeight: 800, marginTop: 8 }}>
              {active.title}
            </div>
            <div style={{ color: "rgba(244,241,234,0.72)", fontSize: 14, marginTop: 8 }}>
              {active.detail}
            </div>
            <div style={{ color: "#f5f1ea", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
              {active.extra}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 18,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                ["Orijinal", "#b9d9c7"],
                ["Boyalı", "#ffb347"],
                ["Lokal boya", "#ffd266"],
                ["Değişen", "#ff6b3d"],
              ].map(([label, color]) => (
                <span
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(244,241,234,0.8)",
                    fontSize: 12,
                  }}
                >
                  <StatusDot color={color} />
                  {label}
                </span>
              ))}
            </div>
            <div style={{ color: "rgba(244,241,234,0.48)", fontSize: 12 }}>
              Noktalar araca bağlıdır; araç döndürüldüğünde birlikte hareket eder.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactView() {
  return (
    <div
      style={{
        position: "relative",
        width: 112,
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto 12px 0 12px",
          height: 12,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(255,107,61,0.35), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <img
        src={conditionCar}
        alt="Premium araç görseli"
        style={{
          width: 94,
          transform: "translateY(2px)",
          filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.3))",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function ValuationProgressCar3D(props) {
  const mode = deriveMode(props);

  if (mode === "identity") {
    return <IdentityView {...props} />;
  }

  if (mode === "condition") {
    return <ConditionView {...props} />;
  }

  return <CompactView {...props} />;
}
