import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CircleAlert,
  Layers3,
} from "lucide-react";

import { getPriceHistoryModelYearSeo } from "../../generated/priceHistoryModelYearSeo";
import priceHistoryApi from "../../services/priceHistoryApi";
import "./model-year-seo-comparison.css";

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

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ModelYearSeoComparison({
  brand,
  model,
  year,
}) {
  const cleanPath = [
    "/arac-fiyat-gecmisi",
    brand,
    model,
    year,
  ]
    .filter(Boolean)
    .join("/");

  const staticData = useMemo(
    () => getPriceHistoryModelYearSeo(cleanPath),
    [cleanPath],
  );

  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    let active = true;

    if (!staticData) {
      setLiveData(null);
      return () => {
        active = false;
      };
    }

    async function load() {
      try {
        const result = await priceHistoryApi.compare(
          brand,
          model,
          year,
        );

        if (active) setLiveData(result || null);
      } catch {
        if (active) setLiveData(null);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [brand, model, year, staticData]);

  const liveBySlug = useMemo(() => {
    const map = new Map();
    for (const item of liveData?.versions || []) {
      map.set(item.version_slug, item);
    }
    return map;
  }, [liveData]);

  const rows = useMemo(() => {
    if (!staticData) return [];
    return staticData.versions.map((item) => ({
      ...item,
      live: liveBySlug.get(item.versionSlug) || null,
    }));
  }, [staticData, liveBySlug]);

  if (!staticData) return null;

  return (
    <section
      className="myseo-shell"
      data-eder-model-year-seo="v1"
      data-eder-model-year-static="true"
    >
      <div className="myseo-heading">
        <div>
          <span className="myseo-eyebrow">Veriyle paket karşılaştırması</span>
          <h2>
            {staticData.year} {staticData.brandName} {staticData.modelName}{" "}
            paketlerini karşılaştır
          </h2>
          <p>
            Veri yeterliliği olan paketleri aynı model yılı içinde karşılaştır.
            Paket adına tıklayarak o versiyonun fiyat geçmişi ve piyasa
            grafiğine geçebilirsin.
          </p>
        </div>

        <div className="myseo-heading-icon" aria-hidden>
          <Layers3 size={24} />
        </div>
      </div>

      <div className="myseo-stats">
        <div>
          <span>Karşılaştırılan paket</span>
          <strong>{integer.format(staticData.eligibleVersionCount)}</strong>
        </div>
        <div>
          <span>Toplam ilan kaydı</span>
          <strong>{integer.format(staticData.totalListingCount)}</strong>
        </div>
        <div>
          <span>Son veri tarihi</span>
          <strong>{formatDate(staticData.lastDataDate)}</strong>
        </div>
      </div>

      <div className="myseo-table-wrap">
        <table className="myseo-table">
          <thead>
            <tr>
              <th>Paket / Versiyon</th>
              <th>İlan verisi</th>
              <th>Piyasa medyanı</th>
              <th>4 hafta</th>
              <th aria-label="Fiyat geçmişi" />
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.versionSlug}>
                <td>
                  <Link to={item.pagePath}>
                    <strong>{item.versionLabel}</strong>
                    <small>
                      {formatDate(item.firstDataDate)} – {formatDate(item.lastDataDate)}
                    </small>
                  </Link>
                </td>
                <td>{integer.format(item.totalListingCount)} ilan</td>
                <td>{money(item.live?.current_median_price)}</td>
                <td>
                  <span
                    className={
                      Number(item.live?.four_week_change_pct) > 0
                        ? "myseo-trend myseo-trend--up"
                        : Number(item.live?.four_week_change_pct) < 0
                          ? "myseo-trend myseo-trend--down"
                          : "myseo-trend"
                    }
                  >
                    {signedPercent(item.live?.four_week_change_pct)}
                  </span>
                </td>
                <td>
                  <Link
                    className="myseo-open"
                    to={item.pagePath}
                    aria-label={`${item.versionLabel} fiyat geçmişini aç`}
                  >
                    <ArrowRight size={17} aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!liveData ? (
        <div className="myseo-static-note">
          <CircleAlert size={17} aria-hidden />
          <span>
            Paket listesi ve ilan adetleri EDER'in statik SEO veri setinden
            gösteriliyor. Canlı fiyat servisi erişilebilir olduğunda medyan ve
            4 haftalık değişim de otomatik tamamlanır.
          </span>
        </div>
      ) : null}

      <div className="myseo-method">
        <BarChart3 size={17} aria-hidden />
        <span>
          Karşılaştırma ilan fiyatlarından türetilir; satış/işlem fiyatı
          değildir. Yalnızca EDER'in grafik için yeterli veri eşiğini geçen
          paketler bu SEO karşılaştırmasına dahil edilir.
        </span>
      </div>
    </section>
  );
}
