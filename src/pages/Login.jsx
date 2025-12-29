// src/pages/Login.jsx
import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../services/AuthContext";
import "./auth.css";

const { Title, Text } = Typography;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const features = [
  { icon: Shield, text: "Güvenli veri koruması" },
  { icon: Sparkles, text: "Hızlı değerleme sistemi" },
  { icon: CheckCircle, text: "Doğru piyasa analizi" },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/app";

  async function onFinish(values) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Giriş başarılı!");
      navigate(from, { replace: true });
    } catch (error) {
      message.error(error?.message || "Giriş yapılamadı");
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

      <div className="auth-content">
        <motion.div
          className="auth-form-section"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div className="auth-brand" variants={fadeUp} custom={0}>
            <div className="auth-logo">
              <motion.span
                className="auth-dot"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(255,122,24,0.4)",
                    "0 0 0 8px rgba(255,122,24,0)",
                    "0 0 0 0 rgba(255,122,24,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="auth-name">EDER</span>
              <span className="auth-beta">Beta</span>
            </div>
          </motion.div>

          <motion.div className="auth-header" variants={fadeUp} custom={1}>
            <Title className="auth-title">Tekrar Hoş Geldin</Title>
            <Text className="auth-subtitle">
              Hesabına giriş yap ve değerleme işlemlerine devam et
            </Text>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <Card className="auth-card">
              <Form layout="vertical" onFinish={onFinish} className="auth-form">
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

                <Form.Item
                  name="password"
                  label="Şifre"
                  rules={[{ required: true, message: "Şifre zorunlu" }]}
                >
                  <Input.Password
                    prefix={<Lock size={18} />}
                    placeholder="Şifrenizi girin"
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>

                {/* ✅ Şifremi Unuttum */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <Link
                    to="/forgot-password"
                    style={{ fontWeight: 600, color: "rgba(255,122,24,0.9)" }}
                  >
                    Şifremi unuttum
                  </Link>
                </div>

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
                    {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                  </Button>
                </motion.div>
              </Form>

              <div className="auth-divider">
                <span>Hesabın yok mu?</span>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/register">
                  <Button
                    size="large"
                    block
                    style={{
                      height: "56px",
                      borderRadius: "16px",
                      fontWeight: "700",
                      border: "1px solid rgba(255,122,24,0.3)",
                      color: "rgba(255,122,24,0.8)",
                    }}
                  >
                    Hesap Oluştur
                  </Button>
                </Link>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          className="auth-info-section"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }}
        >
          <div className="auth-info-content">
            <motion.div className="auth-info-header" variants={fadeUp}>
              <Title className="auth-info-title">Araç Değerleme Platformu</Title>
              <Text className="auth-info-subtitle">
                Türkiye'nin en güvenilir araç değerleme sistemi ile doğru fiyatları keşfedin
              </Text>
            </motion.div>

            <motion.div className="auth-features" variants={fadeUp}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="auth-feature"
                  variants={fadeUp}
                  custom={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="auth-feature-icon">
                    <feature.icon size={20} />
                  </div>
                  <span className="auth-feature-text">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div className="auth-stats" variants={fadeUp}>
              {[
                { v: "50K+", t: "Değerleme" },
                { v: "10K+", t: "Kullanıcı" },
                { v: "99%", t: "Doğruluk" },
              ].map((s, i) => (
                <motion.div key={i} style={{ textAlign: "center" }} whileHover={{ scale: 1.05 }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "rgba(255,122,24,0.9)",
                      marginBottom: "4px",
                    }}
                  >
                    {s.v}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "rgba(15,23,42,0.7)" }}>
                    {s.t}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
