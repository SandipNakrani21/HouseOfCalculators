import type { CalculatorCategory } from "@/config/categories";
import type { Country, CountryCode } from "@/config/countries";
import type { Formatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n/core";

export type { CalculatorCategory as Category } from "@/config/categories";

/** Everything a definition needs to shape itself for the visitor's locale. */
export type CalcContext = {
  countryCode: CountryCode;
  country: Country;
  t: TranslateFn;
  fmt: Formatter;
};

export type FieldKind =
  | "currency"
  | "percent"
  | "number"
  | "years"
  | "months"
  | "select"
  | "toggle"
  /** Free text, for inputs that are a list rather than a single number. */
  | "text";

export type SelectOption = {
  value: string;
  labelKey: string;
  /** Literal label used when the option text is data, not copy (e.g. "18%"). */
  label?: string;
};

export type CalculatorField = {
  id: string;
  labelKey: string;
  kind: FieldKind;
  /** Shown under the input, e.g. a note about a statutory cap. */
  hintKey?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Slider is hidden when false - used for free-form amounts. */
  slider?: boolean;
  default: number | string | boolean;
  options?: SelectOption[];
  /** Hide this field unless the predicate passes, for dependent inputs. */
  visibleWhen?: (values: FieldValues) => boolean;
};

export type FieldValues = Record<string, number | string | boolean>;

/** `label` marks a value that is itself a dictionary key to translate. */
export type ResultKind =
  | "currency"
  | "percent"
  | "number"
  | "years"
  | "text"
  | "label";

export type ResultRow = {
  labelKey: string;
  value: number | string;
  kind: ResultKind;
  /** Renders bigger and bolder - the headline number of the group. */
  emphasis?: boolean;
  /** Decimal places. Defaults to 0, which is right for money but not for a BMI. */
  decimals?: number;
  /** Swatch colour, matched to the chart slice of the same name. */
  tone?: "principal" | "returns" | "tax" | "neutral";
  hintKey?: string;
};

export type ChartSlice = {
  labelKey: string;
  value: number;
  tone: "principal" | "returns" | "tax" | "neutral";
};

export type BreakdownColumn = {
  key: string;
  labelKey: string;
  kind: ResultKind;
  /** Decimal places for this column; defaults to 0. */
  decimals?: number;
};

/**
 * One way of slicing the same schedule - monthly, yearly, whole term. The UI
 * for these is shared; only the rows differ per calculator.
 */
export type BreakdownView = {
  id: string;
  labelKey: string;
  columns: BreakdownColumn[];
  rows: Record<string, number | string>[];
  /** Long schedules are paged rather than rendering hundreds of rows at once. */
  paginate?: boolean;
};

export type CalculatorResult = {
  /** The single number the page leads with. */
  primary: ResultRow;
  rows: ResultRow[];
  /** Donut slices. Omit for calculators where a split makes no sense. */
  chart?: ChartSlice[];
  /** Optional year-by-year table, e.g. a tax band breakdown. */
  table?: {
    columns: BreakdownColumn[];
    rows: Record<string, number | string>[];
  };
  /** Several views of one schedule, shown as tabs. */
  breakdown?: BreakdownView[];
  /** Extra caveats specific to the inputs, e.g. "above the statutory cap". */
  notes?: { key: string; params?: Record<string, string | number> }[];
};

export type CalculatorDef = {
  slug: string;
  /** Emoji used on the grid card. */
  icon: string;
  /**
   * Bumped when the formula or a statutory rule changes in a way that alters
   * published results, so a change is never silent.
   */
  version: number;
  category: CalculatorCategory;
  titleKey: string;
  descKey: string;
  /**
   * Placeholders for the title and description, resolved per country - it is
   * how one definition reads as "GST Calculator" in India and
   * "VAT Calculator" in the UK.
   */
  params?: (ctx: CalcContext) => Record<string, string | number>;
  /** Countries this calculator is offered in. */
  countries: CountryCode[];
  /**
   * True when the country changes the rules, not merely the currency. These
   * live under /countries/{country}/{slug}; the rest sit under their subject
   * category, so the same calculation never gets two competing URLs.
   */
  isCountrySpecific?: boolean;
  /**
   * What the country actually changes for this calculator. It decides the note
   * under the heading and whether a country selector is offered at all.
   *
   *   rules    - statutory figures differ (tax, duty, contributions)
   *   currency - only the money symbol and grouping change
   *   units    - metric or imperial defaults follow the country
   *   none     - nothing changes; a hypotenuse is a hypotenuse
   *
   * Defaults to "rules" for a country-specific calculator and "currency"
   * otherwise, which is what every existing finance definition means.
   */
  countryRelevance?: "rules" | "currency" | "units" | "none";
  /** Slugs to surface as related tools, beyond the automatic suggestions. */
  relatedCalculators?: string[];
  /** Extra words that should match this calculator in search. */
  keywordsKey?: string;
  /** Fields can differ per country - caps, slab names, currency ranges. */
  fields: (ctx: CalcContext) => CalculatorField[];
  compute: (values: FieldValues, ctx: CalcContext) => CalculatorResult;
  /** Dictionary keys rendered in the "how this is calculated" panel. */
  explainerKeys?: string[];
  /**
   * The formula behind the headline result, shown under the explainer. The
   * same shape as a guide's formula, so the two read alike.
   */
  formula?: {
    /** Written as plain text so it reads the same in every language. */
    expression: string;
    /** Symbol plus the dictionary key describing it. */
    variables: { symbol: string; key: string }[];
  };
  /** Pairs of `<key>.q` / `<key>.a` dictionary entries. */
  faqKeys?: string[];
  /**
   * Put inputs and results side by side from a narrower card. Beside the
   * desktop ad rail the card is too narrow for the default split, which
   * stacks the result under the inputs.
   */
  splitEarly?: boolean;
};

/** Narrowing helpers - values arrive from inputs as strings or numbers. */
export function num(values: FieldValues, id: string, fallback = 0): number {
  const raw = values[id];
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function str(values: FieldValues, id: string, fallback = ""): string {
  const raw = values[id];
  return raw === undefined || raw === null ? fallback : String(raw);
}

export function bool(values: FieldValues, id: string, fallback = false): boolean {
  const raw = values[id];
  return typeof raw === "boolean" ? raw : raw === "true" ? true : fallback;
}

/**
 * What the country changes for a calculator, with the default applied.
 * Kept here rather than inline so the page and the runner cannot disagree
 * about whether to offer a country selector.
 */
export function countryRelevanceOf(
  calculator: Pick<CalculatorDef, "countryRelevance" | "isCountrySpecific">,
): "rules" | "currency" | "units" | "none" {
  return (
    calculator.countryRelevance ??
    (calculator.isCountrySpecific ? "rules" : "currency")
  );
}
