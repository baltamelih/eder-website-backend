import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { sanity } from "../lib/sanity";

function safeDate(d) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? new Date(t) : null;
}

function formatDateTR(dateStr) {
  const d = safeDate(dateStr);
  if (!d) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(d);
}

function makeExcerpt(text, maxLen = 160) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trimEnd() + "…";
}

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const q = `*[_type=="post"] | order(publishedAt desc){
      title,
      description,
      "slug": slug.current,
      publishedAt,
      tags
    }`;

    sanity
      .fetch(q)
      .then((rows) => {
        if (!alive) return;
        setPosts(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => console.error("Sanity fetch error:", e))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://ederapp.com";
  const canonical = `${siteUrl}/blog`;

  const viewPosts = useMemo(() => {
    return posts.map((p) => ({
      title: p?.title || "Untitled",
      slug: p?.slug || "",
      date: p?.publishedAt || "",
      tags: Array.isArray(p?.tags) ? p.tags : [],
      excerpt: p?.description?.trim() ? makeExcerpt(p.description.trim(), 180) : "",
    }));
  }, [posts]);

  return (
    <div style={{ padding: "28px 0" }}>
      
        <title>EDER Blog | Araç Değerleme ve Piyasa Analizi</title>
        <meta
          name="description"
          content="Araç değerleme, ikinci el piyasa trendleri, fiyatı etkileyen faktörler ve pratik rehberler. EDER Blog."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EDER Blog" />
        <meta property="og:description" content="Araç değerleme ve piyasa analizi içerikleri." />
        <meta property="og:url" content={canonical} />
      

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: -0.4 }}>Blog</h1>
          <div style={{ color: "rgba(0,0,0,0.55)" }}>Araç değerleme ve piyasa analizi</div>
        </div>

        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
          {loading ? (
            <div style={{ gridColumn: "span 12", color: "rgba(0,0,0,0.6)" }}>Yükleniyor…</div>
          ) : null}

          {!loading && viewPosts.length === 0 ? (
            <div style={{ gridColumn: "span 12", color: "rgba(0,0,0,0.6)" }}>
              Henüz blog yazısı yok.
            </div>
          ) : null}

          {viewPosts.map((p) => (
            <article
              key={p.slug}
              style={{
                gridColumn: "span 12",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
                  {p.date ? formatDateTR(p.date) : ""}
                </div>

                {p.tags?.length ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {p.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "rgba(255,122,24,0.10)",
                          color: "#B84E00",
                          border: "1px solid rgba(255,122,24,0.25)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <h2 style={{ margin: "10px 0 6px", fontSize: 22, letterSpacing: -0.2, lineHeight: 1.2 }}>
                <Link to={`/blog/${p.slug}`} style={{ color: "#111", textDecoration: "none" }}>
                  {p.title}
                </Link>
              </h2>

              {p.excerpt ? (
                <p style={{ margin: 0, color: "rgba(0,0,0,0.70)", lineHeight: 1.65 }}>{p.excerpt}</p>
              ) : null}

              <div style={{ marginTop: 12 }}>
                <Link
                  to={`/blog/${p.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,122,24,0.12)",
                    border: "1px solid rgba(255,122,24,0.22)",
                    color: "#B84E00",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Yazıyı oku →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
