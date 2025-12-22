import { Card, Switch, Typography, Divider, message, Button, Form, Input, Select, Alert, Space, Row, Col, Tag } from "antd";
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Mail, User, Crown, Save, RefreshCw } from "lucide-react";
import { useState } from "react";
import { setMockIsPremium } from "../services/mockSubscription";
import { useSubscription } from "../services/SubscriptionContext";
import { useAuth } from "../services/AuthContext";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export default function Settings() {
  const { refreshSubscription, isPremium } = useSubscription();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    priceAlerts: isPremium,
    newsletter: false
  });
  const [preferences, setPreferences] = useState({
    language: 'tr',
    theme: 'light',
    currency: 'TRY',
    autoSave: true
  });

  async function onTogglePremium(checked) {
    setMockIsPremium(checked);
    await refreshSubscription();
    message.success(checked ? "Premium aktif (mock)" : "Free mod (mock)");
  }

  async function onSaveProfile(values) {
    setLoading(true);
    try {
      // Backend API çağrısı burada olacak
      console.log("Profile update:", values);
      message.success("Profil bilgileri güncellendi");
    } catch (error) {
      message.error("Güncelleme sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  function onNotificationChange(key, value) {
    setNotifications(prev => ({ ...prev, [key]: value }));
    message.success("Bildirim ayarları güncellendi");
  }

  function onPreferenceChange(key, value) {
    setPreferences(prev => ({ ...prev, [key]: value }));
    message.success("Tercihler güncellendi");
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <SettingsIcon size={28} color="#FF7A18" />
          <Title level={2} style={{ margin: 0 }}>Ayarlar</Title>
          {isPremium && (
            <Tag color="orange" icon={<Crown size={14} />}>Premium</Tag>
          )}
        </div>
        <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: 16 }}>
          Hesap bilgilerinizi ve tercihlerinizi yönetin
        </Text>
      </div>

      {/* Profile Settings */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <User size={20} color="#FF7A18" />
            <span>Profil Bilgileri</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSaveProfile}
          initialValues={{
            full_name: user?.full_name || "",
            email: user?.email || "",
            phone: user?.phone || ""
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="full_name"
                label="Ad Soyad"
                rules={[{ required: true, message: "Ad Soyad gerekli" }]}
              >
                <Input placeholder="Örn: Ahmet Yılmaz" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: "E-posta gerekli" },
                  { type: "email", message: "Geçerli e-posta girin" }
                ]}
              >
                <Input placeholder="ornek@email.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="Telefon (İsteğe Bağlı)"
          >
            <Input placeholder="+90 555 123 45 67" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<Save size={16} />}
            >
              Profili Güncelle
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Notification Settings */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={20} color="#FF7A18" />
            <span>Bildirim Ayarları</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Text strong>E-posta Bildirimleri</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                Önemli güncellemeler ve sistem bildirimleri
              </div>
            </div>
            <Switch 
              checked={notifications.email} 
              onChange={(checked) => onNotificationChange('email', checked)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Text strong>Fiyat Değişim Uyarıları</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                Takip ettiğiniz araçlarda fiyat değişiklikleri
                {!isPremium && <Tag color="orange" size="small" style={{ marginLeft: 8 }}>Premium</Tag>}
              </div>
            </div>
            <Switch 
              checked={notifications.priceAlerts} 
              onChange={(checked) => onNotificationChange('priceAlerts', checked)}
              disabled={!isPremium}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Text strong>Haber Bülteni</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                Otomotiv sektörü haberleri ve güncellemeler
              </div>
            </div>
            <Switch 
              checked={notifications.newsletter} 
              onChange={(checked) => onNotificationChange('newsletter', checked)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Text strong>Tarayıcı Bildirimleri</Text>
              <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                Anlık bildirimler (tarayıcı izni gerekli)
              </div>
            </div>
            <Switch 
              checked={notifications.push} 
              onChange={(checked) => onNotificationChange('push', checked)}
            />
          </div>
        </Space>
      </Card>

      {/* Preferences */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Palette size={20} color="#FF7A18" />
            <span>Tercihler</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} sm={12}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                <Globe size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Dil
              </Text>
              <Select
                value={preferences.language}
                onChange={(value) => onPreferenceChange('language', value)}
                style={{ width: "100%" }}
              >
                <Option value="tr">Türkçe</Option>
                <Option value="en">English</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Para Birimi
              </Text>
              <Select
                value={preferences.currency}
                onChange={(value) => onPreferenceChange('currency', value)}
                style={{ width: "100%" }}
              >
                <Option value="TRY">₺ Türk Lirası</Option>
                <Option value="USD">$ Amerikan Doları</Option>
                <Option value="EUR">€ Euro</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Tema
              </Text>
              <Select
                value={preferences.theme}
                onChange={(value) => onPreferenceChange('theme', value)}
                style={{ width: "100%" }}
              >
                <Option value="light">Açık Tema</Option>
                <Option value="dark">Koyu Tema</Option>
                <Option value="auto">Sistem Ayarı</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
              <div>
                <Text strong>Otomatik Kaydetme</Text>
                <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
                  Değerleme verilerini otomatik kaydet
                </div>
              </div>
              <Switch 
                checked={preferences.autoSave} 
                onChange={(checked) => onPreferenceChange('autoSave', checked)}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Privacy & Security */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={20} color="#FF7A18" />
            <span>Gizlilik & Güvenlik</span>
          </div>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>Veri İndirme</Text>
            <Text style={{ color: "rgba(0,0,0,0.65)", marginBottom: 12 }}>
              KVKK kapsamında tüm verilerinizi indirin
            </Text>
            <Button icon={<RefreshCw size={16} />}>
              Verilerimi İndir
            </Button>
          </div>

          <Divider />

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>Şifre Değiştir</Text>
            <Text style={{ color: "rgba(0,0,0,0.65)", marginBottom: 12 }}>
              Hesap güvenliğiniz için düzenli şifre değiştirin
            </Text>
            <Button>
              Şifre Değiştir
            </Button>
          </div>

          <Divider />

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>İki Faktörlü Doğrulama</Text>
            <Text style={{ color: "rgba(0,0,0,0.65)", marginBottom: 12 }}>
              Hesabınızı ekstra güvenlik katmanı ile koruyun
              {!isPremium && <Tag color="orange" size="small" style={{ marginLeft: 8 }}>Premium</Tag>}
            </Text>
            <Button disabled={!isPremium}>
              {isPremium ? "Etkinleştir" : "Premium Gerekli"}
            </Button>
          </div>
        </Space>
      </Card>

      {/* Developer/Mock Settings */}
      <Card 
        title="Geliştirici Ayarları (Mock)"
        style={{ borderRadius: 16, marginBottom: 24, border: "2px dashed rgba(255, 122, 24, 0.3)" }}
      >
        <Alert
          message="Test Amaçlı"
          description="Backend gelene kadar Premium/Free akışını UI'da test etmek için mock kontrol."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Text strong>Premium Mod (Mock)</Text>
            <div style={{ color: "rgba(0,0,0,0.60)", marginTop: 4 }}>
              Açıkken reklamlar gizlenir, premium etiketleri görünür
            </div>
          </div>
          <Switch checked={isPremium} onChange={onTogglePremium} />
        </div>
      </Card>
    </div>
  );
}
