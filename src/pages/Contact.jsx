import React, { useState } from "react";
import { Button, Card, Col, Form, Input, Row, Typography, message } from "antd";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const { Title, Paragraph, Text } = Typography;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function onFinish(values) {
    setLoading(true);
    try {
      // ✅ Şimdilik demo: backend yoksa bile çalışır
      // İstersen bunu /api/support/contact gibi bir endpoint'e bağlarız.
      await new Promise((r) => setTimeout(r, 650));

      message.success("Mesajınız alındı! En kısa sürede dönüş yapacağız.");
      form.resetFields();
    } catch (e) {
      message.error(e?.message || "Mesaj gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "28px 0 56px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          style={{
            borderRadius: 24,
            padding: "26px 22px",
            background:
              "radial-gradient(900px circle at 10% 10%, rgba(255,122,24,0.20), transparent 55%)," +
              "radial-gradient(700px circle at 90% 40%, rgba(255,122,24,0.12), transparent 55%)," +
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 18px 60px rgba(15,23,42,0.07)",
            overflow: "hidden",
          }}
        >
          <motion.div variants={fadeUp} custom={0}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255,122,24,0.95)",
                  boxShadow: "0 0 0 6px rgba(255,122,24,0.12)",
                }}
              />
              <Text style={{ fontWeight: 800, letterSpacing: 0.2 }}>
                EDER Destek
              </Text>
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(255,122,24,0.10)",
                  color: "rgba(255,122,24,0.95)",
                  border: "1px solid rgba(255,122,24,0.25)",
                }}
              >
                Beta
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} style={{ marginTop: 10 }}>
            <Title
              style={{
                margin: 0,
                fontSize: 36,
                letterSpacing: -0.8,
                lineHeight: 1.12,
              }}
            >
              Bizimle iletişime geçin
            </Title>
            <Paragraph style={{ marginTop: 10, marginBottom: 0, fontSize: 15 }}>
              Sorularınızı, önerilerinizi veya destek taleplerinizi buradan
              iletebilirsiniz. Ekibimiz en kısa sürede dönüş yapar.
            </Paragraph>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={2}
            style={{
              marginTop: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.8)",
                fontWeight: 700,
                color: "rgba(15,23,42,0.8)",
              }}
            >
              <ShieldCheck size={16} />
              Verileriniz güvende
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.8)",
                fontWeight: 700,
                color: "rgba(15,23,42,0.8)",
              }}
            >
              <MessageCircle size={16} />
              Hızlı geri dönüş
            </span>
          </motion.div>
        </motion.div>

        <div style={{ height: 18 }} />

        <Row gutter={[16, 16]}>
          {/* Left: Contact Cards */}
          <Col xs={24} md={10}>
            <Card
              style={{
                borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 16px 50px rgba(15,23,42,0.06)",
              }}
              bodyStyle={{ padding: 18 }}
            >
              <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
                İletişim Bilgileri
              </Title>

              <div style={{ display: "grid", gap: 12 }}>
                <InfoRow
                  icon={<Mail size={18} />}
                  title="E-posta"
                  value={
                    <a href="mailto:destek@ederapp.com" style={{ fontWeight: 700 }}>
                      destek@ederapp.com
                    </a>
                  }
                  hint="Destek talepleri için"
                />

                <InfoRow
                  icon={<MapPin size={18} />}
                  title="Konum"
                  value={<span style={{ fontWeight: 700 }}>Türkiye</span>}
                  hint="Online destek"
                />

                <InfoRow
                  icon={<Clock size={18} />}
                  title="Çalışma Saatleri"
                  value={<span style={{ fontWeight: 700 }}>09:00 – 18:00</span>}
                  hint="Hafta içi"
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 16,
                  border: "1px dashed rgba(255,122,24,0.35)",
                  background: "rgba(255,122,24,0.06)",
                }}
              >
                <Text style={{ fontWeight: 800, color: "rgba(255,122,24,0.95)" }}>
                  Not
                </Text>
                <div style={{ marginTop: 6, color: "rgba(15,23,42,0.75)", fontWeight: 600 }}>
                  En erken 2 iş günü ile 14 iş günü içerisinde geri dönüş sağlanacaktır.
                </div>
              </div>
            </Card>
          </Col>

          {/* Right: Form */}
          <Col xs={24} md={14}>
            <Card
              style={{
                borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 16px 50px rgba(15,23,42,0.06)",
              }}
              bodyStyle={{ padding: 18 }}
            >
              <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                Bize yazın
              </Title>
              <Text type="secondary">
                Formu doldurun, size e-posta ile dönüş yapalım.
              </Text>

              <div style={{ height: 14 }} />

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Row gutter={[12, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Ad Soyad"
                      rules={[{ required: true, message: "Ad Soyad gerekli" }]}
                    >
                      <Input
                        size="large"
                        placeholder="Adınız Soyadınız"
                        style={{ borderRadius: 14, height: 48 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="E-posta"
                      rules={[
                        { required: true, message: "E-posta gerekli" },
                        { type: "email", message: "Geçerli e-posta girin" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="ornek@ederapp.com"
                        style={{ borderRadius: 14, height: 48 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="subject"
                  label="Konu"
                  rules={[{ required: true, message: "Konu gerekli" }]}
                >
                  <Input
                    size="large"
                    placeholder="Örn: Premium ödeme sorunu / Değerleme hatası"
                    style={{ borderRadius: 14, height: 48 }}
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Mesaj"
                  rules={[
                    { required: true, message: "Mesaj gerekli" },
                    { min: 10, message: "Mesaj en az 10 karakter olmalı" },
                  ]}
                >
                  <Input.TextArea
                    rows={6}
                    placeholder="Detayları yazın..."
                    style={{ borderRadius: 14 }}
                  />
                </Form.Item>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    icon={<Send size={18} />}
                    style={{
                      height: 52,
                      borderRadius: 16,
                      fontWeight: 800,
                      width: "100%",
                      background: "rgba(255,122,24,0.95)",
                      borderColor: "rgba(255,122,24,0.95)",
                      boxShadow: "0 18px 40px rgba(255,122,24,0.22)",
                    }}
                  >
                    {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
                  </Button>
                </motion.div>

                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Gönderdiğiniz mesaj destek ekibimize iletilir. Gizlilik için{" "}
                    <a href="/privacy">Gizlilik Politikası</a>.
                  </Text>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function InfoRow({ icon, title, value, hint }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: 12,
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.85)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: "rgba(255,122,24,0.10)",
          border: "1px solid rgba(255,122,24,0.25)",
          color: "rgba(255,122,24,0.95)",
          flex: "0 0 auto",
        }}
      >
        {icon}
      </div>

      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontWeight: 800, color: "rgba(15,23,42,0.9)" }}>{title}</div>
        <div style={{ marginTop: 4, color: "rgba(15,23,42,0.8)" }}>{value}</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "rgba(15,23,42,0.55)", fontWeight: 600 }}>
          {hint}
        </div>
      </div>
    </div>
  );
}
