/**
 * Visitor preferences. Locale and country are stored separately because they
 * are separate choices: reading in English (US) while calculating for the UK
 * is a supported combination, not a mistake to normalise away.
 */

export const LOCALE_COOKIE = "hoc_locale";
export const COUNTRY_COOKIE = "hoc_country";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function write(name: string, value: string): void {
  try {
    document.cookie = [
      `${name}=${value}`,
      "path=/",
      `max-age=${COOKIE_MAX_AGE}`,
      "samesite=lax",
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
