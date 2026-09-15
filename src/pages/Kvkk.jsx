import {
  TrustLinks,
  TrustList,
  TrustNote,
  TrustPageShell,
  TrustSection,
} from "../components/TrustPageShell";

export default function Kvkk() {
  return (
    <TrustPageShell
      eyebrow="KVKK"
      title="Kişisel verileriniz için sade bir aydınlatma çerçevesi."
      lead="Bu metin, ederapp.com üzerinden sunulan EDER hizmetinde kişisel verilerin hangi amaçlarla işlenebileceğini 6698 sayılı Kişisel Verilerin Korunması Kanunu çerçevesinde özetler."
    >
      <TrustSection number="01" title="Veri sorumlusu iletişimi">
        <p>
          Bu metinde EDER, ederapp.com üzerinden sunulan araç değerleme
          hizmetini ifade eder. Veri koruma ve hak kullanımı talepleri için
          iletişim kanalı:
        </p>
        <p>
          <strong>destek@ederapp.com</strong>
        </p>
        <TrustNote title="Kimlik doğrulama">
          Kişisel veri talebinin doğru kişiye ait olduğunu doğrulamak için
          talebin niteliğine uygun ek bilgi istenebilir.
        </TrustNote>
      </TrustSection>

      <TrustSection number="02" title="Kişisel veri kategorileri">
        <TrustList
          items={[
            "Kimlik ve iletişim niteliğindeki hesap verileri: özellikle e-posta adresi ve hesap tanımlayıcıları.",
            "Müşteri işlem verileri: değerleme kayıtları, kaydedilen araçlar, fiyat beklentisi ve kullanıcının seçmesi halinde satış geri bildirimi.",
            "İşlem güvenliği verileri: IP adresi, oturum ve güvenlik olayları, kötüye kullanım ve hata inceleme kayıtları.",
            "Talep/şikâyet verileri: destek veya iletişim sırasında kullanıcı tarafından iletilen içerik.",
          ]}
        />
      </TrustSection>

      <TrustSection number="03" title="İşleme amaçları ve hukuki sebepler">
        <p>
          Veriler; hizmetin kurulması ve sunulması, hesap ve bilgi güvenliğinin
          sağlanması, kullanıcı taleplerinin karşılanması, kötüye kullanımın
          önlenmesi, hukuki yükümlülüklerin yerine getirilmesi ve hizmetin
          geliştirilmesi amaçlarıyla işlenebilir.
        </p>
        <p>
          Uygulanacak KVKK işleme şartı faaliyete göre değişebilir; sözleşmenin
          kurulması/ifası, hukuki yükümlülük, bir hakkın tesisi veya kullanılması,
          meşru menfaat ve gerektiği durumlarda açık rıza gibi kanuni sebepler
          gündeme gelebilir.
        </p>
      </TrustSection>

      <TrustSection number="04" title="Aktarım">
        <p>
          Hizmetin teknik olarak çalışması için barındırma, kimlik doğrulama,
          güvenlik, içerik ve reklam altyapısı sağlayıcılarından yararlanılabilir.
          Aktarımın kapsamı, kullanılan özelliğin gerektirdiği veriyle
          sınırlandırılmaya çalışılır.
        </p>
      </TrustSection>

      <TrustSection number="05" title="KVKK m.11 kapsamındaki haklar">
        <TrustList
          items={[
            "Kişisel verinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme.",
            "İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.",
            "Aktarım yapılan üçüncü kişileri öğrenme.",
            "Eksik veya yanlış işlenen verilerin düzeltilmesini isteme.",
            "Kanuni şartlar oluştuğunda silme veya yok etme talebinde bulunma.",
            "Kanunda öngörülen diğer hakları kullanma.",
          ]}
        />
      </TrustSection>

      <TrustSection number="06" title="Başvuru">
        <p>
          Talebinizin konusu, ilgili hesap e-postası ve talebinizi açıklayan
          bilgileri <strong>destek@ederapp.com</strong> adresine iletebilirsiniz.
          Resmî başvuru yönteminin gerektirdiği ek kimlik doğrulama veya usul
          adımları varsa size bildirilebilir.
        </p>
        <TrustNote title="Hukuki metinlerin kapsamı" tone="accent">
          Bu sayfa ürünün mevcut veri akışlarını anlaşılır biçimde açıklar;
          yürürlükteki mevzuat ve somut işletme yapısı bakımından nihai hukuki
          değerlendirme profesyonel danışmanlıkla yapılmalıdır.
        </TrustNote>
        <TrustLinks />
      </TrustSection>
    </TrustPageShell>
  );
}
