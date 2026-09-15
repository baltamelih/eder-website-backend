import { useEffect, useMemo, useState } from "react";
import { ValuationFeedbackAPI } from "../services/valuationFeedback";
import "./valuation-feedback-panel.css";

// EDER_03F6B_PRICE_EXPECTATION_UI
const digits = (value) => String(value ?? "").replace(/\D/g, "");
const asNumber = (value) => Number(digits(value)) || 0;
const formatTL = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `${Math.round(n).toLocaleString("tr-TR")} TL` : "-";
};

function damageCounts(damageMap = {}) {
  const counts = { changed: 0, painted: 0, localPainted: 0 };
  Object.values(damageMap).forEach((state) => {
    if (state === "changed") counts.changed += 1;
    if (state === "painted") counts.painted += 1;
    if (state === "localPainted") counts.localPainted += 1;
  });
  return counts;
}

function predictionPayload(formData) {
  const counts = damageCounts(formData.damageMap);
  const heavy = Boolean(formData.hasChassisRepair || formData.hasPodyeRepair || formData.hasPillarRepair);
  return {
    BrandID: formData.brandId,
    ModelID: formData.modelId,
    Year: Number(formData.year),
    Kilometre: asNumber(formData.km),
    FuelType: formData.fuelType,
    Transmission: formData.transmission,
    BodyType: formData.bodyType,
    Color: formData.color,
    Traction: formData.traction,
    TotalChangedParts: counts.changed,
    TotalPaintedParts: counts.painted,
    TotalLocalPaintParts: counts.localPainted,
    HasHeavyDamage: heavy ? 1 : 0,
    TramerNote: formData.tramerNote || "",
    hasChassisRepair: formData.hasChassisRepair ? 1 : 0,
    hasPodyeRepair: formData.hasPodyeRepair ? 1 : 0,
    hasPillarRepair: formData.hasPillarRepair ? 1 : 0,
    ModelRaw: formData.trim || null,
    RefAvgPrice: formData.trimStats?.avg_price || null,
  };
}

export default function ValuationFeedbackPanel({ formData, result }) {
  const defaultExpectation = useMemo(() => Number(result?.range_mid || result?.predicted_price || 0), [result]);
  const [expectedPrice, setExpectedPrice] = useState("");
  const [expectedNote, setExpectedNote] = useState("");
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saleOpen, setSaleOpen] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [saleChannel, setSaleChannel] = useState("");
  const [saleNote, setSaleNote] = useState("");

  useEffect(() => {
    setExpectedPrice(defaultExpectation ? String(Math.round(defaultExpectation)) : "");
    setExpectedNote("");
    setSaved(null);
    setError("");
    setSaleOpen(false);
    setSalePrice("");
    setSoldAt("");
    setSaleChannel("");
    setSaleNote("");
  }, [defaultExpectation, result?.title]);

  const saveExpectation = async () => {
    const price = asNumber(expectedPrice);
    if (price < 50000) {
      setError("Beklediğin fiyatı en az 50.000 TL olarak gir.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await ValuationFeedbackAPI.saveExpectation({
        expected_price: price,
        expected_note: expectedNote.trim() || null,
        vehicle_label: result?.title || "",
        valuation_payload: predictionPayload(formData),
      });
      setSaved(response?.feedback || response);
    } catch (e) {
      if (e?.status === 401) {
        setError("Beklentini kaydetmek için giriş yapmalısın.");
        return;
      }
      setError(e?.message || "Fiyat beklentin kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const reportSale = async () => {
    const price = asNumber(salePrice);
    if (!saved?.feedbackid || price < 50000) {
      setError("Gerçekleşen satış fiyatını gir.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await ValuationFeedbackAPI.reportSale(saved.feedbackid, {
        sale_price: price,
        sold_at: soldAt || null,
        sale_channel: saleChannel.trim() || null,
        sale_note: saleNote.trim() || null,
      });
      setSaved(response?.feedback || response);
      setSaleOpen(false);
    } catch (e) {
      setError(e?.message || "Satış bilgisi kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="valuation-feedback" aria-labelledby="valuation-feedback-title">
      <div className="valuation-feedback__head">
        <div>
          <span>GERÇEK KULLANICI GERİ BİLDİRİMİ</span>
          <h4 id="valuation-feedback-title">Sen bu araç için ne kadar bekliyorsun?</h4>
        </div>
        <div className="valuation-feedback__model">
          <span>EDER merkezi</span>
          <strong>{formatTL(result?.range_mid)}</strong>
        </div>
      </div>

      {!saved ? (
        <div className="valuation-feedback__entry">
          <label>
            <span>Benim satış beklentim</span>
            <div className="valuation-feedback__money">
              <input
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(digits(e.target.value))}
                inputMode="numeric"
                aria-label="Satış fiyatı beklentin"
              />
              <em>TL</em>
            </div>
          </label>
          <label className="valuation-feedback__note">
            <span>Kısa not <small>opsiyonel</small></span>
            <input
              value={expectedNote}
              onChange={(e) => setExpectedNote(e.target.value.slice(0, 240))}
              placeholder="Örn. İlanı acele etmeden vermeyi düşünüyorum"
            />
          </label>
          <button type="button" className="valuation-feedback__primary" disabled={busy} onClick={saveExpectation}>
            {busy ? "Kaydediliyor..." : "Beklentimi kaydet"}
          </button>
        </div>
      ) : (
        <div className="valuation-feedback__saved">
          <div>
            <span>Beklentin kaydedildi</span>
            <strong>{formatTL(saved.expectedprice)}</strong>
            <small>Bu kayıt sana ait gerçek geri bildirim olarak saklanıyor.</small>
          </div>
          <button type="button" onClick={() => setSaleOpen((x) => !x)}>
            {saved.verificationstatus === "pending" ? "Satış bildirildi" : "Satış gerçekleşti"}
          </button>
        </div>
      )}

      {saved?.verificationstatus === "pending" ? (
        <div className="valuation-feedback__verification is-pending">
          <strong>Doğrulama bekliyor</strong>
          <span>Bildirdiğin satış kaydı doğrulanana kadar kamuya açık istatistiklerde “doğrulanmış satış” olarak kullanılmaz.</span>
        </div>
      ) : null}

      {saleOpen && saved?.verificationstatus !== "pending" ? (
        <div className="valuation-feedback__sale">
          <div className="valuation-feedback__sale-head">
            <span>GERÇEKLEŞEN SATIŞ</span>
            <strong>Aracın gerçekten satıldıysa sonucu paylaş.</strong>
          </div>
          <div className="valuation-feedback__sale-grid">
            <label>
              <span>Satış fiyatı</span>
              <div className="valuation-feedback__money">
                <input value={salePrice} onChange={(e) => setSalePrice(digits(e.target.value))} inputMode="numeric" />
                <em>TL</em>
              </div>
            </label>
            <label><span>Satış tarihi</span><input type="date" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} /></label>
            <label><span>Nerede satıldı? <small>opsiyonel</small></span><input value={saleChannel} onChange={(e) => setSaleChannel(e.target.value.slice(0, 60))} placeholder="Örn. bireysel ilan" /></label>
            <label><span>Not <small>opsiyonel</small></span><input value={saleNote} onChange={(e) => setSaleNote(e.target.value.slice(0, 400))} placeholder="Pazarlık veya satış süreci" /></label>
          </div>
          <button type="button" className="valuation-feedback__primary" disabled={busy} onClick={reportSale}>
            {busy ? "Kaydediliyor..." : "Gerçekleşen satışı bildir"}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="valuation-feedback__error" role="alert">
          <span>{error}</span>
          {error.includes("giriş") ? <a href="/login?next=/valuation">Giriş yap</a> : null}
        </div>
      ) : null}

      <p className="valuation-feedback__privacy">
        Kendi bildirdiğin satış fiyatı otomatik olarak doğrulanmış sayılmaz. Yalnız doğrulama sürecini geçen gerçek satış kayıtları ileride EDER güven verilerinde kullanılabilir.
      </p>
    </section>
  );
}
