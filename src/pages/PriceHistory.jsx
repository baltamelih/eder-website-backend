import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Select, Skeleton } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CarFront,
  ChevronRight,
  CircleAlert,
  History,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import AdSenseRuntime from "../components/ads/AdSenseRuntime";
import AdSlot from "../components/ads/AdSlot";
import priceHistoryApi from "../services/priceHistoryApi";
import "./price-history.css";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("tr-TR");

const RANGE_OPTIONS = [
  { key: "30d", short: "4H", label: "Son 4 hafta" },
  { key: "90d", short: "12H", label: "Son 12 hafta" },
  { key: "180d", short: "26H", label: "Son 26 hafta" },
  { key: "1y", short: "1Y", label: "Son 1 yıl" },
  { key: "all", short: "Tümü", label: "Tüm geçmiş" },
];

function coalesceCatalogRows(rows, slugKey, countKeys = []) {
  const result = new Map();

  (rows || []).forEach((row) => {
    const slug = String(row?.[slugKey] || "").trim();
    if (!slug) return;

    const existing = result.get(slug);
    if (!existing) {
      result.set(slug, { ...row });
      return;
    }

    const merged = { ...existing };
    countKeys.forEach((key) => {
      merged[key] = Number(existing[key] || 0) + Number(row[key] || 0);
    });

    const existingDate = String(existing.latest_data_date || "");
    const incomingDate = String(row.latest_data_date || "");
    if (incomingDate > existingDate) {
      merged.latest_data_date = row.latest_data_date;
    }

    result.set(slug, merged);
  });

  return Array.from(result.values());
}

function compactMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  if (Math.abs(number) >= 1_000_000) {
    return `₺${(number / 1_000_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 2,
    })} Mn`;
  }

  if (Math.abs(number) >= 1_000) {
    return `₺${(number / 1_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 0,
    })} B`;
  }

  return formatMoney(number);
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return currency.format(number);
}

function formatInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return integer.format(number);
}

function formatDate(value) {
  if (!value) return "—";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatWeekTick(start, end) {
  if (!start || !end) return "—";

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return `${start} – ${end}`;
  }

  const startDay = String(startDate.getDate()).padStart(2, "0");
  const endDay = String(endDate.getDate()).padStart(2, "0");
  const month = new Intl.DateTimeFormat("tr-TR", {
    month: "short",
  }).format(endDate);

  return `${startDay}–${endDay} ${month}`;
}


function formatWeekRange(start, end) {
  if (!start || !end) return "—";

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return `${start} – ${end}`;
  }

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth =
    sameYear && startDate.getMonth() === endDate.getMonth();

  const day = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
  });

  const monthYear = new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    year: "numeric",
  });

  const full = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (sameMonth) {
    return `${day.format(startDate)}–${full.format(endDate)}`;
  }

  if (sameYear) {
    const startPart = new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
    }).format(startDate);
    return `${startPart} – ${full.format(endDate)}`;
  }

  return `${full.format(startDate)} – ${full.format(endDate)}`;
}

function formatPercent(value, empty = "Yeterli geçmiş yok") {
  const number = Number(value);
  if (!Number.isFinite(number)) return empty;

  const amount = Math.abs(number).toLocaleString("tr-TR", {
    maximumFractionDigits: 1,
  });

  if (number > 0) return `%${amount} artış`;
  if (number < 0) return `%${amount} düşüş`;
  return "%0 değişim";
}

function humanizeSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function selectorOptions(rows, valueKey, labelKey) {
  return (rows || []).map((row) => ({
    value: row[valueKey],
    label: row[labelKey],
  }));
}

function ErrorNotice({ message }) {
  if (!message) return null;

  return (
    <div className="ph-error" role="alert">
      <CircleAlert size={18} aria-hidden />
      <div>
        <strong>Veri şu anda yüklenemedi.</strong>
        <span>{message}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, accent = false }) {
  return (
    <article className={`ph-metric ${accent ? "ph-metric--accent" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

function PriceHistoryChart({ series }) {
  const points = useMemo(
    () =>
      (series || [])
        .map((point) => ({
          ...point,
          median: Number(point.median_price),
          p25: Number(point.p25_price),
          p75: Number(point.p75_price),
        }))
        .filter(
          (point) =>
            Number.isFinite(point.median) &&
            Number.isFinite(point.p25) &&
            Number.isFinite(point.p75),
        ),
    [series],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(Math.max(0, points.length - 1));
  }, [points.length]);

  if (!points.length) {
    return (
      <div className="ph-chart-empty">
        Bu tarih aralığında grafik oluşturacak haftalık veri henüz yok.
      </div>
    );
  }

  const width = 1000;
  const height = 360;
  const margin = { top: 24, right: 26, bottom: 54, left: 74 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const rawMin = Math.min(...points.map((point) => point.p25));
  const rawMax = Math.max(...points.map((point) => point.p75));
  const priceSpan = Math.max(rawMax - rawMin, rawMax * 0.05, 10_000);
  const minPrice = Math.max(0, rawMin - priceSpan * 0.18);
  const maxPrice = rawMax + priceSpan * 0.18;

  const xForIndex = (index) => {
    if (points.length === 1) {
      return margin.left + plotWidth / 2;
    }

    return (
      margin.left +
      (index / (points.length - 1)) * plotWidth
    );
  };

  const yFor = (price) =>
    margin.top +
    (1 - (Number(price) - minPrice) / (maxPrice - minPrice)) * plotHeight;

  const medianPath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${xForIndex(index).toFixed(2)} ${yFor(
          point.median,
        ).toFixed(2)}`,
    )
    .join(" ");

  const upper = points
    .map(
      (point, index) =>
        `${xForIndex(index).toFixed(2)} ${yFor(point.p75).toFixed(2)}`,
    )
    .join(" L ");

  const lower = [...points]
    .map((_, reverseIndex) => {
      const index = points.length - 1 - reverseIndex;
      const point = points[index];
      return `${xForIndex(index).toFixed(2)} ${yFor(point.p25).toFixed(2)}`;
    })
    .join(" L ");

  const bandPath = `M ${upper} L ${lower} Z`;

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return maxPrice - (maxPrice - minPrice) * ratio;
  });

  const desiredTickCount = points.length <= 6 ? points.length : 5;
  const xTickIndexes = Array.from(
    new Set(
      Array.from({ length: desiredTickCount }, (_, index) => {
        if (desiredTickCount === 1) return 0;
        return Math.round(
          (index / (desiredTickCount - 1)) * (points.length - 1),
        );
      }),
    ),
  );

  const activePoint = points[Math.min(activeIndex, points.length - 1)];
  const activeX = xForIndex(Math.min(activeIndex, points.length - 1));
  const activeY = yFor(activePoint.median);

  function onPointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;

    const svgX =
      ((event.clientX - rect.left) / rect.width) * width;

    const ratio = Math.max(
      0,
      Math.min(
        1,
        (svgX - margin.left) / plotWidth,
      ),
    );

    const nextIndex =
      points.length === 1
        ? 0
        : Math.round(ratio * (points.length - 1));

    setActiveIndex(nextIndex);
  }

  return (
    <div className="ph-chart-wrap">
      <div className="ph-chart-tooltip" aria-live="polite">
        <div>
          <span>Hafta</span>
          <strong>
            {formatWeekRange(
              activePoint.week_start,
              activePoint.week_end,
            )}
          </strong>
        </div>
        <div>
          <span>Haftalık piyasa seviyesi</span>
          <strong>{formatMoney(activePoint.median)}</strong>
        </div>
        <div>
          <span>O hafta görülen ilan</span>
          <strong>{formatInteger(activePoint.raw_listing_count)}</strong>
        </div>
      </div>

      <div className="ph-chart-scroll">
        <svg
          className="ph-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Haftalık piyasa seviyesi ve fiyat bandı grafiği"
          onPointerMove={onPointerMove}
        >
          <defs>
            <linearGradient id="phBandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b33" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ff6b33" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="phMedianStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#111214" />
              <stop offset="100%" stopColor="#ff6b33" />
            </linearGradient>
          </defs>

          {yTicks.map((tick, index) => {
            const y = yFor(tick);
            return (
              <g key={`y-${index}`}>
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={y}
                  y2={y}
                  className="ph-chart-gridline"
                />
                <text
                  x={margin.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="ph-chart-axis-label"
                >
                  {compactMoney(tick)}
                </text>
              </g>
            );
          })}

          <path d={bandPath} fill="url(#phBandFill)" />
          <path
            d={medianPath}
            fill="none"
            stroke="url(#phMedianStroke)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {xTickIndexes.map((index) => {
            const point = points[index];
            return (
              <text
                key={`${point.week_start}-${index}`}
                x={xForIndex(index)}
                y={height - 20}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === points.length - 1
                      ? "end"
                      : "middle"
                }
                className="ph-chart-axis-label ph-chart-axis-label--x"
              >
                {formatWeekTick(point.week_start, point.week_end)}
              </text>
            );
          })}

          {points.map((point, index) => (
            <circle
              key={`${point.week_start}-${index}`}
              cx={xForIndex(index)}
              cy={yFor(point.median)}
              r={index === activeIndex ? 7 : 4}
              className={
                index === activeIndex
                  ? "ph-chart-point ph-chart-point--active"
                  : "ph-chart-point"
              }
              onPointerEnter={() => setActiveIndex(index)}
            />
          ))}

          <line
            x1={activeX}
            x2={activeX}
            y1={margin.top}
            y2={margin.top + plotHeight}
            className="ph-chart-cursor"
          />
          <circle
            cx={activeX}
            cy={activeY}
            r="8"
            className="ph-chart-focus"
          />
        </svg>
      </div>

      <div className="ph-chart-detail-strip">
        <span>
          Piyasa bandı:{" "}
          <strong>
            {formatMoney(activePoint.p25)} – {formatMoney(activePoint.p75)}
          </strong>
        </span>
        <span>
          Önceki haftaya göre:{" "}
          <strong>
            {formatPercent(activePoint.weekly_change_pct, "Karşılaştırma yok")}
          </strong>
        </span>
      </div>
    </div>
  );
}

function Breadcrumbs({
  brand,
  model,
  year,
  version,
  brandLabel,
  modelLabel,
  versionLabel,
}) {
  const items = [
    { label: "Araç fiyat geçmişi", to: "/arac-fiyat-gecmisi" },
  ];

  if (brand) {
    items.push({
      label: brandLabel || humanizeSlug(brand),
      to: `/arac-fiyat-gecmisi/${brand}`,
    });
  }

  if (brand && model) {
    items.push({
      label: modelLabel || humanizeSlug(model),
      to: `/arac-fiyat-gecmisi/${brand}/${model}`,
    });
  }

  if (brand && model && year) {
    items.push({
      label: String(year),
      to: `/arac-fiyat-gecmisi/${brand}/${model}/${year}`,
    });
  }

  if (brand && model && year && version) {
    items.push({
      label: versionLabel || humanizeSlug(version),
      to: `/arac-fiyat-gecmisi/${brand}/${model}/${year}/${version}`,
    });
  }

  return (
    <nav className="ph-breadcrumbs" aria-label="Sayfa yolu">
      <Link to="/">EDER</Link>
      {items.map((item, index) => (
        <span className="ph-breadcrumb-fragment" key={item.to}>
          <ChevronRight size={14} aria-hidden />
          {index === items.length - 1 ? (
            <span aria-current="page">{item.label}</span>
          ) : (
            <Link to={item.to}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function PriceHistory() {
  const { brand, model, year, version } = useParams();
  const navigate = useNavigate();

  const [health, setHealth] = useState(null);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [versions, setVersions] = useState([]);
  const [detail, setDetail] = useState(null);
  const [rangeKey, setRangeKey] = useState("1y");

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const pendingScrollRef = useRef(null);

  const parsedYear = year ? Number(year) : undefined;

  useEffect(() => {
    let active = true;

    async function boot() {
      setCatalogLoading(true);
      setError("");

      try {
        const [healthResult, brandResult] = await Promise.all([
          priceHistoryApi.health(),
          priceHistoryApi.brands(),
        ]);

        if (!active) return;
        setHealth(healthResult);
        setBrands(
          coalesceCatalogRows(
            Array.isArray(brandResult) ? brandResult : [],
            "brand_slug",
            ["version_year_page_count", "chart_eligible_page_count"],
          ),
        );
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Fiyat geçmişi servisine ulaşılamadı.");
      } finally {
        if (active) setCatalogLoading(false);
      }
    }

    boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadModels() {
      if (!brand) {
        setModels([]);
        setYears([]);
        setVersions([]);
        return;
      }

      setBranchLoading(true);
      setError("");

      try {
        const result = await priceHistoryApi.models(brand);
        if (!active) return;
        setModels(
          coalesceCatalogRows(
            Array.isArray(result) ? result : [],
            "model_slug",
            ["version_year_page_count", "chart_eligible_page_count"],
          ),
        );
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Modeller yüklenemedi.");
      } finally {
        if (active) setBranchLoading(false);
      }
    }

    loadModels();
    return () => {
      active = false;
    };
  }, [brand]);

  useEffect(() => {
    let active = true;

    async function loadYears() {
      if (!brand || !model) {
        setYears([]);
        setVersions([]);
        return;
      }

      setBranchLoading(true);
      setError("");

      try {
        const result = await priceHistoryApi.years(brand, model);
        if (!active) return;
        setYears(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Model yılları yüklenemedi.");
      } finally {
        if (active) setBranchLoading(false);
      }
    }

    loadYears();
    return () => {
      active = false;
    };
  }, [brand, model]);

  useEffect(() => {
    let active = true;

    async function loadVersions() {
      if (!brand || !model || !parsedYear) {
        setVersions([]);
        return;
      }

      setBranchLoading(true);
      setError("");

      try {
        const result = await priceHistoryApi.versions(
          brand,
          model,
          parsedYear,
        );

        if (!active) return;
        setVersions(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Paket ve versiyonlar yüklenemedi.");
      } finally {
        if (active) setBranchLoading(false);
      }
    }

    loadVersions();
    return () => {
      active = false;
    };
  }, [brand, model, parsedYear]);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!brand || !model || !parsedYear || !version) {
        setDetail(null);
        return;
      }

      setDetailLoading(true);
      setError("");

      try {
        const result = await priceHistoryApi.detail(
          brand,
          model,
          parsedYear,
          version,
          rangeKey,
          "weekly",
        );

        if (!active) return;
        setDetail(result || null);
      } catch (err) {
        if (!active) return;

        setDetail(null);
        setError(
          err?.status === 404
            ? "Bu araç kombinasyonu için fiyat geçmişi sayfası bulunamadı."
            : err?.message || "Fiyat geçmişi yüklenemedi.",
        );
      } finally {
        if (active) setDetailLoading(false);
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [brand, model, parsedYear, version, rangeKey]);

  useLayoutEffect(() => {
    if (pendingScrollRef.current === null) return undefined;

    const targetY = pendingScrollRef.current;
    const timers = [];

    const restore = () => {
      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: "auto",
      });
    };

    restore();
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });

    [60, 180, 420].forEach((delay) => {
      timers.push(window.setTimeout(restore, delay));
    });

    const release = window.setTimeout(() => {
      pendingScrollRef.current = null;
    }, 500);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(release);
    };
  }, [brand, model, year, version]);

  const selectedBrand = useMemo(
    () => brands.find((item) => item.brand_slug === brand),
    [brands, brand],
  );

  const selectedModel = useMemo(
    () => models.find((item) => item.model_slug === model),
    [models, model],
  );

  const selectedVersion = useMemo(
    () => versions.find((item) => item.version_slug === version),
    [versions, version],
  );

  const brandOptions = useMemo(
    () => selectorOptions(brands, "brand_slug", "brand_name"),
    [brands],
  );

  const modelOptions = useMemo(
    () => selectorOptions(models, "model_slug", "model_name"),
    [models],
  );

  const yearOptions = useMemo(
    () =>
      years.map((item) => ({
        value: String(item.year),
        label: String(item.year),
      })),
    [years],
  );

  const versionOptions = useMemo(
    () =>
      versions.map((item) => ({
        value: item.version_slug,
        label: `${item.version_label} · ${formatInteger(
          item.total_listing_count,
        )} ilan`,
      })),
    [versions],
  );

  const topBrands = useMemo(
    () =>
      [...brands]
        .sort(
          (a, b) =>
            Number(b.chart_eligible_page_count || 0) -
            Number(a.chart_eligible_page_count || 0),
        )
        .slice(0, 12),
    [brands],
  );

  const rangeSummary = useMemo(() => {
    if (detail?.range_summary) return detail.range_summary;

    const rows = detail?.series || [];
    return {
      raw_listing_count: rows.reduce(
        (sum, point) => sum + Number(point.raw_listing_count || 0),
        0,
      ),
      sample_count: rows.reduce(
        (sum, point) => sum + Number(point.sample_count || 0),
        0,
      ),
      distinct_week_count: rows.length,
      first_week_start: rows[0]?.week_start || null,
      last_week_end: rows[rows.length - 1]?.week_end || null,
      first_data_date: rows[0]?.observed_from || null,
      last_data_date: rows[rows.length - 1]?.observed_to || null,
    };
  }, [detail]);

  function navigateWithoutJump(path) {
    pendingScrollRef.current = window.scrollY;
    navigate(path, { preventScrollReset: true });
  }

  function onBrandChange(value) {
    navigateWithoutJump(`/arac-fiyat-gecmisi/${value}`);
  }

  function onModelChange(value) {
    navigateWithoutJump(`/arac-fiyat-gecmisi/${brand}/${value}`);
  }

  function onYearChange(value) {
    navigateWithoutJump(`/arac-fiyat-gecmisi/${brand}/${model}/${value}`);
  }

  function onVersionChange(value) {
    navigateWithoutJump(
      `/arac-fiyat-gecmisi/${brand}/${model}/${parsedYear}/${value}`,
    );
  }

  const detailVehicle = detail?.vehicle;
  const summary = detail?.summary;
  const trend = detail?.trend_summary;
  const weeklySeries = detail?.series || [];
  const latestWeek = weeklySeries[weeklySeries.length - 1] || null;
  const vehicleTitle = [
    detailVehicle?.brand_name || selectedBrand?.brand_name,
    detailVehicle?.model_name || selectedModel?.model_name,
    parsedYear,
    detailVehicle?.version_label || selectedVersion?.version_label,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <AdSenseRuntime />

      <AdSlot
        slot="priceHistoryLeftRail"
        side="left"
      />
      <AdSlot
        slot="priceHistoryRightRail"
        side="right"
      />

      <main className="ph-page">
      <Breadcrumbs
        brand={brand}
        model={model}
        year={year}
        version={version}
        brandLabel={selectedBrand?.brand_name}
        modelLabel={selectedModel?.model_name}
        versionLabel={selectedVersion?.version_label}
      />

      <section className="ph-hero">
        <div className="ph-hero-copy">
          <span className="ph-kicker">
            <History size={16} aria-hidden />
            EDER'i Neydi?
          </span>

          <h1>
            {vehicleTitle
              ? `${vehicleTitle} fiyat geçmişi`
              : "Aracın piyasadaki fiyat geçmişini gör."}
          </h1>

          <p>
            Marka, model, yıl ve paket seç. Aracın geçmiş haftalardaki
            fiyat hareketini, piyasa seviyesini ve fiyat aralığını tek yerde
            gör.
          </p>

        </div>

        <aside className="ph-live-card">
          <span className="ph-live-card__eyebrow">Ne göreceksin?</span>

          <div className="ph-benefit-list">
            <div className="ph-benefit-row">
              <span className="ph-benefit-number">01</span>
              <strong>Haftalık fiyat trendi</strong>
            </div>

            <div className="ph-benefit-row">
              <span className="ph-benefit-number">02</span>
              <strong>Versiyona özel fiyat geçmişi</strong>
            </div>

            <div className="ph-benefit-row">
              <span className="ph-benefit-number">03</span>
              <strong>Piyasa fiyat aralığı</strong>
            </div>
          </div>
        </aside>
      </section>

      <AdSlot slot="priceHistoryTopLeaderboard" />

      <section className="ph-selector-shell" aria-label="Araç seçimi">
        <div className="ph-selector-heading">
          <div>
            <span className="ph-section-eyebrow">Araç seç</span>
            <h2>Dört adımda geçmiş piyasa görünümüne git.</h2>
          </div>
          <Search size={22} aria-hidden />
        </div>

        <div className="ph-select-grid">
          <label className="ph-select-field">
            <span>1 · Marka</span>
            <Select
              showSearch
              value={brand}
              options={brandOptions}
              optionFilterProp="label"
              placeholder="Marka seç"
              loading={catalogLoading}
              onChange={onBrandChange}
              size="large"
            />
          </label>

          <label className="ph-select-field">
            <span>2 · Model</span>
            <Select
              showSearch
              value={model}
              options={modelOptions}
              optionFilterProp="label"
              placeholder="Model seç"
              disabled={!brand}
              loading={branchLoading && Boolean(brand)}
              onChange={onModelChange}
              size="large"
            />
          </label>

          <label className="ph-select-field">
            <span>3 · Yıl</span>
            <Select
              showSearch
              value={year}
              options={yearOptions}
              optionFilterProp="label"
              placeholder="Yıl seç"
              disabled={!brand || !model}
              loading={branchLoading && Boolean(model)}
              onChange={onYearChange}
              size="large"
            />
          </label>

          <label className="ph-select-field">
            <span>4 · Paket / Versiyon</span>
            <Select
              showSearch
              value={version}
              options={versionOptions}
              optionFilterProp="label"
              placeholder="Paket seç"
              disabled={!brand || !model || !parsedYear}
              loading={branchLoading && Boolean(parsedYear)}
              onChange={onVersionChange}
              size="large"
            />
          </label>
        </div>
      </section>

      <AdSlot slot="priceHistoryAfterSelector" />

      <ErrorNotice message={error} />

      {!brand ? (
        <section className="ph-discovery">
          <div className="ph-section-heading">
            <div>
              <span className="ph-section-eyebrow">Başlangıç noktası</span>
              <h2>En çok fiyat geçmişi bulunan markalar</h2>
            </div>
            <span>{formatInteger(brands.length)} marka</span>
          </div>

          {catalogLoading ? (
            <div className="ph-card-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="ph-skeleton-card" key={index}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="ph-card-grid">
              {topBrands.map((item) => (
                <Link
                  preventScrollReset
                  className="ph-discovery-card"
                  key={item.brand_slug}
                  to={`/arac-fiyat-gecmisi/${item.brand_slug}`}
                >
                  <div>
                    <strong>{item.brand_name}</strong>
                    <span>
                      {formatInteger(item.chart_eligible_page_count)} grafik
                      uygun sayfa
                    </span>
                  </div>
                  <ArrowRight size={18} aria-hidden />
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {brand && !model ? (
        <section className="ph-discovery">
          <div className="ph-section-heading">
            <div>
              <span className="ph-section-eyebrow">
                {selectedBrand?.brand_name || humanizeSlug(brand)}
              </span>
              <h2>Model seç</h2>
            </div>
            <span>{formatInteger(models.length)} model</span>
          </div>

          <div className="ph-card-grid">
            {models.map((item) => (
              <Link
                preventScrollReset
                className="ph-discovery-card"
                key={item.model_slug}
                to={`/arac-fiyat-gecmisi/${brand}/${item.model_slug}`}
              >
                <div>
                  <strong>{item.model_name}</strong>
                  <span>
                    {formatInteger(item.version_year_page_count)} fiyat
                    geçmişi sayfası
                  </span>
                </div>
                <ArrowRight size={18} aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {brand && model && !year ? (
        <section className="ph-discovery">
          <div className="ph-section-heading">
            <div>
              <span className="ph-section-eyebrow">
                {selectedBrand?.brand_name} {selectedModel?.model_name}
              </span>
              <h2>Model yılı seç</h2>
            </div>
            <span>{formatInteger(years.length)} yıl</span>
          </div>

          <div className="ph-year-grid">
            {years.map((item) => (
              <Link
                preventScrollReset
                className="ph-year-card"
                key={item.year}
                to={`/arac-fiyat-gecmisi/${brand}/${model}/${item.year}`}
              >
                <strong>{item.year}</strong>
                <span>
                  {formatInteger(item.version_page_count)} paket ·{" "}
                  {formatInteger(item.chart_eligible_version_count)} grafik
                  uygun
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {brand && model && year && !version ? (
        <section className="ph-discovery">
          <div className="ph-section-heading">
            <div>
              <span className="ph-section-eyebrow">
                {selectedBrand?.brand_name} {selectedModel?.model_name} {year}
              </span>
              <h2>Paket veya versiyon seç</h2>
            </div>
            <span>{formatInteger(versions.length)} seçenek</span>
          </div>

          <div className="ph-version-list">
            {versions.map((item) => (
              <Link
                preventScrollReset
                className="ph-version-card"
                key={item.version_slug}
                to={`/arac-fiyat-gecmisi/${brand}/${model}/${year}/${item.version_slug}`}
              >
                <div>
                  <strong>{item.version_label}</strong>
                  <span>
                    {formatInteger(item.total_listing_count)} ilan ·{" "}
                    {formatInteger(item.distinct_day_count)} veri günü
                  </span>
                </div>
                <div className="ph-version-card__status">
                  <span
                    className={
                      item.chart_eligible
                        ? "ph-status ph-status--ready"
                        : "ph-status ph-status--waiting"
                    }
                  >
                    {item.chart_eligible
                      ? "Grafik için hazır"
                      : "Daha fazla veri gerekiyor"}
                  </span>
                  <ArrowRight size={18} aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {brand && model && year && version ? (
        <section className="ph-detail">
          {detailLoading ? (
            <div className="ph-detail-loading">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : detail && summary ? (
            <>
              <div className="ph-detail-title">
                <div>
                  <span className="ph-section-eyebrow">
                    Piyasa özeti
                  </span>
                  <h2>{vehicleTitle}</h2>
                  <p>
                    İlan fiyatları üzerinden oluşturulan piyasa istatistikleri.
                    Satış/işlem fiyatı değildir.
                  </p>
                </div>

                <span
                  className={
                    summary.chart_eligible
                      ? "ph-status ph-status--ready"
                      : "ph-status ph-status--waiting"
                  }
                >
                  {summary.chart_eligible
                    ? "Grafik için yeterli veri"
                    : "Yeterince ilan yok"}
                </span>
              </div>

              <div className="ph-metric-grid">
                <MetricCard
                  accent
                  label="Güncel piyasa seviyesi"
                  value={formatMoney(
                    trend?.latest_week_median_price ??
                      latestWeek?.median_price ??
                      summary.latest_daily_median_price,
                  )}
                  helper={
                    latestWeek
                      ? formatWeekRange(
                          latestWeek.week_start,
                          latestWeek.week_end,
                        )
                      : "En güncel fiyat seviyesi"
                  }
                />

                <MetricCard
                  label="Yıllık fiyat değişimi"
                  value={formatPercent(
                    trend?.one_year_change_pct,
                    "Yeterli geçmiş yok",
                  )}
                  helper={
                    trend?.one_year_reference_week_start
                      ? trend?.one_year_reference_method ===
                        "previous_year_earliest"
                        ? `${formatDate(
                            trend.one_year_reference_week_start,
                          )} tarihindeki ilk mevcut haftaya göre`
                        : `${formatDate(
                            trend.one_year_reference_week_start,
                          )} haftasına göre`
                      : "En az 9 aylık karşılaştırılabilir geçmiş gerekir"
                  }
                />

                <MetricCard
                  label="Son 1 yıl ortalama fiyat"
                  value={formatMoney(trend?.one_year_average_price)}
                  helper="Son 1 yıldaki ilanların ağırlıklı ortalama fiyatı"
                />

                <MetricCard
                  label="Piyasanın güncel fiyat bandı"
                  value={
                    latestWeek
                      ? `${formatMoney(latestWeek.p25_price)} – ${formatMoney(
                          latestWeek.p75_price,
                        )}`
                      : "—"
                  }
                  helper="Son haftada ilanların yoğunlaştığı orta fiyat bandı"
                />

                <MetricCard
                  label="İncelenen ilan"
                  value={formatInteger(rangeSummary.raw_listing_count)}
                  helper={`${formatInteger(
                    rangeSummary.distinct_week_count,
                  )} haftalık veri noktası`}
                />

                <MetricCard
                  label="4 haftalık fiyat değişimi"
                  value={formatPercent(
                    trend?.four_week_change_pct,
                    "Karşılaştırma yok",
                  )}
                  helper={
                    trend?.four_week_reference_week_start
                      ? `${formatDate(
                          trend.four_week_reference_week_start,
                        )} haftasına göre`
                      : "Tam 4 hafta önce ilan verisi varsa hesaplanır"
                  }
                />
              </div>

              {!summary.chart_eligible ? (
                <div className="ph-low-data">
                  <div className="ph-low-data__icon">
                    <CarFront size={24} aria-hidden />
                  </div>
                  <div className="ph-low-data__copy">
                    <span className="ph-section-eyebrow">
                      Veri büyümeye devam ediyor
                    </span>
                    <h3>Bu paket için veri henüz büyüyor.</h3>
                    <p>
                      Fiyat geçmişini güvenilir biçimde gösterecek kadar ilan
                      henüz birikmedi. Yeni ilanlar geldikçe grafik otomatik
                      olarak oluşacak.
                    </p>
                    <strong>Bu sırada aracının güncel değerini öğren.</strong>
                  </div>
                  <Link to="/arac-degerleme">
                    <Button type="primary" size="large">
                      Aracını Değerle
                    </Button>
                  </Link>
                </div>
              ) : (
                <section className="ph-chart-panel">
                  <div className="ph-chart-heading">
                    <div>
                      <span className="ph-section-eyebrow">
                        Fiyat geçmişi grafiği
                      </span>
                      <h3>Haftalık fiyat hareketi</h3>
                      <p>
                        Koyu çizgi haftalık piyasa seviyesini, turuncu alan ise
                        aynı haftadaki piyasa fiyat bandını gösterir.
                      </p>
                    </div>

                    <div
                      className="ph-range-tabs"
                      aria-label="Grafik tarih aralığı"
                    >
                      {RANGE_OPTIONS.map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          className={
                            rangeKey === item.key
                              ? "ph-range-tab ph-range-tab--active"
                              : "ph-range-tab"
                          }
                          onClick={() => setRangeKey(item.key)}
                        >
                          {item.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ph-chart-range-summary">
                    <span>
                      <strong>
                        {formatInteger(rangeSummary.raw_listing_count)}
                      </strong>
                      ilan
                    </span>
                    <span>
                      <strong>
                        {formatInteger(rangeSummary.distinct_week_count)}
                      </strong>
                      hafta
                    </span>
                    <span>
                      {formatWeekRange(
                        rangeSummary.first_week_start,
                        rangeSummary.last_week_end,
                      )}
                    </span>
                  </div>

                  <PriceHistoryChart series={detail.series || []} />

                  <div className="ph-chart-legend">
                    <span className="ph-chart-legend__median">
                      Piyasa seviyesi
                    </span>
                    <span className="ph-chart-legend__band">
                      Piyasa fiyat bandı
                    </span>
                  </div>
                </section>
              )}

              <aside className="ph-methodology">
                <Sparkles size={20} aria-hidden />
                <div>
                  <strong>Veri nasıl hazırlanıyor?</strong>
                  <p>
                    İlanlar EDER'in onları ilk gördüğü tarihe göre sabit
                    Pazartesi–Pazar haftalarına ayrılır. Gösterilen tutarlar
                    ilan fiyatlarıdır; gerçekleşmiş satış fiyatı değildir.
                  </p>
                </div>
              </aside>
            </>
          ) : null}
        </section>
      ) : null}

      <AdSlot slot="priceHistoryInContent" />
      </main>

      <AdSlot slot="priceHistoryMobileSticky" />
    </>
  );
}
