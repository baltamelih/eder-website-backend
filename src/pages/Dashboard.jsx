import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  List,
  message,
  Row,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  BarChartOutlined,
  CarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
      } catch (error) {
        message.error(error.message || "Araçlar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const valuedCars = cars.filter((car) => car.last_valuation).length;

  return (
    <div style={{ padding: "0 0 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
          Hoş geldin, {user?.full_name || user?.name || "Kullanıcı"}!
        </Title>
        <Text type="secondary">
          Kayıtlı araçlarını görüntüle ve yeni bir EDER değerlemesi başlat.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Kayıtlı Araç"
              value={cars.length}
              prefix={<CarOutlined style={{ color: "#ff7a18" }} />}
              valueStyle={{ color: "#ff7a18", fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Değerleme Kaydı Olan Araç"
              value={valuedCars}
              prefix={<BarChartOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 16 }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>Araçlarım ({cars.length})</span>
            <Link to="/valuation">
              <Button type="primary" icon={<PlusOutlined />} size="small">
                Yeni Değerleme
              </Button>
            </Link>
          </div>
        }
      >
        {cars.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CarOutlined
              style={{
                fontSize: 48,
                color: "#d9d9d9",
                marginBottom: 16,
              }}
            />
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Henüz kayıtlı aracın yok.
              </Text>
            </div>
            <Link to="/valuation">
              <Button type="primary" icon={<PlusOutlined />}>
                İlk Değerlemeyi Başlat
              </Button>
            </Link>
          </div>
        ) : (
          <List
            loading={loading}
            dataSource={cars}
            renderItem={(car, index) => (
              <List.Item style={{ padding: "16px 0" }}>
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          marginBottom: 4,
                        }}
                      >
                        {car.BrandName} {car.ModelName} {car.Year}
                      </div>
                      <Text type="secondary">
                        {car.Trim || "Donanım belirtilmemiş"}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <Tag color="blue" style={{ margin: 0 }}>
                        {(car.Kilometre || 0).toLocaleString("tr-TR")} km
                      </Tag>
                      <Tag color="green" style={{ margin: 0 }}>
                        #{index + 1}
                      </Tag>
                    </div>
                  </div>

                  {car.last_valuation && (
                    <div
                      style={{
                        padding: 12,
                        background: "#f6f7fb",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Son değerleme: {car.last_valuation}
                      </Text>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card
        style={{
          borderRadius: 16,
          marginTop: 24,
          border: "1px solid rgba(255,122,24,0.18)",
          background: "rgba(255,122,24,0.04)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            Aracının güncel tahmini aralığını gör
          </Title>
          <Text type="secondary">
            Değerleme akışı ücretsizdir ve birkaç temel araç bilgisiyle başlar.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Link to="/valuation">
              <Button type="primary" size="large">
                Değerlemeye Git
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
