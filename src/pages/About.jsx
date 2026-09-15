import {
  TrustList,
  TrustNote,
  TrustPageShell,
  TrustSection,
} from "../components/TrustPageShell";

export default function About() {
  return (
    <TrustPageShell
      eyebrow="HAKKIMIZDA"
      title="Araç değerlemede daha anlaşılır bir başlangıç noktası."
      lead="EDER, ikinci el araç değerini tek bir kesin rakama indirgemek yerine araç özellikleri ve piyasa verileri üzerinden tahmini bir değer aralığı sunar."
      asideTitle="Ürün ilkeleri"
      asideText="Açıklık, veri minimizasyonu, ölçülü iddia ve doğrulanabilir kullanıcı geri bildirimi."
    >
      <TrustSection number="01" title="Ne yapıyoruz?">
        <p>
          Kullanıcının verdiği araç bilgilerini mevcut piyasa verileriyle
          birlikte değerlendirerek karar desteği sağlayan bir değerleme deneyimi
          geliştiriyoruz.
        </p>
      </TrustSection>

      <TrustSection number="02" title="Ne yapmıyoruz?">
        <TrustList
          items={[
            "Tahmini sonucu kesin satış garantisi gibi sunmuyoruz.",
            "Yeterli doğrulanmış örnek olmadan başarı yüzdesi veya doğruluk oranı yayımlamıyoruz.",
            "Kullanıcı yorumu, satış sayısı veya sosyal kanıt uydurmuyoruz.",
            "Bireysel satış kayıtlarını kamuya açık piyasa metriği olarak göstermiyoruz.",
          ]}
        />
      </TrustSection>

      <TrustSection number="03" title="Doğrulanmış veri yaklaşımı">
        <p>
          Kullanıcının bildirdiği satış bilgisi doğrudan doğrulanmış kabul
          edilmez. İnceleme süreci tamamlanan kayıtlar, yeterli örnek oluştuğunda
          gizliliği koruyan toplulaştırılmış içgörülere katkı sağlayabilir.
        </p>
        <TrustNote title="Örnek eşiği">
          Doğrulanmış veri henüz yeterli değilse yüzde veya hata metriği
          yayımlamak yerine verinin oluşmakta olduğunu açıkça belirtiriz.
        </TrustNote>
      </TrustSection>

      <TrustSection number="04" title="İletişim">
        <p>
          Ürün geri bildirimi, iş birliği veya destek için
          <strong> destek@ederapp.com</strong> adresinden bize ulaşabilirsiniz.
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
