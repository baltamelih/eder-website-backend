import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import FooterBar from "../components/FooterBar";
import "./layout.css";

import UserAreaBar from "../components/UserAreaBar";
const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <TopBar />
      <Content style={{ padding: "24px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* EDER_03F2B_V1_3_EXACT_GOOGLE_AUTH */}
          <UserAreaBar />
          <Outlet />
          {/* GlobalAdBar kaldırıldı */}
        </div>
      </Content>
      <FooterBar />
    </Layout>
  );
}
