import { Alert, Button, Card, Space, Typography } from "antd";
import { Mail, ShieldAlert, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function DeleteAccount() {
  const subject = encodeURIComponent("EDER hesap silme talebi");

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Trash2 size={26} color="#dc2626" />
          <Title level={2} style={{ margin: 0 }}>
            Hesap Silme
          </Title>
        </div>

        <Paragraph style={{ marginTop: 18, fontSize: 16 }}>
          Hesap silme işlemi kalıcıdır. Talebin doğrulanabilmesi için hesabında
          kullandığın e-posta adresinden bize ulaşman gerekir.
        </Paragraph>

        <Alert
          type="warning"
          showIcon
          icon={<ShieldAlert size={18} />}
          message="Silme işleminden önce"
          description="Hesabın, kayıtlı araçların ve hesabına bağlı kişisel verilerin silinmesi talep edilir. Yasal saklama zorunluluğu bulunan kayıtlar ilgili süre boyunca korunabilir."
          style={{ marginBottom: 20 }}
        />

        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Text>
            Talebi göndermek için aşağıdaki düğme, varsayılan e-posta
            uygulamanda destek adresimize hazır bir mesaj açar.
          </Text>

          <Button
            danger
            type="primary"
            icon={<Mail size={16} />}
            href={`mailto:destek@ederapp.com?subject=${subject}`}
          >
            Hesap Silme Talebi Gönder
          </Button>

          <Link to="/privacy">
            <Button>Gizlilik Politikasını İncele</Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
