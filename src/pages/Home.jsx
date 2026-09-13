import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gauge,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import AdSlot from "../components/AdSlot";
import { MetaTags } from "../components/MetaTags";
import "./Home.css";

const HOME_AD_SLOT = import.meta.env.VITE_ADS_SLOT_HOME;
const ease = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

const chapters = [
  {
    step: "01",
    eyebrow: "ARACI TANIMLA",
    title: "Doğru araçla başla.",
    text:
      "Marka, model, yıl, versiyon ve kilometre bilgilerini zincir halinde seç. Değerleme yanlış araç grubuna değil, doğru kombinasyona bağlansın.",
    points: ["Marka + model", "Model yılı", "Versiyon", "Kilometre"],
  },
  {
    step: "02",
    eyebrow: "KONDİSYONU ANLAT",
    title: "Temiz araçla işlem görmüş aracı ayır.",
    text:
      "Boya, değişen ve ağır hasar bilgisini parça bazında ekle. Kondisyon etkisini formun sonundaki küçük bir dipnot olmaktan çıkar.",
    points: ["Boya bilgisi", "Değişen parça", "Ağır hasar", "Parça bazlı seçim"],
  },
  {
    step: "03",
    eyebrow: "PİYASAYI OKU",
    title: "Tek rakama değil, aralığa bak.",
    text:
      "EDER sonucu kesin satış fiyatı değildir. Sana karar verirken kullanabileceğin tahmini piyasa değer aralığını ve orta noktayı gösterir.",
    points: ["Alt bant", "Üst bant", "Orta nokta", "Araç özeti"],
  },
];

function StoryChapter({ chapter, index, reducedMotion }) {
  const image =
    index === 1
      ? "/media/eder/home/inspection.jpg"
      : index === 2
        ? "/media/eder/home/night-road.jpg"
        : null;

  return (
    <motion.article
      className={`home-chapter home-chapter--${index + 1}`}
      initial={reducedMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, ease }}
    >
      <div className="home-chapter__rail">
        <span>{chapter.step}</span>
        <i />
        <small>{chapter.eyebrow}</small>
      </div>

      <div className="home-chapter__copy">
        <h3>{chapter.title}</h3>
        <p>{chapter.text}</p>

        <div className="home-chapter__points">
          {chapter.points.map((point) => (
            <span key={point}>
              <Check size={14} aria-hidden />
              {point}
            </span>
          ))}
        </div>
      </div>

      {image ? (
        <div className="home-chapter__media">
          <img src={image} alt="" loading="lazy" />
          <div className="home-chapter__media-label">
            <span>{index === 1 ? "CONDITION / INPUT" : "MARKET / CONTEXT"}</span>
            <strong>{index === 1 ? "Kondisyon verisi" : "Piyasa bağlamı"}</strong>
          </div>
        </div>
      ) : (
        <div className="home-chapter__instrument">
          <div className="home-config-grid">
            <span>MARKA</span>
            <strong>01</strong>
            <span>MODEL</span>
            <strong>02</strong>
            <span>YIL</span>
            <strong>03</strong>
            <span>VERSİYON</span>
            <strong>04</strong>
          </div>
          <div className="home-config-line" aria-hidden>
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
    </motion.article>
  );
}

export default function Home() {
  const reducedMotion = useReducedMotion();

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
          <motion.div initial="hidden" animate="show" variants={reveal}>
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
              Tahmin etmekten fazlası. Araç kimliği, kilometre ve kondisyon
              bilgisini tek akışta birleştir; tahmini piyasa değer aralığını gör.
            </p>

            <div className="home-cinema__actions">
              <Link to="/valuation" className="home-action home-action--primary">
                Aracın kaç EDER?
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#eder-deneyimi" className="home-action home-action--ghost">
                Nasıl çalışıyor?
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
              <strong>Turnstile doğrulamalı</strong>
            </div>
          </motion.aside>
        </div>

        <div className="home-cinema__scroll">
          <ChevronDown size={18} aria-hidden />
          <span>Kaydır</span>
        </div>
      </section>

      <section className="home-manifesto" id="eder-deneyimi">
        <div className="eder-home-shell">
          <div className="home-manifesto__eyebrow">EDER / VALUE EXPERIENCE</div>
          <div className="home-manifesto__grid">
            <h2>Bir fiyat söylemek kolay. O fiyatın bağlamını göstermek değerli.</h2>
            <div>
              <p>
                EDER, kullanıcıyı uzun bir formun içine bırakmak yerine
                değerleme yolculuğunu aşamalara böler. Her adım sonucu biraz
                daha anlamlı hale getirir.
              </p>
              <div className="home-manifesto__proof">
                <span><ShieldCheck size={15} aria-hidden />Güvenlik doğrulamalı</span>
                <span><Gauge size={15} aria-hidden />Progressive flow</span>
                <span><TrendingUp size={15} aria-hidden />Aralık odaklı sonuç</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-story">
        <div className="eder-home-shell">
          <div className="home-story__header">
            <span>DEĞERLEME YOLCULUĞU</span>
            <h2>Üç bölüm. Tek karar ekranı.</h2>
          </div>

          <div className="home-story__chapters">
            {chapters.map((chapter, index) => (
              <StoryChapter
                key={chapter.step}
                chapter={chapter}
                index={index}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-condition">
        <div className="eder-home-shell home-condition__grid">
          <div className="home-condition__media">
            <img
              src="/media/eder/home/inspection.jpg"
              alt="Araç kontrolünü temsil eden mekanik inceleme"
              loading="lazy"
            />
            <div className="home-condition__tag">
              <ScanSearch size={16} aria-hidden />
              KONDİSYON / PARÇA BAZLI
            </div>
          </div>

          <motion.div
            className="home-condition__copy"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="home-section-kicker">KONDİSYON BİR DETAY DEĞİL</span>
            <h2>Aracın hikâyesi sonucu değiştirir.</h2>
            <p>
              Boya ve değişen bilgisini parça bazında ekleyebilirsin. Böylece
              temiz araçla işlem görmüş aracı aynı kutuya koymamış olursun.
            </p>

            <div className="home-condition__rows">
              <div><span>01</span><strong>Boya</strong><small>Parça bazlı durum</small></div>
              <div><span>02</span><strong>Değişen</strong><small>Kondisyon etkisi</small></div>
              <div><span>03</span><strong>Ağır hasar</strong><small>Ek değerleme sinyali</small></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="home-market">
        <img
          className="home-market__image"
          src="/media/eder/home/night-road.jpg"
          alt=""
          loading="lazy"
        />
        <div className="home-market__shade" />

        <div className="eder-home-shell home-market__content">
          <span className="home-section-kicker">PİYASA HAREKETLİDİR</span>
          <h2>Sonuç bir etiket değil, karar verirken kullanacağın aralık.</h2>

          <div className="home-market__curve" aria-hidden>
            <svg viewBox="0 0 900 230" preserveAspectRatio="none">
              <motion.path
                d="M0 177 C102 172 137 131 225 139 C312 147 351 82 446 96 C540 111 584 53 680 71 C766 87 802 45 900 36"
                fill="none"
                stroke="#ff5a1f"
                strokeWidth="4"
                initial={reducedMotion ? false : { pathLength: 0 }}
                whileInView={reducedMotion ? undefined : { pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.35, ease }}
              />
            </svg>
          </div>

          <div className="home-market__legend">
            <span>ALT BANT</span>
            <i />
            <strong>EDER ARALIĞI</strong>
            <i />
            <span>ÜST BANT</span>
          </div>
        </div>
      </section>

      <section className="home-ad" aria-label="Reklam">
        <div className="eder-home-shell">
          <AdSlot enabled slot={HOME_AD_SLOT} style={{ minHeight: 120 }} />
        </div>
      </section>

      <section className="home-final">
        <div className="eder-home-shell home-final__grid">
          <div>
            <span className="home-section-kicker">
              <Sparkles size={14} aria-hidden />
              HAZIRSAN BAŞLAYALIM
            </span>
            <h2>Aracının kaç EDER olduğunu birkaç adımda gör.</h2>
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
