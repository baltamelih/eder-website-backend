import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Helmet } from "react-helmet-async";

// (Opsiyonel) AdSense slotları:
// Eğer AdSlot component’in varsa import et. Yoksa aşağıdaki satırı yorumlu bırak.
import AdSlot from "../components/AdSlot";

// Markdown dosyaları
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

function readAllPostsFull() {
  const entries = Object.entries(mdModules);

  return entries.map(([path, raw]) => {
    const { data, content } = matter(raw);

    const title = data?.title?.toString() || "Untitled";
    const slug = normalizeSlug(data?.slug, title);

    let date = data?.date?.toString();
    if (!date) {
      const m = path.match(/(\d{4}-\d{2}-\d{2})/);
      if (m) date = m[1];
    }

    const description = (data?.description?.toString() || "").trim();
    const tags = Array.isArray(data?.tags) ? data.tags.map(String) : [];

    const canonical =
      (data?.canonical && String(data.canonical)) ||
      ""; // boşsa aşağıda window.location ile set edeceğiz

    const image = data?.image ? String(data.image) : "";

    return {
      title,
      slug,
      date: date || "",
      description,
      tags,
      canonical,
      image,
      content,
    };
  });
}

export default function BlogPost() {
  const { slug } = useParams();

  const posts = useMemo(() => readAllPostsFull(), []);
  const post = posts.find((p) => p.slug === slug);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://ederapp.com";
  const canonical = post?.canonical?.length ? post.canonical : `${siteUrl}/blog/${slug || ""}`;

  // AdSense env ile kontrol (opsiyonel)
  const ADS_ENABLED = Boolean(import.meta.env.VITE_ADSENSE_CLIENT);
  const TOP_SLOT = import.meta.env.VITE_ADSENSE_SLOT_TOP; // örn: "1234567890"
  const INARTICLE_SLOT = import.meta.env.VITE_ADSENSE_SLOT_INARTICLE;
  const BOTTOM_SLOT = import.meta.env.VITE_ADSENSE_SLOT_BOTTOM;

  if (!post) {
    return (
      <div style={{ padding: "28px 0" }}>
        <Helmet>
          <title>Yazı Bulunamadı | EDER Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>Yazı bulunamadı</h1>
          <p style={{ color: "rgba(0,0,0,0.7)", lineHeight: 1.65 }}>
            Bu sayfa kaldırılmış olabilir ya da bağlantı hatalı olabilir.
          </p>
          <Link to="/blog" style={{ color: "#FF7A18", fontWeight: 700, textDecoration: "none" }}>
            ← Blog’a geri dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 0" }}>
      <Helmet>
        <title>{post.title} | EDER Blog</title>
        {post.description ? <meta name="description" content={post.description} /> : null}
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        {post.description ? <meta property="og:description" content={post.description} /> : null}
        <meta property="og:url" content={canonical} />
        {post.image ? <meta property="og:image" content={post.image} /> : null}

        <meta name="twitter:card" content={post.image ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={post.title} />
        {post.description ? <meta name="twitter:description" content={post.description} /> : null}
        {post.image ? <meta name="twitter:image" content={post.image} /> : null}

        {/* (Opsiyonel) Article structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description || undefined,
            datePublished: post.date || undefined,
            mainEntityOfPage: canonical,
            url: canonical,
            publisher: {
              "@type": "Organization",
              name: "EDER",
              url: siteUrl,
            },
          })}
        </script>
      </Helmet>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ marginBottom: 14 }}>
          <Link to="/blog" style={{ color: "#FF7A18", fontWeight: 800, textDecoration: "none" }}>
            ← Blog
          </Link>
        </div>

        <header style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", color: "rgba(0,0,0,0.55)" }}>
            {post.date ? <span>{formatDateTR(post.date)}</span> : null}
            {post.tags?.length ? (
              <>
                <span>•</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {post.tags.map((t) => (
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
              </>
            ) : null}
          </div>

          <h1 style={{ margin: "10px 0 0", fontSize: 36, letterSpacing: -0.6, lineHeight: 1.15 }}>
            {post.title}
          </h1>

          {post.description ? (
            <p style={{ margin: "10px 0 0", color: "rgba(0,0,0,0.72)", lineHeight: 1.7, fontSize: 16 }}>
              {post.description}
            </p>
          ) : null}
        </header>

        {/* Üst reklam (opsiyonel) */}
        {ADS_ENABLED && TOP_SLOT ? (
          <div style={{ margin: "14px 0 18px", minHeight: 120 }}>
            <AdSlot slot={TOP_SLOT} />
          </div>
        ) : null}

        <article
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            padding: 18,
            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...props }) => (
                <h2 style={{ marginTop: 22, marginBottom: 10, fontSize: 22, letterSpacing: -0.2 }} {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 style={{ marginTop: 18, marginBottom: 8, fontSize: 18 }} {...props} />
              ),
              p: ({ node, ...props }) => (
                <p style={{ margin: "10px 0", lineHeight: 1.75, color: "rgba(0,0,0,0.82)" }} {...props} />
              ),
              a: ({ node, ...props }) => (
                <a style={{ color: "#FF7A18", fontWeight: 700 }} target="_blank" rel="noreferrer" {...props} />
              ),
              li: ({ node, ...props }) => <li style={{ margin: "6px 0", lineHeight: 1.7 }} {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote
                  style={{
                    margin: "14px 0",
                    padding: "10px 14px",
                    borderLeft: "4px solid rgba(255,122,24,0.7)",
                    background: "rgba(255,122,24,0.06)",
                    borderRadius: 10,
                  }}
                  {...props}
                />
              ),
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code
                    style={{
                      padding: "2px 6px",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.06)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 13,
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.06)",
                      overflowX: "auto",
                      fontSize: 13,
                    }}
                    {...props}
                  >
                    <code>{children}</code>
                  </pre>
                ),
            }}
          >
            {post.content}
          </ReactMarkdown>

          {/* İçerik içi reklam (opsiyonel) — şimdilik yazı sonuna yakın koyduk.
              İstersen 2. H2’den sonra otomatik ekleyen “akıllı” versiyonunu da yaparım. */}
          {ADS_ENABLED && INARTICLE_SLOT ? (
            <div style={{ margin: "18px 0 8px", minHeight: 120 }}>
              <AdSlot slot={INARTICLE_SLOT} />
            </div>
          ) : null}
        </article>

        {/* Alt reklam (opsiyonel) */}
        {ADS_ENABLED && BOTTOM_SLOT ? (
          <div style={{ margin: "18px 0 0", minHeight: 120 }}>
            <AdSlot slot={BOTTOM_SLOT} />
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link to="/blog" style={{ color: "#FF7A18", fontWeight: 800, textDecoration: "none" }}>
            ← Tüm yazılar
          </Link>
          <Link to="/valuation" style={{ color: "#111", fontWeight: 800, textDecoration: "none" }}>
            Araç değerle →
          </Link>
        </div>
      </div>
    </div>
  );
}
