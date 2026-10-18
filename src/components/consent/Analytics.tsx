"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ANALYTICS_ON, GA_MEASUREMENT_ID } from "@/config/analytics";
import { clearAnalyticsCookies, useConsentState } from "@/lib/consent-state";

/**
 * Google Analytics 4, under Google Consent Mode.
 *
 * ConsentScript has already set every consent type to "denied"
 * before this loads. The analytics tag is not fetched and page views are not
 * sent until analytics storage is explicitly granted. Revocation stops events.
 *
 * Page views are sent by hand with the address minus its query string and
 * hash: shared calculator inputs stay out of this analytics page address.
 * Legacy query links remain readable and may be recorded by hosting systems.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function Analytics() {
  const pathname = usePathname();
  const consent = useConsentState();
  const allowed = consent.ready && consent.purposes.analytics_storage === "granted";

  useEffect(() => {
    if (!ANALYTICS_ON || !allowed) return;
    if (document.getElementById("ga-loader")) return;
    window.dataLayer = window.dataLayer ?? [];
    // gtag must push the arguments object itself, as Google's snippet does.
    window.gtag =
      window.gtag ??
      function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
    window.gtag("js", new Date());
    // Every event, including the ones GA sends by itself (user_engagement,
    // scroll), takes page_location from here; set before config so not even
    // the first one carries the query string.
    window.gtag("set", { page_location: cleanLocation(), page_referrer: cleanReferrer() });
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, page_location: cleanLocation(), page_referrer: cleanReferrer(),
      allow_google_signals: false, allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.id = "ga-loader";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }, [allowed]);

  useEffect(() => {
    if (!ANALYTICS_ON || !window.gtag) return;
    // Stop a previously loaded tag as well as future SPA page views on revoke.
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = !allowed;
    if (!allowed) { clearAnalyticsCookies(); return; }
    const location = cleanLocation();
    window.gtag("set", { page_location: location, page_referrer: cleanReferrer() });
    window.gtag("event", "page_view", { page_location: location, page_referrer: cleanReferrer(), page_path: pathname, page_title: document.title });
  }, [pathname, allowed]);

  return null;
}

/** The current address without its query string or hash (see the note above). */
function cleanLocation(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

function cleanReferrer(): string {
  try {
    const url = new URL(document.referrer);
    return `${url.origin}${url.pathname}`;
  } catch { return ""; }
}
