import { useMemo, useState } from "react";
import { Input } from "antd";
import { Link } from "react-router-dom";
import { TrustPageShell } from "../components/TrustPageShell";

const FAQ = [
  {
    category: "Değerleme",
    q: "EDER sonucu kesin satış fiyatı mıdır?",
    a: "Hayır. EDER bir tahmini piyasa değer aralığı sunar. Gerçek satış fiyatı aracın fiziksel durumu, bölgesel piyasa, ilan koşulları, bakım/hasar geçmişi ve pazarlığa göre farklılaşabilir.",
  },
  {
    category: "Değerleme",
    q: "Sonuç neden başka bir ilandaki fiyattan farklı olabilir?",
    a: "İlan fiyatı, gerçekleşmiş satış fiyatı değildir. Ayrıca kilometre, donanım, kondisyon, bölge ve zaman gibi değişkenler araçlar arasında önemli fark yaratabilir.",
  },
  {
    category: "Değerleme",
    q: "Boya, değişen parça ve hasar bilgisi önemli mi?",
    a: "Evet. Kondisyon bilgileri değerlemeyi etkileyebilir. Mümkün olduğunca doğru bilgi girmek, tahmini aralığın daha anlamlı olmasına yardımcı olur.",
  },
  {
    category: "Hesap",
    q: "Hesap açmak zorunlu mu?",
    a: "Bazı genel değerleme akışları hesap olmadan kullanılabilir; kayıtlı araçlar, geçmiş ve geri bildirim gibi kişisel özellikler hesap gerektirebilir.",
  },
  {
    category: "Hesap",
    q: "Google ile giriş yapabilir miyim?",
    a: "Google ile giriş seçeneği arayüzde etkinse Google Identity Services üzerinden oturum açabilirsiniz. E-posta/şifre girişi de desteklenir.",
  },
  {
    category: "Geri bildirim",
    q: "Aracımı sattığımda satış fiyatını paylaşmak zorunda mıyım?",
    a: "Hayır. Fiyat beklentisi ve satış geri bildirimi isteğe bağlıdır. Gerçek satış bildirimi, doğrulanmadan önce bekleyen durumda tutulabilir.",
  },
  {
    category: "Geri bildirim",
    q: "Doğrulanmış piyasa istatistikleri nasıl oluşuyor?",
    a: "Kamuya açık istatistikler yalnız doğrulanmış satış geri bildirimlerinden ve yeterli örnek oluştuğunda toplulaştırılmış biçimde üretilir. Bireysel satış kaydı yayımlanmaz.",
  },
  {
    category: "Gizlilik",
    q: "Hangi kişisel veriler işlenebilir?",
    a: "Hesap bilgileri, değerleme girdileri, kaydettiğiniz araçlar, güvenlik/teknik kayıtlar ve bize ilettiğiniz destek içerikleri özelliğe göre işlenebilir. Ayrıntılar Gizlilik Politikası ve KVKK Aydınlatma Metni'nde yer alır.",
  },
  {
    category: "Gizlilik",
    q: "Reklam ve çerez kullanılıyor mu?",
    a: "EDER Google AdSense kullanabilir. Reklam, güvenlik ve oturum teknolojileri çerez veya benzer tarayıcı depolama mekanizmalarından yararlanabilir. Ayrıntılar Çerez Politikası'nda açıklanır.",
  },
  {
    category: "Destek",
    q: "Teknik sorun yaşarsam ne yapmalıyım?",
    a: "Sorunun adımlarını, kullandığınız cihaz/tarayıcıyı ve gördüğünüz hata mesajını destek@ederapp.com adresine iletebilir veya İletişim sayfasındaki e-posta taslağını kullanabilirsiniz.",
  },
];

function normalize(value) {
  return (value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export default function Faq() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return FAQ;
    return FAQ.filter((item) =>
      normalize(`${item.category} ${item.q} ${item.a}`).includes(q)
    );
  }, [query]);

  return (
    <TrustPageShell
      eyebrow="S.S.S."
      title="Kısa cevaplar. Gereksiz kesinlik yok."
      lead="Değerleme, hesap, gizlilik ve doğrulanmış satış geri bildirimi hakkında en sık sorulan soruları tek yerde topladık."
      asideTitle="Aradığınız yok mu?"
      asideText="Destek merkezine geçebilir veya bize e-posta gönderebilirsiniz."
    >
      <div className="faq-search">
        <Input
          size="large"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Soru ara…"
          allowClear
        />
        <span>{filtered.length} sonuç</span>
      </div>

      <div className="faq-list">
        {filtered.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>
              <span>{item.category}</span>
              {item.q}
            </summary>
            <p>{item.a}</p>
          </details>
        ))}

        {filtered.length === 0 && (
          <div className="faq-empty">
            <strong>Sonuç bulunamadı.</strong>
            <p>
              <Link to="/destek">Destek merkezine</Link> geçebilir veya{" "}
              <a href="mailto:destek@ederapp.com">destek@ederapp.com</a>{" "}
              adresine yazabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </TrustPageShell>
  );
}
