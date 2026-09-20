import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  adRuntime,
  getAdSenseManualSlotId,
  getAdSlotDefinition,
  isAdSenseRuntimeReady,
} from "../../config/adSlots";
import "./ad-slot.css";

function isPreviewMode() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return import.meta.env.DEV || params.get("adPreview") === "1";
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useMobileStickyVisibility(active) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return undefined;
    }

    let footerObserver;
    let footerVisible = false;

    const footer = document.querySelector(
      "footer, [data-site-footer='true']",
    );

    const update = () => {
      const scrollGate = Math.max(
        420,
        Math.round(window.innerHeight * 0.55),
      );

      const hasScrolledEnough = window.scrollY >= scrollGate;

      let footerNearViewport = footerVisible;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        footerNearViewport =
          footerVisible ||
          rect.top <= window.innerHeight + 24;
      }

      setVisible(hasScrolledEnough && !footerNearViewport);
    };

    if (footer && "IntersectionObserver" in window) {
      footerObserver = new IntersectionObserver(
        (entries) => {
          footerVisible = entries.some((entry) => entry.isIntersecting);
          update();
        },
        {
          root: null,
          threshold: 0,
          rootMargin: "0px 0px 80px 0px",
        },
      );

      footerObserver.observe(footer);
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    update();

    return () => {
      footerObserver?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);

  return visible;
}

function AdSenseManualUnit({
  definition,
  slotId,
}) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("AdSense unit could not initialize.", error);
      }
    }
  }, []);

  return (
    <ins
      id={definition.id}
      className="adsbygoogle eder-ad-slot__adsense"
      style={{ display: "block" }}
      data-ad-client={adRuntime.adsenseClient}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export default function AdSlot({
  slot,
  className = "",
  side,
}) {
  const definition = getAdSlotDefinition(slot);
  const preview = useMemo(() => isPreviewMode(), []);
  const isMobile = useMediaQuery("(max-width: 760px)");

  const isMobileSticky =
    definition?.format === "mobile-sticky" && isMobile;

  const stickyVisible = useMobileStickyVisibility(
    preview && isMobileSticky,
  );

  if (!definition || definition.reserved) {
    return null;
  }

  if (definition.format === "mobile-sticky" && !isMobile) {
    return null;
  }

  if (definition.format === "rail" && isMobile) {
    return null;
  }

  if (preview && isMobileSticky && !stickyVisible) {
    return null;
  }

  const providerReady = isAdSenseRuntimeReady();
  const manualSlotId = getAdSenseManualSlotId(slot);

  const autoManaged = definition.delivery === "adsense-auto";
  const manualManaged = definition.delivery === "manual";

  if (!preview && autoManaged) {
    // AdSense Auto Ads owns anchor, side rail and vignette formats.
    return null;
  }

  if (
    !preview &&
    manualManaged &&
    (!providerReady || !manualSlotId)
  ) {
    // Never reserve a blank production box.
    return null;
  }

  if (!preview && !adRuntime.enabled) {
    return null;
  }

  const displaySize = isMobile
    ? definition.mobile || definition.desktop
    : definition.desktop || definition.mobile;

  const classes = [
    "eder-ad-slot",
    `eder-ad-slot--${definition.format}`,
    side ? `eder-ad-slot--${side}` : "",
    preview ? "eder-ad-slot--preview" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const previewTitle = autoManaged
    ? `AdSense Auto · ${definition.label}`
    : definition.label;

  return (
    <aside
      className={classes}
      aria-label="Reklam"
      data-ad-slot={definition.placement}
      data-ad-provider={adRuntime.provider}
      data-ad-delivery={definition.delivery}
      data-ad-preview={preview ? "true" : "false"}
    >
      <div className="eder-ad-slot__surface">
        <span className="eder-ad-slot__label">Reklam</span>

        {preview ? (
          <div className="eder-ad-slot__preview-copy">
            <strong>{previewTitle}</strong>
            <span>{displaySize || "AdSense Auto Ads"}</span>
          </div>
        ) : (
          <AdSenseManualUnit
            definition={definition}
            slotId={manualSlotId}
          />
        )}
      </div>
    </aside>
  );
}
