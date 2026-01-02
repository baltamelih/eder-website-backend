import fs from 'fs';
import { sanity } from '../lib/sanity.js';

async function generateSitemap() {
  // Static pages
  const staticPages = [
    { url: 'https://ederapp.com/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://ederapp.com/blog', priority: '0.8', changefreq: 'daily' },
    { url: 'https://ederapp.com/pricing', priority: '0.7', changefreq: 'weekly' },
    { url: 'https://ederapp.com/app/valuation', priority: '0.9', changefreq: 'weekly' },
  ];

  // Get blog posts from Sanity
  const posts = await sanity.fetch(`
    *[_type == "post" && defined(slug.current)] {
      "slug": slug.current,
      publishedAt,
      _updatedAt
    }
  `);

  const blogPages = posts.map(post => ({
    url: `https://ederapp.com/blog/${post.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: post._updatedAt || post.publishedAt
  }));

  const allPages = [...staticPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log(`✅ Sitemap generated with ${allPages.length} URLs`);
}

generateSitemap().catch(console.error);