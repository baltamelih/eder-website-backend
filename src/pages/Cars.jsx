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
        if (active) message.error(error.message || "Ara├ğ ge├ğmi┼şi y├╝klenemedi.");
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
          <span>ARA├çLARIM</span>
          <Title level={2}>Ara├ğ ge├ğmi┼şin.</Title>
          <Text>
            Paneline kaydetti─şin ara├ğlar─▒ ve yeni ara├ğ ekleme hakk─▒n─▒ burada takip et.
          </Text>
        </div>

        {canAdd ? (
          <Link to="/valuation">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Yeni ara├ğ de─şerle
            </Button>
          </Link>
        ) : (
          <Button size="large" disabled icon={<ClockCircleOutlined />}>
            {Math.max(1, daysRemaining)} g├╝n sonra yeni ara├ğ
          </Button>
        )}
      </section>

      <Card className={`eder-cars__policy${canAdd ? " is-ready" : " is-locked"}`}>
        <div>
          <span>90 G├£NL├£K KURAL</span>
          <strong>
            {canAdd
              ? "Yeni ara├ğ hakk─▒n a├ğ─▒k."
              : "Yeni ara├ğ hakk─▒n hen├╝z a├ğ─▒lmad─▒."}
          </strong>
        </div>
        <Text>
          {canAdd
            ? "Bir ara├ğ kaydetti─şinde sonraki yeni ara├ğ kayd─▒ 90 g├╝n sonra a├ğ─▒l─▒r."
            : `Sonraki kay─▒t tarihi ${formatDate(policy?.next_add_at)}. Mevcut kay─▒tlar─▒n─▒ g├Âr├╝nt├╝lemeye devam edebilirsin.`}
        </Text>
      </Card>

      <Card className="eder-cars__history">
        <div className="eder-cars__history-head">
          <div>
            <span>KAYIT GE├çM─░┼Ş─░</span>
            <strong>{cars.length} ara├ğ</strong>
          </div>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : cars.length === 0 ? (
          <Empty description="Hen├╝z ara├ğ kayd─▒n yok." />
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
                  <span>{car.Trim || "Donan─▒m belirtilmemi┼ş"}</span>
                </div>
                <div className="eder-cars__facts">
                  <Tag>{Number(car.Kilometre || 0).toLocaleString("tr-TR")} km</Tag>
                  <small>Eklenme: {formatDate(car.CreatedAt)}</small>
                  <small>G├╝ncelleme: {formatDate(car.UpdatedAt)}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
