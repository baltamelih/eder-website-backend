import { useEffect, useState } from "react";
import { ValuationFeedbackAPI } from "../services/valuationFeedback";
import "./verified-market-insights.css";

// EDER_03F6D_VERIFIED_MARKET_INSIGHTS
const fmtInt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export default function VerifiedMarketInsights() {
  const [state, setState] = useState({ loading: true, data: null, error: false });

  useEffect(() => {
    let active = true;
    ValuationFeedbackAPI.verifiedInsights()
      .then((data) => {
        if (active) setState({ loading: false, data, error: false });
      })
      .catch(() => {
        if (active) setState({ loading: false, data: null, error: true });
      });
    return () => { active = false; };
  }, []);

  const data = state.data;
  const ready = Boolean(data?.sample_sufficient && data?.metrics);
  const current = Number(data?.verified_sample_size || 0);
  const minimum = Number(data?.minimum_sample_size || 10);
  const progress = Math.min(100, Math.round((current / Math.max(1, minimum)) * 100));

  return (
    <section className="verified-market" aria-labelledby="verified-market-title">
      <div className="verified-market__shell">
        <div className="verified-market__copy">
          <span className="verified-market__eyebrow">DOĞRULANMIŞ SATIŞ GERİ BESLEMESİ</span>
          <h2 id="verified-market-title">Tahminin gerçek satışla buluştuğu yer.</h2>
          <p>
            EDER bu alanda yalnızca satış bildirimi incelenip <strong>doğrulanan</strong> kayıtları
            toplulaştırır. Bekleyen, reddedilen veya yalnızca kullanıcı tarafından bildirilen
            satışlar bu metriklere girmez.
          </p>
        </div>

        {state.loading ? (
          <div className="verified-market__state" aria-live="polite">Doğrulanmış satış metrikleri hazırlanıyor…</div>
        ) : state.error ? (
          <div className="verified-market__state">Doğrulanmış satış özeti şu anda görüntülenemiyor.</div>
        ) : ready ? (
          <div className="verified-market__metrics">
            <article>
              <small>Değer aralığında kapanan</small>
              <strong>%{Number(data.metrics.within_range_rate_pct).toFixed(0)}</strong>
              <span>{fmtInt.format(current)} doğrulanmış satış üzerinden</span>
            </article>
            <article>
              <small>Medyan tahmin sapması</small>
              <strong>%{Number(data.metrics.median_prediction_error_pct).toFixed(1)}</strong>
              <span>Düşük değer, tahmin ile satışın birbirine daha yakın olduğunu gösterir.</span>
            </article>
            <article>
              <small>Son 90 gün</small>
              <strong>{fmtInt.format(Number(data.metrics.verified_last_90_days || 0))}</strong>
              <span>İncelemesi tamamlanmış gerçek satış kaydı</span>
            </article>
          </div>
        ) : (
          <div className="verified-market__building">
            <div className="verified-market__building-head">
              <strong>Doğrulanmış veri birikiyor</strong>
              <span>{current} / {minimum} kayıt</span>
            </div>
            <div className="verified-market__progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
            <p>
              Anlamlı bir oran göstermek için en az {minimum} doğrulanmış satış bekliyoruz.
              Yeterli örneklem oluşmadan yüzde veya başarı oranı yayınlamıyoruz.
            </p>
          </div>
        )}

        <div className="verified-market__method">
          <span>METODOLOJİ</span>
          <p>Yalnız <b>verified</b> satışlar · Kişisel veri gösterilmez · Minimum örneklem: {minimum}</p>
        </div>
      </div>
    </section>
  );
}
