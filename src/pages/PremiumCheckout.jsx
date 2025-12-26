import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Space, Alert, Spin } from "antd";
import { Crown, ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useSubscription } from "../services/SubscriptionContext";

const { Title, Paragraph, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_BASE || ""; // örn: https://api.ederapp.com

async function apiJson(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export default function PremiumCheckout() {
  const nav = useNavigate();
  const loc = useLocation();

  const { user, refresh: refreshAuth } = useAuth();
  const { isPremium, refresh: refreshSubscription } = useSubscription(); // aşağıda context'e ekleyeceğiz
  const [loading, setLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");

  // user token'ını senin projende nereden alıyorsan ona göre ayarla.
  // Çoğu projede localStorage token olur:
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const alreadyPremium = !!isPremium;

  useEffect(() => {
    if (alreadyPremium) {
      // premium ise checkout’a sokma
      nav("/app/account", { replace: true });
    }
  }, [alreadyPremium, nav]);

  async function startPayment() {
    setError("");
    setLoading(true);
    try {
      // burada adres/telefon istersen modal ile alırız; şimdilik boş geçilebilir
      const resp = await apiJson(
        "/api/paytr/premium/init",
        {
          method: "POST",
          token,
          body: {
            plan_code: "premium_30d",
            // name/phone/address opsiyonel
            name: user?.full_name || "",
          },
        }
      );

      setIframeUrl(resp.iframe_url || "");
      setOrderCode(resp.order_code || "");
    } catch (e) {
      setError(e.message || "Ödeme başlatılamadı.");
    } finally {
      setLoading(false);
    }
  }

  // ödeme sonrası premium aktif olana kadar polling
  useEffect(() => {
    if (!orderCode) return;

    let stopped = false;
    const t0 = Date.now();

    async function poll() {
      if (stopped) return;

      try {
        // Önce subscription context’i tazele
        if (refreshSubscription) await refreshSubscription();
        await refreshAuth();

        // Premium açıldıysa yönlendir
        // (useSubscription isPremium anında true olmalı)
        if (window.__eder_isPremium === true) {
          nav("/app/account", { replace: true });
          return;
        }
      } catch (_) {}

      // 2 dakika dene, sonra bırak
      if (Date.now() - t0 < 120000) {
        setTimeout(poll, 2500);
      }
    }

    poll();
    return () => {
      stopped = true;
    };
  }, [orderCode, nav, refreshAuth, refreshSubscription]);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space align="center">
            <Crown size={20} color="#FF7A18" />
            <div>
              <Title level={4} style={{ margin: 0 }}>Premium Satın Al</Title>
              <Text type="secondary">Güvenli ödeme (PayTR 3D Secure)</Text>
            </div>
          </Space>

          <Button icon={<ArrowLeft size={16} />} onClick={() => nav("/pricing")}>
            Geri
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px", minWidth: 320 }}>
            <Title level={5} style={{ marginTop: 0 }}>Plan</Title>
            <div style={{ padding: 14, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12 }}>
              <Space align="start">
                <ShieldCheck size={18} color="#52c41a" />
                <div>
                  <Text strong>Premium 30 Gün</Text>
                  <div><Text type="secondary">₺199 / ay • Sınırsız değerleme • Reklamsız</Text></div>
                </div>
              </Space>
            </div>

            <Paragraph style={{ marginTop: 16, color: "rgba(0,0,0,0.65)" }}>
              Kart bilgileriniz EDER sunucularına <b>hiç</b> gelmez. Ödeme PayTR iFrame üzerinden 3D Secure ile tamamlanır.
            </Paragraph>

            {!!error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}

            {!iframeUrl ? (
              <Button
                type="primary"
                size="large"
                onClick={startPayment}
                loading={loading}
                style={{
                  height: 50,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #FF7A18 0%, #FF9A4A 100%)",
                  border: "none",
                }}
                block
              >
                Ödemeyi Başlat
              </Button>
            ) : (
              <Alert
                type="info"
                showIcon
                message="Ödeme ekranı açıldı"
                description="Aşağıdaki güvenli ödeme ekranından işlemi tamamlayın. Ödeme sonrası Premium otomatik aktif olur."
                style={{ marginTop: 10 }}
              />
            )}

            {orderCode && (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Sipariş Kodu: </Text>
                <Text code>{orderCode}</Text>
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 440px", minWidth: 320 }}>
            <Title level={5} style={{ marginTop: 0 }}>Güvenli Ödeme</Title>

            {!iframeUrl ? (
              <div style={{ padding: 24, borderRadius: 12, border: "1px dashed rgba(0,0,0,0.15)", textAlign: "center" }}>
                <Spin spinning={loading}>
                  <Text type="secondary">Ödemeyi başlattıktan sonra burada PayTR ekranı görünecek.</Text>
                </Spin>
              </div>
            ) : (
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
                <iframe
                  title="PayTR Payment"
                  src={iframeUrl}
                  style={{ width: "100%", height: 640, border: 0 }}
                  allow="payment"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
