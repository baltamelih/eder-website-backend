import { useEffect, useMemo } from "react";

const SITE_ORIGIN = "https://ederapp.com";
const SCHEMA_ID = "eder-price-history-breadcrumb-schema";

function titleCaseSlug(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function upsertMeta(name, content, property = false) {
  const selector = property
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;

  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(node);
  }

  node.setAttribute("content", content);
}

function upsertCanonical(href) {
  let node = document.head.querySelector('link[rel="canonical"]');

  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }

  node.setAttribute("href", href);
}

function setJsonLd(payload) {
  let node = document.getElementById(SCHEMA_ID);

  if (!node) {
    node = document.createElement("script");
    node.id = SCHEMA_ID;
    node.type = "application/ld+json";
    document.head.appendChild(node);
  }

  node.textContent = JSON.stringify(payload);
}

function removeJsonLd() {
  document.getElementById(SCHEMA_ID)?.remove();
}

export default function PriceHistorySeo({
  brand,
  model,
  year,
  version,
  brandLabel,
  modelLabel,
  versionLabel,
  detail,
  detailLoading,
  detailResolved,
}) {
  const state = useMemo(() => {
    const cleanPath = [
      "/arac-fiyat-gecmisi",
      brand,
      model,
      year,
      version,
    ]
      .filter(Boolean)
      .join("/");

    const absolute = `${SITE_ORIGIN}${cleanPath}`;

    const resolvedBrand =
      detail?.vehicle?.brand_name ||
      brandLabel ||
      titleCaseSlug(brand);

    const resolvedModel =
      detail?.vehicle?.model_name ||
      modelLabel ||
      titleCaseSlug(model);

    const resolvedVersion =
      detail?.vehicle?.version_label ||
      versionLabel ||
      titleCaseSlug(version);

    const vehicleTitle = [
      resolvedBrand,
      resolvedModel,
      year,
      resolvedVersion,
    ]
      .filter(Boolean)
      .join(" ");

    const exactDetail = Boolean(
      brand && model && year && version,
    );

    const hubPage = Boolean(
      !brand && !model && !year && !version,
    );

    const eligible = Boolean(
      exactDetail &&
      detailResolved &&
      detail?.summary?.chart_eligible,
    );

    const indexable = Boolean(
      hubPage ||
      (exactDetail && (!detailResolved || eligible)),
    );

    const listingCount = Number(
      detail?.summary?.total_listing_count || 0,
    );

    const title = exactDetail
      ? `${vehicleTitle} Fiyat Geçmişi ve Piyasa Grafiği | EDER`
      : vehicleTitle
        ? `${vehicleTitle} Fiyat Geçmişi | EDER`
        : "Araç Fiyat Geçmişi | EDER";

    const description =
      eligible && listingCount > 0
        ? `${vehicleTitle} ikinci el fiyat geçmişini, haftalık piyasa seviyesini ve fiyat bandını EDER'de inceleyin. ${listingCount} ilan verisinden türetilen görünüm.`
        : vehicleTitle
          ? `${vehicleTitle} için ikinci el araç fiyat geçmişi, paket seçenekleri ve piyasa görünümünü EDER'de inceleyin.`
          : "Marka, model, yıl ve paket bazında ikinci el araç ilan fiyat geçmişini EDER ile inceleyin.";

    const breadcrumbItems = [
      {
        name: "Araç fiyat geçmişi",
        path: "/arac-fiyat-gecmisi",
      },
    ];

    if (brand) {
      breadcrumbItems.push({
        name: resolvedBrand,
        path: `/arac-fiyat-gecmisi/${brand}`,
      });
    }

    if (brand && model) {
      breadcrumbItems.push({
        name: resolvedModel,
        path: `/arac-fiyat-gecmisi/${brand}/${model}`,
      });
    }

    if (brand && model && year) {
      breadcrumbItems.push({
        name: String(year),
        path: `/arac-fiyat-gecmisi/${brand}/${model}/${year}`,
      });
    }

    if (brand && model && year && version) {
      breadcrumbItems.push({
        name: resolvedVersion,
        path: cleanPath,
      });
    }

    return {
      absolute,
      title,
      description,
      eligible,
      hubPage,
      exactDetail,
      indexable,
      breadcrumbItems,
    };
  }, [
    brand,
    model,
    year,
    version,
    brandLabel,
    modelLabel,
    versionLabel,
    detail,
    detailLoading,
    detailResolved,
  ]);

  useEffect(() => {
    document.title = state.title;
    upsertCanonical(state.absolute);

    upsertMeta("description", state.description);
    upsertMeta(
      "robots",
      state.indexable ? "index,follow" : "noindex,follow",
    );

    upsertMeta("og:title", state.title, true);
    upsertMeta("og:description", state.description, true);
    upsertMeta("og:url", state.absolute, true);

    upsertMeta("twitter:title", state.title);
    upsertMeta("twitter:description", state.description);

    if (state.breadcrumbItems.length > 1) {
      setJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: state.breadcrumbItems.map(
          (item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${SITE_ORIGIN}${item.path}`,
          }),
        ),
      });
    } else {
      removeJsonLd();
    }

    return () => {
      removeJsonLd();
    };
  }, [state]);

  return null;
}
