import React, { useMemo, useState } from "react";
import { Card, Collapse, Input, Tag, Typography, Row, Col, Button } from "antd";
import { motion } from "framer-motion";
import { Search, HelpCircle, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const FAQ_DATA = [
  {
    category: "Genel Bilgiler",
    items: [
      {
        q: "EDER nedir ve nasıl çalışır?",
        a: "EDER, araç özellikleri ve piyasa verilerini birlikte değerlendirerek tahmini piyasa değer aralığı sunan bir araç değerleme platformudur. Marka, model, yıl, kilometre, donanım ve kondisyon gibi girdiler değerleme sürecinde birlikte ele alınır.",
      },
      {
        q: "Değerleme sonucu kesin fiyat mıdır?",
        a: "Hayır, EDER tarafından verilen değer bir 'tahmini piyasa değeri'dir. Gerçek satış fiyatı; bölgesel farklılıklar, arz-talep dengesi, aracın fiziksel durumu, bakım geçmişi ve pazarlık gibi faktörlere göre değişebilir. Sonuçlarımız güçlü bir başlangıç noktası sağlar.",
      },
      {
        q: "Hangi araç türleri için değerleme yapabiliyorum?",
        a: "Desteklenen marka ve modeller değerleme formundaki güncel katalogda gösterilir. Aradığınız aracı göremiyorsanız destek ekibimize bildirebilirsiniz.",
      },
      {
        q: "EDER'i ücretsiz kullanabilir miyim?",
        a: "Evet. Araç değerleme akışını ücretsiz kullanabilirsiniz. Kötüye kullanımı önlemek için güvenlik doğrulaması ve günlük kullanım sınırı uygulanabilir.",
      },
    ],
  },
  {
    category: "Hesap Yönetimi",
    items: [
      {
        q: "Nasıl hesap oluşturabilirim?",
        a: "Ana sayfadaki 'Kayıt Ol' butonuna tıklayarak e-posta adresiniz ve güvenli bir şifre ile hesap oluşturabilirsiniz. Kayıt işlemi sadece birkaç saniye sürer ve hemen değerleme yapmaya başlayabilirsiniz.",
      },
      {
        q: "Şifremi unuttum, ne yapmalıyım?",
        a: "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayın. E-posta adresinizi girdikten sonra size şifre sıfırlama bağlantısı gönderilecektir. Bu bağlantı ile yeni şifrenizi belirleyebilirsiniz.",
      },
      {
        q: "Hesap bilgilerimi nasıl güncelleyebilirim?",
        a: "Giriş yaptıktan sonra sağ üst köşedeki profil menüsünden 'Hesap Ayarları' seçeneğine tıklayarak kişisel bilgilerinizi, e-posta adresinizi ve şifrenizi güncelleyebilirsiniz.",
      },
      {
        q: "Hesabımı silmek istiyorum.",
        a: "Hesap silme işlemi için destek ekibimize e-posta göndermeniz gerekmektedir. Talebinizi en kısa sürede işleme alacağız. Hesap silindikten sonra tüm verileriniz kalıcı olarak silinir.",
      },
    ],
  },
  {
    category: "Değerleme Süreci",
    items: [
      {
        q: "Değerleme nasıl bu kadar hızlı hesaplanıyor?",
        a: "Gelişmiş makine öğrenmesi algoritmalarımız, sürekli güncellenen piyasa verilerini, satış istatistiklerini ve araç özelliklerini gerçek zamanlı olarak analiz eder. Bu sayede saniyeler içinde doğru tahmin üretebiliriz.",
      },
      {
        q: "Kilometre değerlemeyi nasıl etkiler?",
        a: "Kilometre, değerlemeyi etkileyen en önemli faktörlerden biridir. Genellikle yüksek kilometre değeri düşürür, ancak araç segmenti, yaşı, bakım durumu ve kullanım şekli de dikkate alınır. Algoritmanız bu karmaşık ilişkiyi otomatik olarak hesaplar.",
      },
      {
        q: "Hasar ve boyalı parça bilgilerini nasıl girmeliyim?",
        a: "Değerleme formunda 'Hasar Durumu' bölümünde aracınızın boyalı, değişen veya hasarlı parçalarını işaretleyebilirsiniz. Bu bilgiler değerlemeyi önemli ölçüde etkileyeceği için mümkün olduğunca doğru bilgi girmenizi öneririz.",
      },
      {
        q: "Modifikasyon ve tuning değerlemeyi etkiler mi?",
        a: "Evet, orijinal olmayan parçalar ve modifikasyonlar genellikle aracın değerini olumsuz etkiler. Ancak bazı kaliteli ve profesyonel modifikasyonlar değeri artırabilir. Bu durumları 'Ek Notlar' bölümünde belirtebilirsiniz.",
      },
    ],
  },
  {
    category: "Teknik Destek",
    items: [
      {
        q: "Uygulama çok yavaş çalışıyor veya donuyor.",
        a: "Önce internet bağlantınızı kontrol edin. Tarayıcınızın önbelleğini temizleyin veya farklı bir tarayıcı deneyin. Mobil cihazlarda uygulamayı yeniden başlatmayı deneyin. Sorun devam ederse teknik ekibimize yazın.",
      },
      {
        q: "Değerleme sonucu çıkmıyor veya hata alıyorum.",
        a: "Bu durum genellikle eksik araç bilgisi veya geçici sunucu yoğunluğundan kaynaklanır. Tüm alanları doğru doldurduğunuzdan emin olun ve birkaç dakika sonra tekrar deneyin. Sorun devam ederse hata mesajını bize iletin.",
      },
      {
        q: "Hangi tarayıcıları destekliyorsunuz?",
        a: "Chrome, Firefox, Safari ve Edge'in güncel sürümlerini destekliyoruz. En iyi deneyim için Chrome veya Firefox kullanmanızı öneririz. Internet Explorer desteklenmemektedir.",
      },
      {
        q: "Mobil uygulamanız var mı?",
        a: "Şu anda web tabanlı uygulamamız tüm mobil cihazlarda mükemmel çalışmaktadır. iOS ve Android uygulamalarımız geliştirme aşamasında olup yakında App Store ve Google Play'de yayınlanacaktır.",
      },
    ],
  },
];

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

export default function Faq() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return FAQ_DATA;

    return FAQ_DATA.map((group) => {
      const items = group.items.filter((x) => {
        const hay = normalize(`${x.q} ${x.a} ${group.category}`);
        return hay.includes(q);
      });
      return { ...group, items };
    }).filter((g) => g.items.length > 0);
  }, [query]);

  const totalCount = filtered.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div style={{ padding: "28px 0 56px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          style={{
            borderRadius: 24,
            padding: "26px 22px",
            background:
              "radial-gradient(900px circle at 10% 10%, rgba(255,122,24,0.20), transparent 55%)," +
              "radial-gradient(700px circle at 90% 40%, rgba(255,122,24,0.12), transparent 55%)," +
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 18px 60px rgba(15,23,42,0.07)",
          }}
        >
          <motion.div variants={fadeUp} custom={0} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(255,122,24,0.15) 0%, rgba(255,122,24,0.05) 100%)",
                border: "1px solid rgba(255,122,24,0.25)",
                color: "rgba(255,122,24,0.95)",
              }}
            >
              <HelpCircle size={24} />
            </span>
            <div>
              <Title style={{ margin: 0, fontSize: 32, letterSpacing: -0.8, fontWeight: 900 }}>
                Sık Sorulan Sorular
              </Title>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 16 }}>
                Merak ettiklerinizin cevapları burada. Aradığınızı bulamazsanız bize yazın!
              </Text>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} style={{ marginTop: 20 }}>
            <Input
              size="large"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Soru ara... (örn: şifre, değerleme, hesap)"
              prefix={<Search size={20} />}
              style={{
                borderRadius: 16,
                height: 56,
                fontSize: 16,
                border: "2px solid rgba(255,122,24,0.1)",
                boxShadow: "0 4px 12px rgba(255,122,24,0.08)"
              }}
              allowClear
            />
            <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Tag style={{
                borderRadius: 999,
                padding: "6px 14px",
                fontWeight: 700,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#16a34a"
              }}>
                {totalCount} sonuç bulundu
              </Tag>
              <Tag style={{
                borderRadius: 999,
                padding: "6px 14px",
                fontWeight: 700,
                background: "rgba(255,122,24,0.1)",
                border: "1px solid rgba(255,122,24,0.2)",
                color: "rgba(255,122,24,0.95)"
              }}>
                💡 Popüler: "değerleme", "hesap", "şifre"
              </Tag>
            </div>
          </motion.div>
        </motion.div>

        <div style={{ height: 18 }} />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            {/* FAQ Groups */}
            {filtered.map((group) => (
              <Card
                key={group.category}
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 16px 50px rgba(15,23,42,0.06)",
                  marginBottom: 16,
                }}
                bodyStyle={{ padding: 18 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {group.category}
                  </Title>
                  <Text type="secondary" style={{ fontWeight: 700 }}>
                    {group.items.length} madde
                  </Text>
                </div>

                <div style={{ height: 12 }} />

                <Collapse
                  accordion
                  items={group.items.map((x, i) => ({
                    key: `${group.category}-${i}`,
                    label: <span style={{ fontWeight: 800 }}>{x.q}</span>,
                    children: (
                      <div style={{ color: "rgba(15,23,42,0.82)", fontWeight: 600, lineHeight: 1.65 }}>
                        {x.a}
                      </div>
                    ),
                  }))}
                />
              </Card>
            ))}

            {filtered.length === 0 && (
              <Card
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 16px 50px rgba(15,23,42,0.06)",
                  textAlign: "center",
                  padding: "32px 24px"
                }}
              >
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(255,122,24,0.1) 0%, rgba(255,122,24,0.05) 100%)",
                  border: "1px solid rgba(255,122,24,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px"
                }}>
                  <HelpCircle size={36} style={{ color: "rgba(255,122,24,0.8)" }} />
                </div>
                <Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>
                  Aradığınızı bulamadınız mı?
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 24, fontSize: 16 }}>
                  Sorunuzun cevabı burada yoksa, destek ekibimiz size yardımcı olmaktan mutluluk duyar.
                  Genellikle 2 saat içinde yanıtlıyoruz.
                </Paragraph>
                <Link to="/support">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRight size={18} />}
                    iconPosition="end"
                    style={{
                      height: 48,
                      borderRadius: 12,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(255,122,24,0.3)",
                      marginRight: 12
                    }}
                  >
                    Destek Talebi Oluştur
                  </Button>
                </Link>
              </Card>
            )}
          </Col>

          {/* Right: CTA */}
          <Col xs={24} md={8}>
            <Card
              style={{
                borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 16px 50px rgba(15,23,42,0.06)",
                position: "sticky",
                top: 18,
              }}
              bodyStyle={{ padding: 18 }}
            >
              <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
                🚀 Hızlı Destek Alın
              </Title>
              <Text type="secondary" style={{ fontWeight: 600, marginBottom: 20, display: "block" }}>
                Sorununuzu çözemediyseniz, uzman ekibimiz size yardımcı olsun.
              </Text>

              <Link to="/support">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRight size={18} />}
                  iconPosition="end"
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 16,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #ff7a18 0%, #ffb14a 100%)",
                    border: "none",
                    boxShadow: "0 18px 40px rgba(255,122,24,0.22)",
                    marginBottom: 12,
                  }}
                >
                  Destek Formu
                </Button>
              </Link>

              <a href="mailto:destek@ederapp.com">
                <Button
                  size="large"
                  icon={<Mail size={18} />}
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 16,
                    fontWeight: 800,
                    border: "2px solid rgba(255,122,24,0.2)",
                    color: "rgba(255,122,24,0.95)",
                    background: "rgba(255,122,24,0.05)"
                  }}
                >
                  destek@ederapp.com
                </Button>
              </a>

              <div style={{ height: 16 }} />

              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: "1px dashed rgba(255,122,24,0.3)",
                  background: "linear-gradient(135deg, rgba(255,122,24,0.08) 0%, rgba(255,122,24,0.03) 100%)",
                }}
              >
                <Text style={{ fontWeight: 800, color: "rgba(255,122,24,0.95)", fontSize: 14 }}>
                  ⚡ Hızlı Çözüm İpucu
                </Text>
                <div style={{ marginTop: 8, color: "rgba(15,23,42,0.75)", fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>
                  Destek talebinizde <strong>"Değerleme"</strong>, <strong>"Hesap"</strong>, <strong>"Teknik"</strong>
                  veya <strong>"Hesap"</strong> kategorilerinden birini belirterek daha hızlı yanıt alabilirsiniz.
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
