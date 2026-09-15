import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ValuationFeedbackAPI } from "../services/valuationFeedback";
import "./feedback-history.css";

// EDER_03F6C_USER_FEEDBACK_HISTORY
const formatTL = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${Math.round(n).toLocaleString("tr-TR")} TL` : "—";
};
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("tr-TR");
};

const STATUS = {
  not_submitted: { label: "Satış bildirilmedi", tone: "neutral" },
  pending: { label: "Doğrulama bekliyor", tone: "pending" },
  verified: { label: "Doğrulanmış satış", tone: "verified" },
  rejected: { label: "Doğrulanamadı", tone: "rejected" },
};

export default function FeedbackHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReviewer, setIsReviewer] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [mine, access] = await Promise.all([
          ValuationFeedbackAPI.listMine(),
          ValuationFeedbackAPI.reviewAccess().catch(() => ({ is_reviewer: false })),
        ]);
        if (!active) return;
        setItems(mine?.items || []);
        setIsReviewer(Boolean(access?.is_reviewer));
      } catch (e) {
        if (active) setError(e?.message || "Geri bildirim kayıtları yüklenemedi.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => ({
    total: items.length,
    sold: items.filter((x) => x.saleprice).length,
    verified: items.filter((x) => x.verificationstatus === "verified").length,
  }), [items]);

  return (
    <main className="feedback-history">
      <header className="feedback-history__hero">
        <div>
          <span>GERİ BİLDİRİMLERİM</span>
          <h1>Beklentiden gerçek satışa kadar kendi kayıtların.</h1>
          <p>Burada yalnızca senin gönderdiğin fiyat beklentileri ve satış bildirimleri görünür.</p>
        </div>
        <div className="feedback-history__actions">
          {isReviewer ? <Link className="feedback-history__review-link" to="/app/feedback-review">Doğrulama paneli</Link> : null}
          <Link className="feedback-history__primary" to="/valuation">Yeni değerleme</Link>
        </div>
      </header>

      <section className="feedback-history__stats" aria-label="Geri bildirim özeti">
        <article><span>Kayıt</span><strong>{summary.total}</strong></article>
        <article><span>Satış bildirimi</span><strong>{summary.sold}</strong></article>
        <article><span>Doğrulanmış satış</span><strong>{summary.verified}</strong></article>
      </section>

      {loading ? <div className="feedback-history__state">Kayıtların yükleniyor…</div> : null}
      {error ? <div className="feedback-history__state is-error">{error}</div> : null}
      {!loading && !error && items.length === 0 ? (
        <div className="feedback-history__empty">
          <strong>Henüz fiyat beklentisi kaydetmedin.</strong>
          <span>Bir değerleme tamamladığında kendi satış beklentini sonuç ekranından kaydedebilirsin.</span>
          <Link to="/valuation">Aracını değerle</Link>
        </div>
      ) : null}

      <section className="feedback-history__list">
        {items.map((item) => {
          const status = STATUS[item.verificationstatus] || STATUS.not_submitted;
          return (
            <article className="feedback-history__card" key={item.feedbackid}>
              <div className="feedback-history__card-head">
                <div>
                  <span>KAYIT #{item.feedbackid}</span>
                  <h2>{item.vehiclelabel || "Araç değerlemesi"}</h2>
                </div>
                <span className={`feedback-history__status is-${status.tone}`}>{status.label}</span>
              </div>
              <div className="feedback-history__prices">
                <div><span>EDER merkezi</span><strong>{formatTL(item.rangemid)}</strong></div>
                <div><span>Senin beklentin</span><strong>{formatTL(item.expectedprice)}</strong></div>
                <div><span>Gerçek satış</span><strong>{formatTL(item.saleprice)}</strong></div>
              </div>
              <div className="feedback-history__meta">
                <span>Kaydedildi: {formatDate(item.createdat)}</span>
                {item.soldat ? <span>Satış: {formatDate(item.soldat)}</span> : null}
                {item.salechannel ? <span>Kanal: {item.salechannel}</span> : null}
              </div>
              {item.verificationstatus === "verified" ? (
                <p className="feedback-history__notice is-verified">Bu satış kaydı doğrulama sürecini geçti.</p>
              ) : null}
              {item.verificationstatus === "pending" ? (
                <p className="feedback-history__notice">Satış bildirimin beklemede. Doğrulanana kadar doğrulanmış satış istatistiğine dahil edilmez.</p>
              ) : null}
              {item.verificationstatus === "rejected" ? (
                <p className="feedback-history__notice is-rejected">Bu bildirim doğrulanamadı.{item.verificationnote ? ` ${item.verificationnote}` : ""}</p>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
