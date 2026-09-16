import { useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Skeleton, Tag, Typography, message } from "antd";
import {
  CarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { UserCarsAPI } from "../services/userCars";
import "./cars.css";

// EDER_03J20R1_UTF8_CLICKABLE_VALUATION_HISTORY
const { Title, Text } = Typography;

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Değer bilgisi yok";

  return `${Math.round(number).toLocaleString("tr-TR")} TL`;
}

function carKey(car, index) {
  return String(
    car?.UserCarID ??
      car?.userCarId ??
      car?.id ??
      `${car?.BrandID ?? car?.BrandName ?? "car"}-${car?.ModelID ?? car?.ModelName ?? index}-${car?.Year ?? ""}`,
  );
}

function historyDate(item) {
  return (
    item?.CreatedAt ??
    item?.createdAt ??
    item?.created_at ??
    item?.ValuationDate ??
    item?.valuationDate ??
    item?.date ??
    null
  );
}

function historyPrice(item) {
  return (
    item?.PredictedPrice ??
    item?.predictedPrice ??
    item?.predicted_price ??
    item?.PredictedValue ??
    item?.predictedValue ??
    item?.MarketValue ??
    item?.marketValue ??
    item?.Value ??
    item?.value ??
    null
  );
}

function historyKilometre(item, car) {
  return (
    item?.Kilometre ??
    item?.kilometre ??
    item?.Mileage ??
    item?.mileage ??
    item?.Km ??
    item?.km ??
    car?.Kilometre ??
    null
  );
}

function valuationHistory(car) {
  const candidates = [
    car?.ValuationHistory,
    car?.valuationHistory,
    car?.valuation_history,
    car?.History,
    car?.history,
    car?.Valuations,
    car?.valuations,
  ];

  let items = candidates.find(Array.isArray) || [];

  if (!items.length) {
    const latest =
      car?.LatestValuation ??
      car?.latestValuation ??
      car?.latest_valuation ??
      null;

    if (latest && typeof latest === "object") {
      items = [latest];
    }
  }

  return [...items].sort((a, b) => {
    const aTime = new Date(historyDate(a) || 0).getTime();
    const bTime = new Date(historyDate(b) || 0).getTime();
    return bTime - aTime;
  });
}

function marketLabel(item) {
  const marketUsed =
    item?.MarketUsed ??
    item?.marketUsed ??
    item?.market_used;

  if (marketUsed === true) return "Güncel piyasa";
  if (marketUsed === false) return "Model referansı";
  return "Değerleme kaydı";
}

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCar, setOpenCar] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await UserCarsAPI.list();
        if (!active) return;

        const payload = data?.data ?? data ?? {};
        setCars(Array.isArray(payload?.cars) ? payload.cars : []);
        setPolicy(payload?.policy || null);
      } catch (error) {
        if (active) {
          message.error(error?.message || "Araç geçmişi yüklenemedi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const canAdd = policy?.can_add_new_car !== false;
  const daysRemaining = Number(policy?.days_remaining || 0);

  const totalValuations = useMemo(
    () => cars.reduce((total, car) => total + valuationHistory(car).length, 0),
    [cars],
  );

  function toggleCar(key) {
    setOpenCar((current) => (current === key ? null : key));
  }

  return (
    <div className="eder-cars">
      <section className="eder-cars__head">
        <div>
          <span>ARAÇLARIM</span>
          <Title level={2}>Araç geçmişin.</Title>
          <Text>
            Paneline kaydettiğin araçları ve önceki değerlemelerini burada takip et.
          </Text>
        </div>

        {canAdd ? (
          <Link to="/arac-degerleme">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Yeni araç değerle
            </Button>
          </Link>
        ) : (
          <Button size="large" disabled icon={<ClockCircleOutlined />}>
            {Math.max(1, daysRemaining)} gün sonra yeni araç
          </Button>
        )}
      </section>

      <Card className={`eder-cars__policy${canAdd ? " is-ready" : " is-locked"}`}>
        <div>
          <span>90 GÜNLÜK KURAL</span>
          <strong>
            {canAdd
              ? "Yeni araç hakkın açık."
              : "Yeni araç hakkın henüz açılmadı."}
          </strong>
        </div>
        <Text>
          {canAdd
            ? "Bir araç kaydettiğinde sonraki yeni araç kaydı 90 gün sonra açılır."
            : `Sonraki kayıt tarihi ${formatDate(policy?.next_add_at)}. Mevcut kayıtlarını ve değerleme geçmişini görüntülemeye devam edebilirsin.`}
        </Text>
      </Card>

      <Card className="eder-cars__history">
        <div className="eder-cars__history-head">
          <div>
            <span>KAYIT GEÇMİŞİ</span>
            <strong>{cars.length} araç</strong>
          </div>
          <small>{totalValuations} değerleme</small>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : cars.length === 0 ? (
          <Empty description="Henüz araç kaydın yok." />
        ) : (
          <div className="eder-cars__list">
            {cars.map((car, index) => {
              const key = carKey(car, index);
              const history = valuationHistory(car);
              const isOpen = openCar === key;

              return (
                <div className={`eder-cars__item-wrap${isOpen ? " is-open" : ""}`} key={key}>
                  <button
                    type="button"
                    className="eder-cars__item"
                    onClick={() => toggleCar(key)}
                    aria-expanded={isOpen}
                    aria-controls={`car-history-${key}`}
                  >
                    <div className="eder-cars__index">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="eder-cars__icon">
                      <CarOutlined />
                    </div>

                    <div className="eder-cars__identity">
                      <strong>
                        {[car.BrandName, car.ModelName, car.Year].filter(Boolean).join(" ")}
                      </strong>
                      <span>{car.Trim || "Donanım belirtilmemiş"}</span>
                    </div>

                    <div className="eder-cars__facts">
                      <Tag>{Number(car.Kilometre || 0).toLocaleString("tr-TR")} km</Tag>
                      <small>Eklenme: {formatDate(car.CreatedAt)}</small>
                      <span className="eder-cars__history-link">
                        {history.length
                          ? `${history.length} değerleme · ${isOpen ? "Geçmişi gizle" : "Geçmişi göster"}`
                          : isOpen
                            ? "Detayı gizle"
                            : "Detayı göster"}
                        <b aria-hidden="true">{isOpen ? "↑" : "↓"}</b>
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <section
                      id={`car-history-${key}`}
                      className="eder-cars__valuation-history"
                      aria-label={`${[car.BrandName, car.ModelName, car.Year].filter(Boolean).join(" ")} değerleme geçmişi`}
                    >
                      <div className="eder-cars__valuation-title">
                        <div>
                          <span>DEĞERLEME GEÇMİŞİ</span>
                          <strong>Bu araca ait önceki kayıtlar</strong>
                        </div>
                        <small>{history.length} kayıt</small>
                      </div>

                      {history.length === 0 ? (
                        <div className="eder-cars__valuation-empty">
                          Bu araç için kayıtlı değerleme geçmişi bulunamadı.
                        </div>
                      ) : (
                        <div className="eder-cars__valuation-list">
                          {history.map((item, historyIndex) => {
                            const km = historyKilometre(item, car);
                            return (
                              <div
                                className="eder-cars__valuation-row"
                                key={
                                  item?.EventID ??
                                  item?.eventId ??
                                  item?.id ??
                                  `${historyDate(item) ?? "history"}-${historyIndex}`
                                }
                              >
                                <div>
                                  <span>{formatDate(historyDate(item))}</span>
                                  <small>{marketLabel(item)}</small>
                                </div>
                                <div>
                                  <span>Kilometre</span>
                                  <strong>
                                    {Number.isFinite(Number(km))
                                      ? `${Number(km).toLocaleString("tr-TR")} km`
                                      : "—"}
                                  </strong>
                                </div>
                                <div className="eder-cars__valuation-price">
                                  <span>Tahmini değer</span>
                                  <strong>{formatMoney(historyPrice(item))}</strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
