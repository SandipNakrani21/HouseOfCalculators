// Reviewed production pilot, matching the existing provider configuration pattern.
// Development stays off. An explicit false disables the pilot at build time.
export const ADSTERRA_ENABLED = (process.env.NEXT_PUBLIC_ADSTERRA_ENABLED ??
  (process.env.NODE_ENV === "production" ? "true" : "false")) === "true";
export const ADSTERRA_KEY = "77c6f84cefe4773be0e3fd3546792638";
export const ADSTERRA_COOKIE = "hoc_adsterra_v1";
export const ADSTERRA_LIFETIME = 180 * 24 * 60 * 60 * 1000;
export const ADSTERRA_POLICY = "default-src 'none'; script-src 'unsafe-inline' https://bauval.org; style-src 'unsafe-inline'; img-src https://bauval.org https://cdn.storageimagedisplay.com https://static.nresystems.com; connect-src https://bauval.org; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; upgrade-insecure-requests";
export function parseAdsterraChoice(raw?: string): "granted" | "denied" | null {
  try {
    const value = JSON.parse(decodeURIComponent(raw ?? "null"));
    return value?.vendor === "adsterra-v1" && ["granted", "denied"].includes(value.choice) &&
      Number.isFinite(value.at) && value.at <= Date.now() && Date.now() - value.at < ADSTERRA_LIFETIME
      ? value.choice : null;
  } catch { return null; }
}
