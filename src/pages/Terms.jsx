import { Card, Divider, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function Terms() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={2} style={{ marginTop: 0, color: "#FF7A18" }}>
          Kullanım Şartları
        </Title>

        <Paragraph
          style={{
            color: "rgba(0,0,0,0.70)",
            fontSize: 16,
            marginBottom: 24,
          }}
        >
          Son güncelleme: 11 Eylül 2026
        </Paragraph>

        <Divider />

        <Title level={3}>1. Hizmet Tanımı</Title>
        <Paragraph>
          EDER, araç bilgilerini ve mevcut piyasa verilerini birlikte
          değerlendirerek tahmini piyasa değer aralığı sunan bir web
          platformudur.
        </Paragraph>

        <Title level={3}>2. Kullanım Koşulları</Title>
        <Paragraph>
          • Hizmeti kullanırken doğru ve güncel bilgi vermeniz gerekir
          <br />
          • Platformu kötüye kullanmak, otomatik olarak aşırı istek göndermek
          veya güvenlik önlemlerini aşmaya çalışmak yasaktır
          <br />• Hizmet üzerinde adil kullanım ve güvenlik limitleri
          uygulanabilir
        </Paragraph>

        <Title level={3}>3. Değerleme Hizmeti</Title>
        <Paragraph>
          • Değerleme sonuçları tahmini niteliktedir
          <br />
          • Kesin satış veya alış fiyatı garantisi verilmez
          <br />
          • Piyasa koşulları, aracın gerçek kondisyonu ve ilan koşulları sonucu
          etkileyebilir
          <br />• Sonuçlar bilgilendirme amaçlıdır
        </Paragraph>

        <Title level={3}>4. Hizmete Erişim</Title>
        <Paragraph>
          EDER&apos;in temel araç değerleme akışı ücretsiz olarak sunulur.
          Güvenlik, kapasite ve adil kullanım amacıyla belirli dönemlerde istek
          limitleri uygulanabilir. Mevcut arayüzde ücretli abonelik veya satın
          alma işlemi sunulmamaktadır.
        </Paragraph>

        <Title level={3}>5. Gizlilik ve Veri</Title>
        <Paragraph>
          Kişisel verileriniz <Text strong>Gizlilik Politikası</Text>{" "}
          kapsamında işlenir ve yürürlükteki veri koruma yükümlülüklerine göre
          korunur.
        </Paragraph>

        <Title level={3}>6. Sorumluluk Sınırları</Title>
        <Paragraph>
          • EDER, değerleme sonuçlarının doğruluğunu veya gerçekleşecek satış
          fiyatını garanti etmez
          <br />
          • Kullanıcının alım-satım kararları kendi sorumluluğundadır
          <br />• Üçüncü taraf hizmetlerin kesintilerinden EDER sorumlu
          tutulamaz
        </Paragraph>

        <Title level={3}>7. Değişiklikler</Title>
        <Paragraph>
          Hizmet geliştikçe bu şartlar güncellenebilir. Güncel metin bu sayfada
          yayımlanır.
        </Paragraph>

        <Divider />

        <Paragraph
          style={{ textAlign: "center", color: "rgba(0,0,0,0.60)" }}
        >
          Sorularınız için: <Text strong>destek@ederapp.com</Text>
        </Paragraph>
      </Card>
    </div>
  );
}
