import { Card, Typography, Divider, Alert } from "antd";
import { Shield, Eye, Lock, Database, Mail, Calendar } from "lucide-react";

const { Title, Paragraph, Text } = Typography;

export default function Privacy() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Card style={{ borderRadius: 16 }}>
        <Title level={2} style={{ marginTop: 0, color: "#FF7A18" }}>
          <Shield size={24} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Gizlilik Politikası
        </Title>
        
        <Paragraph style={{ color: "rgba(0,0,0,0.70)", fontSize: 16, marginBottom: 24 }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR')} | KVKK uyumlu
        </Paragraph>

        <Alert
          message="Minimum Veri Prensibi"
          description="EDER olarak sadece hizmet sunumu için gerekli olan minimum veriyi topluyoruz ve saklıyoruz."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider />

        <Title level={3}>
          <Database size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Topladığımız Veriler
        </Title>
        
        <div style={{ marginBottom: 24 }}>
          <Text strong>Hesap Bilgileri:</Text>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}>
            • E-posta adresi (giriş ve iletişim için)<br/>
            • Şifre (şifrelenmiş olarak saklanır)<br/>
            • Hesap oluşturma tarihi
          </Paragraph>

          <Text strong>Araç Bilgileri:</Text>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}>
            • Marka, model, yıl bilgileri<br/>
            • Kilometre, yakıt türü gibi teknik özellikler<br/>
            • Değerleme geçmişi (sadece sizin erişebileceğiniz)
          </Paragraph>

          <Text strong>Teknik Veriler:</Text>
          <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 24 }}>
            • IP adresi (güvenlik amaçlı)<br/>
            • Tarayıcı bilgileri<br/>
            • Kullanım istatistikleri (anonim)
          </Paragraph>
        </div>

        <Title level={3}>
          <Eye size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Verilerin Kullanım Amacı
        </Title>
        <Paragraph>
          • <Text strong>Hizmet Sunumu:</Text> Araç değerleme hizmeti sağlamak<br/>
          • <Text strong>Hesap Yönetimi:</Text> Giriş, güvenlik ve destek<br/>
          • <Text strong>İyileştirme:</Text> Hizmet kalitesini artırmak<br/>
          • <Text strong>İletişim:</Text> Önemli güncellemeler ve destek
        </Paragraph>

        <Title level={3}>
          <Lock size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Veri Güvenliği
        </Title>
        <Paragraph>
          • Tüm veriler şifrelenmiş olarak saklanır<br/>
          • SSL/TLS ile güvenli veri aktarımı<br/>
          • Düzenli güvenlik güncellemeleri<br/>
          • Yetkisiz erişime karşı koruma<br/>
          • Veri yedekleme ve kurtarma sistemleri
        </Paragraph>

        <Title level={3}>
          <Calendar size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Veri Saklama Süresi
        </Title>
        <Paragraph>
          • <Text strong>Hesap Bilgileri:</Text> Hesap aktif olduğu sürece<br/>
          • <Text strong>Değerleme Geçmişi:</Text> 2 yıl (yasal gereklilik)<br/>
          • <Text strong>Log Kayıtları:</Text> 6 ay (güvenlik amaçlı)<br/>
          • <Text strong>Pazarlama İzinleri:</Text> İzin geri alınana kadar
        </Paragraph>

        <Title level={3}>KVKK Hakları</Title>
        <Paragraph>
          6698 sayılı KVKK kapsamında sahip olduğunuz haklar:
        </Paragraph>
        <Paragraph style={{ color: "rgba(0,0,0,0.70)", marginLeft: 16 }}>
          • Kişisel verilerinizin işlenip işlenmediğini öğrenme<br/>
          • İşlenen verileriniz hakkında bilgi talep etme<br/>
          • İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme<br/>
          • Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme<br/>
          • Eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme<br/>
          • Kanunda öngörülen şartlar çerçevesinde silinmesini isteme
        </Paragraph>

        <Title level={3}>Çerezler (Cookies)</Title>
        <Paragraph>
          • <Text strong>Zorunlu Çerezler:</Text> Sitenin çalışması için gerekli<br/>
          • <Text strong>Analitik Çerezler:</Text> Kullanım istatistikleri (anonim)<br/>
          • <Text strong>Tercih Çerezler:</Text> Dil, tema gibi ayarlar<br/>
          • Çerez ayarlarınızı tarayıcınızdan yönetebilirsiniz
        </Paragraph>

        <Title level={3}>Üçüncü Taraf Hizmetler</Title>
        <Paragraph>
          • <Text strong>Ödeme İşlemleri:</Text> Güvenli ödeme sağlayıcıları<br/>
          • <Text strong>E-posta Servisi:</Text> Sistem e-postaları için<br/>
          • <Text strong>Analitik:</Text> Anonim kullanım verileri<br/>
          • Bu hizmetler kendi gizlilik politikalarına tabidir
        </Paragraph>

        <Divider />

        <Alert
          message="Veri Talepleriniz"
          description={
            <div>
              KVKK haklarınızı kullanmak için{" "}
              <Text strong style={{ color: "#FF7A18" }}>kvkk@ederapp.com</Text>{" "}
              adresine yazabilir veya hesap ayarlarından veri dışa aktarma işlemini yapabilirsiniz.
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Text style={{ color: "rgba(0,0,0,0.60)" }}>
            Sorularınız için:{" "}
            <Text strong style={{ color: "#FF7A18" }}>
              <Mail size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              gizlilik@ederapp.com
            </Text>
          </Text>
        </div>
      </Card>
    </div>
  );
}
