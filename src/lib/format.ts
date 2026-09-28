import { COUNTRIES, type CountryCode } from "@/config/countries";
import { LANGUAGES, type LanguageCode } from "@/config/languages";
import type { TranslateFn } from "@/lib/i18n/core";

/**
 * Intl locale for a country + language pair, e.g. `hi` in `IN` -> `hi-IN`.
 *
 * Digits are pinned to Latin everywhere. Marathi would otherwise render ५०० and
 * Arabic ٥٠٠, while the number inputs and sliders those figures sit beside can
 * only ever show 500 - and a calculator that disagrees with itself about what a
 * digit looks like is worse than one that uses the less local numerals.
 */
export function intlLocale(country: CountryCode, lang: LanguageCode): string {
  return `${LANGUAGES[lang].intlTag}-${COUNTRIES[country].region}-u-nu-latn`;
}

export type Formatter = {
  /** ₹12,34,567 / $1,234,567.00 */
  currency: (value: number, opts?: { decimals?: number }) => string;
  /** ₹12.35 L / $1.23 M - for chart labels and tight spaces. */
  currencyShort: (value: number) => string;
  /** 12,34,567 with no currency mark. */
  number: (value: number, opts?: { decimals?: number }) => string;
  /** 12.5% */
  percent: (value: number, opts?: { decimals?: number }) => string;
  /** The bare currency symbol, for input prefixes. */
  symbol: string;
  locale: string;
};

/**
 * Where the currency mark sits and what separates it from the number, learned
 * from the locale itself so Arabic can put د.إ after the figure and English
 * can put $ in front.
 */
type CurrencyShape = { symbol: string; before: boolean; gap: string };

function currencyShape(locale: string, code: string, fallback: string): CurrencyShape {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).formatToParts(1);

    const markIndex = parts.findIndex((part) => part.type === "currency");
    const numberIndex = parts.findIndex((part) => part.type === "integer");
    if (markIndex < 0 || numberIndex < 0) {
      return { symbol: fallback, before: true, gap: "" };
    }

    const before = markIndex < numberIndex;
    const between = before ? parts[markIndex + 1] : parts[markIndex - 1];
    return {
      symbol: parts[markIndex].value,
      before,
      gap: between?.type === "literal" ? between.value : "",
    };
  } catch {
    return { symbol: fallback, before: true, gap: "" };
  }
}

export function createFormatter(
  country: CountryCode,
  lang: LanguageCode,
  /** For the lakh / crore / K / M unit words in `currencyShort`. */
  t: TranslateFn,
): Formatter {
  const { currency } = COUNTRIES[country];
  const locale = intlLocale(country, lang);

  // Composed from the plain number formatter rather than `style: "currency"`:
  // some locales (mr-IN among them) abandon Indian lakh grouping inside the
  // currency pattern, and ₹30,00,000 turning into ₹3,000,000 is exactly the
  // kind of wrong a money calculator cannot afford.
  const shape = currencyShape(locale, currency.code, currency.symbol);

  const number = (value: number, opts?: { decimals?: number }) => {
    const decimals = opts?.decimals ?? 0;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safe(value));
  };

  const withSymbol = (body: string) =>
    shape.before
      ? `${shape.symbol}${shape.gap}${body}`
      : `${body}${shape.gap}${shape.symbol}`;

  return {
    locale,
    symbol: shape.symbol,
    number,
    currency: (value, opts) =>
      withSymbol(number(value, { decimals: opts?.decimals ?? currency.decimals })),
    currencyShort: (value) => {
      const { amount, unitKey } = abbreviate(safe(value), country);
      const body = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: unitKey ? 2 : 0,
      }).format(amount);
      // The unit joins the number before the symbol does, so a suffix currency
      // reads "25 ألف د.إ." rather than "25 د.إ. ألف".
      const unit = unitKey ? ` ${t(unitKey)}` : "";
      return withSymbol(`${body}${unit}`);
    },
    percent: (value, opts) =>
      `${number(value, { decimals: opts?.decimals ?? 2 })}%`,
  };
}

function safe(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/**
 * Splits a number into a short mantissa plus a unit key.
 * India counts in lakh (1e5) and crore (1e7); everywhere else uses K/M/B.
 */
function abbreviate(
  value: number,
  country: CountryCode,
): { amount: number; unitKey: string | null } {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  const steps =
    COUNTRIES[country].numbering === "indian"
      ? ([
          [1e7, "units.crore"],
          [1e5, "units.lakh"],
          [1e3, "units.thousand"],
        ] as const)
      : ([
          [1e9, "units.billion"],
          [1e6, "units.million"],
          [1e3, "units.thousand"],
        ] as const);

  for (const [divisor, unitKey] of steps) {
    if (abs >= divisor) return { amount: (sign * abs) / divisor, unitKey };
  }
  return { amount: sign * abs, unitKey: null };
}
