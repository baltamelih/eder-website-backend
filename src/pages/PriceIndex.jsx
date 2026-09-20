import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleHelp,
  Database,
  Gauge,
  Layers3,
  LineChart,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import priceIndexApi from "../services/priceIndexApi";
import "./price-index.css";

const RANGE_OPTIONS = [
  { key: "30d", short: "1A", label: "Son 30 gün" },
  { key: "90d", short: "3A", label: "Son 90 gün" },
  { key: "180d", short: "6A", label: "Son 6 ay" },
  { key: "1y", short: "1Y", label: "Son 1 yıl" },
  { key: "all", short: "Tümü", label: "Tüm dönem" },
];

const integer = new Intl.NumberFormat("tr-TR");

function formatIndex(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";

  return parsed.toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

function formatInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  return integer.format(parsed);
}

function formatPercent(value, empty = "Karşılaştırma yok") {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return empty;

  const magnitude = Math.abs(parsed).toLocaleString("tr-TR", {
    maximumFractionDigits: 1,
  });

  if (parsed > 0) return `%${magnitude} artış`;
  if (parsed < 0) return `%${magnitude} düşüş`;
  return "%0 değişim";
}

function percentNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
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

function formatWeek(value) {
  if (!value) return "—";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(parsed);
}

function direction(value) {
  const parsed = percentNumber(value);
  if (parsed === null || parsed === 0) return "flat";
  return parsed > 0 ? "up" : "down";
}

function DirectionIcon({ value, size = 17 }) {
  const trend = direction(value);

  if (trend === "up") {
    return <ArrowUpRight size={size} aria-hidden />;
  }

  if (trend === "down") {
    return <ArrowDownRight size={size} aria-hidden />;
  }

  return <ArrowRight size={size} aria-hidden />;
}

function geometryGap(points) {
  const dates = (points || [])
    .map((point) => new Date(`${point?.week_start}T00:00:00`).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  let largest = 0;

  for (let index = 1; index < dates.length; index += 1) {
    largest = Math.max(
      largest,
      Math.round((dates[index] - dates[index - 1]) / 86400000),
    );
  }

  return largest;
}

function MetricCard({
  eyebrow,
  value,
  helper,
  tone,
  icon: Icon,
}) {
  return (
    <article className={`pi-metric ${tone ? `pi-metric--${tone}` : ""}`}>
      <div className="pi-metric__top">
        <span>{eyebrow}</span>
        {Icon ? <Icon size={17} aria-hidden /> : null}
      </div>

      <strong className="pi-metric__value">{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

function IndexChart({ points }) {
  const svgRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const geometry = useMemo(() => {
    const clean = (points || []).filter((point) =>
      Number.isFinite(Number(point?.index_value)),
    );

    if (!clean.length) {
      return {
        clean,
        path: "",
        area: "",
        dots: [],
        labels: [],
        min: 0,
        max: 0,
      };
    }

    const width = 960;
    const height = 300;
    const left = 46;
    const right = 18;
    const top = 22;
    const bottom = 44;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const values = clean.map((point) => Number(point.index_value));
    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) {
      min -= 1;
      max += 1;
    }

    const padding = Math.max((max - min) * 0.18, 0.8);
    min -= padding;
    max += padding;

    const timestamps = clean.map((point) =>
      new Date(`${point.week_start}T00:00:00`).getTime(),
    );
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeSpan = Math.max(maxTime - minTime, 1);

    const dots = clean.map((point, index) => {
      const timestamp = timestamps[index];
      const x =
        clean.length === 1
          ? left + plotWidth / 2
          : left + ((timestamp - minTime) / timeSpan) * plotWidth;

      const value = Number(point.index_value);
      const y =
        top + ((max - value) / (max - min)) * plotHeight;

      return {
        x,
        y,
        value,
        timestamp,
        point,
      };
    });

    const segments = dots.slice(1).map((dot, index) => {
      const previous = dots[index];
      const gapDays = Math.round(
        (dot.timestamp - previous.timestamp) / 86400000,
      );

      return {
        from: previous,
        to: dot,
        gapDays,
        isLongGap: gapDays > 35,
      };
    });

    const areaPath = dots
      .map((dot, index) =>
        `${index === 0 ? "M" : "L"} ${dot.x.toFixed(2)} ${dot.y.toFixed(2)}`,
      )
      .join(" ");

    const area =
      dots.length > 0
        ? `${areaPath} L ${dots[dots.length - 1].x.toFixed(2)} ${(top + plotHeight).toFixed(
            2,
          )} L ${dots[0].x.toFixed(2)} ${(top + plotHeight).toFixed(2)} Z`
        : "";

    const tickCount = 5;
    const labels = Array.from({ length: tickCount }, (_, index) => {
      const ratio = tickCount === 1 ? 0 : index / (tickCount - 1);
      const timestamp = minTime + ratio * timeSpan;

      return {
        x: left + ratio * plotWidth,
        timestamp,
      };
    });

    const maxGapDays = segments.reduce(
      (largest, segment) => Math.max(largest, segment.gapDays),
      0,
    );

    return {
      clean,
      area,
      dots,
      segments,
      labels,
      maxGapDays,
      min,
      max,
      width,
      height,
      left,
      right,
      top,
      bottom,
      plotHeight,
    };
  }, [points]);

  if (!geometry.clean.length) {
    return (
      <div className="pi-chart-empty">
        <LineChart size={24} aria-hidden />
        <strong>Henüz grafik oluşturacak endeks noktası yok.</strong>
      </div>
    );
  }

  function onPointerMove(event) {
    const svg = svgRef.current;
    if (!svg || !geometry.dots.length) return;

    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;

    const svgX =
      ((event.clientX - rect.left) / rect.width) * geometry.width;

    let nearest = 0;
    let nearestDistance = Infinity;

    geometry.dots.forEach((dot, index) => {
      const distance = Math.abs(dot.x - svgX);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    setActiveIndex(nearest);
  }

  const active =
    activeIndex === null ? null : geometry.dots[activeIndex];

  return (
    <div className="pi-chart">
      <div className="pi-chart__canvas">
        <svg
          ref={svgRef}
          className="pi-chart__svg"
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          role="img"
          aria-label="EDER ikinci el fiyat endeksi grafiği"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="pi-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.19" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y =
              geometry.top + ratio * geometry.plotHeight;

            return (
              <line
                key={ratio}
                x1={geometry.left}
                x2={geometry.width - geometry.right}
                y1={y}
                y2={y}
                className="pi-chart__grid"
              />
            );
          })}

          <path
            d={geometry.area}
            className="pi-chart__area"
            fill="url(#pi-area-gradient)"
          />
          {geometry.segments.map((segment, index) => (
            <line
              key={`segment-${index}`}
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              className={
                segment.isLongGap
                  ? "pi-chart__segment is-gap"
                  : "pi-chart__segment"
              }
            />
          ))}

          {geometry.dots.map((dot, index) => (
            <circle
              key={`${dot.point.week_start}-${index}`}
              cx={dot.x}
              cy={dot.y}
              r={activeIndex === index ? 6 : 4}
              className={
                activeIndex === index
                  ? "pi-chart__dot is-active"
                  : "pi-chart__dot"
              }
            />
          ))}

          {geometry.labels.map((item, index) => (
            <text
              key={`label-${index}`}
              x={item.x}
              y={geometry.height - 14}
              textAnchor="middle"
              className="pi-chart__label"
            >
              {formatWeek(
                new Date(item.timestamp).toISOString().slice(0, 10),
              )}
            </text>
          ))}
        </svg>

        {active ? (
          <div
            className="pi-chart__tooltip"
            style={{
              left: `${(active.x / geometry.width) * 100}%`,
              top: `${(active.y / geometry.height) * 100}%`,
            }}
          >
            <span>{formatDate(active.point.week_start)}</span>
            <strong>Endeks {formatIndex(active.value)}</strong>
            <small>
              {formatInteger(active.point.matched_page_count)} eşleşen sayfa
            </small>
          </div>
        ) : null}
      </div>

      <div className="pi-chart__legend">
        <span>
          <i aria-hidden />
          EDER Fiyat Endeksi
        </span>
        <span>
          Baz değer: <strong>100</strong>
        </span>
      </div>
    </div>
  );
}

function MoverRow({ item, type }) {
  const change = percentNumber(item?.four_week_change_pct);
  const trend = direction(change);
  const isModel = type === "model";

  const target = isModel
    ? `/arac-fiyat-gecmisi/${item.brand_slug}/${item.model_slug}`
    : `/arac-fiyat-gecmisi/${item.brand_slug}`;

  return (
    <Link to={target} className="pi-mover-row">
      <div>
        <strong>{item.scope_label}</strong>
        <span>Endeks {formatIndex(item.index_value)}</span>
      </div>

      <span className={`pi-mover-row__change is-${trend}`}>
        <DirectionIcon value={change} size={16} />
        {formatPercent(change)}
      </span>
    </Link>
  );
}

function MoversPanel({
  title,
  subtitle,
  items,
  type,
  icon: Icon,
}) {
  return (
    <article className="pi-movers-card">
      <header>
        <span className="pi-movers-card__icon">
          <Icon size={18} aria-hidden />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </header>

      <div className="pi-movers-card__rows">
        {items?.length ? (
          items.map((item) => (
            <MoverRow
              key={`${item.scope_type}-${item.scope_key}`}
              item={item}
              type={type}
            />
          ))
        ) : (
          <div className="pi-movers-empty">
            Bu yönde gösterilecek yeterli 4 haftalık hareket yok.
          </div>
        )}
      </div>
    </article>
  );
}

export default function PriceIndex() {
  const [range, setRange] = useState("1y");
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await priceIndexApi.overview(range);
        if (!alive) return;
        setData(response);
      } catch (loadError) {
        if (!alive) return;

        setError(
          loadError?.message ||
            "EDER Fiyat Endeksi şu anda yüklenemiyor.",
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [range, reloadKey]);

  const national = data?.national || null;
  const series = data?.series || [];

  const baseChange = useMemo(() => {
    const current = Number(national?.index_value);
    if (!Number.isFinite(current)) return null;
    return current - 100;
  }, [national?.index_value]);

  return (
    <main className="pi-page">
      <section className="pi-hero">
        <div className="pi-hero__copy">
          <span className="pi-kicker">
            <Sparkles size={15} aria-hidden />
            EDER Fiyat Endeksi
          </span>

          <h1>
            İkinci el piyasasının
            <span> yönünü tek bakışta gör.</span>
          </h1>

          <p>
            Aynı araç yıl ve versiyonlarını dönemler arasında eşleştiren
            EDER endeksi, ikinci el ilan fiyatlarındaki hareketi araç karması
            etkisini azaltarak takip eder.
          </p>

          <div className="pi-hero__actions">
            <a href="#endeks-grafigi" className="pi-primary-action">
              Endeksi incele
              <ArrowRight size={17} aria-hidden />
            </a>

            <Link to="/arac-fiyat-gecmisi" className="pi-secondary-action">
              Araç fiyat geçmişine git
            </Link>
          </div>
        </div>

        <div className="pi-hero__index-card">
          <div className="pi-hero__index-top">
            <span>Türkiye ikinci el</span>
            <Gauge size={19} aria-hidden />
          </div>

          <div className="pi-hero__index-value">
            {loading ? "…" : formatIndex(national?.index_value)}
          </div>

          <div
            className={`pi-hero__index-change is-${direction(baseChange)}`}
          >
            <DirectionIcon value={baseChange} />
            <span>
              {baseChange === null
                ? "Baz döneme göre karşılaştırma yok"
                : `Baz döneme göre ${formatPercent(baseChange)}`}
            </span>
          </div>

          <div className="pi-hero__index-foot">
            <span>
              Baz tarih
              <strong>{formatDate(national?.base_week_start)}</strong>
            </span>

            <span>
              Son dönem
              <strong>{formatDate(national?.week_start)}</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="pi-explain-strip">
        <div>
          <span className="pi-explain-strip__icon">
            <CircleHelp size={18} aria-hidden />
          </span>
          <p>
            <strong>100 ne demek?</strong>
            Endeksin ilk geçerli dönemi 100 kabul edilir. Örneğin 103,
            baz döneme göre yaklaşık %3 daha yüksek piyasa seviyesini ifade eder.
          </p>
        </div>
      </section>

      {error ? (
        <section className="pi-error" role="alert">
          <strong>Endeks yüklenemedi.</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
            <RefreshCw size={16} aria-hidden />
            Tekrar dene
          </button>
        </section>
      ) : null}

      <section className="pi-metrics" aria-label="Endeks özeti">
        <MetricCard
          eyebrow="Güncel endeks"
          value={loading ? "…" : formatIndex(national?.index_value)}
          helper="Baz endeks 100 üzerinden"
          icon={BarChart3}
        />

        <MetricCard
          eyebrow="Önceki endeks noktasına göre"
          value={
            loading
              ? "…"
              : formatPercent(
                  national?.previous_index_change_pct,
                  "Karşılaştırma yok",
                )
          }
          helper={
            national?.previous_index_period_days
              ? `${formatInteger(
                  national.previous_index_period_days,
                )} gün önceki geçerli noktaya göre`
              : "Önceki geçerli endeks noktasına göre"
          }
          tone={direction(national?.previous_index_change_pct)}
          icon={TrendingUp}
        />

        <MetricCard
          eyebrow="4 haftalık değişim"
          value={
            loading
              ? "…"
              : formatPercent(
                  national?.four_week_change_pct,
                  "Karşılaştırma yok",
                )
          }
          helper="Yalnızca uygun referans varsa gösterilir"
          tone={direction(national?.four_week_change_pct)}
          icon={CalendarDays}
        />

        <MetricCard
          eyebrow="Yıllık değişim"
          value={
            loading
              ? "…"
              : formatPercent(
                  national?.yearly_change_pct,
                  "Yeterli geçmiş yok",
                )
          }
          helper="Yaklaşık 1 yıllık geçerli endeks referansı"
          tone={direction(national?.yearly_change_pct)}
          icon={Layers3}
        />
      </section>

      <section
        id="endeks-grafigi"
        className="pi-chart-section"
        aria-label="EDER fiyat endeksi grafiği"
      >
        <header className="pi-section-header">
          <div>
            <span className="pi-section-eyebrow">Piyasanın yönü</span>
            <h2>Türkiye ikinci el fiyat endeksi</h2>
            <p>
              Sabit araç sayfaları eşleştirilerek oluşturulan yayınlanmış
              endeks noktaları.
            </p>
          </div>

          <div className="pi-range-switch" aria-label="Grafik dönemi">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={range === option.key ? "is-active" : ""}
                onClick={() => setRange(option.key)}
                title={option.label}
              >
                {option.short}
              </button>
            ))}
          </div>
        </header>

        <div className="pi-chart-card">
          {loading ? (
            <div className="pi-chart-loading">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <IndexChart points={series} />
          )}
        </div>

        <div className="pi-chart-meta">
          <span>
            <Database size={15} aria-hidden />
            {formatInteger(series.length)} yayınlanmış endeks noktası
          </span>

          <span>
            <ShieldCheck size={15} aria-hidden />
            Son noktada {formatInteger(national?.matched_page_count)} eşleşen
            araç sayfası
          </span>

          {geometryGap(series) > 35 ? (
            <span className="pi-chart-meta__gap">
              <CalendarDays size={15} aria-hidden />
              En uzun yayın aralığı {formatInteger(geometryGap(series))} gün
            </span>
          ) : null}
        </div>
      </section>

      <section className="pi-movers-section">
        <header className="pi-section-header">
          <div>
            <span className="pi-section-eyebrow">Piyasa hareketi</span>
            <h2>Hangi marka ve modeller hareket ediyor?</h2>
            <p>
              Yalnızca yeterli eşleşen sayfaya ve geçerli 4 haftalık
              karşılaştırmaya sahip kapsamlar gösterilir.
            </p>
          </div>
        </header>

        <div className="pi-movers-grid">
          <MoversPanel
            title="Yükselen markalar"
            subtitle="Son 4 haftalık endeks değişimi"
            items={data?.brand_movers?.rising}
            type="brand"
            icon={TrendingUp}
          />

          <MoversPanel
            title="Gerileyen markalar"
            subtitle="Son 4 haftalık endeks değişimi"
            items={data?.brand_movers?.falling}
            type="brand"
            icon={TrendingDown}
          />

          <MoversPanel
            title="Yükselen modeller"
            subtitle="Son 4 haftalık endeks değişimi"
            items={data?.model_movers?.rising}
            type="model"
            icon={TrendingUp}
          />

          <MoversPanel
            title="Gerileyen modeller"
            subtitle="Son 4 haftalık endeks değişimi"
            items={data?.model_movers?.falling}
            type="model"
            icon={TrendingDown}
          />
        </div>
      </section>

      <section className="pi-methodology">
        <div className="pi-methodology__intro">
          <span className="pi-kicker">
            <ShieldCheck size={15} aria-hidden />
            Endeks nasıl hesaplanıyor?
          </span>

          <h2>Araç karmasını değil, aynı araçların hareketini izliyoruz.</h2>
          <p>
            Her hafta piyasadaki araç dağılımı değişebilir. Yalnızca tüm ilanların
            ortalamasına bakmak bu değişimden etkilenir. EDER, aynı marka, model,
            yıl ve versiyon sayfalarını geçerli endeks dönemleri arasında
            eşleştirir.
          </p>
        </div>

        <div className="pi-methodology__steps">
          <article>
            <span>01</span>
            <div>
              <strong>Sabit haftalık veri</strong>
              <p>Pazartesi–Pazar sabit dönemlerdeki medyan ilan fiyatları.</p>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <strong>Eşleşen araç sayfaları</strong>
              <p>Aynı yıl ve versiyon sayfaları iki geçerli dönem arasında eşleşir.</p>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <strong>Medyan fiyat oranı</strong>
              <p>Eşleşen sayfaların fiyat oranlarının medyanı hesaplanır.</p>
            </div>
          </article>

          <article>
            <span>04</span>
            <div>
              <strong>Zincirlenen endeks</strong>
              <p>İlk geçerli dönem 100 kabul edilir ve sonraki hareketler zincirlenir.</p>
            </div>
          </article>
        </div>

        <div className="pi-methodology__note">
          <Database size={17} aria-hidden />
          <p>
            <strong>Önemli:</strong> Endeks ilan fiyatlarından türetilir.
            Gerçekleşmiş satış fiyatını veya tek bir aracın değerini göstermez.
          </p>
        </div>
      </section>
    </main>
  );
}
