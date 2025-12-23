import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import matter from "gray-matter";
import { Helmet } from "react-helmet-async";

// Vite: markdown dosyalarını raw string olarak al
const mdModules = import.meta.glob("../blog/posts/*.md", { as: "raw", eager: true });

function safeDate(d) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? new Date(t) : null;
}

function formatDateTR(dateStr) {
  const d = safeDate(dateStr);
  if (!d) return "";
  return new Intl.DateTimeFormat("tr-TR", { year: "numeric", month: "long", day: "2-digit" }).format(d);
}

function makeExcerpt(content, maxLen = 160) {
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/[#>*_~\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

function normalizeSlug(slug, fallbackTitle) {
  const base = (slug || fallbackTitle || "post").toString().trim().toLowerCase();
  return base
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function readAllPosts() {
  const entries = Object.entries(mdModules);

  return entries
    .map(([path, raw]) => {
      const { data, content } = matter(raw);

      const title = data?.title?.toString() || "Untitled";
      const slug = normalizeSlug(data?.slug, title);

      // date yoksa dosya isminden yakalamaya çalış
      let date = data?.date?.toString();
      if (!date) {
        const m = path.match(/(\d{4}-\d{2}-\d{2})/);
        if (m) date = m[1];
      }

      const description = (data?.description?.toString() || "").trim();
      const tags = Array.isArray(data?.tags) ? data.tags.map(String) : [];

      return {
        title,
        slug,
        date: date || "",
        description,
        excerpt: description || makeExcerpt(content, 180),
        tags,
        // İstersen kapak görseli eklemek için frontmatter'a image koyabilirsin:
        image: data?.image ? String(data.image) : "",
      };
    })
    .sort((a, b) => {
      const da = safeDate(a.date)?.getTime() ?? 0;
      const db = safeDate(b.date)?.getTime() ?? 0;
      return db - da;
    });
}

export default function BlogIndex() {
  const posts = useMemo(() => readAllPosts(), []);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://ederapp.com";
  const canonical = `${siteUrl}/blog`;

  return (
    <div style={{ padding: "28px 0" }}>
      <Helmet>
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
      </Helmet>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: -0.4 }}>Blog</h1>
          <div style={{ color: "rgba(0,0,0,0.55)" }}>Araç değerleme ve piyasa analizi</div>
        </div>

        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
          {posts.map((p) => (
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
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>{p.date ? formatDateTR(p.date) : ""}</div>
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

              <p style={{ margin: 0, color: "rgba(0,0,0,0.70)", lineHeight: 1.65 }}>
                {p.excerpt}
              </p>

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
