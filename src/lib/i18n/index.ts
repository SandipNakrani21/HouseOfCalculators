import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/config/languages";

import ar from "./dictionaries/ar.json";
import de from "./dictionaries/de.json";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";
import gu from "./dictionaries/gu.json";
import hi from "./dictionaries/hi.json";
import mr from "./dictionaries/mr.json";

export type Dictionary = Record<string, string>;

/**
 * English is the source of truth; other languages fall back to it key by key.
 * A language with no entry here simply has no translation yet - it stays in
 * the language registry, but `isLanguageReady` keeps it out of the picker
 * until its file exists and covers enough of the site.
 */
const RAW: Partial<Record<LanguageCode, Dictionary>> = {
  en,
  hi,
  gu,
  mr,
  es,
  ar,
  de,
  fr,
};

const MERGED = LANGUAGE_CODES.reduce(
  (all, code) => {
    all[code] = { ...en, ...(RAW[code] ?? {}) };
    return all;
  },
  {} as Record<LanguageCode, Dictionary>,
);

export function getDictionary(lang: LanguageCode): Dictionary {
  return MERGED[lang] ?? MERGED.en;
}

/**
 * Looks up `key` and fills `{placeholder}` slots from `params`.
 * An unknown key returns the key itself, which makes gaps obvious in the UI
 * rather than rendering an empty string.
 */
export function translate(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  const template = dict[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export function createTranslator(lang: LanguageCode): TranslateFn {
  const dict = getDictionary(lang);
  return (key, params) => translate(dict, key, params);
}

export function directionOf(lang: LanguageCode): "ltr" | "rtl" {
  return LANGUAGES[lang]?.dir ?? "ltr";
}

/**
 * Country name in the forms a sentence might need.
 *
 * Several languages attach postpositions directly to the noun and change its
 * ending doing so: Marathi turns भारत into भारताचे, and Gujarati writes
 * ભારતના with no space. A template therefore uses `{countryObl}` wherever a
 * postposition follows, and `{country}` where the bare name is right.
 * Languages that need no separate form simply fall back to the plain name.
 */
export function countryParams(
  t: TranslateFn,
  code: string,
): { country: string; countryObl: string } {
  const country = t(`country.${code}`);
  const obliqueKey = `country.${code}.obl`;
  const oblique = t(obliqueKey);
  return {
    country,
    countryObl: oblique === obliqueKey ? country : oblique,
  };
}

/**
 * A language is only offered once its dictionary actually covers the site.
 *
 * Every key falls back to English when it is missing, which is the right
 * runtime behaviour but the wrong promise to make in the picker: choosing
 * 日本語 and getting an English page is worse than not being offered it. The
 * threshold is measured against English, so a language switches itself on as
 * soon as its file is filled in - there is no separate list to maintain.
 */
export const READINESS_THRESHOLD = 0.75;

const ENGLISH_KEYS = Object.keys(en);

export const LANGUAGE_COVERAGE = LANGUAGE_CODES.reduce(
  (all, code) => {
    const dict = RAW[code];
    const covered = dict ? ENGLISH_KEYS.filter((key) => key in dict).length : 0;
    all[code] = covered / ENGLISH_KEYS.length;
    return all;
  },
  {} as Record<LanguageCode, number>,
);

export function isLanguageReady(lang: LanguageCode): boolean {
  return lang === "en" || LANGUAGE_COVERAGE[lang] >= READINESS_THRESHOLD;
}
