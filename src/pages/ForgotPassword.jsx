// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { requestPasswordReset } from "../services/passwordResetService";
import "./auth.css";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    try {
      await requestPasswordReset(values.email);

      // Güvenlik için backend 404 dönse bile genelde yine aynı mesajı göstermek isteriz.
      message.success("Eğer bu e-posta kayıtlıysa, şifre sıfırlama kodu gönderildi.");
    } catch (e) {
      // Senin backend şu an 404 döndürüyor -> istersen bunu da generic gösterebilirsin
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-dots" />
      </div>

      <div className="auth-content" style={{ justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="auth-card" style={{ width: 460, maxWidth: "92vw" }}>
            <Title level={3} style={{ marginBottom: 4 }}>Şifre Sıfırlama</Title>
            <Text type="secondary">
              E-postanı gir. Sana 6 haneli bir kod göndereceğiz.
            </Text>

            <div style={{ height: 16 }} />

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: "E-posta zorunlu" },
                  { type: "email", message: "Geçerli e-posta girin" },
                ]}
              >
                <Input
                  prefix={<Mail size={18} />}
                  placeholder="ornek@ederapp.com"
                  size="large"
                  className="auth-input"
                />
              </Form.Item>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="auth-submit"
                  icon={<ArrowRight size={18} />}
                  iconPosition="end"
                >
                  {loading ? "Gönderiliyor..." : "Kodu Gönder"}
                </Button>
              </motion.div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                <Link to="/login">Girişe dön</Link>
                <Link to="/reset-password">Kodum var</Link>
              </div>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
