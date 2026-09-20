import type { Country, CountryCode } from "@/config/countries";
import type { Formatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n";

export type Category =
  | "investment"
  | "savings"
  | "loan"
  | "tax"
  | "retirement"
  | "income"
  | "business"
  | "general";

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
  | "toggle";

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

export type ResultKind = "currency" | "percent" | "number" | "years" | "text";

export type ResultRow = {
  labelKey: string;
  value: number | string;
  kind: ResultKind;
  /** Renders bigger and bolder - the headline number of the group. */
  emphasis?: boolean;
  /** Swatch colour, matched to the chart slice of the same name. */
  tone?: "principal" | "returns" | "tax" | "neutral";
  hintKey?: string;
};

export type ChartSlice = {
  labelKey: string;
  value: number;
  tone: "principal" | "returns" | "tax" | "neutral";
};

export type CalculatorResult = {
  /** The single number the page leads with. */
  primary: ResultRow;
  rows: ResultRow[];
  /** Donut slices. Omit for calculators where a split makes no sense. */
  chart?: ChartSlice[];
  /** Optional year-by-year table, e.g. a loan amortisation schedule. */
  table?: {
    columns: { key: string; labelKey: string; kind: ResultKind }[];
    rows: Record<string, number | string>[];
  };
  /** Extra caveats specific to the inputs, e.g. "above the statutory cap". */
  notes?: { key: string; params?: Record<string, string | number> }[];
};

export type CalculatorDef = {
  slug: string;
  /** Emoji used on the home grid card. */
  icon: string;
  category: Category;
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
  /** Extra words that should match this calculator in search. */
  keywordsKey?: string;
  /** Fields can differ per country - caps, slab names, currency ranges. */
  fields: (ctx: CalcContext) => CalculatorField[];
  compute: (values: FieldValues, ctx: CalcContext) => CalculatorResult;
  /** Dictionary keys rendered in the "how this is calculated" panel. */
  explainerKeys?: string[];
  /** Pairs of `<key>.q` / `<key>.a` dictionary entries. */
  faqKeys?: string[];
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
