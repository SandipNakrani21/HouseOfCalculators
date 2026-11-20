// Production native ads; development requires an explicit opt-in for QA.
// An explicit false disables delivery at build time.
export const ADSTERRA_ENABLED = (process.env.NEXT_PUBLIC_ADSTERRA_ENABLED ??
  (process.env.NODE_ENV === "production" ? "true" : "false")) === "true";
export const ADSTERRA_KEY = "77c6f84cefe4773be0e3fd3546792638";
export const ADSTERRA_COOKIE = "hoc_adsterra_v1";
export const ADSTERRA_LIFETIME = 180 * 24 * 60 * 60 * 1000;
// Browsers and the app server can differ by a few seconds. Keep the window
// bounded: a slightly ahead clock must not discard a brand-new explicit choice.
export const ADSTERRA_CLOCK_SKEW = 30 * 1000;
export const ADSTERRA_POLICY = "default-src 'none'; script-src 'unsafe-inline' https://bauval.org; style-src 'unsafe-inline'; img-src https://bauval.org https://cdn.storageimagedisplay.com https://static.nresystems.com; connect-src https://bauval.org; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; upgrade-insecure-requests";
export function parseAdsterraChoice(raw?: string): "granted" | "denied" | null {
  try {
    const value = JSON.parse(decodeURIComponent(raw ?? "null"));
    const now = Date.now();
    return value?.vendor === "adsterra-v1" && ["granted", "denied"].includes(value.choice) &&
      Number.isFinite(value.at) && value.at > 0 && value.at <= now + ADSTERRA_CLOCK_SKEW && now - value.at < ADSTERRA_LIFETIME
      ? value.choice : null;
  } catch { return null; }
}
