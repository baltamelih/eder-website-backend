import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ValuationFeedbackAPI } from "../services/valuationFeedback";
import "./feedback-review.css";

// EDER_03F6C_VERIFICATION_ADMIN_FLOW
const formatTL = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${Math.round(n).toLocaleString("tr-TR")} TL` : "—";
};
const deltaPercent = (sale, mid) => {
  const s = Number(sale); const m = Number(mid);
  if (!Number.isFinite(s) || !Number.isFinite(m) || !m) return "—";
  const pct = ((s - m) / m) * 100;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
};

export default function FeedbackReview() {
  const [allowed, setAllowed] = useState(null);
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const access = await ValuationFeedbackAPI.reviewAccess();
      if (!access?.is_reviewer) { setAllowed(false); setItems([]); return; }
      setAllowed(true);
      const data = await ValuationFeedbackAPI.reviewQueue(status);
      setItems(data?.items || []);
    } catch (e) {
      if (e?.status === 403) setAllowed(false);
      else setError(e?.message || "Doğrulama kuyruğu yüklenemedi.");
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const review = async (item, decision) => {
    const note = (notes[item.feedbackid] || "").trim();
    if (decision === "rejected" && !note) {
      setError("Reddetme kararında kısa bir açıklama yazmalısın.");
      return;
    }
    setBusyId(item.feedbackid);
    setError("");
    try {
      await ValuationFeedbackAPI.reviewFeedback(item.feedbackid, decision, note);
      setNotes((prev) => ({ ...prev, [item.feedbackid]: "" }));
      await load();
    } catch (e) {
      setError(e?.message || "Doğrulama kararı kaydedilemedi.");
    } finally {
      setBusyId(null);
    }
  };

  if (allowed === false) {
    return <main className="feedback-review"><div className="feedback-review__locked"><strong>Bu alan doğrulama ekibine açık.</strong><span>Hesabının satış doğrulama yetkisi bulunmuyor.</span><Link to="/app/feedback">Kendi kayıtlarıma dön</Link></div></main>;
  }

  return (
    <main className="feedback-review">
      <header className="feedback-review__hero">
        <div><span>DOĞRULAMA PANELİ</span><h1>Gerçek satış bildirimlerini karara bağla.</h1><p>Yalnız sunucu tarafında yetkilendirilmiş hesaplar bu kuyruğu görebilir ve karar verebilir.</p></div>
        <Link to="/app/feedback">Kendi kayıtlarım</Link>
      </header>
      <nav className="feedback-review__filters" aria-label="Doğrulama filtreleri">
        {["pending","verified","rejected"].map((key) => <button key={key} className={status===key?"is-active":""} onClick={()=>setStatus(key)} type="button">{{pending:"Bekleyen",verified:"Doğrulanmış",rejected:"Reddedilen"}[key]}</button>)}
      </nav>
      {error ? <div className="feedback-review__error" role="alert">{error}</div> : null}
      {allowed === null ? <div className="feedback-review__state">Yetki ve kuyruk kontrol ediliyor…</div> : null}
      {allowed && items.length === 0 ? <div className="feedback-review__state">Bu filtrede kayıt yok.</div> : null}
      <section className="feedback-review__list">
        {items.map((item) => (
          <article className="feedback-review__card" key={item.feedbackid}>
            <div className="feedback-review__card-head"><div><span>#{item.feedbackid} · {item.submittername || "Kullanıcı"}</span><h2>{item.vehiclelabel || "Araç değerlemesi"}</h2><small>{item.submitteremail || ""}</small></div><strong>{item.verificationstatus}</strong></div>
            <div className="feedback-review__numbers"><div><span>EDER merkezi</span><b>{formatTL(item.rangemid)}</b></div><div><span>Beklenti</span><b>{formatTL(item.expectedprice)}</b></div><div><span>Satış</span><b>{formatTL(item.saleprice)}</b></div><div><span>EDER farkı</span><b>{deltaPercent(item.saleprice,item.rangemid)}</b></div></div>
            <div className="feedback-review__facts"><span>Satış tarihi: {item.soldat || "—"}</span><span>Kanal: {item.salechannel || "—"}</span>{item.salenote ? <span>Satış notu: {item.salenote}</span> : null}</div>
            {item.verificationstatus === "pending" ? <div className="feedback-review__decision"><textarea value={notes[item.feedbackid] || ""} onChange={(e)=>setNotes((prev)=>({...prev,[item.feedbackid]:e.target.value.slice(0,500)}))} placeholder="Doğrulama notu; reddetmede zorunlu"/><div><button type="button" disabled={busyId===item.feedbackid} onClick={()=>review(item,"rejected")}>Reddet</button><button type="button" className="is-verify" disabled={busyId===item.feedbackid} onClick={()=>review(item,"verified")}>{busyId===item.feedbackid?"Kaydediliyor…":"Doğrula"}</button></div></div> : <div className="feedback-review__reviewed"><span>Karar: {item.verificationstatus === "verified" ? "Doğrulandı" : "Reddedildi"}</span>{item.verificationnote ? <span>Not: {item.verificationnote}</span> : null}{item.reviewername ? <span>İnceleyen: {item.reviewername}</span> : null}</div>}
          </article>
        ))}
      </section>
    </main>
  );
}
