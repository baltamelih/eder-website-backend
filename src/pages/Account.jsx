import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Typography,
} from "antd";
import {
  Calendar,
  LogOut,
  Mail,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const { Title, Text } = Typography;

export default function Account() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await logout();
    nav("/", { replace: true });
  }

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("tr-TR")
    : "Bilinmiyor";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 18, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Avatar
            size={64}
            icon={<User />}
            style={{ backgroundColor: "#FF7A18", fontSize: 24 }}
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {user?.full_name || user?.name || "Kullanıcı"}
            </Title>
            <Text style={{ color: "rgba(0,0,0,0.70)" }}>
              {user?.email || "E-posta bulunamadı"}
            </Text>
          </div>
        </div>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div
              style={{
                padding: 16,
                background: "rgba(0,0,0,0.02)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Mail size={16} color="#666" />
                <Text strong>E-posta</Text>
              </div>
              <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                {user?.email || "Belirtilmemiş"}
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div
              style={{
                padding: 16,
                background: "rgba(0,0,0,0.02)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Calendar size={16} color="#666" />
                <Text strong>Üyelik Tarihi</Text>
              </div>
              <Text style={{ color: "rgba(0,0,0,0.70)" }}>{joinDate}</Text>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={8}>
            <Link to="/app/settings">
              <Button
                block
                size="large"
                icon={<Settings size={16} />}
                style={{ height: 56 }}
              >
                Ayarlar
              </Button>
            </Link>
          </Col>

          <Col xs={24} sm={8}>
            <Link to="/valuation">
              <Button
                block
                size="large"
                type="primary"
                style={{ height: 56 }}
              >
                Yeni Değerleme
              </Button>
            </Link>
          </Col>

          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              danger
              icon={<LogOut size={16} />}
              onClick={handleLogout}
              style={{ height: 56 }}
            >
              Çıkış Yap
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          borderRadius: 18,
          border: "1px solid rgba(220,38,38,0.18)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Trash2 size={20} color="#dc2626" />
          <div style={{ flex: 1 }}>
            <Text strong>Hesabını silmek mi istiyorsun?</Text>
            <div style={{ marginTop: 6, color: "rgba(0,0,0,0.62)" }}>
              Hesap silme sürecini ve veri kapsamını inceleyebilirsin.
            </div>
            <Link to="/delete-account">
              <Button danger style={{ marginTop: 14 }}>
                Hesap Silme Bilgileri
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
