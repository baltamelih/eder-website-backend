import { Card, Typography, Divider, Button, Row, Col, Tag, Avatar } from "antd";
import { User, Mail, Crown, Calendar, Settings, LogOut, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useSubscription } from "../services/SubscriptionContext";
import { logout } from "../services/auth";

const { Title, Paragraph, Text } = Typography;

export default function Account() {
  const { user, refresh } = useAuth();
  const { isPremium, subscription } = useSubscription();
  const nav = useNavigate();

  async function handleLogout() {
    logout();
    await refresh();
    nav("/", { replace: true });
  }

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor';

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Avatar 
            size={64} 
            icon={<User />} 
            style={{ 
              backgroundColor: isPremium ? "#FF7A18" : "#666",
              fontSize: 24
            }}
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {user?.full_name || "Kullanıcı"}
            </Title>
            <Text style={{ color: "rgba(0,0,0,0.70)" }}>
              {user?.email || "E-posta bulunamadı"}
            </Text>
            <div style={{ marginTop: 8 }}>
              {isPremium ? (
                <Tag color="orange" icon={<Crown size={14} />}>
                  Premium Üye
                </Tag>
              ) : (
                <Tag color="default">
                  Free Üye
                </Tag>
              )}
            </div>
          </div>
        </div>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: "rgba(0,0,0,0.02)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Mail size={16} color="#666" />
                <Text strong>E-posta</Text>
              </div>
              <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                {user?.email || "Belirtilmemiş"}
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: "rgba(0,0,0,0.02)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Calendar size={16} color="#666" />
                <Text strong>Üyelik Tarihi</Text>
              </div>
              <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                {joinDate}
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: "rgba(0,0,0,0.02)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Crown size={16} color="#666" />
                <Text strong>Plan Durumu</Text>
              </div>
              <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                {isPremium ? "Premium Aktif" : "Free Plan"}
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ padding: 16, background: "rgba(0,0,0,0.02)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <User size={16} color="#666" />
                <Text strong>Hesap Durumu</Text>
              </div>
              <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                Aktif
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Title level={4} style={{ marginTop: 0 }}>Hızlı İşlemler</Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Link to="/app/settings">
              <Button 
                block 
                size="large" 
                icon={<Settings size={16} />}
                style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                Ayarlar
              </Button>
            </Link>
          </Col>

          <Col xs={24} sm={8}>
            {!isPremium ? (
              <Link to="/pricing">
                <Button 
                  block 
                  size="large" 
                  type="primary"
                  icon={<Crown size={16} />}
                  style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  Premium'a Geç
                </Button>
              </Link>
            ) : (
              <Button 
                block 
                size="large" 
                disabled
                icon={<Crown size={16} />}
                style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                Premium Aktif
              </Button>
            )}
          </Col>

          <Col xs={24} sm={8}>
            <Button 
              block 
              size="large" 
              onClick={handleLogout}
              icon={<LogOut size={16} />}
              style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Çıkış Yap
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Title level={4} style={{ marginTop: 0, color: "#ff4d4f" }}>Tehlikeli Bölge</Title>
        <Paragraph style={{ color: "rgba(0,0,0,0.70)" }}>
          Hesabınızı kalıcı olarak silmek istiyorsanız aşağıdaki butonu kullanabilirsiniz. 
          Bu işlem geri alınamaz.
        </Paragraph>
        
        <Link to="/delete-account">
          <Button 
            danger 
            icon={<Trash2 size={16} />}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            Hesabı Sil
          </Button>
        </Link>
      </Card>
    </div>
  );
}
