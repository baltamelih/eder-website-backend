import { useEffect, useState } from "react";
import { Button, Card, Empty, Skeleton, Tag, Typography, message } from "antd";
import {
  CarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { UserCarsAPI } from "../services/userCars";
import "./cars.css";

// EDER_03F3_90_DAY_CAR_POLICY
const { Title, Text } = Typography;

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await UserCarsAPI.list();
        if (!active) return;
        setCars(Array.isArray(data?.cars) ? data.cars : []);
        setPolicy(data?.policy || null);
      } catch (error) {
        if (active) message.error(error.message || "Araç geçmişi yüklenemedi.");
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

  return (
    <div className="eder-cars">
      <section className="eder-cars__head">
        <div>
          <span>ARAÇLARIM</span>
          <Title level={2}>Araç geçmişin.</Title>
          <Text>
            Paneline kaydettiğin araçları ve yeni araç ekleme hakkını burada takip et.
          </Text>
        </div>

        {canAdd ? (
          <Link to="/valuation">
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
            : `Sonraki kayıt tarihi ${formatDate(policy?.next_add_at)}. Mevcut kayıtlarını görüntülemeye devam edebilirsin.`}
        </Text>
      </Card>

      <Card className="eder-cars__history">
        <div className="eder-cars__history-head">
          <div>
            <span>KAYIT GEÇMİŞİ</span>
            <strong>{cars.length} araç</strong>
          </div>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : cars.length === 0 ? (
          <Empty description="Henüz araç kaydın yok." />
        ) : (
          <div className="eder-cars__list">
            {cars.map((car, index) => (
              <article key={car.UserCarID} className="eder-cars__item">
                <div className="eder-cars__index">{String(index + 1).padStart(2, "0")}</div>
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
                  <small>Güncelleme: {formatDate(car.UpdatedAt)}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
