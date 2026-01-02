import { Button, Card, Col, Row, Typography, Tag, Divider, Space } from "antd";
import { CheckCircleOutlined, StarOutlined, CrownOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Crown, Zap, Shield, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
import { useSubscription } from "../services/SubscriptionContext";
// FreeOnly ve AdSlot import'larını kaldır
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// SLOT_PRICING const'ını kaldır
const { Title, Paragraph, Text } = Typography;

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Pricing() {
  const { isPremium } = useSubscription();

  const features = {
    free: [
      { text: "Temel araç değerleme", icon: <CheckCircleOutlined /> },
      { text: "Günde 3 değerleme hakkı", icon: <CheckCircleOutlined /> },
      { text: "Temel piyasa analizi", icon: <CheckCircleOutlined /> },
      { text: "Reklam gösterimi", icon: <CheckCircleOutlined />, muted: true }
    ],
    premium: [
      { text: "Sınırsız değerleme", icon: <CheckCircleOutlined />, highlight: true },
      { text: "Detaylı piyasa analizi", icon: <CheckCircleOutlined />, highlight: true },
      { text: "Geçmiş değerleme kayıtları", icon: <CheckCircleOutlined /> },
      { text: "Favori araçlar listesi", icon: <CheckCircleOutlined /> },
      { text: "Fiyat değişim bildirimleri", icon: <CheckCircleOutlined /> },
      { text: "Öncelikli müşteri desteği", icon: <CheckCircleOutlined /> },
      { text: "Reklamsız deneyim", icon: <CheckCircleOutlined />, highlight: true },
      
    ]
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", minHeight: "100vh", padding: "40px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Hero Section */}
        <motion.div 
          style={{ textAlign: "center", marginBottom: 60 }}
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <Tag 
              color="orange" 
              style={{ 
                fontSize: 14, 
                padding: "8px 16px", 
                borderRadius: 20,
                marginBottom: 24,
                border: "none",
                background: "linear-gradient(135deg, #FF7A18 0%, #FF9A4A 100%)",
                color: "white"
              }}
            >
              <Crown size={14} style={{ marginRight: 6 }} />
              Premium'a Geçin, Farkı Yaşayın
            </Tag>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Title 
              level={1} 
              style={{ 
                fontSize: 48, 
                fontWeight: 800, 
                background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 16,
                lineHeight: 1.2
              }}
            >
              Araç Değerlemenin
              <br />
              <span style={{ color: "#FF7A18" }}>Profesyonel</span> Hali
            </Title>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Paragraph 
              style={{ 
                fontSize: 20, 
                color: "rgba(0,0,0,0.65)", 
                maxWidth: 600, 
                margin: "0 auto 40px",
                lineHeight: 1.6
              }}
            >
              Free kullanıcılar temel özellikleri kullanır. Premium ile sınırsız değerleme, 
              detaylı analizler ve reklamsız deneyimin keyfini çıkarın.
            </Paragraph>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Space size="large" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={16} color="#52c41a" />
                <Text style={{ color: "rgba(0,0,0,0.65)" }}>10,000+ Mutlu Kullanıcı</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={16} color="#52c41a" />
                <Text style={{ color: "rgba(0,0,0,0.65)" }}>%99.9 Uptime</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={16} color="#52c41a" />
                <Text style={{ color: "rgba(0,0,0,0.65)" }}>7/24 Destek</Text>
              </div>
            </Space>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <Row gutter={[24, 24]} justify="center">
            {/* Free Plan */}
            <Col xs={24} lg={10}>
              <motion.div variants={fadeUp}>
                <Card 
                  style={{ 
                    borderRadius: 20,
                    border: "2px solid #e2e8f0",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "20px 0" }}>
                    <div style={{ textAlign: "center", marginBottom: 30 }}>
                      <Title level={3} style={{ margin: 0, fontSize: 24 }}>Free</Title>
                      <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: 16 }}>Başlamak için ideal</Text>
                      
                      <div style={{ margin: "20px 0" }}>
                        <Text style={{ fontSize: 48, fontWeight: 800, color: "#1e293b" }}>₺0</Text>
                        <Text style={{ color: "rgba(0,0,0,0.65)", marginLeft: 8 }}>/ay</Text>
                      </div>

                      <Tag color="default" style={{ fontSize: 12, padding: "4px 12px", borderRadius: 12 }}>
                        Reklamlı Deneyim
                      </Tag>
                    </div>

                    <div style={{ marginBottom: 30 }}>
                      {features.free.map((feature, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            marginBottom: 12,
                            opacity: feature.muted ? 0.6 : 1
                          }}
                        >
                          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                          <Text style={{ fontSize: 15 }}>{feature.text}</Text>
                        </div>
                      ))}
                    </div>

                    <Button 
                      block 
                      size="large" 
                      style={{ 
                        height: 50, 
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      Ücretsiz Başla
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Premium Plan */}
            <Col xs={24} lg={10}>
              <motion.div variants={fadeUp}>
                <Card 
                  style={{ 
                    borderRadius: 20,
                    border: "3px solid #FF7A18",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(255, 122, 24, 0.15)"
                  }}
                >
                  {/* Popular Badge */}
                  <div 
                    style={{
                      position: "absolute",
                      top: -1,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #FF7A18 0%, #FF9A4A 100%)",
                      color: "white",
                      padding: "8px 24px",
                      borderRadius: "0 0 12px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      zIndex: 1
                    }}
                  >
                    <StarOutlined style={{ marginRight: 4 }} />
                    ÖNERİLEN
                  </div>

                  <div style={{ padding: "40px 0 20px" }}>
                    <div style={{ textAlign: "center", marginBottom: 30 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                        <Crown size={24} color="#FF7A18" />
                        <Title level={3} style={{ margin: 0, fontSize: 24, color: "#FF7A18" }}>Premium</Title>
                      </div>
                      <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: 16 }}>Profesyoneller için</Text>
                      
                      <div style={{ margin: "20px 0" }}>
                        <Text style={{ fontSize: 48, fontWeight: 800, color: "#FF7A18" }}>₺199</Text>
                        <Text style={{ color: "rgba(0,0,0,0.65)", marginLeft: 8 }}>/ay</Text>
                      </div>

                      {isPremium ? (
                        <Tag color="orange" style={{ fontSize: 12, padding: "4px 12px", borderRadius: 12 }}>
                          <CrownOutlined style={{ marginRight: 4 }} />
                          Aktif Plan
                        </Tag>
                      ) : (
                        <Tag color="orange" style={{ fontSize: 12, padding: "4px 12px", borderRadius: 12 }}>
                          <ThunderboltOutlined style={{ marginRight: 4 }} />
                          %40 İndirim
                        </Tag>
                      )}
                    </div>

                    <div style={{ marginBottom: 30 }}>
                      {features.premium.map((feature, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            marginBottom: 12,
                            padding: feature.highlight ? "8px 12px" : "0",
                            background: feature.highlight ? "rgba(255, 122, 24, 0.08)" : "transparent",
                            borderRadius: feature.highlight ? 8 : 0
                          }}
                        >
                          <CheckCircleOutlined 
                            style={{ 
                              color: feature.highlight ? "#FF7A18" : "#52c41a", 
                              fontSize: 16 
                            }} 
                          />
                          <Text 
                            style={{ 
                              fontSize: 15,
                              fontWeight: feature.highlight ? 600 : 400,
                              color: feature.highlight ? "#FF7A18" : "inherit"
                            }}
                          >
                            {feature.text}
                          </Text>
                        </div>
                      ))}
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                      style={{ 
                        height: 50, 
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #FF7A18 0%, #FF9A4A 100%)",
                        border: "none",
                        boxShadow: "0 8px 24px rgba(255, 122, 24, 0.3)"
                      }}
                    >
                      {isPremium ? (
                        <>
                          <CrownOutlined style={{ marginRight: 8 }} />
                          Premium Aktif
                        </>
                      ) : (
                        <>
                          Premium'a Geç
                          <ArrowRight size={16} style={{ marginLeft: 8 }} />
                        </>
                      )}
                    </Button>

                    <Text 
                      style={{ 
                        display: "block", 
                        textAlign: "center",
                        marginTop: 12,
                        color: "rgba(0,0,0,0.5)",
                        fontSize: 13
                      }}
                    >
                      {isPremium ? "Premium özelliklerinin keyfini çıkarın" : "• İstediğiniz zaman iptal etmeniz mümkün"}
                    </Text>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          style={{ marginTop: 80 }}
          initial="initial"
          animate="animate"
          variants={fadeUp}
        >
          <Card 
            style={{ 
              borderRadius: 20, 
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <Title level={3} style={{ color: "#1e293b", marginBottom: 8 }}>
                Sık Sorulan Sorular
              </Title>
              <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: 16 }}>
                Merak ettiklerinizin cevapları burada
              </Text>
            </div>

            <Row gutter={[32, 24]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                    Premium hemen aktif olacak mı?
                  </Text>
                  <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginTop: 8, marginBottom: 0 }}>
                    Evet! Ödeme tamamlandıktan sonra Premium özellikler anında aktif olur. 
                    
                  </Paragraph>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                    Free kullanıcıda reklam nerelerde görünür?
                  </Text>
                  <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginTop: 8, marginBottom: 0 }}>
                    Dashboard ve değerleme sayfalarında belirli alanlarda reklam gösterilir. 
                    Premium'da tamamen reklamsız deneyim yaşarsınız.
                  </Paragraph>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                    İstediğim zaman iptal edebilir miyim?
                  </Text>
                  <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginTop: 8, marginBottom: 0 }}>
                    Tabii ki! Hesap ayarlarından tek tıkla iptal edebilirsiniz. 
                    Mevcut dönem sonuna kadar Premium özellikler aktif kalır.
                  </Paragraph>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                    Ödeme güvenli mi?
                  </Text>
                  <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginTop: 8, marginBottom: 0 }}>
                    Evet! 256-bit SSL şifreleme ve güvenilir ödeme sağlayıcıları kullanıyoruz. 
                    Kart bilgileriniz bizde saklanmaz.
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* CTA Section */}
        {!isPremium && (
          <motion.div
            style={{ 
              marginTop: 60,
              textAlign: "center",
              padding: "60px 40px",
              background: "linear-gradient(135deg, #FF7A18 0%, #FF9A4A 100%)",
              borderRadius: 24,
              color: "white"
            }}
            initial="initial"
            animate="animate"
            variants={fadeUp}
          >
            <Zap size={48} style={{ marginBottom: 24 }} />
            <Title level={2} style={{ color: "white", marginBottom: 16 }}>
              Hemen Premium'a Geçin!
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
              Ayda sadece ₺199 ile sınırsız değerleme ve premium özellikler.
            </Paragraph>
            <Button 
              size="large"
              onClick={() => nav("/app/premium")}
              style={{ 
                height: 56,
                padding: "0 40px",
                borderRadius: 16,
                fontSize: 18,
                fontWeight: 600,
                background: "white",
                color: "#FF7A18",
                border: "none"
              }}
            >
              Hemen Başla
              <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </Button>
          </motion.div>
        )}

        {/* Free Ad Slot */}
       
          <motion.div 
            style={{ marginTop: 40 }}
            initial="initial"
            animate="animate"
            variants={fadeUp}
          >
            <Card 
              style={{ 
                borderRadius: 16, 
                border: "2px dashed rgba(0,0,0,0.1)",
                background: "rgba(0,0,0,0.02)"
              }} 
              bodyStyle={{ padding: 20 }}
            >
              
            </Card>
          </motion.div>
       
      </div>
    </div>
  );
}
