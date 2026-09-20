/** Stores the visitor's choice as `country:lang`, e.g. `in:hi`. */
export const LOCALE_COOKIE = "calcora_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function serializeLocale(country: string, lang: string): string {
  return `${country}:${lang}`;
}

/** Writes the choice so the proxy can route later visits without asking again. */
export function storeLocale(country: string, lang: string): void {
  document.cookie = [
    `${LOCALE_COOKIE}=${serializeLocale(country, lang)}`,
    "path=/",
    `max-age=${LOCALE_COOKIE_MAX_AGE}`,
    "samesite=lax",
  ].join("; ");
}

export function hasStoredLocale(): boolean {
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${LOCALE_COOKIE}=`));
}
