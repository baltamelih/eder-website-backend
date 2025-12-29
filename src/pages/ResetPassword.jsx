// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, KeyRound, ArrowRight } from "lucide-react";
import { resetPassword } from "../services/passwordResetService";
import "./auth.css";

const { Title, Text } = Typography;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onFinish(values) {
    setLoading(true);
    try {
      await resetPassword({
        email: values.email,
        code: values.code,
        new_password: values.new_password,
      });
      message.success("Şifren güncellendi. Giriş yapabilirsin.");
      navigate("/login", { replace: true });
    } catch (e) {
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
            <Title level={3} style={{ marginBottom: 4 }}>Yeni Şifre Belirle</Title>
            <Text type="secondary">
              E-posta + 6 haneli kod + yeni şifreyi gir.
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
                <Input prefix={<Mail size={18} />} size="large" className="auth-input" />
              </Form.Item>

              <Form.Item
                name="code"
                label="Kod (6 haneli)"
                rules={[
                  { required: true, message: "Kod zorunlu" },
                  { len: 6, message: "Kod 6 haneli olmalı" },
                  { pattern: /^\d{6}$/, message: "Kod sadece rakam olmalı" },
                ]}
              >
                <Input prefix={<KeyRound size={18} />} maxLength={6} inputMode="numeric" size="large" className="auth-input" />
              </Form.Item>

              <Form.Item
                name="new_password"
                label="Yeni Şifre"
                rules={[
                  { required: true, message: "Yeni şifre zorunlu" },
                  { min: 8, message: "Şifre en az 8 karakter olmalı" },
                ]}
              >
                <Input.Password prefix={<Lock size={18} />} size="large" className="auth-input" />
              </Form.Item>

              <Form.Item
                name="new_password_2"
                label="Yeni Şifre (Tekrar)"
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Şifre tekrarı zorunlu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Şifreler eşleşmiyor"));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<Lock size={18} />} size="large" className="auth-input" />
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
                  {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                </Button>
              </motion.div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                <Link to="/forgot-password">Kod al</Link>
                <Link to="/login">Girişe dön</Link>
              </div>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
