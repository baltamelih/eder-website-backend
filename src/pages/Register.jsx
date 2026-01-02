import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles,
  Shield,
  CheckCircle
} from "lucide-react";
import { register as registerApi } from "../services/auth";
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
      ease: [0.25, 0.46, 0.45, 0.94] 
    },
  }),
};

const features = [
  { icon: Shield, text: "Güvenli veri koruması" },
  { icon: Sparkles, text: "Hızlı değerleme sistemi" },
  { icon: CheckCircle, text: "Doğru piyasa analizi" }
];

export default function Register() {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    try {
      await registerApi({
        email: values.email,
        password: values.password,
        full_name: values.full_name,
      });

      message.success("Kayıt başarılı. Giriş yapıldı.");
      nav("/dashboard");
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* Background decoration */}
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-dots" />
      </div>

      <div className="auth-content">
        {/* Left side - Form */}
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
                    "0 0 0 0 rgba(255,122,24,0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="auth-name">EDER</span>
              <span className="auth-beta">Beta</span>
            </div>
          </motion.div>

          <motion.div className="auth-header" variants={fadeUp} custom={1}>
            <Title level={2} className="auth-title">
              Hesap Oluştur
            </Title>
            <Text className="auth-subtitle">
              Araç değerleme dünyasına adım at. Hızlı, güvenli ve doğru.
            </Text>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <Card className="auth-card">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="auth-form"
              >
                <Form.Item
                  name="full_name"
                  label="Ad Soyad"
                  rules={[{ required: true, message: "Ad Soyad zorunlu" }]}
                >
                  <Input 
                    prefix={<User size={18} />}
                    placeholder="Örn: Emre Balta" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>

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
                  rules={[
                    { required: true, message: "Şifre zorunlu" },
                    { min: 6, message: "Şifre en az 6 karakter olmalı" }
                  ]}
                >
                  <Input.Password 
                    prefix={<Lock size={18} />}
                    placeholder="En az 6 karakter" 
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    loading={loading}
                    className="auth-submit"
                    icon={<ArrowRight size={18} />}
                    iconPosition="end"
                  >
                    {loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
                  </Button>
                </motion.div>
              </Form>

              <div className="auth-divider">
                <span>Zaten hesabın var mı?</span>
              </div>

              <Link to="/login">
                <Button size="large" className="auth-secondary">
                  Giriş Yap
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div className="auth-footer" variants={fadeUp} custom={3}>
            <Text className="auth-terms">
              Hesap oluşturarak{" "}
              <Link to="/terms" className="auth-link">Kullanım Şartları</Link>
              {" "}ve{" "}
              <Link to="/privacy" className="auth-link">Gizlilik Politikası</Link>
              'nı kabul etmiş olursunuz.
            </Text>
          </motion.div>
        </motion.div>

        {/* Right side - Features */}
        <motion.div 
          className="auth-info-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="auth-info-content">
            <motion.div 
              className="auth-info-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Title level={3} className="auth-info-title">
                Neden EDER?
              </Title>
              <Text className="auth-info-subtitle">
                Araç değerleme konusunda güvenilir çözümler sunuyoruz.
              </Text>
            </motion.div>

            <div className="auth-features">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="auth-feature"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="auth-feature-icon">
                    <feature.icon size={20} />
                  </div>
                  <span className="auth-feature-text">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="auth-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="auth-stat">
                <div className="auth-stat-number">10K+</div>
                <div className="auth-stat-label">Değerlenen Araç</div>
              </div>
              <div className="auth-stat">
                <div className="auth-stat-number">98%</div>
                <div className="auth-stat-label">Doğruluk Oranı</div>
              </div>
              <div className="auth-stat">
                <div className="auth-stat-number">5dk</div>
                <div className="auth-stat-label">Ortalama Süre</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
