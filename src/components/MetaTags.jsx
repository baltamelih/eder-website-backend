import { useEffect } from "react";

function upsertMeta(selector, attributes) {
  let node = document.querySelector(selector);

  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) node.setAttribute(key, value);
  });

  return node;
}

export function MetaTags({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  publishedTime,
  modifiedTime,
  tags = [],
  jsonLd,
}) {
  useEffect(() => {
    const siteTitle = title ? `${title} | EDER` : "EDER | Araç Değerleme";
    document.title = siteTitle;

    if (description) {
      upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
      });
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]');

    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    const image = ogImage || "https://ederapp.com/favicon.png";

    const ogTags = [
      { property: "og:title", content: siteTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: ogType },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "EDER" },
      { property: "og:image", content: image },
    ];

    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: siteTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ];

    if (ogType === "article") {
      if (publishedTime) {
        ogTags.push({
          property: "article:published_time",
          content: publishedTime,
        });
      }

      if (modifiedTime) {
        ogTags.push({
          property: "article:modified_time",
          content: modifiedTime,
        });
      }

      tags.forEach((tag) => {
        ogTags.push({
          property: "article:tag",
          content: tag,
        });
      });
    }

    [...ogTags, ...twitterTags].forEach(({ property, name, content }) => {
      if (!content) return;

      const selector = property
        ? `meta[property="${property}"]`
        : `meta[name="${name}"]`;

      upsertMeta(
        selector,
        property
          ? { property, content }
          : { name, content }
      );
    });

    const ldId = "eder-json-ld";
    const existingLd = document.getElementById(ldId);

    if (jsonLd) {
      const script = existingLd || document.createElement("script");
      script.id = ldId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);

      if (!existingLd) {
        document.head.appendChild(script);
      }
    } else if (existingLd) {
      existingLd.remove();
    }

    return () => {
      const current = document.getElementById(ldId);
      if (current) current.remove();
    };
  }, [
    title,
    description,
    canonical,
    ogImage,
    ogType,
    publishedTime,
    modifiedTime,
    tags,
    jsonLd,
  ]);

  return null;
}
