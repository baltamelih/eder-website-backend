import { useEffect } from 'react';

export function MetaTags({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  ogType = 'article',
  publishedTime,
  modifiedTime,
  tags = []
}) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = `${title} | EDER`;
    }

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Open Graph
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: canonical },
      { property: 'og:site_name', content: 'EDER' },
      { property: 'og:image', content: ogImage || 'https://ederapp.com/og-default.jpg' },
    ];

    // Twitter Cards
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage || 'https://ederapp.com/og-default.jpg' },
    ];

    // Article specific
    if (ogType === 'article') {
      if (publishedTime) {
        ogTags.push({ property: 'article:published_time', content: publishedTime });
      }
      if (modifiedTime) {
        ogTags.push({ property: 'article:modified_time', content: modifiedTime });
      }
      tags.forEach(tag => {
        ogTags.push({ property: 'article:tag', content: tag });
      });
    }

    // Add all meta tags
    [...ogTags, ...twitterTags].forEach(({ property, name, content }) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

    // Cleanup function
    return () => {
      // Optional: cleanup meta tags when component unmounts
    };
  }, [title, description, canonical, ogImage, ogType, publishedTime, modifiedTime, tags]);

  return null;
}