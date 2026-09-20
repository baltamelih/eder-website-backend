import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Drawer, Dropdown } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  Home,
  LogOut,
  Menu as MenuIcon,
  Settings,
  User,
  X as CloseIcon,
} from "lucide-react";

import { useAuth } from "../services/AuthContext";
import { trackValuationCta } from "../services/analytics";
import "./topbar.css";
import ederLogo from "../assets/eder-logo.png";

const publicNav = [
  { key: "/", to: "/", label: "Ana Sayfa" },
  { key: "/valuation", to: "/valuation", label: "Değerleme" },
  {
    key: "/arac-fiyat-gecmisi",
    to: "/arac-fiyat-gecmisi",
    label: "Fiyat Geçmişi",
  },
  {
    key: "/fiyat-endeksi",
    to: "/fiyat-endeksi",
    label: "Fiyat Endeksi",
  },
  { key: "/blog", to: "/blog", label: "Rehber" },
  { key: "/faq", to: "/faq", label: "S.S.S" },
];

export default function TopBar() {
  const { isAuthed, user, refreshMe, logout: logoutUser } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = useMemo(
    () =>
      isAuthed
        ? [
            ...publicNav,
            { key: "/app/dashboard", to: "/app/dashboard", label: "Panel" },
          ]
        : publicNav,
    [isAuthed]
  );

  const activeKey = useMemo(() => {
    if (loc.pathname === "/") return "/";
    return (
      [...navItems]
        .filter((item) => item.key !== "/")
        .sort((a, b) => b.key.length - a.key.length)
        .find(
          (item) =>
            loc.pathname === item.key ||
            loc.pathname.startsWith(item.key + "/")
        )?.key || ""
    );
  }, [loc.pathname, navItems]);

  async function doLogout() {
    try {
      await logoutUser();
      await refreshMe?.();
    } finally {
      setOpen(false);
      nav("/", { replace: true });
    }
  }

  const userMenu = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: "Hesabım",
      onClick: () => nav("/app/account"),
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: "Ayarlar",
      onClick: () => nav("/app/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Çıkış Yap",
      onClick: doLogout,
      danger: true,
    },
  ];

  return (
    <>
      <motion.header
        className={`tb ${scrolled ? "tb--scrolled" : ""}`}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.34 }}
      >
        <div className="tb-inner">
          <Link
            to="/"
            className="tb-brand-link"
            onClick={() => setOpen(false)}
            aria-label="EDER ana sayfa"
          >
            <img src={ederLogo} alt="" className="tb-logo" />
            <span className="tb-wordmark">EDER</span>
          </Link>

          <nav className="tb-desktop-nav" aria-label="Ana menü">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`tb-public-link ${
                  activeKey === item.key ? "is-active" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="tb-actions">
            {!isAuthed ? (
              <>
                <Link to="/login" className="tb-hide-mobile">
                  <Button className="tb-login">Giriş</Button>
                </Link>
                <Link
                  to="/valuation"
                  className="tb-hide-mobile"
                  onClick={() => trackValuationCta("topbar_desktop")}
                >
                  <Button
                    type="primary"
                    className="tb-new-valuation"
                    icon={<BarChart3 size={16} />}
                  >
                    Aracını Değerle
                  </Button>
                </Link>
              </>
            ) : (
              <Dropdown
                menu={{ items: userMenu }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button
                  className="tb-user-trigger"
                  type="button"
                  aria-label="Kullanıcı menüsü"
                >
                  <Avatar size={34}>
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </Avatar>
                  <ChevronDown size={14} />
                </button>
              </Dropdown>
            )}

            <button
              className="tb-burger tb-show-mobile"
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Menüyü aç"
            >
              <MenuIcon size={19} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            placement="right"
            width={320}
            closeIcon={<CloseIcon size={18} />}
            title="EDER"
          >
            <div className="tb-drawer-nav">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`tb-drawer-link ${
                    activeKey === item.key ? "is-active" : ""
                  }`}
                >
                  {item.key === "/" ? <Home size={17} /> : null}
                  <span>{item.label}</span>
                </Link>
              ))}

              {!isAuthed ? (
                <>
                  <Link
                    to="/valuation"
                    onClick={() => {
                      trackValuationCta("topbar_mobile");
                      setOpen(false);
                    }}
                  >
                    <Button block type="primary" size="large">
                      Aracını Değerle
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button block size="large">
                      Giriş Yap
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  block
                  danger
                  onClick={doLogout}
                  icon={<LogOut size={16} />}
                >
                  Çıkış Yap
                </Button>
              )}
            </div>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
}
