import {
  TrustLinks,
  TrustList,
  TrustNote,
  TrustPageShell,
  TrustSection,
} from "../components/TrustPageShell";

export default function Terms() {
  return (
    <TrustPageShell
      eyebrow="KULLANIM KOŞULLARI"
      title="Değerleme bir karar desteğidir; kesin satış fiyatı değildir."
      lead="EDER'i kullanarak aşağıdaki hizmet kapsamını, kullanım kurallarını ve tahmini değerleme sonuçlarının sınırlarını kabul etmiş olursunuz."
    >
      <TrustSection number="01" title="Hizmetin kapsamı">
        <p>
          EDER, kullanıcı tarafından verilen araç bilgilerini ve mevcut piyasa
          verilerini birlikte değerlendirerek tahmini bir piyasa değer aralığı
          sunar.
        </p>
        <TrustNote title="Ekspertiz değildir" tone="accent">
          Sonuç; fiziksel ekspertiz, noter kaydı, satın alma taahhüdü, kredi
          kararı veya kesin satış fiyatı yerine geçmez.
        </TrustNote>
      </TrustSection>

      <TrustSection number="02" title="Kullanıcı sorumluluğu">
        <TrustList
          items={[
            "Değerleme sırasında doğru ve güncel bilgi vermek.",
            "Başkasına ait hesaba yetkisiz erişmemek ve hesabın güvenliğini korumak.",
            "Hizmeti otomatik, aşırı veya güvenlik önlemlerini aşmaya yönelik biçimde kullanmamak.",
            "Sonuçları araç alım-satım kararının tek dayanağı olarak değerlendirmemek.",
          ]}
        />
      </TrustSection>

      <TrustSection number="03" title="Sonuçların değişebilmesi">
        <p>
          Bölgesel arz-talep, aracın gerçek fiziksel durumu, bakım ve hasar
          geçmişi, donanım, kilometre, ilan koşulları ve pazarlık gibi etkenler
          gerçekleşen satış fiyatını değiştirebilir.
        </p>
      </TrustSection>

      <TrustSection number="04" title="Hesaplar ve erişim">
        <p>
          Bazı özellikler hesap gerektirebilir. Güvenlik, kapasite ve adil
          kullanım amacıyla istek sınırları uygulanabilir. Özelliklerin ücretsiz
          veya ücretli niteliği değişirse ilgili arayüzde işlem öncesinde açıkça
          gösterilir.
        </p>
      </TrustSection>

      <TrustSection number="05" title="Geri bildirim ve doğrulama">
        <p>
          Kullanıcılar isterlerse fiyat beklentisi veya gerçek satış bilgisi
          paylaşabilir. Satış bildirimi doğrudan “doğrulanmış” kabul edilmez;
          doğrulama sürecinden geçebilir. Kamuya açık piyasa içgörüleri bireysel
          kayıtları yayımlamak yerine toplulaştırılmış veriyi kullanır.
        </p>
      </TrustSection>

      <TrustSection number="06" title="Hizmet sürekliliği">
        <p>
          Bakım, güvenlik, üçüncü taraf servis kesintileri veya teknik sebeplerle
          hizmet geçici olarak erişilemez olabilir. Kesintisiz erişim garantisi
          verilmez.
        </p>
      </TrustSection>

      <TrustSection number="07" title="İletişim ve güncellemeler">
        <p>
          Bu koşullar ürün ve mevzuat geliştikçe güncellenebilir. Güncel sürüm
          bu sayfada yayımlanır.
        </p>
        <TrustLinks />
      </TrustSection>
    </TrustPageShell>
  );
}
