"use client";

import { useReportWebVitals } from "next/web-vitals";

import { ANALYTICS_ON } from "@/config/analytics";
import { getConsentState } from "@/lib/consent-state";

type ReportMetric = Parameters<typeof useReportWebVitals>[0];

// Stable callback: rerenders and consent changes must not register observers
// again. No event, URL, identifier or performance entry is sent before opt-in.
const reportMetric: ReportMetric = (metric) => {
  const consent = getConsentState();
  if (!ANALYTICS_ON || !consent.ready || consent.purposes.analytics_storage !== "granted" || !window.gtag) return;

  // The navigation URL identifies the measured page, even after an SPA route
  // change. Never send query strings, fragments, DOM targets or raw entries.
  const url = new URL(metric.navigationURL || window.location.href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  window.gtag("event", "web_vitals", {
    metric_name: metric.name,
    metric_id: metric.id,
    metric_value: metric.value,
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
    page_location: `${url.origin}${url.pathname}`,
    page_path: url.pathname,
    ad_frame_present: document.querySelector('iframe[src="/api/adsterra-native"]') ? 1 : 0,
    non_interaction: true,
  });
};

/** Local browser observations; transmission uses the current analytics choice. */
export function WebVitals() {
  useReportWebVitals(reportMetric);
  return null;
}
