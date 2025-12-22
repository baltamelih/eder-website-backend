import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp,
  CheckCircle,
  Star,
  Users,
  Clock,
  BarChart3,
  Car,
  Award,
  Sparkles
} from "lucide-react";
import { useAuth } from "../services/AuthContext";
import FreeOnly from "../components/FreeOnly";
import AdSlot from "../components/AdSlot";
import "./home.css";

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

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Stat({ icon: Icon, label, value, trend }) {
  return (
    <motion.div 
      className="stat-card"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && <div className="stat-trend">+{trend}% bu ay</div>}
      </div>
    </motion.div>
  );
}

function Feature({ icon: Icon, title, desc, highlight }) {
  return (
    <motion.div 
      className={`feature-card ${highlight ? 'featured' : ''}`}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="feature-icon">
        <Icon size={24} />
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-desc">{desc}</p>
      </div>
      {highlight && <div className="feature-badge">Popüler</div>}
    </motion.div>
  );
}

function Step({ no, title, desc, icon: Icon }) {
  return (
    <motion.div 
      className="step-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="step-header">
        <div className="step-number">{no}</div>
        <div className="step-icon">
          <Icon size={20} />
        </div>
      </div>
      <div className="step-content">
        <h3 className="step-title">{title}</h3>
        <p className="step-desc">{desc}</p>
      </div>
    </motion.div>
  );
}

function Testimonial({ name, role, content, avatar, rating }) {
  return (
    <motion.div 
      className="testimonial-card"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="testimonial-rating">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <p className="testimonial-content">"{content}"</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <div className="testimonial-name">{name}</div>
          <div className="testimonial-role">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { isAuthed, user } = useAuth();

  const isPremium = !!user?.is_premium;
  const isAdsFree = !!user?.is_ads_free;

  const carCountText = isAuthed ? `${user?.car_count ?? 0}/${user?.car_limit ?? 1}` : "0/1";
  const planText = isAuthed ? (isPremium ? "Premium" : "Free") : "Misafir";

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-dots" />
        </div>
        
        <div className="container">
          <motion.div 
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div className="hero-badge" variants={fadeUp} custom={0}>
              <Sparkles size={16} />
              <span>Türkiye'nin en güvenilir araç değerleme platformu</span>
            </motion.div>

            <motion.h1 className="hero-title" variants={fadeUp} custom={1}>
              Aracınızın gerçek değerini
              <span className="hero-accent"> saniyeler içinde </span>
              öğrenin
            </motion.h1>

            <motion.p className="hero-subtitle" variants={fadeUp} custom={2}>
              Yapay zeka destekli algoritma ile marka, model, yıl ve donanım bazında 
              en doğru değer aralığını hesaplıyoruz. Giriş yapın, araçlarınızı kaydedin, 
              geçmişinizi takip edin.
            </motion.p>

            <motion.div className="hero-actions" variants={fadeUp} custom={3}>
              <Link to="/app/valuation" className="btn-primary">
                <span>Hemen Değerle</span>
                <ArrowRight size={18} />
              </Link>
              
              {!isAuthed ? (
                <Link to="/register" className="btn-secondary">
                  Ücretsiz Hesap Oluştur
                </Link>
              ) : (
                <Link to="/app/dashboard" className="btn-secondary">
                  Dashboard'a Git
                </Link>
              )}
            </motion.div>

            <motion.div className="hero-stats" variants={fadeUp} custom={4}>
              <Stat 
                icon={Car} 
                label="Araç Hakkı" 
                value={carCountText}
              />
              <Stat 
                icon={Award} 
                label="Plan" 
                value={planText}
                trend={isPremium ? "Premium" : null}
              />
              <Stat 
                icon={Shield} 
                label="Güvenlik" 
                value="256-bit SSL"
              />
            </motion.div>

            <motion.div className="hero-trust" variants={fadeUp} custom={5}>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Aralık yaklaşımı</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Gizlilik odağı</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Şeffaf süreç</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div className="stat-item" variants={fadeUp}>
              <div className="stat-number">25K+</div>
              <div className="stat-text">Değerlenen Araç</div>
            </motion.div>
            <motion.div className="stat-item" variants={fadeUp}>
              <div className="stat-number">98%</div>
              <div className="stat-text">Doğruluk Oranı</div>
            </motion.div>
            <motion.div className="stat-item" variants={fadeUp}>
              <div className="stat-number">30sn</div>
              <div className="stat-text">Ortalama Süre</div>
            </motion.div>
            <motion.div className="stat-item" variants={fadeUp}>
              <div className="stat-number">5K+</div>
              <div className="stat-text">Aktif Kullanıcı</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title">Neden EDER?</h2>
            <p className="section-subtitle">
              Araç değerleme konusunda size en iyi deneyimi sunmak için geliştirdiğimiz özellikler
            </p>
          </motion.div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <Feature
              icon={BarChart3}
              title="Donanım Bazlı Analiz"
              desc="Sadece marka-model değil, trim ve donanım farklarını da hesaba katarak en doğru sonucu verir."
              highlight={true}
            />
            <Feature
              icon={TrendingUp}
              title="Piyasa Metrikleri"
              desc="Güncel piyasa verileri ve istatistiksel analizlerle desteklenen tahmin algoritması."
            />
            <Feature
              icon={Shield}
              title="Güvenli Kayıt"
              desc="Araçlarınızı güvenle kaydedin, geçmiş değerlemelerinizi takip edin."
            />
            <Feature
              icon={Zap}
              title="Hızlı Sonuç"
              desc="30 saniye içinde detaylı değerleme raporu alın, zaman kaybetmeyin."
            />
            <Feature
              icon={Users}
              title="Uzman Desteği"
              desc="Sorularınız için 7/24 müşteri desteği ve uzman danışmanlık hizmeti."
            />
            <Feature
              icon={Clock}
              title="Geçmiş Takibi"
              desc="Değerleme geçmişinizi görün, araçlarınızın değer değişimini takip edin."
            />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="steps-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title">Nasıl Çalışır?</h2>
            <p className="section-subtitle">3 basit adımda aracınızın değerini öğrenin</p>
          </motion.div>

          <motion.div 
            className="steps-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <Step
              no="01"
              icon={Car}
              title="Araç Bilgilerini Girin"
              desc="Marka, model, yıl, donanım ve kilometre bilgilerini seçin."
            />
            <Step
              no="02"
              icon={BarChart3}
              title="Analiz Edilsin"
              desc="Yapay zeka algoritması piyasa verilerini analiz ederek değer aralığını hesaplar."
            />
            <Step
              no="03"
              icon={CheckCircle}
              title="Sonucu Alın"
              desc="Detaylı rapor ile birlikte değer aralığını görün ve kaydedin."
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title">Kullanıcılarımız Ne Diyor?</h2>
            <p className="section-subtitle">Binlerce memnun kullanıcımızdan bazı yorumlar</p>
          </motion.div>

          <motion.div 
            className="testimonials-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <Testimonial
              name="Ahmet Yılmaz"
              role="Araç Sahibi"
              content="EDER sayesinde aracımın gerçek değerini öğrendim. Çok hızlı ve güvenilir bir platform."
              avatar="AY"
              rating={5}
            />
            <Testimonial
              name="Elif Kaya"
              role="Premium Kullanıcı"
              content="Donanım bazlı değerleme özelliği harika. Diğer platformlarda bulamadığım detayı burada buldum."
              avatar="EK"
              rating={5}
            />
            <Testimonial
              name="Mehmet Demir"
              role="Galeri Sahibi"
              content="İş yerimde sürekli kullanıyorum. Müşterilerime güvenilir değer aralığı sunabiliyorum."
              avatar="MD"
              rating={5}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="cta-content">
              <h2 className="cta-title">
                {isAuthed ? "Premium'a Geçin" : "Hemen Başlayın"}
              </h2>
              <p className="cta-subtitle">
                {isAuthed 
                  ? "Reklamsız deneyim ve daha fazla araç hakkı için Premium'a geçin."
                  : "Ücretsiz hesap oluşturun ve araç değerleme dünyasına adım atın."
                }
              </p>
            </div>
            
            <div className="cta-actions">
              {!isAuthed ? (
                <>
                  <Link to="/register" className="btn-primary">
                    <span>Ücretsiz Başla</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/pricing" className="btn-secondary">
                    Planları İncele
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/pricing" className="btn-primary">
                    <span>Premium'a Geç</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/dashboard" className="btn-secondary">
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Free User Ad */}
      <FreeOnly>
        <div className="ad-section">
          <div className="container">
            <AdSlot slot="SLOT_HOME_BOTTOM" style={{ minHeight: 250 }} />
          </div>
        </div>
      </FreeOnly>
    </div>
  );
}
