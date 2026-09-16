import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as userCarsService from "../services/userCars";
import UserAreaBar from "../components/UserAreaBar";
import "./cars.css";

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${Math.round(number).toLocaleString("tr-TR")} TL`;
}

function formatDate(value, short = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", short
    ? { day: "numeric", month: "short" }
    : { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function resolveCarsLoader() {
  for (const name of ["getUserCars", "fetchUserCars", "loadUserCars", "listUserCars"]) {
    if (typeof userCarsService[name] === "function") return userCarsService[name];
  }
  const candidate = Object.entries(userCarsService).find(
    ([name, value]) => typeof value === "function" && /(get|fetch|load|list)/i.test(name) && /car/i.test(name),
  );
  if (candidate) return candidate[1];
  throw new Error("Araç servisi yükleyicisi bulunamadı.");
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) return { cars: payload, policy: null };
  const data = payload?.data ?? payload ?? {};
  return {
    cars: Array.isArray(data.cars) ? data.cars : Array.isArray(data.items) ? data.items : [],
    policy: data.policy ?? null,
  };
}

function historyFor(car) {
  return Array.isArray(car?.ValuationHistory) ? car.ValuationHistory : [];
}

function ValueHistory({ history }) {
  const points = history
    .filter((item) => Number.isFinite(Number(item?.PredictedPrice)))
    .slice(-12);

  if (!points.length) {
    return (
      <div className="ec-history-empty">
        <span className="ec-history-empty__mark" aria-hidden="true" />
        <div>
          <strong>Değer geçmişi ilk değerlemeyle başlar.</strong>
          <p>Sonraki değerlemeler geldikçe değişimi burada göreceksin.</p>
        </div>
      </div>
    );
  }

  const values = points.map((item) => Number(item.PredictedPrice));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, Math.max(max * 0.04, 1));
  const coords = points.map((item, index) => ({
    item,
    x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
    y: 78 - ((Number(item.PredictedPrice) - min) / span) * 56,
  }));
  const polyline = coords.map(({ x, y }) => `${x},${y}`).join(" ");
  const latest = points[points.length - 1];

  return (
    <div className="ec-history">
      <div className="ec-history__top">
        <div>
          <span>Değer geçmişi</span>
          <strong>{money(latest.PredictedPrice)}</strong>
        </div>
        <small>{points.length} kayıt</small>
      </div>

      <div className="ec-chart" role="img" aria-label="Araç değer geçmişi grafiği">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ecHistoryArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6432" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff6432" stopOpacity="0" />
            </linearGradient>
          </defs>
          {coords.length > 1 && (
            <>
              <polygon points={`0,100 ${polyline} 100,100`} fill="url(#ecHistoryArea)" />
              <polyline
                points={polyline}
                fill="none"
                stroke="#ff6432"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
          {coords.map(({ x, y, item }) => (
            <circle
              key={item.EventID ?? item.CreatedAt}
              cx={x}
              cy={y}
              r={coords.length === 1 ? 2.8 : 2.1}
              fill="#ff6432"
              stroke="#ffffff"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="ec-chart__dates">
          {points.map((item) => (
            <span key={item.EventID ?? item.CreatedAt}>{formatDate(item.CreatedAt, true)}</span>
          ))}
        </div>
      </div>

      <div className="ec-history__meta">
        <span>{formatDate(latest.CreatedAt)}</span>
        <strong className={latest.MarketUsed ? "is-live" : ""}>
          {latest.MarketUsed ? "Güncel piyasa" : "Model referansı"}
        </strong>
      </div>
    </div>
  );
}

function CarPanel({ car, onNewValuation }) {
  const history = historyFor(car);
  const latest = history.length ? history[history.length - 1] : car?.LatestValuation;
  const first = history.length ? history[0] : null;
  const delta = first && latest
    ? Number(latest.PredictedPrice) - Number(first.PredictedPrice)
    : null;

  return (
    <article className="ec-car">
      <header className="ec-car__head">
        <div className="ec-car__badge" aria-hidden="true">E</div>
        <div className="ec-car__title">
          <span>Kayıtlı araç</span>
          <h2>{[car.BrandName, car.ModelName, car.Year].filter(Boolean).join(" ")}</h2>
          <p>
            {[car.Trim, car.Kilometre ? `${Number(car.Kilometre).toLocaleString("tr-TR")} km` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button type="button" className="ec-btn ec-btn--dark" onClick={onNewValuation}>
          Yeni değerleme
        </button>
      </header>

      <div className="ec-car__content">
        <ValueHistory history={history} />
        <aside className="ec-car__summary">
          <div className="ec-stat ec-stat--primary">
            <span>Son değer</span>
            <strong>{latest ? money(latest.PredictedPrice) : "Henüz yok"}</strong>
            <small>{latest ? formatDate(latest.CreatedAt) : "İlk değerlemeni oluştur"}</small>
          </div>
          <div className="ec-stat">
            <span>Değişim</span>
            <strong className={delta > 0 ? "is-positive" : delta < 0 ? "is-negative" : ""}>
              {delta === null ? "—" : `${delta >= 0 ? "+" : ""}${money(delta)}`}
            </strong>
          </div>
          <div className="ec-stat">
            <span>Yakıt / Vites</span>
            <strong>{[car.FuelType, car.Transmission].filter(Boolean).join(" · ") || "—"}</strong>
          </div>
        </aside>
      </div>
    </article>
  );
}

export default function Cars() {
  const navigate = useNavigate();
  const [view, setView] = useState({ loading: true, error: "", cars: [], policy: null });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const payload = await resolveCarsLoader()();
        if (!active) return;
        const normalized = normalizePayload(payload);
        setView({ loading: false, error: "", ...normalized });
      } catch (error) {
        if (!active) return;
        setView({ loading: false, error: error?.message || "Araçların yüklenemedi.", cars: [], policy: null });
      }
    })();
    return () => { active = false; };
  }, []);

  const historyCount = useMemo(
    () => view.cars.reduce((total, car) => total + historyFor(car).length, 0),
    [view.cars],
  );
  const canAdd = view.policy?.can_add_new_car !== false;

  return (
    <div className="ec-page">
      <UserAreaBar />
      <main className="ec-shell">
        <section className="ec-intro">
          <div>
            <span className="ec-kicker">Araçlarım</span>
            <h1>Araçların.<br />Değer geçmişin.</h1>
            <p>Ne zaman ne kadardı, tek bakışta.</p>
          </div>
          <div className="ec-counts" aria-label="Araç geçmişi özeti">
            <div><strong>{view.cars.length}</strong><span>araç</span></div>
            <div><strong>{historyCount}</strong><span>değerleme</span></div>
          </div>
        </section>

        {view.policy && !canAdd && (
          <section className="ec-policy">
            <span>Yeni araç</span>
            <strong>{view.policy.days_remaining ?? 0} gün sonra</strong>
            <small>Mevcut geçmişin açık kalır.</small>
          </section>
        )}

        {view.loading && <div className="ec-state">Araç geçmişin hazırlanıyor…</div>}
        {!view.loading && view.error && <div className="ec-state ec-state--error">{view.error}</div>}

        {!view.loading && !view.error && !view.cars.length && (
          <section className="ec-empty">
            <div className="ec-car__badge" aria-hidden="true">E</div>
            <h2>İlk aracınla başla.</h2>
            <p>Değerlemeyi kaydettiğinde geçmiş burada oluşur.</p>
            <button type="button" className="ec-btn ec-btn--accent" onClick={() => navigate("/valuation")}>
              Değerlemeye başla
            </button>
          </section>
        )}

        {!view.loading && !view.error && view.cars.length > 0 && (
          <section className="ec-list" aria-label="Kayıtlı araçlar">
            {view.cars.map((car) => (
              <CarPanel
                key={car.UserCarID ?? `${car.BrandID}-${car.ModelID}-${car.Year}`}
                car={car}
                onNewValuation={() => navigate("/valuation")}
              />
            ))}
          </section>
        )}

        <section className="ec-add">
          <div>
            <span className="ec-kicker">Yeni araç</span>
            <h2>{canAdd ? "Başka bir aracın mı var?" : "Yeni araç hakkın henüz kapalı."}</h2>
          </div>
          <button
            type="button"
            className="ec-btn ec-btn--accent"
            disabled={!canAdd}
            onClick={() => navigate("/valuation")}
          >
            {canAdd ? "Değerlemeye başla" : `${view.policy?.days_remaining ?? 0} gün kaldı`}
          </button>
        </section>
      </main>
    </div>
  );
}
