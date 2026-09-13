import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import "./footerbar.css";

export default function FooterBar() {
  const year = new Date().getFullYear();

  return (
    <footer className="fb">
      <div className="fb-top">
        <div className="fb-brand">
          <span className="fb-kicker">EDER / ARAÇ DEĞER İSTİHBARATI</span>
          <strong>EDER</strong>
          <p>
            Araç kimliği, kilometre ve kondisyon bilgisini tek akışta birleştir;
            tahmini piyasa değer aralığını daha anlaşılır şekilde gör.
          </p>
        </div>

        <div className="fb-nav">
          <div>
            <span>ÜRÜN</span>
            <Link to="/valuation">Araç Değerleme</Link>
            <Link to="/blog">Rehber</Link>
            <Link to="/faq">S.S.S.</Link>
          </div>

          <div>
            <span>DESTEK</span>
            <Link to="/contact">İletişim</Link>
            <a href="mailto:destek@ederapp.com">
              destek@ederapp.com
              <Mail size={14} aria-hidden />
            </a>
          </div>

          <div>
            <span>YASAL</span>
            <Link to="/privacy">Gizlilik</Link>
            <Link to="/terms">Kullanım Şartları</Link>
          </div>
        </div>
      </div>

      <div className="fb-divider" />

      <div className="fb-bottom">
        <span>© {year} EDER</span>
        <p>
          Değerleme sonuçları tahminidir; aracın kondisyonu ve piyasa koşulları
          nihai satış fiyatını değiştirebilir.
        </p>
        <Link to="/valuation">
          Yeni değerleme
          <ArrowUpRight size={15} aria-hidden />
        </Link>
      </div>
    </footer>
  );
}
