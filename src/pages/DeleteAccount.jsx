import { Button, Card, Form, Input, Typography, message, Checkbox, Alert, Divider } from "antd";
import { AlertTriangle, Trash2, ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const { Title, Paragraph, Text } = Typography;

export default function DeleteAccount() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function onFinish(values) {
    if (!confirmed) {
      message.error("Lütfen silme işlemini onaylayın");
      return;
    }

    setLoading(true);
    try {
      // Backend API çağrısı burada olacak
      message.success("Hesap silme talebi alındı. E-posta adresinize onay linki gönderildi.");
      console.log("delete request", values);
      form.resetFields();
      setConfirmed(false);
    } catch (error) {
      message.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <AlertTriangle size={48} color="#ff4d4f" style={{ marginBottom: 16 }} />
          <Title level={2} style={{ marginTop: 0, color: "#ff4d4f" }}>
            Hesap Silme Talebi
          </Title>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", fontSize: 16 }}>
            Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
          </Paragraph>
        </div>

        <Alert
          message="Dikkat!"
          description={
            <div>
              <Text strong>Hesabınız silindiğinde:</Text>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Tüm araç değerleme geçmişiniz silinecek</li>
                <li>Premium üyeliğiniz iptal edilecek</li>
                <li>Kayıtlı araç bilgileriniz silinecek</li>
                <li>Bu işlem geri alınamayacak</li>
              </ul>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider />

        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish} 
          style={{ maxWidth: 420, margin: "0 auto" }}
        >
          <Form.Item 
            name="email" 
            label="E-posta Adresinizi Onaylayın"
            rules={[
              { required: true, message: "E-posta gerekli" },
              { type: "email", message: "Geçerli bir e-posta adresi girin" }
            ]}
          >
            <Input 
              placeholder="hesabiniz@email.com" 
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item 
            name="reason" 
            label="Silme Sebebi (İsteğe Bağlı)"
          >
            <Input.TextArea 
              placeholder="Hesabınızı neden silmek istiyorsunuz? (Bu bilgi hizmetimizi geliştirmek için kullanılacaktır)"
              rows={3}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Checkbox 
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            >
              <Text>
                Hesabımın kalıcı olarak silineceğini ve bu işlemin geri alınamayacağını anlıyorum.
              </Text>
            </Checkbox>
          </Form.Item>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to="/app/account">
              <Button 
                size="large"
                icon={<ArrowLeft size={16} />}
                style={{ minWidth: 120 }}
              >
                Vazgeç
              </Button>
            </Link>
            
            <Button 
              type="primary" 
              danger
              htmlType="submit"
              size="large"
              loading={loading}
              disabled={!confirmed}
              icon={<Trash2 size={16} />}
              style={{ minWidth: 120 }}
            >
              {loading ? "Gönderiliyor..." : "Hesabı Sil"}
            </Button>
          </div>
        </Form>

        <Divider />

        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <Shield size={16} color="#52c41a" />
            <Text strong style={{ color: "#52c41a" }}>Güvenli İşlem</Text>
          </div>
          <Text style={{ color: "rgba(0,0,0,0.60)", fontSize: 14 }}>
            Talebiniz güvenli şekilde işleme alınacak ve e-posta ile onaylanacaktır.
          </Text>
        </div>
      </Card>
    </div>
  );
}
