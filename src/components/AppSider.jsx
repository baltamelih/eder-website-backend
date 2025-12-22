import { Drawer, Layout, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../services/AuthContext";
import ederLogo from "../assets/eder-logo.png";

const { Sider } = Layout;

const items = [
  { key: "/dashboard", label: <Link to="/dashboard">Dashboard</Link> },
  { key: "/valuation", label: <Link to="/valuation">Değerleme</Link> },
  { key: "/pricing", label: <Link to="/pricing">Premium</Link> },
  { key: "/account", label: <Link to="/account">Hesabım</Link> },
  { key: "/settings", label: <Link to="/settings">Ayarlar</Link> },
];

function useSelectedKey(pathname) {
  return useMemo(() => {
    const first = `/${pathname.split("/")[1] || "dashboard"}`;
    return first === "/" ? "/dashboard" : first;
  }, [pathname]);
}

export default function AppSider() {
  const loc = useLocation();
  const selectedKey = useSelectedKey(loc.pathname);
  const { isAuthed } = useAuth();

  // mobil drawer
  const [open, setOpen] = useState(false);

  // login değilse sade görünüm (istersen “landing layout” da yaparız)
  if (!isAuthed) return null;

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      style={{ borderRight: "none" }}
      onClick={() => setOpen(false)}
    />
  );

  return (
    <>
      {/* Desktop sider */}
      <Sider
        width={248}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "#fff",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
        trigger={null}
      >
        <div style={{ padding: "18px 16px", fontWeight: 900, letterSpacing: 0.2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#FF7A18" }}>●</span>
            <img 
              src={ederLogo} 
              alt="EDER" 
              style={{ 
                height: "28px", 
                width: "auto", 
                objectFit: "contain" 
              }}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.55)", marginTop: 6 }}>
            Web Panel
          </div>
        </div>

        {menu}
      </Sider>

      {/* Mobile drawer: TopBar açacak */}
      <Drawer
        title="EDER"
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {menu}
      </Drawer>

      {/* Drawer kontrolünü TopBar'dan açacağız */}
      <div id="eder-mobile-drawer-control" style={{ display: "none" }} />
    </>
  );
}
