import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, HelpCircle, Mail, Shield } from "lucide-react";
import "./footerbar.css";

export default function FooterBar() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="fb"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="fb-inner">
        <div className="fb-content">
          <div className="fb-brand">
            <div className="fb-logo">
              <span className="fb-dot" aria-hidden />
              <span className="fb-name">EDER</span>
              <span className="fb-tagline">Araç Değerleme</span>
            </div>
            <p className="fb-desc">
              Araç sahipleri için hızlı, anlaşılır ve veri odaklı piyasa değerleme deneyimi.
            </p>
            <a className="fb-link" href="mailto:destek@ederapp.com">
              <Mail size={16} /> destek@ederapp.com
            </a>
          </div>

          <nav className="fb-nav" aria-label="Footer">
            <div className="fb-nav-section">
              <h3 className="fb-nav-title">EDER</h3>
              <div className="fb-nav-links">
                <Link className="fb-link" to="/valuation">Araç Değerleme</Link>
                <Link className="fb-link" to="/blog">Rehber</Link>
                <Link className="fb-link" to="/faq"><HelpCircle size={16} /> S.S.S</Link>
              </div>
            </div>
            <div className="fb-nav-section">
              <h3 className="fb-nav-title">Yasal</h3>
              <div className="fb-nav-links">
                <Link className="fb-link" to="/privacy"><Shield size={16} /> Gizlilik</Link>
                <Link className="fb-link" to="/terms"><FileText size={16} /> Kullanım Şartları</Link>
                <Link className="fb-link" to="/contact">İletişim</Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="fb-bottom">
          <div className="fb-copy">© {year} EDER</div>
          <div className="fb-note">
            Değerleme sonuçları tahminidir; aracın kondisyonu ve piyasa koşulları nihai fiyatı değiştirebilir.
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
