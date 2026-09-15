import { Link } from "react-router-dom";
import "./TrustPageShell.css";

export function TrustPageShell({
  eyebrow,
  title,
  lead,
  updated = "15 Eylül 2026",
  children,
  asideTitle = "EDER güven merkezi",
  asideText = "Değerleme, veri kullanımı ve destek süreçlerini açık ve anlaşılır tutmayı hedefliyoruz.",
}) {
  return (
    <main className="trust-page">
      <section className="trust-hero" aria-labelledby="trust-page-title">
        <div className="trust-hero__glow" aria-hidden="true" />
        <div className="trust-hero__content">
          <p className="trust-eyebrow">{eyebrow}</p>
          <h1 id="trust-page-title">{title}</h1>
          <p className="trust-lead">{lead}</p>
          <div className="trust-meta">
            <span>Son güncelleme · {updated}</span>
            <span>ederapp.com</span>
          </div>
        </div>
      </section>

      <div className="trust-layout">
        <article className="trust-article">{children}</article>

        <aside className="trust-aside" aria-label="Yardımcı bağlantılar">
          <div className="trust-aside__card">
            <p className="trust-kicker">GÜVEN & DESTEK</p>
            <h2>{asideTitle}</h2>
            <p>{asideText}</p>
            <nav className="trust-nav">
              <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
              <Link to="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
              <Link to="/cerez-politikasi">Çerez Politikası</Link>
              <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
              <Link to="/destek">Destek Merkezi</Link>
              <Link to="/iletisim">İletişim</Link>
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function TrustSection({ number, title, children }) {
  return (
    <section className="trust-section">
      <div className="trust-section__heading">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      <div className="trust-section__body">{children}</div>
    </section>
  );
}

export function TrustNote({ title, children, tone = "neutral" }) {
  return (
    <div className={`trust-note trust-note--${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

export function TrustList({ items }) {
  return (
    <ul className="trust-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function TrustLinks() {
  return (
    <div className="trust-inline-links">
      <Link to="/sss">Sık sorulan sorular</Link>
      <Link to="/destek">Destek</Link>
      <a href="mailto:destek@ederapp.com">destek@ederapp.com</a>
    </div>
  );
}
