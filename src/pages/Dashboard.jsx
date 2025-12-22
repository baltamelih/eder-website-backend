import { useEffect, useState } from "react";
import { Card, Typography, List, Tag, message, Row, Col, Statistic, Button } from "antd";
import { CarOutlined, PlusOutlined, BarChartOutlined, TrophyOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { UserCarsAPI } from "../services/userCars";
import { useAuth } from "../services/AuthContext";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await UserCarsAPI.list();
        setCars(data.cars || []);
      } catch (e) {
        message.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isPremium = !!user?.is_premium;
  const carCount = user?.car_count ?? 0;
  const carLimit = user?.car_limit ?? 1;

  return (
    <div style={{ padding: "0 0 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
          Hoş geldin, {user?.name || "Kullanıcı"}! 👋
        </Title>
        <Text type="secondary">
          Araçlarını yönet, değerlemelerini takip et ve premium özelliklerden yararlan.
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Araç Sayısı"
              value={carCount}
              suffix={`/ ${carLimit}`}
              prefix={<CarOutlined style={{ color: "#ff7a18" }} />}
              valueStyle={{ color: "#ff7a18", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Plan"
              value={isPremium ? "Premium" : "Free"}
              prefix={<TrophyOutlined style={{ color: isPremium ? "#52c41a" : "#faad14" }} />}
              valueStyle={{ color: isPremium ? "#52c41a" : "#faad14", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Toplam Değerleme"
              value={cars.length}
              prefix={<BarChartOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Kalan Hak"
              value={carLimit - carCount}
              prefix={<PlusOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Cars List */}
      <Card 
        style={{ borderRadius: 16 }} 
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Araçlarım ({cars.length})</span>
            <Link to="/app/valuation">
              <Button type="primary" icon={<PlusOutlined />} size="small">
                Yeni Araç Ekle
              </Button>
            </Link>
          </div>
        }
      >
        {cars.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CarOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Henüz araç eklemedin
              </Text>
            </div>
            <Link to="/app/valuation">
              <Button type="primary" icon={<PlusOutlined />}>
                İlk Aracını Ekle
              </Button>
            </Link>
          </div>
        ) : (
          <List
            loading={loading}
            dataSource={cars}
            renderItem={(c, index) => (
              <List.Item style={{ padding: "16px 0" }}>
                <div style={{ width: "100%" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    gap: 12, 
                    flexWrap: "wrap",
                    marginBottom: 8
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                        {c.BrandName} {c.ModelName} {c.Year}
                      </div>
                      <Text type="secondary">{c.Trim || "Donanım belirtilmemiş"}</Text>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Tag color="blue" style={{ margin: 0 }}>
                        {(c.Kilometre || 0).toLocaleString("tr-TR")} km
                      </Tag>
                      <Tag color="green" style={{ margin: 0 }}>
                        #{index + 1}
                      </Tag>
                    </div>
                  </div>
                  {c.last_valuation && (
                    <div style={{ 
                      padding: 12, 
                      background: "#f6f7fb", 
                      borderRadius: 8,
                      marginTop: 8
                    }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Son değerleme: {c.last_valuation}
                      </Text>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Premium Upgrade */}
      {!isPremium && (
        <Card 
          style={{ 
            borderRadius: 16, 
            marginTop: 24,
            background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
            border: "none"
          }}
        >
          <div style={{ color: "white", textAlign: "center" }}>
            <TrophyOutlined style={{ fontSize: 32, marginBottom: 16 }} />
            <Title level={4} style={{ color: "white", marginBottom: 8 }}>
              Premium'a Geç, Sınırsız Araç Ekle!
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
              Sınırsız araç ekleme, detaylı raporlar ve daha fazlası...
            </Text>
            <div style={{ marginTop: 16 }}>
              <Link to="/pricing">
                <Button type="default" size="large">
                  Premium'u Keşfet
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
