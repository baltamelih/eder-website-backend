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
            <Link to="/arac-degerleme">Araç Değerleme</Link>
            <Link to="/blog">Rehber</Link>
            <Link to="/sss">S.S.S.</Link>
          </div>

          <div>
            <span>DESTEK</span>
            <Link to="/iletisim">İletişim</Link>
            <a href="mailto:destek@ederapp.com">
              destek@ederapp.com
              <Mail size={14} aria-hidden />
            </a>
          </div>

          <div>
            <span>YASAL</span>
            <Link to="/gizlilik-politikasi">Gizlilik</Link>
            <Link to="/kullanim-kosullari">Kullanım Şartları</Link>
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
        <Link to="/arac-degerleme">
          Yeni değerleme
          <ArrowUpRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="fb-whosb-credit" aria-label="Ürün imzası">
        <span>Bu bir </span>
        <a
          className="fb-whosb-credit__brand"
          href="https://whosb-studio.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          whosb studio
        </a>
        <span> ürünüdür.</span>
      </div>

</footer>
  );
}
