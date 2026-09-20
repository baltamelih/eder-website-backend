import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  analyticsStatus,
  trackPageView,
} from "../../services/analytics";

export default function AnalyticsRuntime() {
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackPageView(
        location.pathname,
        document.title,
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (analyticsStatus().debugPreview) {
      console.info(
        "[EDER analytics runtime]",
        analyticsStatus(),
      );
    }
  }, []);

  return null;
}
