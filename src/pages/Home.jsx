import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CarFront,
  Check,
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

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
};

const vehicleSteps = [
  "Araç kimliği",
  "Teknik detaylar",
  "Kondisyon",
  "Piyasa aralığı",
];

function MarketCanvas({ reducedMotion }) {
  return (
    <div className="market-canvas" aria-label="EDER değerleme akışı görseli">
      <div className="market-canvas__topline">
        <span>EDER / MARKET VIEW</span>
        <span className="market-canvas__live">
          <i aria-hidden />
          Değerleme akışı
        </span>
      </div>

      <div className="market-canvas__vehicle">
        <svg viewBox="0 0 620 238" role="img" aria-label="Araç silüeti">
          <defs>
            <linearGradient id="eder-car-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff6b1a" />
              <stop offset="100%" stopColor="#ffad66" />
            </linearGradient>
          </defs>
          <motion.path
            d="M88 150 C116 112 151 87 207 79 L355 76 C404 77 442 92 474 121 L519 143 C543 154 554 171 554 186 L554 193 L516 193 C511 162 488 145 458 145 C428 145 404 162 399 193 L217 193 C212 162 188 145 158 145 C128 145 104 162 99 193 L66 193 L66 179 C66 164 73 156 88 150 Z"
            fill="none"
            stroke="url(#eder-car-line)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0.2 }}
            animate={reducedMotion ? undefined : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.35, ease: "easeInOut" }}
          />
          <path
            d="M204 82 L259 124 L425 124 C405 98 381 84 349 80 Z"
            fill="rgba(255,107,26,0.08)"
            stroke="rgba(255,107,26,0.24)"
            strokeWidth="2"
          />
          <circle cx="158" cy="193" r="31" fill="#111827" stroke="#334155" strokeWidth="7" />
          <circle cx="458" cy="193" r="31" fill="#111827" stroke="#334155" strokeWidth="7" />
          <circle cx="158" cy="193" r="10" fill="#f8fafc" />
          <circle cx="458" cy="193" r="10" fill="#f8fafc" />
        </svg>
      </div>

      <div className="market-canvas__curve" aria-hidden>
        <svg viewBox="0 0 620 160" preserveAspectRatio="none">
          <path
            d="M0 124 C76 120 97 76 158 83 C220 91 241 41 306 53 C371 66 402 22 468 43 C520 60 552 30 620 24"
            fill="none"
            stroke="rgba(255,107,26,0.82)"
            strokeWidth="3"
          />
          <path
            d="M0 139 C85 125 109 103 171 107 C235 112 258 74 322 82 C386 89 421 56 486 67 C543 77 570 57 620 50"
            fill="none"
            stroke="rgba(148,163,184,0.32)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
        </svg>
      </div>

      <div className="market-canvas__steps">
        {vehicleSteps.map((item, index) => (
          <div className="market-canvas__step" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
            <Check size={14} aria-hidden />
          </div>
        ))}
      </div>
    </div>
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

      <section className="eder-hero">
        <div className="eder-shell eder-hero__grid">
          <motion.div
            className="eder-hero__copy"
            initial="hidden"
            animate="show"
            variants={reveal}
          >
            <div className="eder-kicker">
              <Sparkles size={15} aria-hidden />
              Trink EDER'ini öğren
            </div>

            <h1>
              Aracının piyasadaki
              <span> yerini gör.</span>
            </h1>

            <p className="eder-hero__lead">
              Marka, model, kilometre, teknik detaylar ve kondisyon bilgilerini
              tek akışta birleştir. EDER sana anlaşılır bir tahmini piyasa
              değer aralığı sunsun.
            </p>

            <div className="eder-hero__actions">
              <Link to="/valuation" className="eder-button eder-button--primary">
                Ücretsiz değerle
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#nasil-calisir" className="eder-button eder-button--quiet">
                Nasıl çalışıyor?
              </a>
            </div>

            <div className="eder-proof-strip" aria-label="EDER özellikleri">
              <span>
                <ShieldCheck size={16} aria-hidden />
                Güvenlik doğrulamalı
              </span>
              <span>
                <Gauge size={16} aria-hidden />
                Hızlı akış
              </span>
              <span>
                <BarChart3 size={16} aria-hidden />
                Tek sayı yerine aralık
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 28 }}
            animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.72, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <MarketCanvas reducedMotion={reducedMotion} />
          </motion.div>
        </div>

        <div className="eder-hero__rail" aria-hidden>
          <span>MARKA</span>
          <i />
          <span>MODEL</span>
          <i />
          <span>KİLOMETRE</span>
          <i />
          <span>KONDİSYON</span>
          <i />
          <strong>EDER</strong>
        </div>
      </section>

      <section className="eder-process" id="nasil-calisir">
        <div className="eder-shell">
          <div className="eder-section-head">
            <div>
              <span className="eder-section-head__eyebrow">Değerleme mantığı</span>
              <h2>Kararı değil, karar vermeyi kolaylaştıran veriyi sunuyoruz.</h2>
            </div>
            <p>
              Değerleme sonucu kesin satış fiyatı değildir. Araç kondisyonu,
              bakım geçmişi, bölgesel talep ve piyasa hareketleri nihai fiyatı
              değiştirebilir.
            </p>
          </div>

          <div className="eder-process__grid">
            <article className="eder-process-card">
              <span className="eder-process-card__index">01</span>
              <CarFront size={24} aria-hidden />
              <h3>Aracı doğru tanımla</h3>
              <p>
                Marka, model, yıl, versiyon ve kilometre bilgisiyle doğru araç
                grubunu seç.
              </p>
            </article>

            <article className="eder-process-card">
              <span className="eder-process-card__index">02</span>
              <ScanSearch size={24} aria-hidden />
              <h3>Kondisyonu ekle</h3>
              <p>
                Değişen, boya ve ağır hasar gibi değeri etkileyen bilgileri
                parça bazında işaretle.
              </p>
            </article>

            <article className="eder-process-card">
              <span className="eder-process-card__index">03</span>
              <TrendingUp size={24} aria-hidden />
              <h3>Aralığı yorumla</h3>
              <p>
                Sonucu tek bir kesin fiyat gibi değil, piyasa koşullarını
                yansıtan tahmini bir değer aralığı olarak değerlendir.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="eder-home-ad" aria-label="Reklam">
        <div className="eder-shell">
          <AdSlot enabled slot={HOME_AD_SLOT} style={{ minHeight: 120 }} />
        </div>
      </section>

      <section className="eder-final-cta">
        <div className="eder-shell">
          <div className="eder-final-cta__card">
            <div className="eder-final-cta__copy">
              <span>Aracın kaç EDER?</span>
              <h2>Değerleme akışına geç ve piyasa aralığını öğren.</h2>
              <p>
                Güvenlik doğrulaması ve günlük kullanım sınırı, servisin
                sürdürülebilir ve adil kullanılmasına yardımcı olur.
              </p>
            </div>
            <Link to="/valuation" className="eder-button eder-button--primary">
              Değerlemeyi başlat
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
