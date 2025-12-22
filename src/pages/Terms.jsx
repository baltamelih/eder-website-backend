import { Card, Typography, Divider } from "antd";
const { Title, Paragraph, Text } = Typography;

export default function Terms() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={2} style={{ marginTop: 0, color: "#FF7A18" }}>
          Kullanım Şartları
        </Title>
        
        <Paragraph style={{ color: "rgba(0,0,0,0.70)", fontSize: 16, marginBottom: 24 }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </Paragraph>

        <Divider />

        <Title level={3}>1. Hizmet Tanımı</Title>
        <Paragraph>
          EDER, araç değerleme hizmeti sunan bir web platformudur. Kullanıcılarımıza 
          araçlarının piyasa değerini öğrenme imkanı sağlıyoruz.
        </Paragraph>

        <Title level={3}>2. Kullanım Koşulları</Title>
        <Paragraph>
          • Hizmetimizi 18 yaş üstü kullanıcılar kullanabilir<br/>
          • Doğru ve güncel bilgi vermeniz gerekmektedir<br/>
          • Platformu kötüye kullanmak yasaktır<br/>
          • Ticari amaçlı kullanım için izin alınmalıdır
        </Paragraph>

        <Title level={3}>3. Değerleme Hizmeti</Title>
        <Paragraph>
          • Değerleme sonuçları tahmini niteliktedir<br/>
          • Kesin fiyat garantisi verilmez<br/>
          • Piyasa koşulları değerlemeyi etkileyebilir<br/>
          • Sonuçlar sadece bilgilendirme amaçlıdır
        </Paragraph>

        <Title level={3}>4. Premium Üyelik</Title>
        <Paragraph>
          • Premium üyelik aylık/yıllık olarak sunulur<br/>
          • Reklamsız deneyim ve gelişmiş özellikler içerir<br/>
          • İptal işlemi hesap ayarlarından yapılabilir<br/>
          • İade koşulları ayrı belirtilmiştir
        </Paragraph>

        <Title level={3}>5. Gizlilik ve Veri</Title>
        <Paragraph>
          Kişisel verileriniz <Text strong>Gizlilik Politikası</Text> kapsamında 
          korunmaktadır. KVKK'ya uygun şekilde işlenmektedir.
        </Paragraph>

        <Title level={3}>6. Sorumluluk Sınırları</Title>
        <Paragraph>
          • EDER, değerleme sonuçlarının doğruluğunu garanti etmez<br/>
          • Kullanıcı kararlarından sorumlu değildir<br/>
          • Teknik arızalardan kaynaklanan zararlar kapsamdışıdır<br/>
          • Üçüncü taraf hizmetlerden sorumlu değildir
        </Paragraph>

        <Title level={3}>7. Değişiklikler</Title>
        <Paragraph>
          Bu şartlar zaman zaman güncellenebilir. Önemli değişiklikler 
          kullanıcılara bildirilecektir.
        </Paragraph>

        <Divider />

        <Paragraph style={{ textAlign: "center", color: "rgba(0,0,0,0.60)" }}>
          Sorularınız için: <Text strong>destek@ederapp.com</Text>
        </Paragraph>
      </Card>
    </div>
  );
}
