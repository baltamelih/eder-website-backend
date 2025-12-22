import React, { useMemo, useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";

import { useAuth } from "../services/AuthContext";
import { logout as doLogoutService } from "../services/auth";
import { useSubscription } from "../services/SubscriptionContext";

import "./headerbar.css";

const navVariants = {
  hidden: { opacity: 0, y: -10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0 }
};

const logoVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

function NavLink({ to, children, isActive, onClick }) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        to={to}
        onClick={onClick}
        className={`hb-link ${isActive ? "is-active" : ""}`}
      >
        <motion.span
          className="hb-link-text"
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {children}
        </motion.span>
        {isActive && (
          <motion.div
            className="hb-link-indicator"
            layoutId="activeIndicator"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

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
          className={`hb-premium ${className}`}
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
      key: 'profile',
      icon: <User size={16} />,
      label: 'Profil',
      onClick: () => window.location.href = '/account'
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Ayarlar',
      onClick: () => window.location.href = '/settings'
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Çıkış Yap',
      onClick: onLogout,
      danger: true
    }
  ];

  return (
    <Dropdown 
      menu={{ items: menuItems }} 
      placement="bottomRight"
      trigger={['click']}
      overlayClassName="hb-user-dropdown"
    >
      <motion.div 
        className="hb-user-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Badge 
          dot={isPremium} 
          color="#ff7a18"
          offset={[-2, 2]}
        >
          <Avatar 
            size={36}
            style={{ 
              background: 'linear-gradient(135deg, #ff7a18, #ffb14a)',
              border: '2px solid rgba(255,122,24,0.2)'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </Badge>
        <ChevronDown size={14} className="hb-user-chevron" />
      </motion.div>
    </Dropdown>
  );
}

export default function HeaderBar() {
  const loc = useLocation();
  const nav = useNavigate();

  const { isPremium } = useSubscription();
  const { isAuthed, user, refresh } = useAuth();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleLogout() {
    doLogoutService();
    await refresh();
    nav("/", { replace: true });
  }

  const navItems = useMemo(
    () => [
      { key: "/", to: "/", label: "Ana Sayfa" },
      { key: "/valuation", to: "/valuation", label: "Değerleme" },
      { key: "/pricing", to: "/pricing", label: "Premium" },
      ...(isAuthed
        ? [
            { key: "/dashboard", to: "/dashboard", label: "Dashboard" },
          ]
        : []),
    ],
    [isAuthed]
  );

  const activeKey = useMemo(() => {
    const p = loc.pathname;
    const base = p === "/" ? "/" : `/${p.split("/")[1]}`;
    return navItems.some((x) => x.key === base) ? base : "";
  }, [loc.pathname, navItems]);

  return (
    <>
      <motion.header 
        className={`hb ${scrolled ? 'hb--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="hb-inner">
          {/* Left: Brand */}
          <motion.div
            variants={logoVariants}
            initial="rest"
            whileHover="hover"
          >
            <Link to="/" className="hb-brand" onClick={() => setOpen(false)}>
              <motion.span 
                className="hb-dot" 
                aria-hidden
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(255,122,24,0.4)",
                    "0 0 0 6px rgba(255,122,24,0)",
                    "0 0 0 0 rgba(255,122,24,0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="hb-name">EDER</span>
              <motion.span 
                className="hb-beta"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                Beta
              </motion.span>
            </Link>
          </motion.div>

          {/* Center: Desktop nav */}
          <motion.nav 
            className="hb-nav" 
            aria-label="Primary"
            variants={navVariants}
            initial="hidden"
            animate="show"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                isActive={activeKey === item.key}
              >
                {item.label}
              </NavLink>
            ))}
          </motion.nav>

          {/* Right: Actions */}
          <div className="hb-actions">
            {!isAuthed ? (
              <>
                <motion.div 
                  className="hb-hide-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/login">
                    <Button className="hb-login">Giriş</Button>
                  </Link>
                </motion.div>
                <motion.div 
                  className="hb-hide-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PremiumButton to="/pricing">
                    Premium
                  </PremiumButton>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div 
                  className="hb-hide-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {!isPremium ? (
                    <PremiumButton to="/pricing">
                      Upgrade
                    </PremiumButton>
                  ) : (
                    <motion.div className="hb-premium-badge">
                      <Crown size={16} />
                      <span>Premium</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div 
                  className="hb-hide-mobile"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <UserMenu 
                    user={user} 
                    isPremium={isPremium} 
                    onLogout={handleLogout} 
                  />
                </motion.div>
              </>
            )}

            {/* Mobile: Hamburger */}
            <motion.button 
              className="hb-burger" 
              onClick={() => setOpen(true)} 
              aria-label="Menü"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.5 }}
            >
              <MenuIcon size={18} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            placement="right"
            width={340}
            closeIcon={<CloseIcon size={18} />}
            className="hb-drawer-container"
            title={
              <Link to="/" className="hb-drawer-brand" onClick={() => setOpen(false)}>
                <span className="hb-dot" aria-hidden />
                <span className="hb-name">EDER</span>
                <span className="hb-beta">Beta</span>
              </Link>
            }
          >
            <motion.div 
              className="hb-drawer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="hb-drawer-nav">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={`hb-drawer-link ${activeKey === item.key ? "is-active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="hb-drawer-actions">
                {!isAuthed ? (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button block size="large" className="hb-drawer-btn">
                        Giriş Yap
                      </Button>
                    </Link>
                    <Link to="/pricing" onClick={() => setOpen(false)}>
                      <Button 
                        block 
                        size="large" 
                        type="primary" 
                        className="hb-premium"
                        icon={<Sparkles size={16} />}
                      >
                        Premium'a Geç
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/account" onClick={() => setOpen(false)}>
                      <Button block size="large" className="hb-drawer-btn">
                        Hesabım
                      </Button>
                    </Link>

                    {!isPremium ? (
                      <Link to="/pricing" onClick={() => setOpen(false)}>
                        <Button 
                          block 
                          size="large" 
                          type="primary" 
                          className="hb-premium"
                          icon={<Sparkles size={16} />}
                        >
                          Premium'a Geç
                        </Button>
                      </Link>
                    ) : (
                      <div className="hb-premium-status">
                        <Crown size={18} />
                        <span>Premium Üye</span>
                      </div>
                    )}

                    <Button 
                      block 
                      size="large" 
                      onClick={handleLogout}
                      className="hb-logout-btn"
                      icon={<LogOut size={16} />}
                    >
                      Çıkış Yap
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
}
