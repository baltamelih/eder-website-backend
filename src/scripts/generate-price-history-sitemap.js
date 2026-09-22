import fs from "fs";
import path from "path";

const SITE_ORIGIN = "https://ederapp.com";
const API_BASE = String(
  process.env.EDER_API_BASE || "https://eder-backend.onrender.com",
).replace(/\/+$/, "");

const MODEL_YEAR_MIN_ELIGIBLE_VERSIONS = 3;
const MODEL_YEAR_MIN_TOTAL_LISTINGS = 30;

const outputPath = path.resolve(process.cwd(), "public", "sitemap-price-history.xml");
const eligibilityOutputPath = path.resolve(process.cwd(), "src", "generated", "priceHistoryEligibility.js");
const modelYearOutputPath = path.resolve(process.cwd(), "src", "generated", "priceHistoryModelYearSeo.js");

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function maxDate(values) {
  return values.filter(validDate).sort().at(-1) || null;
}

function minDate(values) {
  return values.filter(validDate).sort().at(0) || null;
}

function buildModelYearSeoPages(pages) {
  const groups = new Map();

  for (const page of pages) {
    const key = [page.brand_slug, page.model_slug, page.year].join("|");

    if (!groups.has(key)) {
      groups.set(key, {
        brandName: page.brand_name,
        brandSlug: page.brand_slug,
        modelName: page.model_name,
        modelSlug: page.model_slug,
        year: Number(page.year),
        versions: [],
      });
    }

    groups.get(key).versions.push({
      versionLabel: page.version_label,
      versionSlug: page.version_slug,
      totalListingCount: Number(page.total_listing_count || 0),
      firstDataDate: page.first_data_date || null,
      lastDataDate: page.last_data_date || null,
      pagePath: page.path,
    });
  }

  return Array.from(groups.values())
    .map((group) => {
      const versions = [...group.versions].sort((a, b) => {
        const countDiff = Number(b.totalListingCount) - Number(a.totalListingCount);
        if (countDiff !== 0) return countDiff;
        return String(a.versionLabel || "").localeCompare(String(b.versionLabel || ""), "tr");
      });

      const totalListingCount = versions.reduce(
        (sum, item) => sum + Number(item.totalListingCount || 0),
        0,
      );

      return {
        path: `/arac-fiyat-gecmisi/${group.brandSlug}/${group.modelSlug}/${group.year}`,
        brandName: group.brandName,
        brandSlug: group.brandSlug,
        modelName: group.modelName,
        modelSlug: group.modelSlug,
        year: group.year,
        eligibleVersionCount: versions.length,
        totalListingCount,
        firstDataDate: minDate(versions.map((item) => item.firstDataDate)),
        lastDataDate: maxDate(versions.map((item) => item.lastDataDate)),
        versions,
      };
    })
    .filter(
      (group) =>
        group.eligibleVersionCount >= MODEL_YEAR_MIN_ELIGIBLE_VERSIONS &&
        group.totalListingCount >= MODEL_YEAR_MIN_TOTAL_LISTINGS,
    )
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function main() {
  const response = await fetch(`${API_BASE}/api/price-history/seo-manifest`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`SEO manifest failed: ${response.status} ${response.statusText}`);
  }

  const manifest = await response.json();

  if (
    manifest?.ok !== true ||
    manifest?.eligibility !== "chart_eligible_only" ||
    !Array.isArray(manifest?.pages)
  ) {
    throw new Error("SEO manifest contract mismatch.");
  }

  if (manifest.pages.length !== Number(manifest.eligible_count)) {
    throw new Error("SEO manifest eligible count mismatch.");
  }

  const staticUrls = [
    { path: "/arac-fiyat-gecmisi", lastmod: manifest.latest_data_date },
    { path: "/fiyat-endeksi", lastmod: manifest.latest_data_date },
  ];

  const programmaticUrls = manifest.pages.map((page) => {
    if (!String(page.path || "").startsWith("/arac-fiyat-gecmisi/")) {
      throw new Error(`Unexpected SEO path: ${page.path}`);
    }
    return { path: page.path, lastmod: page.last_data_date };
  });

  const modelYearSeoPages = buildModelYearSeoPages(manifest.pages);
  const modelYearUrls = modelYearSeoPages.map((page) => ({
    path: page.path,
    lastmod: page.lastDataDate,
  }));

  const urls = [...staticUrls, ...modelYearUrls, ...programmaticUrls];
  const unique = new Set(urls.map((item) => item.path));
  if (unique.size !== urls.length) throw new Error("Duplicate sitemap URL detected.");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => {
  const lastmod = validDate(item.lastmod)
    ? `\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>`
    : "";
  return `  <url>\n    <loc>${escapeXml(`${SITE_ORIGIN}${item.path}`)}</loc>${lastmod}\n  </url>`;
}).join("\n")}
</urlset>
`;

  fs.writeFileSync(outputPath, xml, "utf8");
  fs.mkdirSync(path.dirname(eligibilityOutputPath), { recursive: true });

  const eligiblePaths = programmaticUrls.map((item) => item.path);
  const eligibilityModule = `// AUTO-GENERATED by generate-price-history-sitemap.js.\n// Source of truth: the same chart_eligible_only manifest used by the sitemap.\n// Do not edit this file manually.\n\nexport const PRICE_HISTORY_ELIGIBLE_PATHS = ${JSON.stringify(eligiblePaths, null, 2)};\n\nconst ELIGIBLE_PATHS = new Set(PRICE_HISTORY_ELIGIBLE_PATHS);\n\nexport function normalizePriceHistoryPath(pathname) {\n  const value = String(pathname || "").trim();\n  if (!value) return "/";\n  const withoutQuery = value.split("?")[0].split("#")[0];\n  const normalized = withoutQuery.length > 1 ? withoutQuery.replace(/\\/+$/, "") : withoutQuery;\n  return normalized || "/";\n}\n\nexport function isPriceHistoryEligiblePath(pathname) {\n  return ELIGIBLE_PATHS.has(normalizePriceHistoryPath(pathname));\n}\n`;

  fs.writeFileSync(eligibilityOutputPath, eligibilityModule, "utf8");

  const modelYearModule = `// AUTO-GENERATED by generate-price-history-sitemap.js.\n// Data-driven SEO pages derived only from chart-eligible exact version pages.\n// Do not edit this file manually.\n\nexport const PRICE_HISTORY_MODEL_YEAR_MIN_ELIGIBLE_VERSIONS = ${MODEL_YEAR_MIN_ELIGIBLE_VERSIONS};\nexport const PRICE_HISTORY_MODEL_YEAR_MIN_TOTAL_LISTINGS = ${MODEL_YEAR_MIN_TOTAL_LISTINGS};\n\nexport const PRICE_HISTORY_MODEL_YEAR_SEO_PAGES = ${JSON.stringify(modelYearSeoPages, null, 2)};\n\nconst MODEL_YEAR_BY_PATH = new Map(PRICE_HISTORY_MODEL_YEAR_SEO_PAGES.map((item) => [item.path, item]));\n\nexport function normalizePriceHistoryModelYearPath(pathname) {\n  const value = String(pathname || "").trim();\n  if (!value) return "/";\n  const withoutQuery = value.split("?")[0].split("#")[0];\n  const normalized = withoutQuery.length > 1 ? withoutQuery.replace(/\\/+$/, "") : withoutQuery;\n  return normalized || "/";\n}\n\nexport function getPriceHistoryModelYearSeo(pathname) {\n  return MODEL_YEAR_BY_PATH.get(normalizePriceHistoryModelYearPath(pathname)) || null;\n}\n\nexport function isPriceHistoryModelYearSeoEligiblePath(pathname) {\n  return Boolean(getPriceHistoryModelYearSeo(pathname));\n}\n`;

  fs.writeFileSync(modelYearOutputPath, modelYearModule, "utf8");

  console.log(JSON.stringify({
    ok: true,
    output: outputPath,
    eligibility_output: eligibilityOutputPath,
    model_year_output: modelYearOutputPath,
    eligible_programmatic_pages: manifest.pages.length,
    model_year_comparison_pages: modelYearSeoPages.length,
    model_year_min_versions: MODEL_YEAR_MIN_ELIGIBLE_VERSIONS,
    model_year_min_total_listings: MODEL_YEAR_MIN_TOTAL_LISTINGS,
    static_market_pages: staticUrls.length,
    total_urls: urls.length,
    low_data_excluded: Number(manifest.low_data_count || 0),
    eligibility: manifest.eligibility,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
