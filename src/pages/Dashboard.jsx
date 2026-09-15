import { useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Skeleton, Tag, Typography, message } from "antd";
import {
  CarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { UserCarsAPI } from "../services/userCars";
import { useAuth } from "../services/AuthContext";
import "./dashboard.css";

// EDER_03F3_90_DAY_CAR_POLICY
const { Title, Text } = Typography;

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function vehicleTitle(car) {
  return [car.BrandName, car.ModelName, car.Year].filter(Boolean).join(" ");
}

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await UserCarsAPI.list();
        if (!active) return;
        setCars(Array.isArray(data?.cars) ? data.cars : []);
        setPolicy(data?.policy || null);
      } catch (error) {
        if (active) {
          message.error(error.message || "Araçlar yüklenemedi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const recentCars = useMemo(() => cars.slice(0, 3), [cars]);
  const canAdd = policy?.can_add_new_car !== false;
  const daysRemaining = Number(policy?.days_remaining || 0);

  return (
    <div className="eder-dashboard">
      <section className="eder-dashboard__hero">
        <div>
          <span className="eder-dashboard__eyebrow">EDER HESABIN</span>
          <Title level={2}>
            Hoş geldin, {user?.full_name || user?.name || "Kullanıcı"}.
          </Title>
          <Text>
            Araç kayıtlarını, yeni araç hakkını ve son hareketlerini tek yerden yönet.
          </Text>
        </div>

        <div className={`eder-dashboard__policy${canAdd ? " is-ready" : " is-locked"}`}>
          <div className="eder-dashboard__policy-icon">
            {canAdd ? <PlusOutlined /> : <ClockCircleOutlined />}
          </div>
          <div>
            <span>YENİ ARAÇ HAKKI</span>
            <strong>
              {canAdd
                ? "Kullanıma hazır"
                : `${Math.max(1, daysRemaining)} gün sonra yeniden açılacak`}
            </strong>
            <small>
              {canAdd
                ? "Yeni bir aracı paneline ekleyebilirsin."
                : `Sonraki tarih: ${formatDate(policy?.next_add_at)}`}
            </small>
          </div>
        </div>
      </section>

      <section className="eder-dashboard__metrics">
        <Card>
          <span>KAYITLI ARAÇ</span>
          <strong>{loading ? "—" : cars.length}</strong>
          <small>Hesabındaki araç geçmişi</small>
        </Card>

        <Card>
          <span>KURAL</span>
          <strong>90 gün</strong>
          <small>Her yeni araç kaydı arasında</small>
        </Card>

        <Card>
          <span>SON KAYIT</span>
          <strong>{cars[0] ? formatDate(cars[0].CreatedAt) : "Henüz yok"}</strong>
          <small>{cars[0] ? vehicleTitle(cars[0]) : "İlk aracını ekleyebilirsin"}</small>
        </Card>
      </section>

      <section className="eder-dashboard__grid">
        <Card className="eder-dashboard__vehicles">
          <div className="eder-dashboard__section-head">
            <div>
              <span>ARAÇ GEÇMİŞİ</span>
              <strong>Son kayıtların</strong>
            </div>
            <Link to="/app/cars">
              <Button icon={<HistoryOutlined />}>Tümünü gör</Button>
            </Link>
          </div>

          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : recentCars.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Henüz kayıtlı aracın yok."
            />
          ) : (
            <div className="eder-dashboard__vehicle-list">
              {recentCars.map((car) => (
                <article key={car.UserCarID} className="eder-dashboard__vehicle">
                  <div className="eder-dashboard__vehicle-icon">
                    <CarOutlined />
                  </div>
                  <div>
                    <strong>{vehicleTitle(car)}</strong>
                    <span>{car.Trim || "Donanım belirtilmemiş"}</span>
                  </div>
                  <div className="eder-dashboard__vehicle-meta">
                    <Tag>{Number(car.Kilometre || 0).toLocaleString("tr-TR")} km</Tag>
                    <small>{formatDate(car.CreatedAt)}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card className="eder-dashboard__action">
          <span className="eder-dashboard__eyebrow">SONRAKİ ADIM</span>
          <Title level={4}>
            {canAdd ? "Yeni araç değerlemesi oluştur." : "Mevcut aracını takip etmeye devam et."}
          </Title>
          <Text>
            {canAdd
              ? "Değerleme bittikten sonra aracını paneline kaydedebilirsin."
              : "90 günlük pencere dolana kadar yeni araç kaydı server tarafında korunur."}
          </Text>

          <div className="eder-dashboard__action-buttons">
            {canAdd ? (
              <Link to="/valuation">
                <Button type="primary" size="large" icon={<PlusOutlined />}>
                  Yeni değerleme
                </Button>
              </Link>
            ) : (
              <Button type="primary" size="large" disabled icon={<ClockCircleOutlined />}>
                {Math.max(1, daysRemaining)} gün kaldı
              </Button>
            )}

            <Link to="/app/cars">
              <Button size="large">Araçlarım</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
