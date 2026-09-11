import { Button, Card, Col, Divider, Row, Typography } from "antd";
import {
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function Support() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={2} style={{ marginTop: 0, color: "#FF7A18" }}>
          Destek & Yardım
        </Title>

        <Paragraph
          style={{
            color: "rgba(0,0,0,0.70)",
            fontSize: 16,
            marginBottom: 24,
          }}
        >
          Sorularınız ve teknik destek talepleriniz için aşağıdaki kanalları
          kullanabilirsiniz.
        </Paragraph>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,122,24,0.2)",
                background: "rgba(255,122,24,0.02)",
              }}
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Mail size={32} color="#FF7A18" style={{ marginBottom: 12 }} />
                <Title level={4} style={{ margin: "0 0 8px 0" }}>
                  E-posta Desteği
                </Title>
                <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                  Destek talepleriniz için
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
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <MessageCircle
                  size={32}
                  color="#666"
                  style={{ marginBottom: 12 }}
                />
                <Title level={4} style={{ margin: "0 0 8px 0" }}>
                  Canlı Destek
                </Title>
                <Text style={{ color: "rgba(0,0,0,0.70)" }}>
                  Henüz aktif değil
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Button disabled>Yakında</Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Title level={3}>Sık Sorulan Sorular</Title>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <HelpCircle
              size={16}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Değerleme sonucu kesin satış fiyatı mıdır?
          </Text>
          <Paragraph
            style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}
          >
            Hayır. Sonuç, araç bilgileri ve piyasa verileri üzerinden üretilen
            tahmini bir aralıktır; kesin fiyat garantisi değildir.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <HelpCircle
              size={16}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Değerleme limiti neden uygulanıyor?
          </Text>
          <Paragraph
            style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}
          >
            Güvenlik, kötüye kullanımın önlenmesi ve kaynakların adil
            kullanılması için dönemsel istek limitleri uygulanabilir.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <ShieldCheck
              size={16}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Verilerim nasıl işleniyor?
          </Text>
          <Paragraph
            style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}
          >
            Ayrıntılı bilgi için Gizlilik Politikası sayfasını
            inceleyebilirsiniz.
          </Paragraph>
        </div>

        <Divider />

        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Text style={{ color: "rgba(0,0,0,0.60)" }}>
            Daha fazla bilgi için{" "}
            <Link to="/terms" style={{ color: "#FF7A18" }}>
              <FileText
                size={14}
                style={{ verticalAlign: "middle", marginRight: 4 }}
              />
              Kullanım Şartları
            </Link>{" "}
            sayfamızı ziyaret edebilirsiniz.
          </Text>
        </div>
      </Card>
    </div>
  );
}
