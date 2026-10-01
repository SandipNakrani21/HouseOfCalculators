"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ANALYTICS_ON, GA_MEASUREMENT_ID } from "@/config/analytics";

/**
 * Google Analytics 4, under Google Consent Mode.
 *
 * ConsentScript has already set every consent type to "denied" (or restored
 * the visitor's earlier answer) before this loads, so no analytics cookie is
 * written until the visitor accepts on the banner or in Google's EU message;
 * until then Google receives only cookieless signals.
 *
 * Page views are sent by hand with the address minus its query string and
 * hash: a shared calculator link carries the visitor's inputs in the query,
 * and the privacy page promises that what people type is never sent.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ANALYTICS_ON) return;
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
    window.gtag("set", { page_location: cleanLocation() });
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false, page_location: cleanLocation() });
    const script = document.createElement("script");
    script.id = "ga-loader";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ANALYTICS_ON || !window.gtag) return;
    const location = cleanLocation();
    window.gtag("set", { page_location: location });
    window.gtag("event", "page_view", { page_location: location, page_path: pathname, page_title: document.title });
  }, [pathname]);

  return null;
}

/** The current address without its query string or hash (see the note above). */
function cleanLocation(): string {
  return `${window.location.origin}${window.location.pathname}`;
}
