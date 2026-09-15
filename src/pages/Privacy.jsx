import {
  TrustLinks,
  TrustList,
  TrustNote,
  TrustPageShell,
  TrustSection,
} from "../components/TrustPageShell";

export default function Privacy() {
  return (
    <TrustPageShell
      eyebrow="GİZLİLİK"
      title="Verinizin nerede ve neden kullanıldığını açıkça anlatıyoruz."
      lead="Bu politika, EDER'i kullanırken işlenebilen veri kategorilerini, kullanım amaçlarını ve tercihlerinizi anlaşılır bir çerçevede açıklar."
    >
      <TrustSection number="01" title="İşlenebilen veri kategorileri">
        <TrustList
          items={[
            "Hesap oluşturduğunuzda e-posta adresi ve kimlik doğrulama için gerekli hesap kayıtları.",
            "Değerleme için verdiğiniz marka, model, yıl, kilometre, kondisyon ve benzeri araç bilgileri.",
            "Hesabınıza kaydettiğiniz araçlar, değerleme geçmişi, fiyat beklentisi ve kullanmayı seçerseniz satış geri bildirimi.",
            "Güvenlik, kötüye kullanımın önlenmesi ve hata incelemesi için IP adresi, tarayıcı/cihaz bilgisi ve teknik günlük kayıtları.",
            "Bize e-posta gönderdiğinizde mesaj içeriği ve sizin iletmeyi seçtiğiniz iletişim bilgileri.",
          ]}
        />
      </TrustSection>

      <TrustSection number="02" title="Neden kullanıyoruz?">
        <TrustList
          items={[
            "Araç değerleme sonucunu üretmek ve hesabınızla ilişkilendirdiğiniz geçmişi göstermek.",
            "Oturum açma, hesap güvenliği, parola sıfırlama ve destek taleplerini yürütmek.",
            "Hizmeti kötüye kullanımdan korumak, hız limitlerini uygulamak ve teknik sorunları incelemek.",
            "Doğrulanmış satış geri bildirimlerinden yalnız toplulaştırılmış ve gizliliği koruyan piyasa içgörüleri üretmek.",
            "Yasal yükümlülükleri yerine getirmek ve hizmetin güvenilirliğini geliştirmek.",
          ]}
        />
      </TrustSection>

      <TrustSection number="03" title="Hizmet sağlayıcılar">
        <p>
          EDER'in bazı işlevleri üçüncü taraf altyapılarından yararlanır. Bunlar,
          aktif özelliğe göre Google Identity Services, Cloudflare Turnstile,
          Google AdSense, Firebase Hosting, Render ve içerik altyapısı gibi
          hizmetleri kapsayabilir.
        </p>
        <p>
          Bu sağlayıcılar kendi koşulları ve gizlilik dokümanları çerçevesinde
          veri işleyebilir. EDER, hizmet için gerekli olmayan kişisel veriyi
          paylaşmayı amaçlamaz.
        </p>
      </TrustSection>

      <TrustSection number="04" title="Saklama ve güvenlik">
        <p>
          Veriler, hizmetin yürütülmesi, hesap güvenliği, uyuşmazlıkların
          yönetimi ve uygulanabilir hukuki yükümlülükler için gerekli olduğu
          süre boyunca saklanabilir. Her veri türü için tek ve sabit bir saklama
          süresi taahhüt etmiyoruz.
        </p>
        <TrustNote title="Güvenlik yaklaşımı">
          Erişim kontrolü, güvenli bağlantı, kimlik doğrulama ve kötüye kullanım
          önleme katmanları kullanılır. Hiçbir çevrim içi sistem için mutlak
          güvenlik garantisi verilemez.
        </TrustNote>
      </TrustSection>

      <TrustSection number="05" title="Reklamlar, çerezler ve tercihler">
        <p>
          AdSense ve benzeri teknolojiler reklam sunumu, ölçüm ve sahtekârlığın
          önlenmesi için çerez veya benzer depolama yöntemlerinden
          yararlanabilir. Ayrıntılar için Çerez Politikası'nı inceleyebilirsiniz.
        </p>
      </TrustSection>

      <TrustSection number="06" title="Haklarınız ve iletişim">
        <p>
          Kişisel verilerinizle ilgili erişim, düzeltme, silme veya diğer
          talepleriniz için kimliğinizi doğrulayabileceğimiz bir süreç
          gerekebilir. KVKK kapsamındaki ayrıntılar ayrıca yayımlanan Aydınlatma
          Metni'nde yer alır.
        </p>
        <TrustLinks />
      </TrustSection>
    </TrustPageShell>
  );
}
