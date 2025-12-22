import React from "react";
import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react";

const { Title, Paragraph } = Typography;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: 0.1 * i, 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    },
  }),
};

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: "70vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "40px 20px"
    }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        style={{ textAlign: "center", maxWidth: "500px" }}
      >
        {/* 404 Icon */}
        <motion.div variants={fadeUp} custom={0}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,122,24,0.1) 0%, rgba(255,177,74,0.05) 100%)",
            border: "2px solid rgba(255,122,24,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            position: "relative"
          }}>
            <AlertCircle size={48} style={{ color: "#ff7a18" }} />
            <div style={{
              position: "absolute",
              top: "-8px",
              right: "10px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#ff7a18",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              !
            </div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div variants={fadeUp} custom={1}>
          <Title 
            level={1} 
            style={{ 
              fontSize: "72px", 
              fontWeight: "900", 
              color: "#ff7a18",
              margin: "0 0 16px",
              lineHeight: "1"
            }}
          >
            404
          </Title>
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeUp} custom={2}>
          <Title 
            level={2} 
            style={{ 
              color: "#0f172a", 
              marginBottom: "16px",
              fontWeight: "700"
            }}
          >
            Sayfa Bulunamadı
          </Title>
        </motion.div>

        {/* Description */}
        <motion.div variants={fadeUp} custom={3}>
          <Paragraph 
            style={{ 
              color: "rgba(15,23,42,0.62)", 
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "40px"
            }}
          >
            Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir.
            <br />
            Ana sayfaya dönerek devam edebilirsiniz.
          </Paragraph>
        </motion.div>

        {/* Actions */}
        <motion.div 
          variants={fadeUp} 
          custom={4}
          style={{ 
            display: "flex", 
            gap: "16px", 
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <Button 
                type="primary" 
                size="large"
                icon={<Home size={18} />}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(255,122,24,0.3)",
                  paddingLeft: "24px",
                  paddingRight: "24px"
                }}
              >
                Ana Sayfaya Dön
              </Button>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="large"
              icon={<ArrowLeft size={18} />}
              onClick={() => window.history.back()}
              style={{
                height: "48px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "16px",
                border: "2px solid rgba(15,23,42,0.1)",
                color: "rgba(15,23,42,0.8)",
                paddingLeft: "24px",
                paddingRight: "24px"
              }}
            >
              Geri Dön
            </Button>
          </motion.div>
        </motion.div>

        {/* Help Text */}
        <motion.div variants={fadeUp} custom={5}>
          <div style={{ 
            marginTop: "40px",
            padding: "20px",
            borderRadius: "12px",
            background: "rgba(15,23,42,0.04)",
            border: "1px solid rgba(15,23,42,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Search size={16} style={{ color: "#ff7a18" }} />
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                Yardıma mı ihtiyacınız var?
              </span>
            </div>
            <Paragraph style={{ 
              margin: 0, 
              color: "rgba(15,23,42,0.7)", 
              fontSize: "14px" 
            }}>
              Sorun devam ederse <Link to="/support" style={{ color: "#ff7a18", fontWeight: "600" }}>destek</Link> sayfamızdan bize ulaşabilirsiniz.
            </Paragraph>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
