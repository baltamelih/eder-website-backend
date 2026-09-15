import {
  TrustList,
  TrustNote,
  TrustPageShell,
  TrustSection,
} from "../components/TrustPageShell";

export default function CookiePolicy() {
  return (
    <TrustPageShell
      eyebrow="ÇEREZLER"
      title="Çerezleri ve benzer teknolojileri işlevlerine göre açıklıyoruz."
      lead="EDER; oturum, güvenlik, tercihlerin korunması, ölçüm ve reklam hizmetleri için çerezler veya benzer tarayıcı depolama yöntemlerinden yararlanabilir."
    >
      <TrustSection number="01" title="Zorunlu işlevler">
        <p>
          Oturum açma, güvenlik, kötüye kullanımın önlenmesi ve temel sayfa
          davranışları için teknik tanımlayıcılar veya yerel depolama
          kullanılabilir. Bunların bir kısmı hizmetin çalışması için gereklidir.
        </p>
      </TrustSection>

      <TrustSection number="02" title="Güvenlik ve kimlik doğrulama">
        <p>
          Güvenli doğrulama gibi güvenlik hizmetleri otomatik kötüye kullanımı
          ayırt etmek için teknik sinyaller işleyebilir. Google ile giriş
          seçeneğini kullandığınızda Google Identity Services kendi teknik
          verilerini ve depolama mekanizmalarını kullanabilir.
        </p>
      </TrustSection>

      <TrustSection number="03" title="Reklam ve ölçüm">
        <p>
          EDER, Google AdSense kullanabilir. Reklam teknolojileri; reklam
          sunumu, frekans kontrolü, performans ölçümü ve sahtekârlığın önlenmesi
          için çerezlerden veya benzer teknolojilerden yararlanabilir.
        </p>
        <TrustNote title="Kişiselleştirme">
          Kişiselleştirilmiş reklamların kullanılabildiği durumlarda ilgili
          sağlayıcıların izin ve tercih mekanizmaları uygulanabilir. Tarayıcı,
          Google hesabı ve mevcutsa site üzerindeki tercih kontrolleri ayrıca
          kullanılabilir.
        </TrustNote>
      </TrustSection>

      <TrustSection number="04" title="Tarayıcı kontrolleri">
        <TrustList
          items={[
            "Tarayıcınızdan çerezleri görüntüleyebilir, silebilir veya engelleyebilirsiniz.",
            "Çerezlerin tamamını engellemek bazı oturum ve güvenlik işlevlerinin beklenen şekilde çalışmamasına neden olabilir.",
            "Reklam tercihleri için reklam sağlayıcısının sunduğu hesap ve tercih kontrollerini kullanabilirsiniz.",
          ]}
        />
      </TrustSection>

      <TrustSection number="05" title="Güncellemeler">
        <p>
          Kullanılan hizmetler değişirse bu politika da güncellenebilir. Güncel
          sürüm bu canonical sayfada yayımlanır.
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
