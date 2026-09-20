/**
 * Every language the site can render in.
 * `dir` drives the html[dir] attribute so RTL languages lay out correctly.
 */
export type LanguageCode =
  | "en"
  | "hi"
  | "gu"
  | "mr"
  | "es"
  | "ar"
  | "de"
  | "fr"
  | "nl"
  | "ja"
  | "it"
  | "pt"
  | "pl"
  | "tr"
  | "ru"
  | "zh";

export type Language = {
  code: LanguageCode;
  /** Name written in the language itself - what we show in the picker. */
  native: string;
  /** English name, used for search and aria labels. */
  english: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag handed to Intl.NumberFormat / Intl.DateTimeFormat. */
  intlTag: string;
};

export const LANGUAGES: Record<LanguageCode, Language> = {
  en: { code: "en", native: "English", english: "English", dir: "ltr", intlTag: "en" },
  hi: { code: "hi", native: "हिन्दी", english: "Hindi", dir: "ltr", intlTag: "hi" },
  gu: { code: "gu", native: "ગુજરાતી", english: "Gujarati", dir: "ltr", intlTag: "gu" },
  mr: { code: "mr", native: "मराठी", english: "Marathi", dir: "ltr", intlTag: "mr" },
  es: { code: "es", native: "Español", english: "Spanish", dir: "ltr", intlTag: "es" },
  ar: { code: "ar", native: "العربية", english: "Arabic", dir: "rtl", intlTag: "ar" },
  de: { code: "de", native: "Deutsch", english: "German", dir: "ltr", intlTag: "de" },
  fr: { code: "fr", native: "Français", english: "French", dir: "ltr", intlTag: "fr" },
  nl: { code: "nl", native: "Nederlands", english: "Dutch", dir: "ltr", intlTag: "nl" },
  ja: { code: "ja", native: "日本語", english: "Japanese", dir: "ltr", intlTag: "ja" },
  it: { code: "it", native: "Italiano", english: "Italian", dir: "ltr", intlTag: "it" },
  pt: { code: "pt", native: "Português", english: "Portuguese", dir: "ltr", intlTag: "pt" },
  pl: { code: "pl", native: "Polski", english: "Polish", dir: "ltr", intlTag: "pl" },
  tr: { code: "tr", native: "Türkçe", english: "Turkish", dir: "ltr", intlTag: "tr" },
  ru: { code: "ru", native: "Русский", english: "Russian", dir: "ltr", intlTag: "ru" },
  zh: { code: "zh", native: "简体中文", english: "Chinese (Simplified)", dir: "ltr", intlTag: "zh-Hans" },
};

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

export function isLanguageCode(value: string): value is LanguageCode {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, value);
}
