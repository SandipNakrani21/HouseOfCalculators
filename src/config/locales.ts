import type { CountryCode } from "./countries";
import type { LanguageCode } from "./languages";

/**
 * A locale is a language plus a market, and it is the only thing that appears
 * in the URL. It is deliberately not the same as the country: the country is a
 * separate, overridable context that drives currency, units and statutory
 * rules, so a visitor can read in English (US) while calculating for the UK.
 *
 *   Language ≠ Country ≠ Currency ≠ Rules ≠ Formatting
 */
export type LocaleCode =
  | "en-US"
  | "en-GB"
  | "de-DE"
  | "fr-FR"
  | "es-ES"
  | "pt-BR"
  | "ru-RU"
  | "tr-TR"
  | "ja-JP"
  | "zh-CN"
  | "it-IT"
  | "nl-NL"
  | "hi-IN"
  | "gu-IN"
  | "mr-IN"
  | "ar-AE";

export type Locale = {
  code: LocaleCode;
  /** Lowercase form used in URLs, e.g. `en-us`. */
  path: string;
  language: LanguageCode;
  /** Country context a visitor gets before choosing one of their own. */
  defaultCountry: CountryCode;
  /** Name in its own language, for the selector. */
  native: string;
  english: string;
  dir: "ltr" | "rtl";
  /** One of the twelve launch locales, as opposed to an additional one. */
  launch: boolean;
};

export const LOCALES: Record<LocaleCode, Locale> = {
  "en-US": { code: "en-US", path: "en-us", language: "en", defaultCountry: "us", native: "English (US)", english: "English (US)", dir: "ltr", launch: true },
  "en-GB": { code: "en-GB", path: "en-gb", language: "en", defaultCountry: "gb", native: "English (UK)", english: "English (UK)", dir: "ltr", launch: true },
  "de-DE": { code: "de-DE", path: "de-de", language: "de", defaultCountry: "de", native: "Deutsch", english: "German", dir: "ltr", launch: true },
  "fr-FR": { code: "fr-FR", path: "fr-fr", language: "fr", defaultCountry: "fr", native: "Français", english: "French", dir: "ltr", launch: true },
  "es-ES": { code: "es-ES", path: "es-es", language: "es", defaultCountry: "es", native: "Español", english: "Spanish", dir: "ltr", launch: true },
  "pt-BR": { code: "pt-BR", path: "pt-br", language: "pt", defaultCountry: "br", native: "Português", english: "Portuguese", dir: "ltr", launch: true },
  "ru-RU": { code: "ru-RU", path: "ru-ru", language: "ru", defaultCountry: "ru", native: "Русский", english: "Russian", dir: "ltr", launch: true },
  "tr-TR": { code: "tr-TR", path: "tr-tr", language: "tr", defaultCountry: "tr", native: "Türkçe", english: "Turkish", dir: "ltr", launch: true },
  "ja-JP": { code: "ja-JP", path: "ja-jp", language: "ja", defaultCountry: "jp", native: "日本語", english: "Japanese", dir: "ltr", launch: true },
  "zh-CN": { code: "zh-CN", path: "zh-cn", language: "zh", defaultCountry: "cn", native: "简体中文", english: "Chinese (Simplified)", dir: "ltr", launch: true },
  "it-IT": { code: "it-IT", path: "it-it", language: "it", defaultCountry: "it", native: "Italiano", english: "Italian", dir: "ltr", launch: true },
  "nl-NL": { code: "nl-NL", path: "nl-nl", language: "nl", defaultCountry: "nl", native: "Nederlands", english: "Dutch", dir: "ltr", launch: true },

  // Beyond the launch twelve. Already built and translated, so they ship.
  "hi-IN": { code: "hi-IN", path: "hi-in", language: "hi", defaultCountry: "in", native: "हिन्दी", english: "Hindi", dir: "ltr", launch: false },
  "gu-IN": { code: "gu-IN", path: "gu-in", language: "gu", defaultCountry: "in", native: "ગુજરાતી", english: "Gujarati", dir: "ltr", launch: false },
  "mr-IN": { code: "mr-IN", path: "mr-in", language: "mr", defaultCountry: "in", native: "मराठी", english: "Marathi", dir: "ltr", launch: false },
  "ar-AE": { code: "ar-AE", path: "ar-ae", language: "ar", defaultCountry: "ae", native: "العربية", english: "Arabic", dir: "rtl", launch: false },
};

export const LOCALE_CODES = Object.keys(LOCALES) as LocaleCode[];

/** The locale a request falls back to, and the target of `hreflang="x-default"`. */
export const DEFAULT_LOCALE: LocaleCode = "en-US";

const BY_PATH = new Map(
  LOCALE_CODES.map((code) => [LOCALES[code].path, LOCALES[code]]),
);

export function localeFromPath(segment: string): Locale | undefined {
  return BY_PATH.get(segment.toLowerCase());
}

export function isLocalePath(segment: string): boolean {
  return BY_PATH.has(segment.toLowerCase());
}

export function localePath(code: LocaleCode): string {
  return LOCALES[code].path;
}

/**
 * Best locale for an `Accept-Language` header. Exact `lang-REGION` matches win;
 * otherwise the first locale sharing the language is used, so a browser asking
 * for `de-AT` still lands on German rather than English.
 */
export function matchAcceptLanguage(header: string | null): LocaleCode | null {
  if (!header) return null;

  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of wanted) {
    const exact = LOCALE_CODES.find((code) => code.toLowerCase() === tag);
    if (exact) return exact;

    const language = tag.split("-")[0];
    const sameLanguage = LOCALE_CODES.find(
      (code) => LOCALES[code].language === language,
    );
    if (sameLanguage) return sameLanguage;
  }
  return null;
}
