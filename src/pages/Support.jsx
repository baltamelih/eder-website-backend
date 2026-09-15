import { Link } from "react-router-dom";
import {
  TrustLinks,
  TrustNote,
  TrustPageShell,
  TrustSection,
} from "../components/TrustPageShell";

const SUPPORT_TOPICS = [
  {
    title: "Değerleme",
    text: "Sonuç alamama, araç seçimi, kondisyon bilgisi veya sonuç ekranıyla ilgili sorunlar.",
    link: "/arac-degerleme",
    label: "Değerlemeye git",
  },
  {
    title: "Hesap & giriş",
    text: "E-posta/şifre, Google ile giriş, parola sıfırlama ve hesap ayarları.",
    link: "/login",
    label: "Giriş sayfası",
  },
  {
    title: "Veri & gizlilik",
    text: "Kişisel veri, KVKK, çerez tercihleri veya hesap verileriyle ilgili talepler.",
    link: "/gizlilik-politikasi",
    label: "Gizlilik merkezi",
  },
  {
    title: "Teknik sorun",
    text: "Beklenmeyen hata, sayfa yükleme problemi veya tekrarlanabilir bir teknik problem.",
    link: "/iletisim",
    label: "Bize yazın",
  },
];

export default function Support() {
  return (
    <TrustPageShell
      eyebrow="DESTEK MERKEZİ"
      title="Sorunu tanımlayın. Doğru kanala hızlıca ulaşın."
      lead="EDER destek merkezi; değerleme, hesap, veri talepleri ve teknik sorunlar için sade bir başlangıç noktasıdır."
      asideTitle="E-posta desteği"
      asideText="Talebinizi doğrudan destek@ederapp.com adresine iletebilirsiniz. Yanıt süresi talebin kapsamına ve inceleme ihtiyacına göre değişir."
    >
      <TrustSection number="01" title="Destek konuları">
        <div className="support-topic-grid">
          {SUPPORT_TOPICS.map((topic) => (
            <Link className="support-topic" to={topic.link} key={topic.title}>
              <strong>{topic.title}</strong>
              <span>{topic.text}</span>
              <small>{topic.label} →</small>
            </Link>
          ))}
        </div>
      </TrustSection>

      <TrustSection number="02" title="Talebe ne eklemelisiniz?">
        <p>
          Teknik bir sorun için kullandığınız cihaz/tarayıcı, yaptığınız işlem,
          gördüğünüz hata mesajı ve mümkünse ekran görüntüsü çözümü
          hızlandırabilir. Şifre, erişim anahtarı veya ödeme bilgisi gibi gizli
          verileri e-posta ile göndermeyin.
        </p>
        <TrustNote title="Gizli bilgi göndermeyin">
          EDER destek ekibi sizden şifrenizi istememelidir. Hesap doğrulaması
          gerekiyorsa güvenli doğrulama adımları kullanılmalıdır.
        </TrustNote>
      </TrustSection>

      <TrustSection number="03" title="Hesap ve veri talepleri">
        <p>
          Hesap silme veya kişisel veri taleplerinde hesabın size ait olduğunu
          doğrulamak için ek adımlar gerekebilir.
        </p>
        <TrustLinks />
      </TrustSection>
    </TrustPageShell>
  );
}
