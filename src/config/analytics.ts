/**
 * Google Analytics 4. Off until a Measurement ID ("G-…") is set here or in
 * NEXT_PUBLIC_GA_ID, and only in production builds.
 *
 * One switch for everything that depends on it, so the site never says one
 * thing and does another: the tracker (components/consent/Analytics), the
 * privacy and cookie pages' analytics sections (config/legal), the cookie
 * banner's wording, and the Content-Security-Policy allow-list.
 */
const MEASUREMENT_ID = "";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID ?? (process.env.NODE_ENV === "production" ? MEASUREMENT_ID : "");

export const ANALYTICS_ON = /^G-[A-Z0-9]{4,}$/.test(GA_MEASUREMENT_ID);

/** GA4's per-property session cookie: _ga_ plus the ID without "G-". */
export const GA_SESSION_COOKIE = `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, "")}`;
