import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Shield, 
  FileText, 
  HelpCircle, 
  Crown, 
  Trash2,
  Twitter,
  Github,
  Mail
} from "lucide-react";
import "./footerbar.css";

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

const linkHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -2,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

function FooterLink({ to, icon: Icon, children, variant = "default", external = false }) {
  const Component = external ? "a" : Link;
  const props = external ? { href: to, target: "_blank", rel: "noopener noreferrer" } : { to };

  return (
    <motion.div variants={linkHover} initial="rest" whileHover="hover">
      <Component 
        className={`fb-link fb-link--${variant}`} 
        {...props}
      >
        <span className="fb-link-content">
          {Icon && <Icon size={16} />}
          <span>{children}</span>
        </span>
        {external && <ArrowUpRight size={14} className="fb-link-external" />}
      </Component>
    </motion.div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fb-social"
      aria-label={label}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Icon size={18} />
    </motion.a>
  );
}

export default function FooterBar() {
  const year = new Date().getFullYear();

  return (
    <motion.footer 
      className="fb"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="fb-inner">
        <div className="fb-content">
          {/* Brand Section */}
          <motion.div className="fb-brand" variants={fadeUp} custom={0}>
            <div className="fb-logo">
              <motion.span 
                className="fb-dot" 
                aria-hidden
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(255,122,24,0.4)",
                    "0 0 0 8px rgba(255,122,24,0)",
                    "0 0 0 0 rgba(255,122,24,0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="fb-name">EDER</span>
              <span className="fb-tagline">Web</span>
            </div>
            <p className="fb-desc">
              Araç değerleme için hızlı, sade ve güven odaklı bir deneyim. 
              Doğru kararlar için doğru veriler.
            </p>
            
            {/* Social Links */}
            <div className="fb-socials">
              <SocialLink href="https://twitter.com/eder" icon={Twitter} label="Twitter" />
              <SocialLink href="https://github.com/eder" icon={Github} label="GitHub" />
              <SocialLink href="mailto:hello@eder.com" icon={Mail} label="E-posta" />
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.nav className="fb-nav" aria-label="Footer" variants={fadeUp} custom={1}>
            <div className="fb-nav-section">
              <h3 className="fb-nav-title">Ürün</h3>
              <div className="fb-nav-links">
                <FooterLink to="/pricing" icon={Crown}>Premium</FooterLink>
                <FooterLink to="/app/valuation">Değerleme</FooterLink>
                <FooterLink to="/app/dashboard">Dashboard</FooterLink>
              </div>
            </div>

            <div className="fb-nav-section">
              <h3 className="fb-nav-title">Destek</h3>
              <div className="fb-nav-links">
                <FooterLink to="/support" icon={HelpCircle}>Yardım</FooterLink>
                <FooterLink to="/contact">İletişim</FooterLink>
                <FooterLink to="/faq">S.S.S</FooterLink>
              </div>
            </div>

            <div className="fb-nav-section">
              <h3 className="fb-nav-title">Yasal</h3>
              <div className="fb-nav-links">
                <FooterLink to="/privacy" icon={Shield}>Gizlilik</FooterLink>
                <FooterLink to="/terms" icon={FileText}>Şartlar</FooterLink>
                <FooterLink to="/delete-account" icon={Trash2} variant="danger">
                  Hesap Silme
                </FooterLink>
              </div>
            </div>
          </motion.nav>
        </div>

        {/* Bottom Section */}
        <motion.div className="fb-bottom" variants={fadeUp} custom={2}>
          <div className="fb-bottom-left">
            <div className="fb-copy">© {year} EDER</div>
            <div className="fb-status">
              <span className="fb-status-dot" />
              <span>Tüm sistemler çalışıyor</span>
            </div>
          </div>

          <div className="fb-bottom-right">
            <div className="fb-note">
              Sonuçlar tahmini aralıktır; nihai fiyat koşullara göre değişebilir.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle background decoration */}
      <div className="fb-decoration" aria-hidden="true">
        <div className="fb-decoration-line" />
      </div>
    </motion.footer>
  );
}
