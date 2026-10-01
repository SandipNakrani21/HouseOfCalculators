/**
 * The Google AdSense publisher id for thecalculatorshouse.com. It is public
 * (every page that shows ads carries it), so it lives in the code rather than
 * in a secret. NEXT_PUBLIC_ADSENSE_CLIENT overrides it, for example to test
 * another account.
 *
 * Used by lib/ads (ad script, slots, ads.txt, verification tag), the consent
 * script, and next.config.ts (the Content-Security-Policy must allow Google's
 * ad hosts once ads are on). Production builds only, so local development
 * keeps its labelled placeholders and loads no ad script.
 */
const PUBLISHER_ID = "ca-pub-6814796122648657";

export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? (process.env.NODE_ENV === "production" ? PUBLISHER_ID : "");

/**
 * The three responsive display units (AdSense → Ads → By ad unit), one per
 * shape. Every ad position of a shape uses its unit. Also public, and also
 * overridable by environment variable.
 */
export const ADSENSE_UNITS = {
  /** "TCH Leaderboard", horizontal: wide banners on home, listings and pages. */
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD ?? "7947802965",
  /** "TCH Rectangle", square: boxes inside calculators and guides. */
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE ?? "4695787813",
  /** "TCH Sidebar", vertical: the tall rail beside calculators. */
  rail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL ?? "3191134454",
};
