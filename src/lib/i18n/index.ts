import { LANGUAGES, type LanguageCode } from "@/config/languages";

import ar from "./dictionaries/ar.json";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import gu from "./dictionaries/gu.json";
import hi from "./dictionaries/hi.json";
import mr from "./dictionaries/mr.json";

export type Dictionary = Record<string, string>;

/** English is the source of truth; other languages fall back to it key by key. */
const RAW: Record<LanguageCode, Dictionary> = { en, hi, gu, mr, es, ar };

const MERGED: Record<LanguageCode, Dictionary> = Object.fromEntries(
  (Object.keys(RAW) as LanguageCode[]).map((code) => [
    code,
    { ...RAW.en, ...RAW[code] },
  ]),
) as Record<LanguageCode, Dictionary>;

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
