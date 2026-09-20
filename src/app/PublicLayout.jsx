import { useEffect } from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import FooterBar from "../components/FooterBar";
import GlobalAdBar from "../components/GlobalAdBar";
import "./PublicLayout.css";

const { Content } = Layout;

const DEFAULT_META = {
  title: "EDER | Araç Değerleme",
  description:
    "Araç özellikleri ve piyasa verilerini birlikte değerlendirerek tahmini piyasa değer aralığı sunan EDER.",
  canonical: "/",
  index: true,
};

const META = {
  "/": DEFAULT_META,
  "/arac-degerleme": {
    title: "Araç Değerleme | EDER",
    description:
      "Marka, model, yıl, kilometre ve kondisyon bilgileriyle aracınız için tahmini piyasa değer aralığı oluşturun.",
    canonical: "/arac-degerleme",
    index: true,
  },
  "/arac-fiyat-gecmisi": {
    title: "Araç Fiyat Geçmişi | EDER",
    description:
      "Marka, model, yıl ve paket bazında ikinci el araç ilan fiyat geçmişini EDER ile inceleyin.",
    canonical: "/arac-fiyat-gecmisi",
    index: true,
  },
  "/blog": {
    title: "Araç Değerleme Rehberi | EDER",
    description:
      "İkinci el araç değeri, boya, değişen parça, tramer ve piyasa dinamikleri hakkında EDER rehberleri.",
    canonical: "/blog",
    index: true,
  },
  "/hakkimizda": {
    title: "Hakkımızda | EDER",
    description:
      "EDER'in araç değerleme yaklaşımı, veri ilkeleri ve ürün prensipleri.",
    canonical: "/hakkimizda",
    index: true,
  },
  "/sss": {
    title: "Sık Sorulan Sorular | EDER",
    description:
      "EDER araç değerleme, hesap, sonuçlar, gizlilik ve doğrulanmış satış geri bildirimi hakkında sık sorulan sorular.",
    canonical: "/sss",
    index: true,
  },
  "/destek": {
    title: "Destek | EDER",
    description:
      "EDER hesap, değerleme, teknik sorun ve veri talepleri için destek merkezi.",
    canonical: "/destek",
    index: true,
  },
  "/iletisim": {
    title: "İletişim | EDER",
    description:
      "EDER ile iletişime geçin ve destek talebinizi e-posta üzerinden iletin.",
    canonical: "/iletisim",
    index: true,
  },
  "/gizlilik-politikasi": {
    title: "Gizlilik Politikası | EDER",
    description:
      "EDER hizmetinde işlenebilen veri kategorileri, amaçlar, üçüncü taraf hizmetler ve kullanıcı tercihleri.",
    canonical: "/gizlilik-politikasi",
    index: true,
  },
  "/kvkk-aydinlatma-metni": {
    title: "KVKK Aydınlatma Metni | EDER",
    description:
      "EDER hizmeti kapsamında kişisel verilerin işlenmesine ilişkin KVKK bilgilendirmesi.",
    canonical: "/kvkk-aydinlatma-metni",
    index: true,
  },
  "/cerez-politikasi": {
    title: "Çerez Politikası | EDER",
    description:
      "EDER'de çerezler, yerel depolama, güvenlik, analitik ve reklam teknolojilerinin kullanımına ilişkin açıklamalar.",
    canonical: "/cerez-politikasi",
    index: true,
  },
  "/kullanim-kosullari": {
    title: "Kullanım Koşulları | EDER",
    description:
      "EDER araç değerleme hizmetinin kullanım koşulları ve tahmini değerleme sonuçlarının kapsamı.",
    canonical: "/kullanim-kosullari",
    index: true,
  },
  "/login": {
    title: "Giriş | EDER",
    description: "EDER hesabınıza giriş yapın.",
    canonical: "/login",
    index: false,
  },
  "/register": {
    title: "Kayıt | EDER",
    description: "EDER hesabı oluşturun.",
    canonical: "/register",
    index: false,
  },
  "/forgot-password": {
    title: "Şifre Sıfırlama | EDER",
    description: "EDER hesabınız için şifre sıfırlama bağlantısı isteyin.",
    canonical: "/forgot-password",
    index: false,
  },
  "/reset-password": {
    title: "Yeni Şifre | EDER",
    description: "EDER hesabınız için yeni şifre belirleyin.",
    canonical: "/reset-password",
    index: false,
  },
  "/delete-account": {
    title: "Hesap Silme | EDER",
    description: "EDER hesap silme işlemi hakkında bilgi.",
    canonical: "/delete-account",
    index: false,
  },
};

function setMeta(name, content, property = false) {
  const selector = property
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const cleanPath =
      pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

    const isBlogPost = cleanPath.startsWith("/blog/");
    const isPriceHistoryPage =
      cleanPath.startsWith("/arac-fiyat-gecmisi/");
    const meta =
      META[cleanPath] ||
      (isPriceHistoryPage
        ? {
            title: "Araç Fiyat Geçmişi | EDER",
            description:
              "Marka, model, yıl ve paket bazında EDER araç fiyat geçmişi sayfası.",
            canonical: cleanPath,
            // Programmatic SEO index eligibility is activated in 04I.
            index: false,
          }
        : isBlogPost
          ? {
              title: "Araç Değerleme Rehberi | EDER",
              description:
                "EDER araç değerleme rehberindeki güncel içerik ve açıklamalar.",
              canonical: cleanPath,
              index: true,
            }
          : {
              title: "Sayfa Bulunamadı | EDER",
              description: "Aradığınız sayfa bulunamadı.",
              canonical: cleanPath,
              index: false,
            });

    const absolute = `https://ederapp.com${meta.canonical}`;
    document.title = meta.title;

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", absolute);

    setMeta("description", meta.description);
    setMeta("robots", meta.index ? "index,follow" : "noindex,nofollow");
    setMeta("og:title", meta.title, true);
    setMeta("og:description", meta.description, true);
    setMeta("og:url", absolute, true);
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);
  }, [pathname]);

  return null;
}

export default function PublicLayout() {
  return (
    <Layout className="public-layout">
      <RouteMetadata />
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
