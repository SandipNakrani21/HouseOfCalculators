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
