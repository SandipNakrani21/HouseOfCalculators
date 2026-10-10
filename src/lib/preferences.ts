/**
 * Visitor preferences. Locale and country are stored separately because they
 * are separate choices: reading in English (US) while calculating for the UK
 * is a supported combination, not a mistake to normalise away.
 */

export const LOCALE_COOKIE = "hoc_locale";
export const COUNTRY_COOKIE = "hoc_country";
/**
 * Whether the visitor accepted advertising cookies. Only meaningful when
 * advertising is switched on at all; with no publisher id there are no such
 * cookies to consent to, and nothing asks.
 */
export const CONSENT_COOKIE = "hoc_consent";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentChoice = "granted" | "denied";
export const CONSENT_VERSION = 2;
export const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;
export type ConsentRecord = { version: number; choice: ConsentChoice; at: number; scope: "outside-tcf" };

function write(name: string, value: string): void {
  try {
    document.cookie = [
      `${name}=${encodeURIComponent(value)}`,
      "path=/",
      `max-age=${COOKIE_MAX_AGE}`,
      "samesite=lax",
      // Sent only over HTTPS in production; plain-http localhost still works.
      ...(window.location.protocol === "https:" ? ["secure"] : []),
    ].join("; ");
  } catch {
    // Cookies can be blocked; the site still works from the URL alone.
  }
}

function read(name: string): string | null {
  try {
    const entry = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${name}=`));
    return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale: string): void {
  write(LOCALE_COOKIE, locale);
}

export function storeCountry(country: string): void {
  write(COUNTRY_COOKIE, country);
}

export function readStoredCountry(): string | null {
  return read(COUNTRY_COOKIE);
}

export function hasStoredLocale(): boolean {
  return read(LOCALE_COOKIE) !== null;
}

export function storeConsent(choice: ConsentChoice): void {
  write(CONSENT_COOKIE, JSON.stringify({ version: CONSENT_VERSION, choice, at: Date.now(), scope: "outside-tcf" }));
}

export function readConsent(): ConsentChoice | null {
  return readConsentRecord()?.choice ?? null;
}

export function readConsentRecord(): ConsentRecord | null {
  try {
    const record = JSON.parse(read(CONSENT_COOKIE) ?? "null");
    if (!record || record.version !== CONSENT_VERSION || record.scope !== "outside-tcf" ||
      !["granted", "denied"].includes(record.choice) || !Number.isFinite(record.at) ||
      record.at > Date.now() || Date.now() - record.at > CONSENT_LIFETIME_MS) return null;
    return record;
  } catch { return null; }
}

export function clearConsent(): void {
  document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
