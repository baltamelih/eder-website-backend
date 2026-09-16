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
          <span className="fb-kicker">EDER / ARA├ç DE─ŞER ─░ST─░HBARATI</span>
          <strong>EDER</strong>
          <p>
            Ara├ğ kimli─şi, kilometre ve kondisyon bilgisini tek ak─▒┼şta birle┼ştir;
            tahmini piyasa de─şer aral─▒─ş─▒n─▒ daha anla┼ş─▒l─▒r ┼şekilde g├Âr.
          </p>
        </div>

        <div className="fb-nav">
          <div>
            <span>├£R├£N</span>
            <Link to="/arac-degerleme">Ara├ğ De─şerleme</Link>
            <Link to="/blog">Rehber</Link>
            <Link to="/sss">S.S.S.</Link>
          </div>

          <div>
            <span>DESTEK</span>
            <Link to="/iletisim">─░leti┼şim</Link>
            <a href="mailto:destek@ederapp.com">
              destek@ederapp.com
              <Mail size={14} aria-hidden />
            </a>
          </div>

          <div>
            <span>YASAL</span>
            <Link to="/gizlilik-politikasi">Gizlilik</Link>
            <Link to="/kullanim-kosullari">Kullan─▒m ┼Şartlar─▒</Link>
          </div>
        </div>
      </div>

      <div className="fb-divider" />

      <div className="fb-bottom">
        <span>┬® {year} EDER</span>
        <p>
          De─şerleme sonu├ğlar─▒ tahminidir; arac─▒n kondisyonu ve piyasa ko┼şullar─▒
          nihai sat─▒┼ş fiyat─▒n─▒ de─şi┼ştirebilir.
        </p>
        <Link to="/arac-degerleme">
          Yeni de─şerleme
          <ArrowUpRight size={15} aria-hidden />
        </Link>
      </div>
              <span className="footer-whosb-product">Bu bir whosb studio ürünüdür.</span>
</footer>
  );
}
