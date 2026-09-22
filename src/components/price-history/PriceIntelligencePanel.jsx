import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CircleAlert,
  SearchCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import priceHistoryApi from "../../services/priceHistoryApi";
import { trackEvent } from "../../services/analytics";
import "./price-intelligence.css";

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("tr-TR");

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return currency.format(number);
}

function signedPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  const formatted = Math.abs(number).toLocaleString("tr-TR", {
    maximumFractionDigits: 1,
  });

  if (number > 0) return `+%${formatted}`;
  if (number < 0) return `-%${formatted}`;
  return "%0";
}

function compactMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  if (Math.abs(number) >= 1_000_000) {
    return `${(number / 1_000_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 2,
    })} Mn TL`;
  }

  return `${Math.round(number / 1_000).toLocaleString("tr-TR")} bin TL`;
}

function confidenceLabel(value) {
  if (value === "high") return "Yüksek";
  if (value === "medium") return "Orta";
  return "Düşük";
}

function positionCopy(position) {
  const map = {
    notably_below_market: {
      eyebrow: "Fiyat açısından dikkat çekici",
      title: "Piyasanın belirgin altında",
      tone: "positive",
      icon: TrendingDown,
    },
    below_market: {
      eyebrow: "Piyasa karşılaştırması",
      title: "Piyasanın altında",
      tone: "positive",
      icon: TrendingDown,
    },
    market_range: {
      eyebrow: "Piyasa karşılaştırması",
      title: "Piyasa aralığında",
      tone: "neutral",
      icon: SearchCheck,
    },
    above_market: {
      eyebrow: "Piyasa karşılaştırması",
      title: "Piyasanın üzerinde",
      tone: "warning",
      icon: TrendingUp,
    },
  };

  return (
    map[position] || {
      eyebrow: "Piyasa karşılaştırması",
      title: "Karşılaştırma hazır değil",
      tone: "neutral",
      icon: SearchCheck,
    }
  );
}

function normalizePriceInput(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function formatPriceInput(value) {
  const digits = normalizePriceInput(value);
  if (!digits) return "";
  return integer.format(Number(digits));
}

export default function PriceIntelligencePanel({
  brand,
  model,
  year,
  version,
  vehicleTitle,
  chartEligible,
}) {
  const [priceInput, setPriceInput] = useState("");
  const [priceResult, setPriceResult] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadComparison() {
      if (!brand || !model || !year) {
        setComparison(null);
        return;
      }

      setComparisonLoading(true);

      try {
        const result = await priceHistoryApi.compare(
          brand,
          model,
          year,
        );

        if (active) setComparison(result || null);
      } catch {
        if (active) setComparison(null);
      } finally {
        if (active) setComparisonLoading(false);
      }
    }

    loadComparison();

    return () => {
      active = false;
    };
  }, [brand, model, year]);

  useEffect(() => {
    setPriceInput("");
    setPriceResult(null);
    setPriceError("");
  }, [brand, model, year, version]);

  const rows = useMemo(
    () => comparison?.versions || [],
    [comparison],
  );

  async function submitPriceCheck(event) {
    event.preventDefault();

    const amount = Number(normalizePriceInput(priceInput));

    if (!Number.isFinite(amount) || amount <= 0) {
      setPriceError("Karşılaştırmak için geçerli bir ilan fiyatı gir.");
      setPriceResult(null);
      return;
    }

    setPriceLoading(true);
    setPriceError("");

    try {
      const result = await priceHistoryApi.priceCheck(
        brand,
        model,
        year,
        version,
        amount,
      );

      setPriceResult(result || null);

      trackEvent("price_history_price_check", {
        brand_slug: brand,
        model_slug: model,
        vehicle_year: Number(year),
        version_slug: version,
        price_position: result?.assessment?.position,
        confidence: result?.assessment?.confidence,
      });
    } catch (error) {
      setPriceResult(null);
      setPriceError(
        error?.message || "Fiyat karşılaştırması şu anda yüklenemedi.",
      );
    } finally {
      setPriceLoading(false);
    }
  }

  const assessment = priceResult?.assessment;
  const reference = priceResult?.reference;
  const marketContext = priceResult?.market_context;
  const position = positionCopy(assessment?.position);
  const PositionIcon = position.icon;

  return (
    <section className="pi-shell" data-eder-price-intelligence="v1">
      <div className="pi-heading">
        <div>
          <span className="pi-eyebrow">EDER Fiyat Kontrolü</span>
          <h3>Bir ilan gördün mü? Fiyatının piyasadaki yerini gör.</h3>
          <p>
            {vehicleTitle || "Seçtiğin araç"} için ilan fiyatını, EDER'in
            haftalık piyasa seviyesi ve tipik fiyat bandıyla karşılaştır.
          </p>
        </div>
        <div className="pi-heading-icon" aria-hidden>
          <SearchCheck size={24} />
        </div>
      </div>

      {chartEligible ? (
        <form className="pi-price-form" onSubmit={submitPriceCheck}>
          <label>
            <span>İlan fiyatı</span>
            <div className="pi-input-wrap">
              <input
                inputMode="numeric"
                autoComplete="off"
                value={priceInput}
                onChange={(event) =>
                  setPriceInput(formatPriceInput(event.target.value))
                }
                placeholder="Örn. 1.025.000"
                aria-label="İlan fiyatı"
              />
              <span>TL</span>
            </div>
          </label>

          <button type="submit" disabled={priceLoading}>
            {priceLoading ? "Kontrol ediliyor..." : "Fiyatı kontrol et"}
            <ArrowRight size={18} aria-hidden />
          </button>
        </form>
      ) : (
        <div className="pi-data-note">
          <CircleAlert size={18} aria-hidden />
          <span>
            Bu paket için güvenilir fiyat kontrolü sunacak kadar veri henüz
            birikmedi.
          </span>
        </div>
      )}

      {priceError ? (
        <div className="pi-error" role="alert">
          <CircleAlert size={18} aria-hidden />
          <span>{priceError}</span>
        </div>
      ) : null}

      {priceResult ? (
        <article className={`pi-result pi-result--${position.tone}`}>
          <div className="pi-result-lead">
            <div className="pi-result-icon">
              <PositionIcon size={22} aria-hidden />
            </div>
            <div>
              <span>{position.eyebrow}</span>
              <strong>{position.title}</strong>
              <p>
                Piyasa medyanına göre{" "}
                <b>{signedPercent(assessment?.difference_vs_median_pct)}</b>
              </p>
            </div>
          </div>

          <div className="pi-result-grid">
            <div>
              <span>İlan fiyatı</span>
              <strong>{money(priceResult.asking_price)}</strong>
            </div>
            <div>
              <span>Piyasa medyanı</span>
              <strong>{money(reference?.median_price)}</strong>
            </div>
            <div>
              <span>Tipik fiyat bandı</span>
              <strong>
                {money(reference?.p25_price)} – {money(reference?.p75_price)}
              </strong>
            </div>
            <div>
              <span>Veri güveni</span>
              <strong>{confidenceLabel(assessment?.confidence)}</strong>
              <small>
                {integer.format(Number(marketContext?.total_listing_count || 0))} ilan ·{" "}
                {integer.format(Number(marketContext?.observed_week_count || 0))} hafta
              </small>
            </div>
          </div>

          <p className="pi-disclaimer">
            Bu sonuç yalnızca ilan fiyatlarını karşılaştırır. Kilometre,
            kondisyon, hasar geçmişi, donanım ve satıcı tipi gerçek değeri
            değiştirebilir.
          </p>
        </article>
      ) : null}

      <div className="pi-compare">
        <div className="pi-compare-heading">
          <div>
            <span className="pi-eyebrow">Paket karşılaştırması</span>
            <h3>Aynı model ve yıldaki diğer paketler</h3>
          </div>
          <BarChart3 size={22} aria-hidden />
        </div>

        {comparisonLoading ? (
          <div className="pi-compare-loading">Paketler karşılaştırılıyor...</div>
        ) : rows.length ? (
          <div className="pi-table-wrap">
            <table className="pi-table">
              <thead>
                <tr>
                  <th>Paket / Versiyon</th>
                  <th>Medyan</th>
                  <th>4 hafta</th>
                  <th>Veri</th>
                  <th aria-label="Detay" />
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const isCurrent = item.version_slug === version;

                  return (
                    <tr
                      key={item.version_slug}
                      className={isCurrent ? "pi-row-current" : ""}
                    >
                      <td>
                        <Link to={item.page_path}>
                          <strong>{item.version_label}</strong>
                          {isCurrent ? (
                            <span className="pi-current-badge">
                              <BadgeCheck size={14} aria-hidden />
                              Şu anki paket
                            </span>
                          ) : null}
                        </Link>
                      </td>
                      <td>{compactMoney(item.current_median_price)}</td>
                      <td>
                        <span
                          className={
                            Number(item.four_week_change_pct) > 0
                              ? "pi-trend pi-trend--up"
                              : Number(item.four_week_change_pct) < 0
                                ? "pi-trend pi-trend--down"
                                : "pi-trend"
                          }
                        >
                          {signedPercent(item.four_week_change_pct)}
                        </span>
                      </td>
                      <td>
                        <strong>{confidenceLabel(item.confidence)}</strong>
                        <small>
                          {integer.format(Number(item.total_listing_count || 0))} ilan
                        </small>
                      </td>
                      <td>
                        <Link
                          className="pi-row-link"
                          to={item.page_path}
                          aria-label={`${item.version_label} fiyat geçmişini aç`}
                        >
                          <ArrowRight size={17} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pi-data-note">
            <CircleAlert size={18} aria-hidden />
            <span>
              Bu model ve yıl için karşılaştırılabilir başka paket bulunamadı.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
