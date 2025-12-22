import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import FooterBar from "../components/FooterBar";
import GlobalAdBar from "../components/GlobalAdBar";
import "./PublicLayout.css";

const { Content } = Layout;

export default function PublicLayout() {
  return (
    <Layout className="public-layout">
      <TopBar />
      <Content className="public-content">
        <div className="container">
          <Outlet />
        </div>
        <GlobalAdBar />
      </Content>
      <FooterBar />
    </Layout>
  );
}
