import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Divider, Input, Row, Select, Space, Steps, Tag, Typography, Switch, message } from "antd";
import { motion } from "framer-motion";
import {
  Calculator,
  Car,
  Calendar,
  Gauge,
  TrendingUp,
  Crown,
  Sparkles,
  Target,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Paintbrush,
  Wrench,
} from "lucide-react";
import { useSubscription } from "../services/SubscriptionContext";
import FreeOnly from "../components/FreeOnly";
import AdSlot from "../components/AdSlot";
import { valuationApi } from "../services/valuationApi";
import carDamageImage from "../assets/car_damage.png";

const SLOT_VALUATION = import.meta.env.VITE_ADS_SLOT_VALUATION;
const { Title, Paragraph, Text } = Typography;

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

const damageStateColor = (s) =>
  s === "none" ? "default" : s === "changed" ? "volcano" : s === "painted" ? "geekblue" : "gold";

// Flutter’daki DamageSpot listesi (id + x,y)


function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function StepHeader({ isPremium, step, total, title, subtitle }) {
  const percent = clamp01(step / total) * 100;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp} custom={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 24px rgba(255,122,24,0.28)",
            }}
          >
            <Calculator size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <Title level={2} style={{ margin: 0, color: "#0f172a" }}>
              Araç Değerleme
              {isPremium ? (
                <Tag color="orange" style={{ marginLeft: 12, borderRadius: 8, fontWeight: 700 }}>
                  <Crown size={14} style={{ marginRight: 4 }} />
                  Premium
                </Tag>
              ) : (
                <Tag
                  style={{
                    marginLeft: 12,
                    borderRadius: 8,
                    fontWeight: 700,
                    background: "rgba(15,23,42,0.08)",
                    color: "rgba(15,23,42,0.7)",
                    border: "1px solid rgba(15,23,42,0.1)",
                  }}
                >
                  Free
                </Tag>
              )}
            </Title>
            <Paragraph style={{ margin: 0, color: "rgba(15,23,42,0.62)", fontSize: 16 }}>{subtitle}</Paragraph>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
          <Text style={{ color: "rgba(15,23,42,0.6)", fontWeight: 700 }}>
            Adım {step} / {total} • {title}
          </Text>
          <Text style={{ color: "rgba(15,23,42,0.5)" }}>{Math.round(percent)}%</Text>
        </div>

        <div style={{ marginTop: 10, height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(255,122,24,0.15)" }}>
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
              borderRadius: 999,
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChipGroup({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Text style={{ fontWeight: 700, color: "#0f172a" }}>{label}</Text>
      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <Button
              key={opt}
              size="middle"
              onClick={() => onChange(opt)}
              style={{
                borderRadius: 999,
                fontWeight: 700,
                border: selected ? "1px solid rgba(255,122,24,0.6)" : "1px solid rgba(15,23,42,0.12)",
                background: selected ? "rgba(255,122,24,0.12)" : "white",
                color: selected ? "#ff7a18" : "rgba(15,23,42,0.72)",
              }}
            >
              {opt}
            </Button>
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
  const { isPremium } = useSubscription();

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

  const brandSearchTimer = useRef(null);
  const modelSearchTimer = useRef(null);

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

  const stepSubtitle = useMemo(() => {
    if (step === 0) return "Marka, model, yıl ve kilometre ile doğru segmentte konumlandırıyoruz.";
    if (step === 1) return "Yakıt, vites, kasa, renk ve çekiş bilgisi ile değerlemeni hassaslaştırıyoruz.";
    if (step === 2) return "Parça bazlı tıklayarak hasar durumunu işaretle.";
    return "Güncel piyasa aralığını hesaplayalım.";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        message.error("Lütfen Marka / Model / Yıl / Km alanlarını doldur.");
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

      console.log("Predict payload:", payload);

      const data = await valuationApi.predict(payload);
      console.log("Predict response:", data);

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
          title: `${p.brand || ""} ${p.model || ""}${p.trim ? ` ${p.trim}` : ""} • ${p.year} • ${kmNum} km`,
          base_price: `${priceRange.min.toLocaleString('tr-TR')} - ${priceRange.max.toLocaleString('tr-TR')} TL`,
          heavy_damage_applied: hasHeavyDamage,
          raw_price: rawPrice, // Debug için
        },
      }));
    } catch (e) {
      message.error(e.message || "Tahmin sırasında hata oluştu.");
    } finally {
      setBusy(false);
    }
  };

  const renderStepCard = () => {
    if (step === 0) {
      return (
        <Card
          style={{
            borderRadius: 20,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Car size={18} style={{ color: "#ff7a18" }} />
              <Text style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Temel Bilgiler</Text>
            </div>
            <Text style={{ color: "rgba(15,23,42,0.62)" }}>Doğru değerleme için tüm alanları eksiksiz doldurun.</Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{ fontWeight: 700, color: "#0f172a" }}>Marka</Text>
              <Select
                showSearch
                filterOption={false}
                loading={loadingBrands}
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

          <FreeOnly>
            <Card style={{ marginTop: 20, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
              <AdSlot enabled slot={SLOT_VALUATION} style={{ minHeight: 180 }} />
            </Card>
          </FreeOnly>
        </Card>
      );
    }

    if (step === 1) {
      return (
        <Card
          style={{
            borderRadius: 20,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Wrench size={18} style={{ color: "#ff7a18" }} />
              <Text style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Teknik Bilgiler</Text>
            </div>
            <Text style={{ color: "rgba(15,23,42,0.62)" }}>Mobildeki gibi chip seçimi mantığı ile ilerler.</Text>
          </div>

          <ChipGroup label="Yakıt Tipi" value={formData.fuelType} options={fuelTypes} onChange={(v) => setFormData((p) => ({ ...p, fuelType: v, result: null }))} />
          <ChipGroup label="Vites" value={formData.transmission} options={transmissions} onChange={(v) => setFormData((p) => ({ ...p, transmission: v, result: null }))} />
          <ChipGroup label="Kasa Tipi" value={formData.bodyType} options={bodyTypes} onChange={(v) => setFormData((p) => ({ ...p, bodyType: v, result: null }))} />
          <ChipGroup label="Renk" value={formData.color} options={colors} onChange={(v) => setFormData((p) => ({ ...p, color: v, result: null }))} />
          <ChipGroup label="Çekiş" value={formData.traction} options={tractions} onChange={(v) => setFormData((p) => ({ ...p, traction: v, result: null }))} />

          <FreeOnly>
            <Card style={{ marginTop: 20, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
              <AdSlot enabled slot={SLOT_VALUATION} style={{ minHeight: 160 }} />
            </Card>
          </FreeOnly>
        </Card>
      );
    }

    if (step === 2) {
      const counts = countDamage(formData.damageMap);

      return (
        <Card
          style={{
            borderRadius: 20,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Paintbrush size={18} style={{ color: "#ff7a18" }} />
              <Text style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Hasar Bilgileri</Text>
            </div>
            <Text style={{ color: "rgba(15,23,42,0.62)" }}>
              Noktalara tıkla → <b>Değişen</b> → <b>Boyalı</b> → <b>Lokal Boyalı</b> → Temiz
            </Text>
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

              <FreeOnly>
                <Card style={{ marginTop: 16, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
                  <AdSlot enabled slot={SLOT_VALUATION} style={{ minHeight: 140 }} />
                </Card>
              </FreeOnly>
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
      <Card
        style={{
          borderRadius: 20,
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <TrendingUp size={18} style={{ color: "#ff7a18" }} />
            <Text style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Özet & Sonuç</Text>
          </div>
          <Text style={{ color: "rgba(15,23,42,0.62)" }}>Tüm bilgileri toparlayıp hesaplama yap.</Text>
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

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="primary"
              block
              size="large"
              loading={busy}
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
              {busy ? "Hesaplanıyor..." : "Değeri Hesapla"}
            </Button>
          </motion.div>
        </Card>

        <Divider style={{ margin: "18px 0" }} />

        <Card
          style={{
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "linear-gradient(135deg, rgba(255,122,24,0.08) 0%, rgba(255,177,74,0.05) 100%)",
          }}
        >
          {!r ? (
            <div style={{ textAlign: "center", padding: "28px 12px", color: "rgba(15,23,42,0.6)" }}>
              <Calculator size={40} style={{ opacity: 0.35 }} />
              <div style={{ marginTop: 10, fontWeight: 800 }}>Sonuç burada görünecek</div>
              <div style={{ marginTop: 6 }}>Hesaplama için yukarıdaki butona bas.</div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>{r.title}</div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,122,24,0.16)",
                  marginTop: 12,
                }}
              >
                <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>Tahmin</div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "rgba(15,23,42,0.65)", fontSize: 13 }}>Baz Fiyat</div>
                    <div style={{ fontSize: 22, fontWeight: 950, color: "#ff7a18" }}>{r.base_price}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "rgba(15,23,42,0.65)", fontSize: 13 }}>Tramer Dahil</div>
                    <div style={{ fontSize: 22, fontWeight: 950, color: "#ff7a18" }}>{r.price_with_tramer}</div>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: "14px 0" }} />

              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(15,23,42,0.04)",
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <Text style={{ color: "rgba(15,23,42,0.7)", fontSize: 13, lineHeight: 1.6 }}>
                  <strong>Not:</strong> Bu değer bilgilendirme amaçlıdır. Kesin fiyat araç kondisyonu, bakım geçmişi ve yerel piyasa
                  koşullarına göre değişebilir.
                </Text>
              </div>

              <FreeOnly>
                <Card style={{ marginTop: 16, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
                  <AdSlot enabled slot={SLOT_VALUATION} style={{ minHeight: 200 }} />
                </Card>
              </FreeOnly>
            </div>
          )}
        </Card>

        <FreeOnly>
          <Card style={{ marginTop: 16, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)" }}>
            <AdSlot enabled slot={SLOT_VALUATION} style={{ minHeight: 180 }} />
          </Card>
        </FreeOnly>

        {!isPremium && (
          <Card
            style={{
              borderRadius: 20,
              marginTop: 18,
              background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
              border: "none",
              color: "white",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Crown size={30} style={{ marginBottom: 14, opacity: 0.92 }} />
              <Title level={4} style={{ color: "white", marginBottom: 12 }}>
                Premium Özellikleri
              </Title>

              <Space direction="vertical" size={8} style={{ width: "100%", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.92)" }}>
                  <Sparkles size={16} />
                  <span>Reklamsız deneyim</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.92)" }}>
                  <TrendingUp size={16} />
                  <span>Detaylı piyasa analizi</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.92)" }}>
                  <CheckCircle size={16} />
                  <span>Geçmiş değerlemeler</span>
                </div>
              </Space>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="default"
                  size="large"
                  block
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontWeight: 900,
                    background: "white",
                    color: "#ff7a18",
                    border: "none",
                  }}
                >
                  Premium'a Geç
                </Button>
              </motion.div>
            </div>
          </Card>
        )}
      </Card>
    );
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <StepHeader isPremium={isPremium} step={step + 1} total={totalSteps} title={stepTitle} subtitle={stepSubtitle} />

      <Row gutter={[24, 24]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={14}>
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1}>
            <Card
              style={{
                borderRadius: 20,
                border: "1px solid rgba(15,23,42,0.08)",
                boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
              }}
            >
              <Steps current={step} responsive items={[{ title: "Temel" }, { title: "Teknik" }, { title: "Hasar" }, { title: "Sonuç" }]} />

              <Divider style={{ margin: "16px 0" }} />

              {renderStepCard()}

              <Divider style={{ margin: "18px 0" }} />

              <div style={{ display: "flex", gap: 12 }}>
                <Button
                  onClick={goBack}
                  disabled={step === 0}
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

                <Button
                  type="primary"
                  onClick={goNext}
                  size="large"
                  icon={<ArrowRight size={16} />}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    height: 48,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
                    border: "none",
                    boxShadow: "0 10px 24px rgba(255,122,24,0.22)",
                  }}
                >
                  {step === totalSteps - 1 ? "Bitir" : "Devam"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Sağ kolon: web'de hızlı özet paneli */}
        <Col xs={24} lg={10}>
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2}>
            <Card
              style={{
                borderRadius: 20,
                border: "1px solid rgba(15,23,42,0.08)",
                boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <TrendingUp size={18} style={{ color: "#ff7a18" }} />
                <Text style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Hızlı Özet</Text>
              </div>

              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Marka/Model</Text>
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

                <Divider style={{ margin: "10px 0" }} />
              </Space>
            </Card>

            <FreeOnly>
              <Card style={{ marginTop: 16, borderRadius: 20, border: "1px solid rgba(15,23,42,0.08)" }}>
                <AdSlot enabled slot={SLOT_VALUATION} style={{ minHeight: 250 }} />
              </Card>
            </FreeOnly>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
