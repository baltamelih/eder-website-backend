import React, { useState, useEffect, useMemo } from "react";
import { Button, Drawer, Badge, Avatar, Dropdown } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Crown,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  BarChart3,
  Home,
  Plus,
} from "lucide-react";

import { useAuth } from "../services/AuthContext";
import { useSubscription } from "../services/SubscriptionContext";
import "./topbar.css";
import ederLogo from "../assets/eder-logo.png";

const navItems = [
  {
    key: "/app/dashboard",
    label: <Link to="/app/dashboard">Dashboard</Link>,
    icon: <Home size={16} />,
  },
  {
    key: "/app/valuation",
    label: <Link to="/app/valuation">Değerleme</Link>,
    icon: <BarChart3 size={16} />,
  },
  {
    key: "/pricing",
    label: <Link to="/pricing">Premium</Link>,
    icon: <Crown size={16} />,
  },
  {
    key: "/app/account",
    label: <Link to="/app/account">Hesabım</Link>,
    icon: <User size={16} />,
  },
  {
    key: "/app/settings",
    label: <Link to="/app/settings">Ayarlar</Link>,
    icon: <Settings size={16} />,
  },
];

function PremiumButton({ to, children, className = "", onClick, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link to={to} onClick={onClick}>
        <Button
          type="primary"
          className={`tb-premium ${className}`}
          icon={<Sparkles size={16} />}
          {...props}
        >
          {children}
        </Button>
      </Link>
    </motion.div>
  );
}

function UserMenu({ user, isPremium, onLogout }) {
  const menuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: "Profil",
      onClick: () => (window.location.href = "/app/account"),
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: "Ayarlar",
      onClick: () => (window.location.href = "/app/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Çıkış Yap",
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["click"]}
      overlayClassName="tb-user-dropdown"
    >
      <motion.div
        className="tb-user-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Badge dot={isPremium} color="#ff7a18" offset={[-2, 2]}>
          <Avatar
            size={36}
            style={{
              background: "linear-gradient(135deg, #ff7a18, #ffb14a)",
              border: "2px solid rgba(255,122,24,0.2)",
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </Avatar>
        </Badge>
        <ChevronDown size={14} className="tb-user-chevron" />
      </motion.div>
    </Dropdown>
  );
}

function computeSelectedKey(pathname) {
  // Öncelik: navItems ile en uzun prefix match
  // Böylece /app/dashboard/sub gibi rotalarda da doğru seçilir
  const candidates = navItems
    .map((i) => i.key)
    .sort((a, b) => b.length - a.length);

  for (const key of candidates) {
    if (pathname === key || pathname.startsWith(key + "/")) return key;
  }

  // fallback: /app/... ise dashboard seç
  if (pathname.startsWith("/app")) return "/app/dashboard";
  return "/pricing"; // ya da null
}

export default function TopBar() {
  // ✅ refresh yok, doğru isim refreshMe
  // ✅ logout işlemini servis yerine context'ten al (CORS/404 tetiklemesin)
  const { isAuthed, user, refreshMe, logout: logoutUser } = useAuth();
  const { isPremium } = useSubscription();

  const nav = useNavigate();
  const loc = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedKey = useMemo(
    () => computeSelectedKey(loc.pathname),
    [loc.pathname]
  );

  async function doLogout() {
    try {
      // context logout tokenları temizler
      await logoutUser();
      // istersek state’i kesinleştirelim
      await refreshMe?.();
    } finally {
      setOpen(false);
      nav("/", { replace: true });
    }
  }

  return (
    <>
      <motion.header
        className={`tb ${scrolled ? "tb--scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="tb-inner">
          {/* Left: Brand + Mobile Menu */}
          <div className="tb-left">
            {isAuthed && (
              <motion.button
                className="tb-burger"
                onClick={() => setOpen(true)}
                aria-label="Menü"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MenuIcon size={18} />
              </motion.button>
            )}

            <motion.div
              className="tb-brand"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/" className="tb-brand-link" onClick={() => setOpen(false)}>
                <motion.span
                  className="tb-dot"
                  aria-hidden
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255,122,24,0.4)",
                      "0 0 0 6px rgba(255,122,24,0)",
                      "0 0 0 0 rgba(255,122,24,0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <img src={ederLogo} alt="EDER" className="tb-logo" />
              </Link>

              {isAuthed && (
                <motion.div
                  className="tb-status-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {isPremium ? (
                    <div className="tb-premium-badge">
                      <Crown size={14} />
                      <span>Premium</span>
                    </div>
                  ) : (
                    <div className="tb-free-badge">
                      <span>Free</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right: Actions */}
          <div className="tb-actions">
            {!isAuthed ? (
              <>
                <motion.div
                  className="tb-hide-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/login">
                    <Button className="tb-login">Giriş</Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PremiumButton to="/pricing">Premium</PremiumButton>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  className="tb-hide-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/app/valuation">
                    <Button
                      type="primary"
                      className="tb-new-valuation"
                      icon={<Plus size={16} />}
                    >
                      Yeni Değerleme
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  className="tb-hide-mobile"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <UserMenu user={user} isPremium={isPremium} onLogout={doLogout} />
                </motion.div>

                {/* Mobile logout button */}
                <motion.div
                  className="tb-show-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={doLogout}
                    className="tb-logout-mobile"
                    icon={<LogOut size={16} />}
                  >
                    Çıkış
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            placement="left"
            width={320}
            closeIcon={<CloseIcon size={18} />}
            className="tb-drawer-container"
            title={
              <div className="tb-drawer-brand">
                <span className="tb-dot" aria-hidden />
                <span className="tb-name">EDER</span>
                <span className="tb-beta">Panel</span>
              </div>
            }
          >
            <motion.div
              className="tb-drawer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tb-drawer-nav">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div
                      onClick={() => setOpen(false)}
                      className={`tb-drawer-link ${
                        selectedKey === item.key ? "is-active" : ""
                      }`}
                    >
                      <div className="tb-drawer-link-icon">{item.icon}</div>
                      {item.label}
                    </div>
                  </motion.div>
                ))}

                {/* Drawer logout */}
                {isAuthed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.06 }}
                    style={{ marginTop: 12 }}
                  >
                    <Button
                      block
                      danger
                      onClick={doLogout}
                      icon={<LogOut size={16} />}
                    >
                      Çıkış Yap
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
}
