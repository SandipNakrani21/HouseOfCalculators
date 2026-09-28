import type { NextConfig } from "next";

/*
 * Security headers for every response.
 *
 * The Content Security Policy is the static "without nonces" form from the
 * Next.js guide: nonces would force every page to render per request and
 * give up static generation. Scripts may only come from this origin (plus
 * Google's ad and consent hosts once AdSense is configured); inline scripts
 * are allowed because Next's own hydration data is inline. Everything else is
 * locked down: no plugins, no framing by other sites, no foreign form posts,
 * no <base> hijacking.
 */

const isDev = process.env.NODE_ENV === "development";
const adsEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);

/** The newsletter form may post to its provider, and nowhere else. */
function newsletterOrigin(): string {
  const action = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION;
  if (!action) return "";
  try {
    const url = new URL(action);
    return url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
}

const ADS = adsEnabled
  ? {
      script: "https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
      frame: "https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
      img: "https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
      connect: "https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
    }
  : { script: "", frame: "", img: "", connect: "" };

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${ADS.script}`,
  // No inline event-handler attributes (onclick="..."): React never writes
  // them, so this only blocks injected markup. Left off once AdSense is on,
  // since its script is not ours to vouch for.
  ...(adsEnabled ? [] : ["script-src-attr 'none'"]),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${ADS.img}`,
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""} ${ADS.connect}`,
  `frame-src ${ADS.frame || "'none'"}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${newsletterOrigin()}`,
  "frame-ancestors 'none'",
  // Upgrading would break plain-http localhost during development.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .map((directive) => directive.replace(/\s+/g, " ").trim())
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Browsers ignore HSTS over plain http, so this only takes effect in production.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "geolocation=()",
      "gyroscope=()",
      "hid=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "serial=()",
      "usb=()",
      "xr-spatial-tracking=()",
      "browsing-topics=()",
      "fullscreen=(self)",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Other sites may not load this site's scripts, styles or pages into theirs.
  // The share card and icons are the exception (below): previews embed them.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** Meant to be shown on other sites: link previews, bookmarks, tabs. */
const EMBEDDABLE = ["/opengraph-image", "/icon.svg", "/favicon.ico"];

const nextConfig: NextConfig = {
  // Do not advertise the framework and version to scanners.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Later rules override earlier ones for the same header.
      ...EMBEDDABLE.map((source) => ({
        source,
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      })),
    ];
  },
};

export default nextConfig;
