import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Eye,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import { lifecycleApi } from "../../services/lifecycleApi";
import "./lifecycle-intelligence.css";

function formatInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("tr-TR").format(number);
}

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${new Intl.NumberFormat("tr-TR").format(number)} TL`;
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Math.abs(number) < 1 ? 1 : 0,
    signDisplay: "always",
  }).format(number * 100);
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function durationLabel(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "Veri birikiyor";
  }

  if (number < 1) {
    return "< 1 gün";
  }

  return `${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
  }).format(number)} gün`;
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="li-metric">
      <div className="li-metric-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div>
        <div className="li-metric-label">{label}</div>
        <div className="li-metric-value">{value}</div>
        {detail ? (
          <div className="li-metric-detail">{detail}</div>
        ) : null}
      </div>
    </div>
  );
}

function EventRow({ event }) {
  const deltaTl = Number(event?.delta_tl);
  const isDrop = Number.isFinite(deltaTl) && deltaTl < 0;
  const Icon = isDrop ? ArrowDownRight : ArrowUpRight;
  const pct = formatPercent(event?.delta_pct);
  const observedAt = formatDate(event?.observed_at);

  return (
    <div className="li-event">
      <div className={`li-event-direction ${isDrop ? "is-drop" : "is-rise"}`}>
        <Icon size={17} strokeWidth={2} />
      </div>

      <div className="li-event-prices">
        <span>{formatPrice(event?.old_price)}</span>
        <span className="li-event-arrow">→</span>
        <strong>{formatPrice(event?.new_price)}</strong>
      </div>

      <div className="li-event-meta">
        {pct ? <span>{pct}</span> : null}
        {observedAt ? <span>{observedAt}</span> : null}
      </div>
    </div>
  );
}

export default function LifecycleIntelligencePanel({
  brand,
  model,
  year,
  version,
  vehicleTitle,
}) {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!brand || !model || !year || !version) {
        setState({
          loading: false,
          data: null,
          error: null,
        });
        return;
      }

      setState({
        loading: true,
        data: null,
        error: null,
      });

      try {
        const data = await lifecycleApi.version(
          brand,
          model,
          year,
          version,
        );

        if (!cancelled) {
          setState({
            loading: false,
            data,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            data: null,
            error,
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [brand, model, year, version]);

  const summary = state.data?.summary;
  const events = useMemo(
    () =>
      Array.isArray(state.data?.recent_price_events)
        ? state.data.recent_price_events
        : [],
    [state.data],
  );

  if (state.loading) {
    return (
      <section
        className="li-shell li-loading"
        data-eder-lifecycle-intelligence-loading="v1"
        aria-label="İlan yaşam döngüsü yükleniyor"
      >
        <div className="li-loading-line is-wide" />
        <div className="li-loading-grid">
          <div className="li-loading-card" />
          <div className="li-loading-card" />
          <div className="li-loading-card" />
          <div className="li-loading-card" />
        </div>
      </section>
    );
  }

  if (!summary || state.error) {
    return null;
  }

  const observedCount = Number(summary.observed_listing_count || 0);
  const activeCount = Number(summary.active_observed_count || 0);
  const changedListings = Number(
    summary.price_changed_listing_count || 0,
  );
  const totalChanges = Number(summary.total_price_change_count || 0);
  const dropCount = Number(summary.price_drop_event_count || 0);
  const riseCount = Number(summary.price_rise_event_count || 0);
  const medianDays = Number(summary.median_observed_days || 0);
  const lastSeen = formatDate(summary.last_seen_at);
  const latestChange = formatDate(summary.latest_price_change_at);

  const hasRealPriceMovement =
    totalChanges > 0 || events.length > 0;

  return (
    <section
      className="li-shell"
      data-eder-lifecycle-intelligence="v1"
      aria-labelledby="li-title"
    >
      <div className="li-head">
        <div>
          <div className="li-eyebrow">
            <Activity size={15} strokeWidth={2} />
            EDER İlan Yaşam Döngüsü
          </div>
          <h2 id="li-title">İlanlar piyasada nasıl hareket ediyor?</h2>
          <p>
            {vehicleTitle
              ? `${vehicleTitle} için `
              : ""}
            EDER&apos;in gerçekten gözlemlediği ilan sürelerini ve
            yakaladığı fiyat değişikliklerini gösterir.
          </p>
        </div>

        <div className="li-live-badge">
          <span />
          Gözlem verisi
        </div>
      </div>

      <div className="li-metrics">
        <Metric
          icon={Eye}
          label="Gözlemlenen ilan"
          value={formatInteger(observedCount)}
          detail={lastSeen ? `Son gözlem: ${lastSeen}` : null}
        />

        <Metric
          icon={RefreshCw}
          label="Hâlâ aktif görünen"
          value={formatInteger(activeCount)}
          detail="Son kaynak gözleminde aktif"
        />

        <Metric
          icon={Clock3}
          label="Ortanca gözlem süresi"
          value={durationLabel(medianDays)}
          detail="Satış süresi değildir"
        />

        <Metric
          icon={TrendingDown}
          label="Fiyatı değişen ilan"
          value={formatInteger(changedListings)}
          detail={
            latestChange
              ? `Son hareket: ${latestChange}`
              : "05C sonrası gerçek değişimler"
          }
        />
      </div>

      {hasRealPriceMovement ? (
        <div className="li-movement">
          <div className="li-movement-head">
            <div>
              <h3>Yakalanan fiyat hareketleri</h3>
              <p>
                Toplam {formatInteger(totalChanges)} fiyat değişikliği:
                {" "}
                {formatInteger(dropCount)} düşüş,
                {" "}
                {formatInteger(riseCount)} artış.
              </p>
            </div>
          </div>

          {events.length ? (
            <div className="li-events">
              {events.slice(0, 6).map((event) => (
                <EventRow
                  key={`${event.source_event_id}-${event.observed_at}`}
                  event={event}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="li-collecting">
          <div className="li-collecting-icon">
            <RefreshCw size={20} strokeWidth={1.8} />
          </div>
          <div>
            <strong>Fiyat hareketi verisi yeni toplanmaya başladı.</strong>
            <p>
              Bu pakette henüz doğrulanmış bir eski fiyat → yeni fiyat
              değişimi yakalanmadı. Veri oluştukça burada gerçek hareketler
              görünecek.
            </p>
          </div>
        </div>
      )}

      <div className="li-methodology">
        <strong>Nasıl okumalı?</strong>
        <span>
          Gözlem süresi, bir ilanın EDER tarafından ilk ve son görüldüğü
          zaman arasındadır. Bu değer satış süresi değildir. Kaybolan bir
          ilanı “satıldı” kabul etmiyoruz ve 05C öncesi fiyat değişikliklerini
          geriye dönük üretmiyoruz.
        </span>
      </div>
    </section>
  );
}
