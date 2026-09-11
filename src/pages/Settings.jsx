import {
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import {
  Bell,
  Globe,
  KeyRound,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Settings() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newsletter: false,
  });

  const [preferences, setPreferences] = useState({
    language: "tr",
    theme: "light",
    currency: "TRY",
  });

  function onNotificationChange(key, value) {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  }

  function onPreferenceChange(key, value) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <SettingsIcon size={28} color="#FF7A18" />
          <Title level={2} style={{ margin: 0 }}>
            Ayarlar
          </Title>
        </div>
        <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: 16 }}>
          Hesap görünümünü, bildirim tercihlerini ve güvenlik seçeneklerini yönet.
        </Text>
      </div>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <User size={20} color="#FF7A18" />
            <span>Hesap</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text type="secondary">Ad Soyad</Text>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {user?.full_name || user?.name || "Belirtilmemiş"}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <Text type="secondary">E-posta</Text>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {user?.email || "Belirtilmemiş"}
            </div>
          </Col>
        </Row>
        <div style={{ marginTop: 16, color: "rgba(0,0,0,0.56)" }}>
          Profil alanlarının düzenlenmesi için destek ekibiyle iletişime geçebilirsin.
        </div>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={20} color="#FF7A18" />
            <span>Bildirim Tercihleri</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <Text strong>E-posta bildirimleri</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                Hesap ve hizmetle ilgili önemli bildirimler.
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onChange={(checked) => onNotificationChange("email", checked)}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <Text strong>Haber bülteni</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                EDER ürün ve içerik güncellemeleri.
              </div>
            </div>
            <Switch
              checked={notifications.newsletter}
              onChange={(checked) =>
                onNotificationChange("newsletter", checked)
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <Text strong>Tarayıcı bildirimleri</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                Bu seçenek yalnızca arayüz tercihini değiştirir; tarayıcı izni ayrıca gerekir.
              </div>
            </div>
            <Switch
              checked={notifications.push}
              onChange={(checked) => onNotificationChange("push", checked)}
            />
          </div>
        </Space>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Palette size={20} color="#FF7A18" />
            <span>Görünüm ve Bölge</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} sm={8}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              <Globe
                size={16}
                style={{ marginRight: 8, verticalAlign: "middle" }}
              />
              Dil
            </Text>
            <Select
              value={preferences.language}
              onChange={(value) => onPreferenceChange("language", value)}
              style={{ width: "100%" }}
            >
              <Option value="tr">Türkçe</Option>
              <Option value="en">English</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Para Birimi
            </Text>
            <Select
              value={preferences.currency}
              onChange={(value) => onPreferenceChange("currency", value)}
              style={{ width: "100%" }}
            >
              <Option value="TRY">₺ Türk Lirası</Option>
              <Option value="USD">$ Amerikan Doları</Option>
              <Option value="EUR">€ Euro</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Tema
            </Text>
            <Select
              value={preferences.theme}
              onChange={(value) => onPreferenceChange("theme", value)}
              style={{ width: "100%" }}
            >
              <Option value="light">Açık Tema</Option>
              <Option value="dark">Koyu Tema</Option>
              <Option value="auto">Sistem Ayarı</Option>
            </Select>
          </Col>
        </Row>

        <div style={{ marginTop: 16, color: "rgba(0,0,0,0.56)" }}>
          Bu tercihler şu an arayüz önizleme durumudur; kalıcı senkronizasyon sonraki sürümde etkinleştirilecektir.
        </div>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={20} color="#FF7A18" />
            <span>Gizlilik ve Güvenlik</span>
          </div>
        }
        style={{ borderRadius: 16 }}
      >
        <Space wrap>
          <Link to="/privacy">
            <Button icon={<Shield size={16} />}>Gizlilik Politikası</Button>
          </Link>
          <Link to="/reset-password">
            <Button icon={<KeyRound size={16} />}>Şifre Sıfırla</Button>
          </Link>
          <Link to="/delete-account">
            <Button danger icon={<Trash2 size={16} />}>
              Hesap Silme
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
