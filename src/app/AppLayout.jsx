import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import FooterBar from "../components/FooterBar";
import GlobalAdBar from "../components/GlobalAdBar";
import "./layout.css";

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <TopBar />
      <Content style={{ padding: "24px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Outlet />
          <GlobalAdBar />
        </div>
      </Content>
      <FooterBar />
    </Layout>
  );
}
