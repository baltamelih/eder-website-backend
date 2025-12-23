import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

import AdSlot from "../components/AdSlot";
import { sanity } from "../lib/sanity";

function safeDate(d) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? new Date(t) : null;
}

function formatDateTR(dateStr) {
  const d = safeDate(dateStr);
  if (!d) return "";
  return new Intl.DateTimeFormat("tr-TR", { year: "numeric", month: "long", day: "2-digit" }).format(d);
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // AdSense env ile kontrol (opsiyonel)
  const ADS_ENABLED = Boolean(import.meta.env.VITE_ADSENSE_CLIENT);
  const TOP_SLOT = import.meta.env.VITE_ADSENSE_SLOT_TOP;
  const INARTICLE_SLOT = import.meta.env.VITE_ADSENSE_SLOT_INARTICLE;
  const BOTTOM_SLOT = import.meta.env.VITE_ADSENSE_SLOT_BOTTOM;

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const q = `*[_type=="post" && slug.current==$slug][0]{
      title,
      description,
      canonical,
      publishedAt,
      tags,
      "slug": slug.current,
      markdown,
      mainImage{asset->{url}}
    }`;

    sanity.fetch(q)
        .then((rows) => {
            console.log("SANITY POSTS:", rows);
            setPosts(Array.isArray(rows) ? rows : []);
        })
        .catch((e) => {
            console.error("SANITY ERROR:", e);
            setPosts([]);
        })
        .finally(() => setLoading(false));


    return () => {
      alive = false;
    };
  }, [slug]);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://ederapp.com";
  const canonical = post?.canonical?.length ? post.canonical : `${siteUrl}/blog/${slug || ""}`;

  // markdown alanına raw md basmış olabilirsin (frontmatter dahil). Onu ayıkla:
  const { fm, mdBody } = useMemo(() => {
    const raw = post?.markdown || "";
    if (!raw) return { fm: {}, mdBody: "" };
    try {
      const parsed = matter(raw);
      return { fm: parsed.data || {}, mdBody: parsed.content || "" };
    } catch {
      return { fm: {}, mdBody: raw };
    }
  }, [post?.markdown]);

  const title = post?.title || "Yazı";
  const description = (post?.description || fm?.description || "").toString().trim();
  const datePublished = post?.publishedAt || fm?.date || "";
  const tags = Array.isArray(post?.tags) ? post.tags : Array.isArray(fm?.tags) ? fm.tags : [];
  const ogImage = post?.mainImage?.asset?.url || (fm?.image ? String(fm.image) : "");

  if (loading) {
    return (
      <div style={{ padding: "28px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px", color: "rgba(0,0,0,0.7)" }}>
          Yükleniyor…
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: "28px 0" }}>
        
          <title>Yazı Bulunamadı | EDER Blog</title>
          <meta name="robots" content="noindex" />
        

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
      
        <title>{title} | EDER Blog</title>
        {description ? <meta name="description" content={description} /> : null}
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        {description ? <meta property="og:description" content={description} /> : null}
        <meta property="og:url" content={canonical} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}

        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={title} />
        {description ? <meta name="twitter:description" content={description} /> : null}
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: description || undefined,
            datePublished: datePublished || undefined,
            mainEntityOfPage: canonical,
            url: canonical,
            publisher: { "@type": "Organization", name: "EDER", url: siteUrl },
          })}
        </script>
      

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ marginBottom: 14 }}>
          <Link to="/blog" style={{ color: "#FF7A18", fontWeight: 800, textDecoration: "none" }}>
            ← Blog
          </Link>
        </div>

        <header style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", color: "rgba(0,0,0,0.55)" }}>
            {datePublished ? <span>{formatDateTR(datePublished)}</span> : null}
            {tags?.length ? (
              <>
                <span>•</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {tags.map((t) => (
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

          <h1 style={{ margin: "10px 0 0", fontSize: 36, letterSpacing: -0.6, lineHeight: 1.15 }}>{title}</h1>

          {description ? (
            <p style={{ margin: "10px 0 0", color: "rgba(0,0,0,0.72)", lineHeight: 1.7, fontSize: 16 }}>
              {description}
            </p>
          ) : null}
        </header>

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
              h2: (props) => <h2 style={{ marginTop: 22, marginBottom: 10, fontSize: 22, letterSpacing: -0.2 }} {...props} />,
              h3: (props) => <h3 style={{ marginTop: 18, marginBottom: 8, fontSize: 18 }} {...props} />,
              p: (props) => <p style={{ margin: "10px 0", lineHeight: 1.75, color: "rgba(0,0,0,0.82)" }} {...props} />,
              a: (props) => <a style={{ color: "#FF7A18", fontWeight: 700 }} target="_blank" rel="noreferrer" {...props} />,
              li: (props) => <li style={{ margin: "6px 0", lineHeight: 1.7 }} {...props} />,
              blockquote: (props) => (
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
            {mdBody}
          </ReactMarkdown>

          {ADS_ENABLED && INARTICLE_SLOT ? (
            <div style={{ margin: "18px 0 8px", minHeight: 120 }}>
              <AdSlot slot={INARTICLE_SLOT} />
            </div>
          ) : null}
        </article>

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
