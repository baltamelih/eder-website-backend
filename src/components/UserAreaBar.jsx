import { NavLink } from "react-router-dom";
import "./user-area-bar.css";

// EDER_03F2B_V1_3_EXACT_GOOGLE_AUTH
const links = [
  { to: "/app/dashboard", label: "Panel" },
  { to: "/app/cars", label: "Araçlarım" }, // EDER_03F3_90_DAY_CAR_POLICY
  { to: "/app/feedback", label: "Geri Bildirimler" }, // EDER_03F6C_FEEDBACK_NAV
  { to: "/valuation", label: "Yeni değerleme" },
  { to: "/app/account", label: "Hesabım" },
  { to: "/app/settings", label: "Ayarlar" },
];

export default function UserAreaBar() {
  return (
    <nav className="eder-user-area-bar" aria-label="Kullanıcı alanı">
      <div className="eder-user-area-bar__context">
        <span>KULLANICI ALANI</span>
        <strong>Araç ve hesap işlemlerin</strong>
      </div>

      <div className="eder-user-area-bar__links">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `eder-user-area-bar__link${isActive ? " is-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
