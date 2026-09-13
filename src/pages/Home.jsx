import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import { MetaTags } from "../components/MetaTags";
import "./Home.css";

const HOME_AD_SLOT = import.meta.env.VITE_ADS_SLOT_HOME;
const ease = [0.22, 1, 0.36, 1];

const journey = [
  {
    step: "01",
    eyebrow: "ARACI TANIMLA",
    title: "Doğru araçla başla.",
    text:
      "Marka, model, yıl, versiyon ve kilometre bilgisini zincir halinde seç. EDER, yanlış sınıfa değil aracın gerçek kombinasyonuna yaklaşsın.",
    points: ["Marka + model", "Model yılı", "Versiyon", "Kilometre"],
  },
  {
    step: "02",
    eyebrow: "KONDİSYONU ANLAT",
    title: "Kondisyonu soyut bırakma.",
    text:
      "Boya, değişen ve ağır hasar bilgisini parça bazında işaretle. Temiz araçla işlem görmüş araç aynı sonuç yüzeyine düşmesin.",
    points: ["Parça bazlı boya", "Değişen", "Ağır hasar", "Görsel harita"],
  },
  {
    step: "03",
    eyebrow: "PİYASAYI OKU",
    title: "Tek rakama değil, konuma bak.",
    text:
      "Sonucu kesin satış fiyatı gibi sunmak yerine alt, orta ve üst bantla birlikte göster. Böylece karar verirken bağlamı kaybetme.",
    points: ["Alt bant", "Orta nokta", "Üst bant", "Araç özeti"],
  },
];

function VehicleIdentityScene() {
  return (
    <div className="journey-stage journey-stage--identity">
      <div className="journey-stage__eyebrow">EDER / VEHICLE IDENTITY</div>

      <div className="identity-grid">
        <div>
          <span>01</span>
          <small>MARKA</small>
          <strong>Seçildi</strong>
        </div>
        <div>
          <span>02</span>
          <small>MODEL</small>
          <strong>Seçildi</strong>
        </div>
        <div>
          <span>03</span>
          <small>YIL</small>
          <strong>Seçildi</strong>
        </div>
        <div>
          <span>04</span>
          <small>VERSİYON</small>
          <strong>Seçildi</strong>
        </div>
      </div>

      <div className="identity-car" aria-hidden>
        <svg viewBox="0 0 760 300">
          <path
            d="M80 205 C134 198 168 164 220 118 C248 93 282 82 333 81 L464 81 C512 83 551 98 588 133 L626 171 L678 188 C698 195 710 207 710 224 L710 232 L650 232 C644 199 618 177 585 177 C551 177 524 199 518 232 L288 232 C282 199 255 177 221 177 C188 177 161 199 155 232 L69 232 L69 218 C69 211 73 207 80 205 Z"
            fill="none"
            stroke="#ff6b33"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M228 118 L316 137 L533 137 C511 106 482 90 446 86 L340 86 C299 87 261 96 228 118 Z"
            fill="rgba(255,107,51,0.09)"
            stroke="rgba(255,107,51,0.34)"
            strokeWidth="1.5"
          />
          <circle cx="221" cy="232" r="33" fill="#0f1114" stroke="#59606a" strokeWidth="6" />
          <circle cx="585" cy="232" r="33" fill="#0f1114" stroke="#59606a" strokeWidth="6" />
          <circle cx="221" cy="232" r="9" fill="#e8e4dc" />
          <circle cx="585" cy="232" r="9" fill="#e8e4dc" />
        </svg>
      </div>

      <div className="identity-footer">
        <span>Doğru kombinasyon</span>
        <i />
        <span>Değerleme girdisi</span>
      </div>
    </div>
  );
}

function ConditionScene() {
  const markers = [
    { x: "31%", y: "37%", label: "Kaput" },
    { x: "55%", y: "31%", label: "Tavan" },
    { x: "68%", y: "49%", label: "Arka çamurluk" },
    { x: "42%", y: "61%", label: "Ön kapı" },
  ];

  return (
    <div className="journey-stage journey-stage--condition">
      <div className="journey-stage__eyebrow">EDER / CONDITION MAP</div>

      <div className="condition-board">
        <svg className="condition-car" viewBox="0 0 720 360" aria-label="Araç kondisyon haritası">
          <path
            d="M112 197 C157 189 193 161 237 122 C266 96 304 84 355 84 L442 84 C487 85 525 98 561 127 L599 158 L650 174 C675 182 691 200 691 219 L691 239 L631 239 C624 204 597 182 563 182 C527 182 499 206 494 239 L286 239 C280 204 253 182 218 182 C183 182 155 205 149 239 L91 239 L91 218 C91 207 98 201 112 197 Z"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.62)"
            strokeWidth="2.4"
          />
          <path
            d="M245 122 L329 140 L520 140 C498 111 471 96 437 92 L354 92 C312 93 276 102 245 122 Z"
            fill="rgba(255,90,31,0.05)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
          />
          <circle cx="218" cy="239" r="34" fill="#0b0c0e" stroke="#545b64" strokeWidth="6" />
          <circle cx="563" cy="239" r="34" fill="#0b0c0e" stroke="#545b64" strokeWidth="6" />
          <circle cx="218" cy="239" r="9" fill="#f2eee7" />
          <circle cx="563" cy="239" r="9" fill="#f2eee7" />
        </svg>

        {markers.map((marker, index) => (
          <div
            key={marker.label}
            className={`condition-marker condition-marker--${index + 1}`}
            style={{ left: marker.x, top: marker.y }}
          >
            <i />
            <span>{marker.label}</span>
          </div>
        ))}
      </div>

      <div className="condition-legend">
        <div><i className="is-clean" /><span>Orijinal</span></div>
        <div><i className="is-painted" /><span>Boyalı</span></div>
        <div><i className="is-changed" /><span>Değişen</span></div>
      </div>
    </div>
  );
}

function MarketScene({ reducedMotion }) {
  return (
    <div className="journey-stage journey-stage--market">
      <div className="journey-stage__eyebrow">EDER / MARKET POSITION</div>

      <div className="market-readout">
        <span>Tahmini piyasa aralığı</span>
        <strong>Karar için bağlam</strong>
      </div>

      <div className="market-scale">
        <div className="market-scale__labels">
          <span>ALT</span>
          <span>ORTA</span>
          <span>ÜST</span>
        </div>

        <div className="market-scale__track">
          <div className="market-scale__range" />
          <motion.div
            className="market-scale__marker"
            initial={reducedMotion ? false : { left: "22%" }}
            whileInView={reducedMotion ? undefined : { left: "63%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease }}
          >
            <span>EDER</span>
          </motion.div>
        </div>
      </div>

      <div className="market-curve" aria-hidden>
        <svg viewBox="0 0 900 250" preserveAspectRatio="none">
          <motion.path
            d="M0 187 C90 180 128 151 202 157 C292 166 327 104 417 111 C503 117 548 75 634 80 C722 86 777 47 900 38"
            fill="none"
            stroke="#ff5a1f"
            strokeWidth="4"
            initial={reducedMotion ? false : { pathLength: 0 }}
            whileInView={reducedMotion ? undefined : { pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.25, ease }}
          />
        </svg>
      </div>

      <div className="market-footer">
        <span>Kesin satış fiyatı değildir.</span>
        <span>Kimlik + kondisyon + piyasa bağlamı</span>
      </div>
    </div>
  );
}

function JourneyVisual({ step, reducedMotion }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        className="journey-visual__motion"
        initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -12, scale: 0.99 }}
        transition={{ duration: 0.45, ease }}
      >
        {step === 0 && <VehicleIdentityScene />}
        {step === 1 && <ConditionScene />}
        {step === 2 && <MarketScene reducedMotion={reducedMotion} />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="eder-home">
      <MetaTags
        title="Araç Değerleme"
        description="Aracınızın marka, model, yıl, kilometre, teknik özellik ve kondisyon bilgilerini kullanarak tahmini piyasa değer aralığını öğrenin."
        canonical="https://ederapp.com/"
        ogType="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "EDER",
          url: "https://ederapp.com/",
          applicationCategory: "AutomotiveApplication",
          operatingSystem: "Web",
          description:
            "Araç özellikleri ve piyasa verileriyle tahmini piyasa değer aralığı sunan web uygulaması.",
        }}
      />

      <section className="home-cinema">
        <img
          className="home-cinema__image"
          src="/media/eder/home/hero-studio.jpg"
          alt=""
          fetchPriority="high"
        />
        <div className="home-cinema__shade" />
        <div className="home-cinema__grid" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>

        <div className="eder-home-shell home-cinema__content">
          <motion.div
            className="home-cinema__copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease }}
          >
            <div className="home-cinema__eyebrow">
              <span>EDER</span>
              <i />
              <span>ARAÇ DEĞER İSTİHBARATI</span>
            </div>

            <h1>
              Aracının
              <span>piyasadaki yerini gör.</span>
            </h1>

            <p>
              Araç kimliği, kilometre ve kondisyon bilgisini tek akışta birleştir.
              Sonucu tek rakam yerine tahmini piyasa değer aralığı olarak gör.
            </p>

            <div className="home-cinema__actions">
              <Link to="/valuation" className="home-action home-action--primary">
                Aracın kaç EDER?
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#eder-yolculugu" className="home-action home-action--ghost">
                Deneyimi keşfet
              </a>
            </div>
          </motion.div>

          <motion.aside
            className="home-cinema__hud"
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.72, delay: 0.16, ease }}
          >
            <div>
              <span>OTURUM</span>
              <strong>4 aşama</strong>
            </div>
            <div>
              <span>SONUÇ</span>
              <strong>Değer aralığı</strong>
            </div>
            <div>
              <span>GÜVENLİK</span>
              <strong>Turnstile</strong>
            </div>
          </motion.aside>
        </div>

        <div className="home-cinema__scroll">
          <ChevronDown size={18} aria-hidden />
          <span>Kaydır</span>
        </div>
      </section>

      <section className="home-spec-band" aria-label="EDER değerleme yapısı">
        <div>
          <span>01</span>
          <strong>Araç kimliği</strong>
          <small>Marka · model · yıl · versiyon</small>
        </div>
        <div>
          <span>02</span>
          <strong>Kilometre</strong>
          <small>Kullanım bağlamı</small>
        </div>
        <div>
          <span>03</span>
          <strong>Kondisyon</strong>
          <small>Boya · değişen · hasar</small>
        </div>
        <div>
          <span>04</span>
          <strong>EDER aralığı</strong>
          <small>Alt · orta · üst bant</small>
        </div>
      </section>

      <section className="home-manifesto">
        <div className="eder-home-shell">
          <div className="home-manifesto__eyebrow">EDER / VALUE EXPERIENCE</div>

          <div className="home-manifesto__grid">
            <h2>Değerleme bir form değil, karar vermeye hazırlayan bir akış olmalı.</h2>
            <div>
              <p>
                Bu yüzden EDER ekranları tek tek alanları doldurtmak yerine kullanıcıyı
                aracın kimliğinden kondisyonuna, oradan piyasa bağlamına taşıyan bir
                deneyim olarak kurgulanır.
              </p>

              <div className="home-manifesto__proof">
                <span><ShieldCheck size={15} aria-hidden />Güvenlik doğrulamalı</span>
                <span><Gauge size={15} aria-hidden />Aşamalı ilerleme</span>
                <span><TrendingUp size={15} aria-hidden />Aralık odaklı sonuç</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-journey" id="eder-yolculugu">
        <div className="home-journey__intro">
          <span>DEĞERLEME YOLCULUĞU</span>
          <h2>Kaydırdıkça aracın hikâyesi tamamlanır.</h2>
        </div>

        <div className="home-journey__grid">
          <div className="home-journey__steps">
            {journey.map((item, index) => (
              <motion.article
                key={item.step}
                className={`journey-step ${activeStep === index ? "is-active" : ""}`}
                onViewportEnter={() => setActiveStep(index)}
                viewport={{ amount: 0.55 }}
              >
                <div className="journey-step__meta">
                  <span>{item.step}</span>
                  <i />
                  <small>{item.eyebrow}</small>
                </div>

                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <div className="journey-step__points">
                  {item.points.map((point) => (
                    <span key={point}>
                      <Check size={14} aria-hidden />
                      {point}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>

          <div className="home-journey__visual">
            <div className="home-journey__sticky">
              <JourneyVisual step={activeStep} reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </section>

      <section className="home-market-cinema">
        <img
          className="home-market-cinema__image"
          src="/media/eder/home/night-road.jpg"
          alt=""
          loading="lazy"
        />
        <div className="home-market-cinema__shade" />

        <div className="home-market-cinema__content">
          <div>
            <span className="home-section-kicker">PİYASA HAREKETLİDİR</span>
            <h2>EDER sonucu etiket değil, karar ekranıdır.</h2>
          </div>

          <div className="home-market-cinema__instrument">
            <div className="market-cinema__head">
              <span>MARKET POSITION</span>
              <strong>EDER</strong>
            </div>

            <div className="market-cinema__bands">
              <span>ALT</span>
              <i />
              <span>ORTA</span>
              <i />
              <span>ÜST</span>
            </div>

            <div className="market-cinema__track">
              <i />
              <strong>EDER</strong>
            </div>

            <p>
              Sonuçlar tahminidir; kondisyon ve piyasa koşulları nihai satış fiyatını değiştirebilir.
            </p>
          </div>
        </div>
      </section>

      <section className="home-trust">
        <div className="home-trust__intro">
          <span>ÜRÜN PRENSİPLERİ</span>
          <h2>Gösterişli bir sayıdan daha fazlası.</h2>
        </div>

        <div className="home-trust__grid">
          <article>
            <span>01</span>
            <strong>Doğrulanabilir akış</strong>
            <p>Marka, model, yıl ve versiyon zinciri adım adım ilerler.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Kondisyon görünür</strong>
            <p>Parça bilgisi sonuç ekranına giden yolun gerçek bir parçasıdır.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Tek rakam dayatmaz</strong>
            <p>Karar verirken kullanabileceğin değer aralığını öne çıkarır.</p>
          </article>
          <article>
            <span>04</span>
            <strong>Güvenlik koruması</strong>
            <p>Public valuation akışı Turnstile ile korunur.</p>
          </article>
        </div>
      </section>

      <section className="home-ad" aria-label="Reklam">
        <div className="eder-home-shell">
          <AdSlot enabled slot={HOME_AD_SLOT} style={{ minHeight: 120 }} />
        </div>
      </section>
      <section className="home-proof" aria-labelledby="home-proof-title">
        <div className="home-proof__shell">
          <div className="home-proof__intro">
            <span className="home-proof__kicker">WEB DÜZEYİ GÜVEN</span>
            <h2 id="home-proof-title">Sadece etkileyici değil, ikna eden bir vitrin.</h2>
            <p>
              EDER ana sayfası yalnızca bir tanıtım yüzeyi gibi değil; güven oluşturan,
              nasıl çalıştığını anlatan ve kullanıcıyı doğru sonraki adıma taşıyan
              premium bir ürün vitrini gibi davranmalı.
            </p>
          </div>

          <div className="home-proof__grid">
            <article className="home-proof-card">
              <span>01</span>
              <strong>Net değer akışı</strong>
              <p>Araç kimliği, kilometre, kondisyon ve bağlam tek anlatıda bir araya gelir.</p>
            </article>

            <article className="home-proof-card">
              <span>02</span>
              <strong>Güven inşa eden çerçeve</strong>
              <p>Turnstile koruması, kontrollü akış ve şeffaf dil sayesinde ilk temasta güven verir.</p>
            </article>

            <article className="home-proof-card">
              <span>03</span>
              <strong>Karar odaklı sunum</strong>
              <p>Kullanıcıya ham veri değil; piyasadaki yerini anlamlandıran okunaklı bir sonuç deneyimi sunar.</p>
            </article>

            <article className="home-proof-card">
              <span>04</span>
              <strong>Hazır dönüşüm yüzeyi</strong>
              <p>Güçlü CTA’lar, açıklayıcı bölümler ve sık sorulan sorular ile ürün sitesine dönüşür.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-faq" aria-labelledby="home-faq-title">
        <div className="home-faq__shell">
          <div className="home-faq__intro">
            <span className="home-faq__kicker">SIK SORULANLAR</span>
            <h2 id="home-faq-title">Karar vermeden önce herkesin sorduğu şeyler.</h2>
            <p>
              İlk bakışta yanıt beklenen temel soruları görünür tutmak; güven, dönüşüm
              ve ürün netliği açısından kritik. Bu bölüm EDER’i daha tamamlanmış bir web
              deneyimine taşır.
            </p>
          </div>

          <div className="home-faq__list">
            <details className="home-faq-item" open>
              <summary>EDER sonucu tam olarak neyi gösterir?</summary>
              <p>
                EDER; araç kimliği, kilometre, kondisyon sinyalleri ve piyasa bağlamını birleştirerek
                aracın tahmini değer aralığını ve piyasadaki yerini daha okunaklı biçimde sunar.
              </p>
            </details>

            <details className="home-faq-item">
              <summary>Bu sonuç ekspertiz raporunun yerine mi geçer?</summary>
              <p>
                Hayır. EDER sonucu; karar hazırlayan dijital bir katmandır. Fiziksel ekspertiz ve
                detaylı inceleme süreçlerini tamamlayıcı biçimde konumlanır.
              </p>
            </details>

            <details className="home-faq-item">
              <summary>Kullanıcı akışı neden bu kadar adımlı tasarlandı?</summary>
              <p>
                Çünkü amaç yalnızca form doldurtmak değil; kullanıcıyı araç kimliğinden kondisyon
                algısına, oradan da piyasa bağlamına taşıyan daha anlaşılır bir karar akışı oluşturmaktır.
              </p>
            </details>

            <details className="home-faq-item">
              <summary>Güvenlik ve erişim tarafında ne var?</summary>
              <p>
                Public valuation akışı kontrollü erişim, Turnstile koruması ve net yönlendirmelerle
                güvenilir bir ürün yüzeyi olarak kurgulanır.
              </p>
            </details>

            <details className="home-faq-item">
              <summary>Sonraki adımda bu siteye neler eklenebilir?</summary>
              <p>
                Referans örnekleri, müşteri hikâyeleri, ürün ekranları, kurumsal iletişim, kullanım
                senaryoları ve yardımcı alt sayfalar ile site daha da olgunlaştırılabilir.
              </p>
            </details>
          </div>
        </div>
      </section>



      <section className="home-final">
        <div className="home-final__grid">
          <div>
            <span className="home-section-kicker">
              <Sparkles size={14} aria-hidden />
              HAZIRSAN BAŞLAYALIM
            </span>
            <h2>Aracının piyasadaki yerini birkaç adımda gör.</h2>
          </div>

          <Link to="/valuation" className="home-action home-action--light">
            Değerlemeyi başlat
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
