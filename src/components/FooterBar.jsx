import { Link } from "react-router-dom";
import "./FooterBar.css";

const groups = [
  {
    title: "Ürün",
    links: [
      ["/arac-degerleme", "Araç Değerleme"],
      ["/blog", "Rehber"],
      ["/hakkimizda", "Hakkımızda"],
      ["/sss", "Sık Sorulan Sorular"],
    ],
  },
  {
    title: "Destek",
    links: [
      ["/destek", "Destek Merkezi"],
      ["/iletisim", "İletişim"],
      ["/login", "Giriş"],
      ["/register", "Kayıt"],
    ],
  },
  {
    title: "Yasal",
    links: [
      ["/gizlilik-politikasi", "Gizlilik Politikası"],
      ["/kvkk-aydinlatma-metni", "KVKK Aydınlatma Metni"],
      ["/cerez-politikasi", "Çerez Politikası"],
      ["/kullanim-kosullari", "Kullanım Koşulları"],
    ],
  },
];

export default function FooterBar() {
  return (
    <footer className="eder-footer">
      <div className="eder-footer__inner">
        <div className="eder-footer__brand">
          <Link to="/" className="eder-footer__wordmark">
            EDER
          </Link>
          <p>
            Araç özellikleri ve piyasa verileriyle tahmini değer aralığı sunan
            karar destek platformu.
          </p>
          <a href="mailto:destek@ederapp.com">destek@ederapp.com</a>
        </div>

        <div className="eder-footer__groups">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <strong>{group.title}</strong>
              {group.links.map(([to, label]) => (
                <Link to={to} key={to}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="eder-footer__bottom">
        <span>© {new Date().getFullYear()} EDER</span>
        <span>Değerleme sonuçları tahmini niteliktedir.</span>
      </div>
    </footer>
  );
}
