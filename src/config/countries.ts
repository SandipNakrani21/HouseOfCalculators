import type { LanguageCode } from "./languages";

export type CountryCode =
  | "in"
  | "us"
  | "gb"
  | "ae"
  | "ca"
  | "au"
  | "de"
  | "at"
  | "ch"
  | "fr"
  | "be"
  | "nl"
  | "jp"
  | "es"
  | "mx"
  | "it"
  | "pt"
  | "br"
  | "pl"
  | "tr"
  | "ru"
  | "cn";

export type Country = {
  code: CountryCode;
  /** English name; localized names live in the dictionaries under `country.<code>`. */
  name: string;
  currency: {
    /** ISO 4217 code handed to Intl.NumberFormat. */
    code: string;
    symbol: string;
    /** Minor units shown by default (0 for whole-yen/rupee style display). */
    decimals: number;
  };
  /**
   * Grouping style for large numbers.
   * `indian` gives 12,34,567 and abbreviates to Lakh / Crore,
   * `western` gives 1,234,567 and abbreviates to K / M / B.
   */
  numbering: "indian" | "western";
  /**
   * Which units a person there actually uses day to day. Drives whether a
   * health or construction calculator offers kilograms or pounds, metres or
   * feet. `mixed` is real rather than a hedge: the UK weighs people in
   * stones, drives in miles, and buys petrol in litres.
   */
  measurementSystem: "metric" | "us-customary" | "mixed";
  /** BCP 47 region tag used to build the Intl locale, e.g. `hi` + `IN` -> `hi-IN`. */
  region: string;
  /**
   * Languages offered for this country, in picker order. First entry is the
   * default. English is offered everywhere as a fallback that always has full
   * coverage; multilingual countries list their own languages first.
   */
  languages: LanguageCode[];
  /** Label and rates of the consumption tax, which differs per country. */
  consumptionTax: {
    /** Key into the dictionary, e.g. `tax.gst` / `tax.vat` / `tax.salesTax`. */
    labelKey: string;
    /** Standard rate as a percentage. */
    standardRate: number;
    /** Every rate slab the picker offers. */
    rates: number[];
  };
  /** How the tax year is written, e.g. "2025-26" (IN) vs "2025" (DE). */
  fiscalYear: { start: string; label: string };
};

export const COUNTRIES: Record<CountryCode, Country> = {
  in: {
    code: "in",
    name: "India",
    currency: { code: "INR", symbol: "₹", decimals: 0 },
    numbering: "indian",
    measurementSystem: "metric",
    region: "IN",
    languages: ["en", "hi", "gu", "mr"],
    consumptionTax: { labelKey: "tax.gst", standardRate: 18, rates: [0.25, 3, 5, 12, 18, 28] },
    fiscalYear: { start: "04-01", label: "2025-26" },
  },
  us: {
    code: "us",
    name: "United States",
    currency: { code: "USD", symbol: "$", decimals: 2 },
    numbering: "western",
    measurementSystem: "us-customary",
    region: "US",
    languages: ["en", "es"],
    consumptionTax: { labelKey: "tax.salesTax", standardRate: 7, rates: [0, 4, 6, 7, 8.25, 10] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  gb: {
    code: "gb",
    name: "United Kingdom",
    currency: { code: "GBP", symbol: "£", decimals: 2 },
    numbering: "western",
    measurementSystem: "mixed",
    region: "GB",
    languages: ["en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 20, rates: [0, 5, 20] },
    fiscalYear: { start: "04-06", label: "2025/26" },
  },
  ca: {
    code: "ca",
    name: "Canada",
    currency: { code: "CAD", symbol: "$", decimals: 2 },
    numbering: "western",
    measurementSystem: "mixed",
    region: "CA",
    languages: ["en", "fr"],
    // GST alone is 5%; HST provinces combine it with the provincial share.
    consumptionTax: { labelKey: "tax.gstHst", standardRate: 13, rates: [5, 13, 14, 15] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  au: {
    code: "au",
    name: "Australia",
    currency: { code: "AUD", symbol: "$", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "AU",
    languages: ["en"],
    consumptionTax: { labelKey: "tax.gst", standardRate: 10, rates: [0, 10] },
    fiscalYear: { start: "07-01", label: "2025-26" },
  },
  de: {
    code: "de",
    name: "Germany",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "DE",
    languages: ["de", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 19, rates: [0, 7, 19] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  at: {
    code: "at",
    name: "Austria",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "AT",
    languages: ["de", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 20, rates: [0, 10, 13, 20] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  ch: {
    code: "ch",
    name: "Switzerland",
    currency: { code: "CHF", symbol: "CHF", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "CH",
    languages: ["de", "fr", "it", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 8.1, rates: [0, 2.6, 3.8, 8.1] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  fr: {
    code: "fr",
    name: "France",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "FR",
    languages: ["fr", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 20, rates: [2.1, 5.5, 10, 20] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  be: {
    code: "be",
    name: "Belgium",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "BE",
    languages: ["nl", "fr", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 21, rates: [0, 6, 12, 21] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  nl: {
    code: "nl",
    name: "Netherlands",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "NL",
    languages: ["nl", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 21, rates: [0, 9, 21] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  jp: {
    code: "jp",
    name: "Japan",
    currency: { code: "JPY", symbol: "¥", decimals: 0 },
    numbering: "western",
    measurementSystem: "metric",
    region: "JP",
    languages: ["ja", "en"],
    consumptionTax: { labelKey: "tax.consumptionTax", standardRate: 10, rates: [8, 10] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  es: {
    code: "es",
    name: "Spain",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "ES",
    languages: ["es", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 21, rates: [0, 4, 10, 21] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  mx: {
    code: "mx",
    name: "Mexico",
    currency: { code: "MXN", symbol: "$", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "MX",
    languages: ["es", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 16, rates: [0, 8, 16] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  it: {
    code: "it",
    name: "Italy",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "IT",
    languages: ["it", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 22, rates: [0, 4, 5, 10, 22] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  pt: {
    code: "pt",
    name: "Portugal",
    currency: { code: "EUR", symbol: "€", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "PT",
    languages: ["pt", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 23, rates: [0, 6, 13, 23] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  br: {
    code: "br",
    name: "Brazil",
    currency: { code: "BRL", symbol: "R$", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "BR",
    languages: ["pt", "en"],
    // Brazil layers ICMS, ISS, PIS and COFINS rather than charging one VAT;
    // these are the common ICMS rates, and the calculator says as much.
    consumptionTax: { labelKey: "tax.icms", standardRate: 18, rates: [7, 12, 17, 18, 20] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  pl: {
    code: "pl",
    name: "Poland",
    currency: { code: "PLN", symbol: "zł", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "PL",
    languages: ["pl", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 23, rates: [0, 5, 8, 23] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  tr: {
    code: "tr",
    name: "Türkiye",
    currency: { code: "TRY", symbol: "₺", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "TR",
    languages: ["tr", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 20, rates: [1, 10, 20] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  ru: {
    code: "ru",
    name: "Russia",
    currency: { code: "RUB", symbol: "₽", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "RU",
    languages: ["ru", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 20, rates: [0, 10, 20] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  cn: {
    code: "cn",
    name: "China",
    currency: { code: "CNY", symbol: "¥", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "CN",
    languages: ["zh", "en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 13, rates: [0, 6, 9, 13] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
  ae: {
    code: "ae",
    name: "United Arab Emirates",
    currency: { code: "AED", symbol: "د.إ", decimals: 2 },
    numbering: "western",
    measurementSystem: "metric",
    region: "AE",
    languages: ["en", "ar"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 5, rates: [0, 5] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
};

export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

export function isCountryCode(value: string): value is CountryCode {
  return Object.prototype.hasOwnProperty.call(COUNTRIES, value);
}
