import type { LanguageCode } from "./languages";

export type CountryCode = "in" | "us" | "gb" | "ae";

export type Country = {
  code: CountryCode;
  /** English name; localized names live in the dictionaries under `country.<code>`. */
  name: string;
  currency: {
    /** ISO 4217 code handed to Intl.NumberFormat. */
    code: string;
    symbol: string;
    /** Minor units shown by default (0 for whole-rupee/dirham style display). */
    decimals: number;
  };
  /**
   * Grouping style for large numbers.
   * `indian` gives 12,34,567 and abbreviates to Lakh / Crore,
   * `western` gives 1,234,567 and abbreviates to K / M / B.
   */
  numbering: "indian" | "western";
  /** BCP 47 region tag used to build the Intl locale, e.g. `hi` + `IN` -> `hi-IN`. */
  region: string;
  /** Languages offered for this country, in picker order. First entry is the default. */
  languages: LanguageCode[];
  /** Label + name of the consumption tax, since it differs per country. */
  consumptionTax: {
    /** Key into the dictionary, e.g. `tax.gst` / `tax.vat` / `tax.salesTax`. */
    labelKey: string;
    /** Standard rate as a percentage. */
    standardRate: number;
    /** Every rate slab the picker offers. */
    rates: number[];
  };
  /** How the fiscal year is written, e.g. "2025-26" (IN) vs "2025" (US). */
  fiscalYear: { start: string; label: string };
};

export const COUNTRIES: Record<CountryCode, Country> = {
  in: {
    code: "in",
    name: "India",
    currency: { code: "INR", symbol: "₹", decimals: 0 },
    numbering: "indian",
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
    region: "GB",
    languages: ["en"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 20, rates: [0, 5, 20] },
    fiscalYear: { start: "04-06", label: "2025/26" },
  },
  ae: {
    code: "ae",
    name: "United Arab Emirates",
    currency: { code: "AED", symbol: "د.إ", decimals: 2 },
    numbering: "western",
    region: "AE",
    languages: ["en", "ar"],
    consumptionTax: { labelKey: "tax.vat", standardRate: 5, rates: [0, 5] },
    fiscalYear: { start: "01-01", label: "2025" },
  },
};

export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

export const DEFAULT_COUNTRY: CountryCode = "in";

export function isCountryCode(value: string): value is CountryCode {
  return Object.prototype.hasOwnProperty.call(COUNTRIES, value);
}

/** The language to use when a country is chosen but no language is stored yet. */
export function defaultLanguageFor(country: CountryCode): LanguageCode {
  return COUNTRIES[country].languages[0];
}

/** Narrows an arbitrary language to one this country actually offers. */
export function resolveLanguage(country: CountryCode, lang: string): LanguageCode {
  const supported = COUNTRIES[country].languages;
  return (supported as string[]).includes(lang)
    ? (lang as LanguageCode)
    : supported[0];
}
