import { Card, Typography, Divider, Button, Row, Col } from "antd";
import { Mail, MessageCircle, Phone, Clock, HelpCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function Support() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={2} style={{ marginTop: 0, color: "#FF7A18" }}>
          Destek & Yardım
        </Title>
        
        <Paragraph style={{ color: "rgba(0,0,0,0.70)", fontSize: 16, marginBottom: 24 }}>
          Size nasıl yardımcı olabiliriz? Sorularınız için aşağıdaki kanalları kullanabilirsiniz.
        </Paragraph>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card 
              size="small" 
              style={{ 
                borderRadius: 12, 
                border: "1px solid rgba(255,122,24,0.2)",
                background: "rgba(255,122,24,0.02)"
              }}
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Mail size={32} color="#FF7A18" style={{ marginBottom: 12 }} />
                <Title level={4} style={{ margin: "0 0 8px 0" }}>E-posta Desteği</Title>
                <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                  Detaylı sorularınız için
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Button type="primary" href="mailto:destek@ederapp.com">
                    destek@ederapp.com
                  </Button>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              size="small" 
              style={{ 
                borderRadius: 12, 
                border: "1px solid rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <MessageCircle size={32} color="#666" style={{ marginBottom: 12 }} />
                <Title level={4} style={{ margin: "0 0 8px 0" }}>Canlı Destek</Title>
                <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                  Yakında aktif olacak
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Button disabled>
                    Çok Yakında
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Title level={3}>Sık Sorulan Sorular</Title>
        
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <HelpCircle size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Değerleme sonuçları ne kadar doğru?
          </Text>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}>
            Değerleme sonuçlarımız piyasa verilerine dayalı tahminlerdir. Kesin fiyat garantisi vermemekteyiz.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <HelpCircle size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Premium üyelik nasıl iptal edilir?
          </Text>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}>
            Hesap ayarlarından premium üyeliğinizi istediğiniz zaman iptal edebilirsiniz.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <HelpCircle size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Verilerim güvende mi?
          </Text>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}>
            Tüm verileriniz KVKK kapsamında korunmaktadır. Detaylar için gizlilik politikamızı inceleyebilirsiniz.
          </Paragraph>
        </div>

        <Divider />

        <Title level={3}>Çalışma Saatleri</Title>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Clock size={20} color="#FF7A18" />
          <div>
            <Text strong>Pazartesi - Cuma:</Text> 09:00 - 18:00<br/>
            <Text strong>Hafta Sonu:</Text> 10:00 - 16:00
          </div>
        </div>

        <Divider />

        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Text style={{ color: "rgba(0,0,0,0.60)" }}>
            Daha fazla bilgi için{" "}
            <Link to="/terms" style={{ color: "#FF7A18" }}>
              <FileText size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Kullanım Şartları
            </Link>
            {" "}sayfamızı ziyaret edebilirsiniz.
          </Text>
        </div>
      </Card>
    </div>
  );
}
