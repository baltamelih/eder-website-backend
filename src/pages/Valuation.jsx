import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Divider, Input, Row, Select, Space, Steps, Typography, Switch, message } from "antd";
import { motion } from "framer-motion";
import {
  Calculator,
  Car,
  Calendar,
  Gauge,
  TrendingUp,
  Target,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Paintbrush,
  Wrench,
} from "lucide-react";
import TurnstileWidget from "../components/TurnstileWidget";
import { MetaTags } from "../components/MetaTags";
import { valuationApi } from "../services/valuationApi";
import { UserCarsAPI } from "../services/userCars";
import ValuationFeedbackPanel from "../components/ValuationFeedbackPanel";
import carDamageImage from "../assets/car_damage.png";
import "./Valuation.css";

import ValuationProgressCar3D from "../components/ValuationProgressCar3D";
const { Title, Paragraph, Text } = Typography;

// EDER_03F1_V2_PRODUCT_FLOW_RECOVERY
const formatTL = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `${Math.round(number).toLocaleString("tr-TR")} TL`;
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// Flutter enum: none -> changed -> painted -> localPainted
const DAMAGE_STATES = ["none", "changed", "painted", "localPainted"];
const damageStateLabel = (s) =>
  s === "none" ? "Temiz" : s === "changed" ? "Değişen" : s === "painted" ? "Boyalı" : "Lokal Boyalı";


// Flutter’daki DamageSpot listesi (id + x,y)


function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function StepHeader({ step, total, title, subtitle }) {
  const percent = clamp01(step / total) * 100;

  return (
    <motion.section
      className="valuation-progress"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      aria-label="Değerleme ilerlemesi"
    >
      <motion.div className="valuation-progress__top" variants={fadeUp} custom={0}>
        <div className="valuation-progress__mark" aria-hidden>
          <Calculator size={21} />
        </div>

        <div className="valuation-progress__copy">
          <span>EDER DEĞERLEME AKIŞI</span>
          <strong>{title}</strong>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="valuation-progress__counter">
          <span>ADIM</span>
          <strong>{String(step).padStart(2, "0")}</strong>
          <em>/ {String(total).padStart(2, "0")}</em>
        </div>
      </motion.div>

      <motion.div
        className="valuation-progress__rail valuation-progress__rail--3d"
        variants={fadeUp}
        custom={1}
      >
        <div
          className="valuation-progress__fill"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
        {/* EDER_03F4_CINEMATIC_HERO_3D_PROGRESS */}
        <ValuationProgressCar3D progress={percent / 100} />
      </motion.div>
    </motion.section>
  );
}

function ChipGroup({ label, value, options, onChange }) {
  return (
    <div className="valuation-chip-group">
      <Text className="valuation-field-label">{label}</Text>
      <div className="valuation-chip-list" role="group" aria-label={label}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              className={`valuation-chip ${selected ? "is-selected" : ""}`}
              aria-pressed={selected}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Hasar noktaları - car_damage.png görselindeki gerçek konumlara göre
const SPOTS = [
  // Ön tampon ve ön kısım
  { id: "front_bumper", x: 50, y: 85 },
  { id: "hood", x: 50, y: 65 },

  // Sol taraf (üstten bakış) - x koordinatları sağda
  { id: "left_front_fender", x: 75, y: 72 },
  { id: "left_front_door", x: 75, y: 55 },
  { id: "left_rear_door", x: 75, y: 38 },
  { id: "left_rear_fender", x: 75, y: 22 },

  // Sağ taraf (üstten bakış) - x koordinatları solda
  { id: "right_front_fender", x: 25, y: 72 },
  { id: "right_front_door", x: 25, y: 55 },
  { id: "right_rear_door", x: 25, y: 38 },
  { id: "right_rear_fender", x: 25, y: 22 },

  // Arka kısım
  { id: "rear_bumper", x: 50, y: 15 },
  { id: "trunk", x: 50, y: 28 },

  // Tavan
  { id: "roof", x: 50, y: 45 }
];

// Spot labels güncellendi
const spotLabels = {
  front_bumper: "Ön Tampon",
  hood: "Kaput",
  left_front_fender: "Sol Ön Çamurluk",
  left_front_door: "Sol Ön Kapı",
  left_rear_door: "Sol Arka Kapı",
  left_rear_fender: "Sol Arka Çamurluk",
  right_front_fender: "Sağ Ön Çamurluk",
  right_front_door: "Sağ Ön Kapı",
  right_rear_door: "Sağ Arka Kapı",
  right_rear_fender: "Sağ Arka Çamurluk",
  rear_bumper: "Arka Tampon",
  trunk: "Bagaj",
  roof: "Tavan"
};

const DEFAULT_PRESET = {};

function DamageMap({ damageMap, setDamageMap }) {
  const [hovered, setHovered] = useState(null);

  const onTap = (id) => {
    setDamageMap((prev) => {
      const cur = prev[id] ?? DEFAULT_PRESET[id] ?? "none";
      const idx = DAMAGE_STATES.indexOf(cur);
      const next = DAMAGE_STATES[(idx + 1) % DAMAGE_STATES.length];
      return { ...prev, [id]: next };
    });
  };

  const getDamageLabel = (state) => {
    if (state === "changed") return "D";
    if (state === "painted") return "B";
    if (state === "localPainted") return "LB";
    return "•";
  };

  const getDamageStyle = (state) => {
    switch (state) {
      case "changed":
        return {
          ring: "#ef4444",
          bg: "rgba(239,68,68,0.16)",
          text: "#ef4444",
          glow: "rgba(239,68,68,0.22)",
        };
      case "painted":
        return {
          ring: "#3b82f6",
          bg: "rgba(59,130,246,0.16)",
          text: "#3b82f6",
          glow: "rgba(59,130,246,0.22)",
        };
      case "localPainted":
        return {
          ring: "#f59e0b",
          bg: "rgba(245,158,11,0.18)",
          text: "#f59e0b",
          glow: "rgba(245,158,11,0.22)",
        };
      default:
        return {
          ring: "#22c55e",
          bg: "rgba(34,197,94,0.12)",
          text: "#22c55e",
          glow: "rgba(34,197,94,0.18)",
        };
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        aspectRatio: "1 / 1.1",
        borderRadius: 28,
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        border: "1px solid rgba(148,163,184,0.22)",
        boxShadow: "0 10px 34px rgba(15,23,42,0.10)",
        overflow: "hidden",
        padding: 18,
      }}
    >
      {/* Arka plan görseli */}
      <div
        style={{
          position: "absolute",
          inset: 18,
          width: "calc(100% - 36px)",
          height: "calc(100% - 36px)",
          backgroundImage: `url(${carDamageImage})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 1,
          opacity: 0.85,
        }}
      />

      {/* Yön etiketleri - car_damage.png'ye göre */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(71,85,105,0.7)",
          letterSpacing: 1.5,
          zIndex: 5,
        }}
      >
        ARKA
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(71,85,105,0.7)",
          letterSpacing: 1.5,
          zIndex: 5,
        }}
      >
        ÖN
      </div>

      <div
        style={{
          position: "absolute",
          left: 4,
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(71,85,105,0.7)",
          letterSpacing: 1.5,
          zIndex: 5,
        }}
      >
        SAĞ
      </div>

      <div
        style={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%) rotate(90deg)",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(71,85,105,0.7)",
          letterSpacing: 1.5,
          zIndex: 5,
        }}
      >
        SOL
      </div>

      {/* Hasar noktaları - car_damage.png üzerindeki konumlara göre */}
      {SPOTS.map((spot) => {
        const state = damageMap[spot.id] ?? DEFAULT_PRESET[spot.id] ?? "none";
        const style = getDamageStyle(state);
        const label = getDamageLabel(state);
        const isHovered = hovered === spot.id;
        const showCenterDot = state === "none";
        const fontSize = label === "LB" ? 9 : 12;

        return (
          <button
            key={spot.id}
            type="button"
            onClick={() => onTap(spot.id)}
            onMouseEnter={() => setHovered(spot.id)}
            onMouseLeave={() => setHovered(null)}
            title={`${spotLabels[spot.id] || spot.id}: ${damageStateLabel(state)}`}
            style={{
              position: "absolute",
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              transform: `translate(-50%, -50%) scale(${isHovered ? 1.12 : 1})`,
              width: 36,
              height: 36,
              borderRadius: 999,
              border: `2.5px solid ${style.ring}`,
              background: style.bg,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: isHovered
                ? `0 0 0 6px ${style.glow}, 0 8px 20px rgba(15,23,42,0.15)`
                : `0 0 0 4px ${style.glow}, 0 6px 16px rgba(15,23,42,0.1)`,
              cursor: "pointer",
              transition: "all 180ms ease",
              zIndex: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: style.text,
              fontSize,
              lineHeight: 1,
            }}
          >
            {showCenterDot ? (
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: style.text,
                  opacity: 0.8,
                }}
              />
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}

function countDamage(damageMap) {
  let changed = 0,
    painted = 0,
    localPainted = 0;

  Object.values(damageMap || {}).forEach((s) => {
    if (s === "changed") changed += 1;
    if (s === "painted") painted += 1;
    if (s === "localPainted") localPainted += 1;
  });

  return { changed, painted, localPainted };
}

export default function Valuation() {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  // “CarFormData” web karşılığı
  const [formData, setFormData] = useState({
    // basic
    brand: null,
    brandId: null,
    model: null,
    modelId: null,
    trim: null,
    year: null,
    km: "",

    // technical
    fuelType: "Benzin",
    transmission: "Otomatik",
    bodyType: "Sedan",
    color: "Beyaz",
    traction: "Önden Çekiş",

    // damage
    damageMap: {}, // {hood: "changed", ...}
    totalChangedParts: 0,
    totalPaintedParts: 0,
    totalLocalPaintedParts: 0,
    hasChassisRepair: false,
    hasPodyeRepair: false,
    hasPillarRepair: false,
    tramerNote: "",

    // trims stats (backend trims)
    trimStats: null,

    // result
    result: null,
  });

  // Select options (backend’den)
  const [brandOpts, setBrandOpts] = useState([]);
  const [modelOpts, setModelOpts] = useState([]);
  const [yearOpts, setYearOpts] = useState([]);
  const [trimOpts, setTrimOpts] = useState([]); // {value,label,meta}

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingTrims, setLoadingTrims] = useState(false);

  const [busy, setBusy] = useState(false);
  const [requestNotice, setRequestNotice] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileEpoch, setTurnstileEpoch] = useState(0);
  const [savingCar, setSavingCar] = useState(false);
  const [carSaved, setCarSaved] = useState(false);
  const resultRef = useRef(null);

  const brandSearchTimer = useRef(null);
  const modelSearchTimer = useRef(null);

  useEffect(() => {
    if (!formData.result) setCarSaved(false);
  }, [formData.result]);

  const fuelTypes = ["Benzin", "Dizel", "LPG & Benzin", "Benzin & LPG", "Hybrid", "Elektrik"];
  const transmissions = ["Düz", "Yarı Otomatik", "Otomatik"];
  const bodyTypes = ["Sedan", "Hatchback", "SUV", "Coupe", "Station Wagon", "Pickup", "Minivan", "Cabrio", "Diğer"];
  const colors = ["Beyaz", "Siyah", "Gri", "Mavi", "Kırmızı", "Yeşil", "Sarı", "Turuncu", "Bej", "Kahverengi", "Mor", "Diğer"];
  const tractions = ["Önden Çekiş", "Arkadan İtiş", "4x4"];

  const stepTitle = useMemo(() => {
    if (step === 0) return "Araç Temel Bilgileri";
    if (step === 1) return "Teknik Bilgiler";
    if (step === 2) return "Hasar Bilgileri";
    return "Özet & Sonuç";
  }, [step]);

  // -------- backend fetchers --------
  const fetchBrands = async (q = "") => {
    setLoadingBrands(true);
    try {
      const data = await valuationApi.getBrands(q);
      setBrandOpts(data.map((x) => ({ value: x.id, label: x.name })));
    } catch (e) {
      message.error(e.message || "Markalar alınamadı.");
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId, q = "") => {
    if (!brandId) return;
    setLoadingModels(true);
    try {
      const data = await valuationApi.getModels(brandId, q);
      setModelOpts(data.map((x) => ({ value: x.id, label: x.name })));
    } catch (e) {
      message.error(e.message || "Modeller alınamadı.");
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchYears = async (brandId, modelId) => {
    if (!brandId || !modelId) return;
    setLoadingYears(true);
    try {
      const data = await valuationApi.getYears(brandId, modelId);
      setYearOpts(data.map((y) => ({ value: y, label: String(y) })));
    } catch (e) {
      message.error(e.message || "Yıllar alınamadı.");
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchTrims = async (brandId, modelId, year) => {
    if (!brandId || !modelId || !year) return;
    setLoadingTrims(true);
    try {
      const data = await valuationApi.getTrims(brandId, modelId, year);
      setTrimOpts(
        data.map((t) => ({
          value: t.trim,
          label: t.trim,
          meta: t,
        }))
      );
    } catch (e) {
      message.error(e.message || "Versiyonlar alınamadı.");
    } finally {
      setLoadingTrims(false);
    }
  };

  // initial brands load
  useEffect(() => {
    fetchBrands("");
  }, []);

  // handlers
  const onSelectBrand = async (brandId, option) => {
    setFormData((p) => ({
      ...p,
      brandId,
      brand: option?.label || null,

      // reset dependents
      modelId: null,
      model: null,
      year: null,
      trim: null,
      trimStats: null,
      result: null,
    }));

    setModelOpts([]);
    setYearOpts([]);
    setTrimOpts([]);

    await fetchModels(brandId, "");
  };

  const onSelectModel = async (modelId, option) => {
    setFormData((p) => ({
      ...p,
      modelId,
      model: option?.label || null,

      // reset dependents
      year: null,
      trim: null,
      trimStats: null,
      result: null,
    }));

    setYearOpts([]);
    setTrimOpts([]);

    await fetchYears(formData.brandId, modelId);
  };

  const onSelectYear = async (year) => {
    setFormData((p) => ({
      ...p,
      year,
      trim: null,
      trimStats: null,
      result: null,
    }));

    setTrimOpts([]);
    await fetchTrims(formData.brandId, formData.modelId, year);
  };

  const onSelectTrim = (trimValue) => {
    const picked = trimOpts.find((x) => x.value === trimValue)?.meta;

    setFormData((p) => ({
      ...p,
      trim: trimValue,
      trimStats: picked || null,

      // trims endpoint default_* alanları
      fuelType: picked?.default_fuel_type || p.fuelType,
      transmission: picked?.default_transmission || p.transmission,
      bodyType: picked?.default_body_type || p.bodyType,
      color: picked?.default_color || p.color,

      result: null,
    }));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const goNext = async () => {
    if (step === 0) {
      if (!formData.brandId || !formData.modelId || !formData.year || !String(formData.km || "").trim()) {
        message.error("Marka, model, yıl ve kilometre alanlarını tamamlayın.");
        return;
      }
    }
    if (step === 2) {
      const c = countDamage(formData.damageMap);
      setFormData((p) => ({
        ...p,
        totalChangedParts: c.changed,
        totalPaintedParts: c.painted,
        totalLocalPaintedParts: c.localPainted,
      }));
    }
    setStep((s) => Math.min(totalSteps - 1, s + 1));
  };

  // Değer aralığı hesaplama fonksiyonu
  const calculatePriceRange = (basePrice, hasHeavyDamage = false) => {
    let price = Number(basePrice);

    // Ağır hasar varsa %15 indirim uygula
    if (hasHeavyDamage) {
      price = price * 0.85; // %15 indirim
    }

    let margin;
    if (price <= 1000000) {
      margin = 20000; // 0-1M: ±20k
    } else if (price <= 2000000) {
      margin = 40000; // 1-2M: ±40k
    } else {
      margin = 75000; // 2M+: ±75k
    }

    const minPrice = Math.round((price - margin) / 1000) * 1000; // 1000'e yuvarla
    const maxPrice = Math.round((price + margin) / 1000) * 1000;

    return {
      base: Math.round(price / 1000) * 1000,
      min: Math.max(50000, minPrice), // En az 50k
      max: maxPrice
    };
  };

  // REAL predict call
  const computeValuation = async () => {
    if (!turnstileToken) {
      message.warning("Lütfen güvenlik doğrulamasını tamamlayın.");
      return;
    }

    setRequestNotice(null);
    setBusy(true);
    try {
      const kmNum = Number(String(formData.km).replace(/\D/g, "")) || 0;

      // Hasar sayılarını hesapla
      const damageCount = countDamage(formData.damageMap);

      // Ağır hasar kontrolü
      const hasHeavyDamage = formData.hasChassisRepair || formData.hasPodyeRepair || formData.hasPillarRepair;

      const payload = {
        BrandID: formData.brandId,
        ModelID: formData.modelId,
        Year: Number(formData.year),
        Kilometre: kmNum,
        FuelType: formData.fuelType,
        Transmission: formData.transmission,
        BodyType: formData.bodyType,
        Color: formData.color,
        Traction: formData.traction,
        TotalChangedParts: damageCount.changed,
        TotalPaintedParts: damageCount.painted,
        TotalLocalPaintParts: damageCount.localPainted,
        HasHeavyDamage: hasHeavyDamage ? 1 : 0,
        TramerNote: formData.tramerNote || "",
        hasChassisRepair: formData.hasChassisRepair ? 1 : 0,
        hasPodyeRepair: formData.hasPodyeRepair ? 1 : 0,
        hasPillarRepair: formData.hasPillarRepair ? 1 : 0,
        ModelRaw: formData.trim || null,
        RefAvgPrice: formData.trimStats?.avg_price || null,
      };

      const data = await valuationApi.predict(payload, turnstileToken);
      // Tek değer al (farklı formatları destekle)
      let rawPrice;
      if (typeof data === 'number') {
        rawPrice = data;
      } else if (data?.predicted_price !== undefined) {
        rawPrice = data.predicted_price;
      } else if (data?.base_price !== undefined) {
        rawPrice = data.base_price;
      } else {
        throw new Error(`Beklenmeyen response formatı: ${JSON.stringify(data)}`);
      }

      // Kendi aralık sistemimizi uygula (ağır hasar indirimi dahil)
      const priceRange = calculatePriceRange(rawPrice, hasHeavyDamage);

      setFormData((p) => ({
        ...p,
        totalChangedParts: damageCount.changed,
        totalPaintedParts: damageCount.painted,
        totalLocalPaintedParts: damageCount.localPainted,
        result: {
          title: `${p.brand || ""} ${p.model || ""}${p.trim ? ` ${p.trim}` : ""} • ${p.year} • ${kmNum.toLocaleString("tr-TR")} km`,
          range_label: `${priceRange.min.toLocaleString("tr-TR")} - ${priceRange.max.toLocaleString("tr-TR")} TL`,
          midpoint_label: `${priceRange.base.toLocaleString("tr-TR")} TL`,
          heavy_damage_applied: hasHeavyDamage,
          predicted_price: Number(rawPrice),
          model_base_price: Number(data?.base_price ?? rawPrice),
          range_min: priceRange.min,
          range_mid: priceRange.base,
          range_max: priceRange.max,
          sale_targets: {
            today: priceRange.min,
            day15: priceRange.base,
            day30: priceRange.max,
          },
          model_reference: p.trimStats
            ? {
                sample_count: Number(p.trimStats.sample_count || 0),
                avg_price: p.trimStats.avg_price ?? null,
                min_price: p.trimStats.min_price ?? null,
                max_price: p.trimStats.max_price ?? null,
              }
            : null,
        },
      }));
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 160);
    } catch (e) {
      if (e?.status === 429) {
        const retry = Number(e?.data?.retry_after_seconds || 0);
        const hours = retry > 0 ? Math.max(1, Math.ceil(retry / 3600)) : 24;
        const text = `24 saatlik değerleme limitine ulaştınız. Yaklaşık ${hours} saat sonra tekrar deneyebilirsiniz.`;
        setRequestNotice({ type: "warning", title: "Günlük limit doldu", text });
        message.warning(text);
      } else if (e?.status === 403 && e?.data?.error === "human_verification_failed") {
        const text = "Güvenlik doğrulamasının süresi doldu veya doğrulama geçersiz. Tekrar doğrulayıp yeniden deneyin.";
        setRequestNotice({ type: "warning", title: "Doğrulama yenilenmeli", text });
        message.warning(text);
      } else if (e?.status === 503) {
        const text = "Değerleme servisi şu anda hazır değil. Bilgileriniz kaybolmadı; kısa bir süre sonra tekrar deneyebilirsiniz.";
        setRequestNotice({ type: "error", title: "Servis geçici olarak kullanılamıyor", text });
        message.error(text);
      } else {
        const text = e?.message || "Tahmin sırasında beklenmeyen bir hata oluştu.";
        setRequestNotice({ type: "error", title: "Değerleme tamamlanamadı", text });
        message.error(text);
      }
    } finally {
      setBusy(false);
      setTurnstileToken("");
      setTurnstileEpoch((x) => x + 1);
    }
  };

  const saveCurrentCarToPanel = async () => {
    if (!formData.result) {
      message.info("Önce piyasa aralığını oluşturun.");
      return;
    }

    const counts = countDamage(formData.damageMap);
    const payload = {
      BrandID: formData.brandId,
      BrandName: formData.brand || "",
      ModelID: formData.modelId,
      ModelName: formData.model || "",
      Year: Number(formData.year),
      Trim: formData.trim || "",
      Kilometre: Number(String(formData.km || "").replace(/\D/g, "")) || 0,
      FuelType: formData.fuelType,
      Transmission: formData.transmission,
      BodyType: formData.bodyType,
      Color: formData.color,
      TotalChangedParts: counts.changed,
      TotalPaintedParts: counts.painted,
      TotalLocalPaintParts: counts.localPainted,
    };

    const saveFn = UserCarsAPI?.upsert || UserCarsAPI?.save || UserCarsAPI?.create || UserCarsAPI?.add;
    if (typeof saveFn !== "function") {
      message.error("Araç kayıt servisi bulunamadı.");
      return;
    }

    setSavingCar(true);
    try {
      await saveFn(payload);
      setCarSaved(true);
      message.success("Araç panele kaydedildi.");
      window.setTimeout(() => window.location.assign("/app/dashboard"), 650);
    } catch (error) {
      if (error?.status === 401) {
        message.info("Aracı panele kaydetmek için giriş yapın.");
        window.setTimeout(() => window.location.assign("/login?next=/valuation"), 450);
        return;
      }
      if (error?.status === 403) {
        message.warning(error?.data?.message || error?.data?.error || "Araç ekleme hakkınız şu anda kullanılamıyor.");
        return;
      }
      message.error(error?.message || "Araç panele kaydedilemedi.");
    } finally {
      setSavingCar(false);
    }
  };

  const renderStepCard = () => {
    if (step === 0) {
      return (
        <Card className="valuation-step-card">
          <div className="valuation-step-heading">
            <div className="valuation-step-heading__title">
              <Car size={18} style={{ color: "#ff7a18" }} />
              <Text className="valuation-step-title">Temel Bilgiler</Text>
            </div>
            
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{ fontWeight: 700, color: "#0f172a" }}>Marka</Text>
              <Select
                showSearch
                filterOption={false}
                loading={loadingBrands}
                notFoundContent={loadingBrands ? "Yükleniyor..." : "Marka bulunamadı"}
                value={formData.brandId}
                placeholder="Marka seçin"
                size="large"
                style={{ width: "100%", marginTop: 8 }}
                options={brandOpts}
                onChange={onSelectBrand}
                onSearch={(text) => {
                  clearTimeout(brandSearchTimer.current);
                  brandSearchTimer.current = setTimeout(() => fetchBrands(text), 250);
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <Text style={{ fontWeight: 700, color: "#0f172a" }}>Model</Text>
              <Select
                showSearch
                filterOption={false}
                loading={loadingModels}
                notFoundContent={loadingModels ? "Yükleniyor..." : "Model bulunamadı"}
                disabled={!formData.brandId}
                value={formData.modelId}
                placeholder="Model seçin"
                size="large"
                style={{ width: "100%", marginTop: 8 }}
                options={modelOpts}
                onChange={onSelectModel}
                onSearch={(text) => {
                  clearTimeout(modelSearchTimer.current);
                  modelSearchTimer.current = setTimeout(() => fetchModels(formData.brandId, text), 250);
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text style={{ fontWeight: 700, color: "#0f172a" }}>
                <Calendar size={15} style={{ marginRight: 6 }} />
                Model Yılı
              </Text>
              <Select
                loading={loadingYears}
                notFoundContent={loadingYears ? "Yükleniyor..." : "Yıl bulunamadı"}
                disabled={!formData.brandId || !formData.modelId}
                value={formData.year}
                placeholder="Yıl seçin"
                size="large"
                style={{ width: "100%", marginTop: 8 }}
                options={yearOpts}
                onChange={onSelectYear}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text style={{ fontWeight: 700, color: "#0f172a" }}>Versiyon / Donanım</Text>
              <Select
                loading={loadingTrims}
                notFoundContent={loadingTrims ? "Yükleniyor..." : "Versiyon bulunamadı"}
                disabled={!formData.brandId || !formData.modelId || !formData.year}
                value={formData.trim}
                placeholder="Versiyon seçin"
                size="large"
                style={{ width: "100%", marginTop: 8 }}
                options={trimOpts.map((x) => ({ value: x.value, label: x.label }))}
                onChange={onSelectTrim}
                allowClear
              />
              {formData.trimStats?.sample_count ? (
                <div style={{ marginTop: 8, color: "rgba(15,23,42,0.6)", fontWeight: 700, fontSize: 12 }}>
                  Değerlendirilen: {formData.trimStats.sample_count} • Ortalama: {formData.trimStats.avg_price?.toLocaleString?.("tr-TR") ?? formData.trimStats.avg_price}
                </div>
              ) : null}
            </Col>



            <Col xs={24} md={12}>
              <Text style={{ fontWeight: 700, color: "#0f172a" }}>
                <Gauge size={15} style={{ marginRight: 6 }} />
                Kilometre
              </Text>
              <Input
                value={formData.km}
                onChange={(e) => setFormData((p) => ({ ...p, km: e.target.value, result: null }))}
                placeholder="Örn: 120000"
                size="large"
                style={{ marginTop: 8 }}
                suffix="km"
                inputMode="numeric"
              />
            </Col>
          </Row>


        </Card>
      );
    }

    if (step === 1) {
      return (
        <Card className="valuation-step-card">
          <div className="valuation-step-heading">
            <div className="valuation-step-heading__title">
              <Wrench size={18} style={{ color: "#ff7a18" }} />
              <Text className="valuation-step-title">Teknik Bilgiler</Text>
            </div>
            
          </div>

          <ChipGroup label="Yakıt Tipi" value={formData.fuelType} options={fuelTypes} onChange={(v) => setFormData((p) => ({ ...p, fuelType: v, result: null }))} />
          <ChipGroup label="Vites" value={formData.transmission} options={transmissions} onChange={(v) => setFormData((p) => ({ ...p, transmission: v, result: null }))} />
          <ChipGroup label="Kasa Tipi" value={formData.bodyType} options={bodyTypes} onChange={(v) => setFormData((p) => ({ ...p, bodyType: v, result: null }))} />
          <ChipGroup label="Renk" value={formData.color} options={colors} onChange={(v) => setFormData((p) => ({ ...p, color: v, result: null }))} />
          <ChipGroup label="Çekiş" value={formData.traction} options={tractions} onChange={(v) => setFormData((p) => ({ ...p, traction: v, result: null }))} />


        </Card>
      );
    }

    if (step === 2) {
      const counts = countDamage(formData.damageMap);

      return (
        <Card className="valuation-step-card">
          <div className="valuation-step-heading">
            <div className="valuation-step-heading__title">
              <Paintbrush size={18} style={{ color: "#ff7a18" }} />
              <Text className="valuation-step-title">Hasar Bilgileri</Text>
            </div>
            
          </div>

          <DamageMap
            damageMap={formData.damageMap}
            setDamageMap={(updater) =>
              setFormData((p) => {
                const nextMap = typeof updater === "function" ? updater(p.damageMap) : updater;
                const c = countDamage(nextMap);
                return {
                  ...p,
                  damageMap: nextMap,
                  totalChangedParts: c.changed,
                  totalPaintedParts: c.painted,
                  totalLocalPaintedParts: c.localPainted,
                  result: null,
                };
              })
            }
          />

          <Divider style={{ margin: "18px 0" }} />

          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
                <Text style={{ color: "rgba(15,23,42,0.6)", fontWeight: 700 }}>Değişen</Text>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#ff7a18", marginTop: 6 }}>{counts.changed}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
                <Text style={{ color: "rgba(15,23,42,0.6)", fontWeight: 700 }}>Boyalı</Text>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#ff7a18", marginTop: 6 }}>{counts.painted}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
                <Text style={{ color: "rgba(15,23,42,0.6)", fontWeight: 700 }}>Lokal Boyalı</Text>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#ff7a18", marginTop: 6 }}>{counts.localPainted}</div>
              </Card>
            </Col>
          </Row>

          <Divider style={{ margin: "18px 0" }} />

          <Card style={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
            <Text style={{ fontWeight: 800, color: "#0f172a" }}>Şasi / Podye / Direk Bilgileri</Text>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text>Şaside işlem var</Text>
                <Switch checked={formData.hasChassisRepair} onChange={(v) => setFormData((p) => ({ ...p, hasChassisRepair: v, result: null }))} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text>Podyede işlem var</Text>
                <Switch checked={formData.hasPodyeRepair} onChange={(v) => setFormData((p) => ({ ...p, hasPodyeRepair: v, result: null }))} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text>Direklerde işlem var</Text>
                <Switch checked={formData.hasPillarRepair} onChange={(v) => setFormData((p) => ({ ...p, hasPillarRepair: v, result: null }))} />
              </div>

              <div>
                <Text style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>Tramer Notu</Text>
                <Input.TextArea
                  value={formData.tramerNote}
                  onChange={(e) => setFormData((p) => ({ ...p, tramerNote: e.target.value, result: null }))}
                  placeholder="Varsa tramer / hasar notu..."
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </div>


            </div>
          </Card>

          <Divider style={{ margin: "18px 0" }} />

          <Card style={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
            <Text style={{ fontWeight: 800, color: "#0f172a" }}>Hasar Durumu Rehberi</Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.15)",
                  border: "2px solid #ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#ef4444"
                }}>D</div>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>Değişen</Text>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(59,130,246,0.15)",
                  border: "2px solid #3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#3b82f6"
                }}>B</div>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>Boyalı</Text>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(245,158,11,0.15)",
                  border: "2px solid #f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 900,
                  color: "#f59e0b"
                }}>LB</div>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>Lokal Boyalı</Text>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                  border: "2px solid rgba(15,23,42,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "rgba(15,23,42,0.4)"
                }}>•</div>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>Temiz</Text>
              </div>
            </div>

            <div style={{
              marginTop: 16,
              padding: 16,
              background: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(147,51,234,0.04) 100%)",
              borderRadius: 12,
              border: "1px solid rgba(59,130,246,0.12)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Dekoratif arka plan */}
              <div style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 40,
                height: 40,
                background: "rgba(59,130,246,0.08)",
                borderRadius: "50%",
                zIndex: 0
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 12, color: "white" }}>💡</span>
                  </div>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                    Nasıl Kullanılır?
                  </Text>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3b82f6" }} />
                    <Text style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
                      <strong>Noktalara tıklayarak</strong> hasar durumunu değiştirin
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#8b5cf6" }} />
                    <Text style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
                      <strong>Sıralama:</strong> Temiz → Değişen → Boyalı → Lokal Boyalı
                    </Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#06b6d4" }} />
                    <Text style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
                      <strong>Fare ile üzerine gelin</strong> parça adını görmek için
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Card>
      );
    }

    // step 3 summary
    const r = formData.result;
    const counts = countDamage(formData.damageMap);

    return (
      <Card className="valuation-step-card">
        <div className="valuation-step-heading">
          <div className="valuation-step-heading__title">
            <TrendingUp size={18} style={{ color: "#ff7a18" }} />
            <Text className="valuation-step-title">Özet & Sonuç</Text>
          </div>
          
        </div>

        <Card style={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
          <Text style={{ fontWeight: 900, color: "#0f172a", fontSize: 16 }}>
            {formData.brand || "-"} {formData.model || "-"} {formData.trim ? `• ${formData.trim}` : ""} • {formData.year || "-"} •{" "}
            {formData.km ? `${formData.km} km` : "-"}
          </Text>

          <Divider style={{ margin: "14px 0" }} />

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Text style={{ color: "rgba(15,23,42,0.65)", fontWeight: 700 }}>Yakıt / Vites</Text>
              <div style={{ marginTop: 4, fontWeight: 800 }}>
                {formData.fuelType} • {formData.transmission}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text style={{ color: "rgba(15,23,42,0.65)", fontWeight: 700 }}>Kasa / Renk / Çekiş</Text>
              <div style={{ marginTop: 4, fontWeight: 800 }}>
                {formData.bodyType} • {formData.color} • {formData.traction}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <Text style={{ color: "rgba(15,23,42,0.65)", fontWeight: 700 }}>Hasar Sayacı</Text>
              <div style={{ marginTop: 4, fontWeight: 800 }}>
                Değişen: {counts.changed} • Boyalı: {counts.painted} • Lokal: {counts.localPainted}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text style={{ color: "rgba(15,23,42,0.65)", fontWeight: 700 }}>Şasi/Podye/Direk</Text>
              <div style={{ marginTop: 4, fontWeight: 800 }}>
                {formData.hasChassisRepair ? "Şasi var" : "Şasi yok"} • {formData.hasPodyeRepair ? "Podye var" : "Podye yok"} •{" "}
                {formData.hasPillarRepair ? "Direk var" : "Direk yok"}
              </div>
            </Col>

            {formData.trimStats ? (
              <Col xs={24}>
                <Divider style={{ margin: "10px 0" }} />
                <Text style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>Piyasa İstatistiği (Seçilen Trim)</Text>
                <div style={{ marginTop: 6, fontWeight: 800, color: "rgba(15,23,42,0.78)" }}>
                  Örnek: {formData.trimStats.sample_count} • Min: {formData.trimStats.min_price} • Avg: {formData.trimStats.avg_price} • Max:{" "}
                  {formData.trimStats.max_price}
                </div>
              </Col>
            ) : null}
          </Row>

          <Divider style={{ margin: "16px 0" }} />

          {requestNotice ? (
            <div
              className={`valuation-notice valuation-notice--${requestNotice.type}`}
              role="status"
            >
              <strong>{requestNotice.title}</strong>
              <span>{requestNotice.text}</span>
            </div>
          ) : null}

          <div className="valuation-security">
            <div className="valuation-security__copy">
              <strong>Güvenli değerleme</strong>
              <span>Tek kullanımlık insan doğrulamasıyla isteğinizi koruyoruz.</span>
            </div>
          </div>

          <TurnstileWidget
            key={turnstileEpoch}
            onToken={setTurnstileToken}
            onUnavailable={(msg) => {
              if (!msg) return;
              setRequestNotice({
                type: "warning",
                title: "Güvenlik doğrulaması",
                text: msg,
              });
            }}
          />

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="primary"
              block
              size="large"
              loading={busy}
              disabled={!turnstileToken}
              onClick={computeValuation}
              icon={<Target size={18} />}
              style={{
                height: 56,
                borderRadius: 16,
                fontWeight: 900,
                fontSize: 16,
                background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
                border: "none",
                boxShadow: "0 10px 26px rgba(255,122,24,0.28)",
              }}
            >
              {busy ? "Piyasa aralığı hesaplanıyor..." : "Piyasa aralığını oluştur"}
            </Button>
          </motion.div>
        </Card>

        <Divider style={{ margin: "18px 0" }} />

        <div ref={resultRef} className={`valuation-result ${r ? "valuation-result--ready" : ""}`} aria-live="polite">
          {!r ? (
            <div className="valuation-result__empty">
              <Calculator size={38} aria-hidden />
              <strong>Değer aralığın burada görünecek</strong>
              <span>Araç özetini kontrol et, güvenlik doğrulamasını tamamla ve değerlemeyi başlat.</span>
            </div>
          ) : (
            <motion.div className="valuation-result__ready valuation-result-v2" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <header className="valuation-result-v2__hero">
                <div className="valuation-result-v2__eyebrow"><CheckCircle size={15} aria-hidden /> EDER TAHMİNİ DEĞER</div>
                <div className="valuation-result-v2__hero-grid">
                  <div>
                    <span className="valuation-result-v2__label">Tahmini piyasa değeri</span>
                    <h3>{r.midpoint_label}</h3>
                    <p className="valuation-result-v2__range">{r.range_label}<span> tahmini değer aralığı</span></p>
                  </div>
                  <div className="valuation-result-v2__status">
                    <span>VERİ DURUMU</span>
                    <strong>{r.model_reference?.sample_count ? "Model referansı mevcut" : "Tahmin modeli"}</strong>
                    <small>{r.model_reference?.sample_count ? `${r.model_reference.sample_count} kayıtlık trim referansı` : "Doğrulanmış canlı ilan örneklemi bağlı değil"}</small>
                  </div>
                </div>
                <p className="valuation-result__vehicle">{r.title}</p>
              </header>

              <section className="valuation-result-v2__sale">
                <div className="valuation-result-v2__section-heading">
                  <div><span>SATIŞ HEDEFİ</span><strong>Ne kadar beklersen hangi fiyat bandı?</strong></div>
                  <p>EDER değer aralığından türetilen fiyatlama senaryolarıdır; satış süresi garantisi değildir.</p>
                </div>
                <div className="valuation-result-v2__sale-grid">
                  <article className="is-fast"><span>Bugün satmayı hedefle</span><strong>{formatTL(r.sale_targets?.today)}</strong><small>Daha agresif fiyat · daha düşük pazarlık alanı</small></article>
                  <article className="is-primary"><span>15 gün içinde hedefle</span><strong>{formatTL(r.sale_targets?.day15)}</strong><small>Dengeli fiyat · EDER merkez tahmini</small></article>
                  <article><span>30 gün içinde hedefle</span><strong>{formatTL(r.sale_targets?.day30)}</strong><small>Daha sabırlı ilan · üst banda yakın hedef</small></article>
                </div>
              </section>

              {/* EDER_03F6B_PRICE_EXPECTATION_PANEL */}
              <ValuationFeedbackPanel formData={formData} result={r} />

              <div className="valuation-result-v2__grid">
                <section className="valuation-result-v2__panel">
                  <div className="valuation-result-v2__panel-title"><Car size={18} aria-hidden /><div><span>ARAÇ ÖZETİ</span><strong>Hesaba giren temel bilgiler</strong></div></div>
                  <dl className="valuation-result-v2__facts">
                    <div><dt>Yıl / KM</dt><dd>{formData.year || "-"} · {formData.km ? `${formData.km} km` : "-"}</dd></div>
                    <div><dt>Yakıt / Vites</dt><dd>{formData.fuelType || "-"} · {formData.transmission || "-"}</dd></div>
                    <div><dt>Değişen / Boyalı</dt><dd>{counts.changed} / {counts.painted}</dd></div>
                    <div><dt>Lokal boya</dt><dd>{counts.localPainted}</dd></div>
                  </dl>
                  {r.heavy_damage_applied ? <div className="valuation-result__damage-note">Şasi, podye veya direk bilgisi hesaplamaya dahil edildi.</div> : <div className="valuation-result-v2__clean-note">Ağır yapısal hasar işareti girilmedi.</div>}
                </section>

                <section className="valuation-result-v2__panel valuation-result-v2__panel--evidence">
                  <div className="valuation-result-v2__panel-title"><Gauge size={18} aria-hidden /><div><span>PİYASA REFERANSI</span><strong>Mevcut örneklemin kapsamı</strong></div></div>
                  {r.model_reference?.sample_count ? (
                    <>
                      <div className="valuation-result-v2__evidence-metrics">
                        <div><span>Örnek</span><strong>{r.model_reference.sample_count}</strong></div>
                        <div><span>Ortalama</span><strong>{formatTL(r.model_reference.avg_price)}</strong></div>
                        <div><span>Min / Maks</span><strong>{formatTL(r.model_reference.min_price)} / {formatTL(r.model_reference.max_price)}</strong></div>
                      </div>
                      <p className="valuation-result-v2__evidence-note">Bu referans seçilen trim için mevcut örneklemden gelir. Güncelliği doğrulanmış canlı ilan akışı olarak yorumlanmamalıdır.</p>
                    </>
                  ) : (
                    <div className="valuation-result-v2__no-evidence"><strong>Yeterli güncel piyasa verisi yok.</strong><span>Sonuç tahmin modelinden üretilmiştir. Doğrulanmış canlı ilan örneklemi mevcut olmadığı için ek piyasa kanıtı göstermiyoruz.</span></div>
                  )}
                </section>
              </div>

              <div className="valuation-result-v2__footer">
                <div><strong>Sonucun hazır.</strong><span>Aracını paneline kaydedebilir veya bilgileri değiştirip yeniden değerleme oluşturabilirsin.</span></div>
                <div className="valuation-result-v2__footer-actions">
                  <Button type="default" onClick={() => { setStep(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Bilgileri güncelle</Button>
                  <Button type="primary" loading={savingCar} disabled={carSaved} onClick={saveCurrentCarToPanel}>{carSaved ? "Panele kaydedildi" : "Aracı panele kaydet"}</Button>
                </div>
              </div>
              <p className="valuation-result__disclaimer">EDER sonucu bilgilendirme amaçlı bir tahmindir; kesin satış fiyatı veya belirtilen süre içinde satış garantisi değildir.</p>
            </motion.div>
          )}
        </div>



      </Card>
    );
  };

  return (
    <main className="valuation-page">
      <MetaTags
        title="Ücretsiz Araç Değerleme"
        description="Marka, model, yıl, kilometre, teknik özellik ve kondisyon bilgileriyle aracınız için tahmini piyasa değer aralığı oluşturun."
        canonical="https://ederapp.com/valuation"
        ogType="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "EDER Araç Değerleme",
          url: "https://ederapp.com/valuation",
          applicationCategory: "AutomotiveApplication",
          operatingSystem: "Web",
        }}
      />

      <div className="valuation-shell">
        <div className="valuation-top">
          <div className="valuation-intro">
            <span>Yeni değerleme</span>
            <strong>Aracını değerle.</strong>
          </div>

          <div className="valuation-progress-wrap">
            <StepHeader step={step + 1} total={totalSteps} title={stepTitle} subtitle={null} />
          </div>
        </div>

      <Row gutter={[24, 24]} className="valuation-grid">
        <Col xs={24} lg={15}>
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1}>
            <Card id="valuation-form" className="valuation-workspace">
              <div className="valuation-steps-shell">
                <div
                  className="valuation-step-motion"
                  style={{ left: `calc(${(step / Math.max(totalSteps - 1, 1)) * 100}% - 16px)` }}
                  aria-hidden
                >
                  <Car size={14} />
                </div>

                <Steps
                  className="valuation-steps"
                  current={step}
                  responsive
                  items={[{ title: "Araç" }, { title: "Teknik" }, { title: "Kondisyon" }, { title: "Sonuç" }]}
                />
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {renderStepCard()}

              <Divider style={{ margin: "18px 0" }} />

              <div className={`valuation-actions ${step === 0 ? "is-first-step" : ""}`}>
                {step > 0 ? (
                  <Button
                    className="valuation-action valuation-action--back"
                    onClick={goBack}
                    size="large"
                    icon={<ArrowLeft size={16} />}
                    style={{
                      borderRadius: 14,
                      height: 48,
                      fontWeight: 900,
                      border: "1px solid rgba(15,23,42,0.12)",
                    }}
                  >
                    Geri
                  </Button>
                ) : null}

                {step === totalSteps - 1 ? (
                  <Button className="valuation-action valuation-action--next" type="primary" onClick={saveCurrentCarToPanel} disabled={!formData.result || carSaved} loading={savingCar} size="large" icon={<ArrowRight size={16} />} style={{ flex: 1, borderRadius: 14, height: 48, fontWeight: 900, background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)", border: "none", boxShadow: "0 10px 24px rgba(255,122,24,0.22)" }}>
                    {carSaved ? "Panele kaydedildi" : formData.result ? "Aracı panele kaydet" : "Önce piyasa aralığını oluştur"}
                  </Button>
                ) : (
                  <Button className="valuation-action valuation-action--next" type="primary" onClick={goNext} size="large" icon={<ArrowRight size={16} />} style={{ flex: 1, borderRadius: 14, height: 48, fontWeight: 900, background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)", border: "none", boxShadow: "0 10px 24px rgba(255,122,24,0.22)" }}>
                    Devam
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Sağ kolon: tek ve güçlü canlı özet paneli */}
        <Col xs={24} lg={9}>
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2}>
            <Card className="valuation-summary">
              <div className="valuation-summary__heading">
                <span className="valuation-summary__icon"><TrendingUp size={18} aria-hidden /></span>
                <div>
                  <span>CANLI ÖZET</span>
                  <strong>Değerleme özeti</strong>
                </div>
              </div>

              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Marka / Model</Text>
                  <Text style={{ fontWeight: 800 }}>
                    {formData.brand || "-"} / {formData.model || "-"}
                  </Text>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Yıl / Km</Text>
                  <Text style={{ fontWeight: 800 }}>
                    {formData.year || "-"} / {formData.km ? `${formData.km} km` : "-"}
                  </Text>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Yakıt / Vites</Text>
                  <Text style={{ fontWeight: 800 }}>
                    {formData.fuelType} / {formData.transmission}
                  </Text>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Hasar</Text>
                  <Text style={{ fontWeight: 800 }}>
                    D:{formData.totalChangedParts} B:{formData.totalPaintedParts} L:{formData.totalLocalPaintedParts}
                  </Text>
                </div>
              </Space>

              <Divider style={{ margin: "16px 0" }} />

              <div className="valuation-summary__footer">
                <span>MEVCUT ADIM</span>
                <strong>{stepTitle}</strong>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
      </div>
    </main>
  );
}
