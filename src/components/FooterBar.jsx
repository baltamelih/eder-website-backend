import React from "react";
import { Link } from "react-router-dom";
import "./footerbar.css";

export default function FooterBar() {
  return (
    <footer className="fb" aria-label="Site alt bilgisi">
      <div className="fb-inner">
        <Link to="/" className="fb-brand" aria-label="EDER ana sayfa">
          <strong>EDER</strong>
          <span>Gerçek değer. Daha fazlası.</span>
        </Link>

        <nav className="fb-links" aria-label="Alt menü">
          <Link to="/valuation">Değerleme</Link>
          <Link to="/blog">Rehber</Link>
          <Link to="/faq">S.S.S.</Link>
          <Link to="/contact">İletişim</Link>
          <a href="/gizlilik.html">Gizlilik</a>
          <a href="/kullanim-kosullari.html">Koşullar</a>
        </nav>

        <a
          className="fb-whosb-credit"
          href="https://whosb-studio.vercel.app/"
          target="_blank"
          rel="noreferrer"
          aria-label="whosb studio web sitesini yeni sekmede aç"
        >
          <span className="fb-whosb-prefix">Bu bir</span>
          <strong className="fb-whosb-wordmark" aria-label="whosb studio">
            <b>whosb</b>
            <span>studio</span>
            <sup>°</sup>
          </strong>
          <span className="fb-whosb-suffix">ürünüdür.</span>
        </a>
      </div>
    </footer>
  );
}
