import { COUNTRIES, type CountryCode } from "@/config/countries";
import { MONEY_SCALE } from "@/config/calculators/scale";
import type { CalculatorDef, CalculatorField, CalculatorResult, FieldValues, ResultRow } from "@/config/calculators/types";

export type NumberRules = { min: number; max: number; decimals: number; integer?: boolean; maxDigits?: number };
export type ValidationError = "required" | "number" | "min" | "max" | "integer" | "digits" | "decimals" | "precision" | "list";
export const MAX_FACTOR_NUMBER = 1_000_000_000;
export const MAX_LIST_ITEMS = 100;
export const MAX_LIST_CHARACTERS = 5000;
export const MAX_WORD_NUMBER = 999_999_999_999.99;
export function normalizeNumericInput(raw: string, locale: string): string {
  const decimal = new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === "decimal")?.value;
  return decimal === "," && !raw.includes(".") ? raw.replace(",", ".") : raw;
}

export function currencyDecimals(country: CountryCode): number {
  return new Intl.NumberFormat("en", { style: "currency", currency: COUNTRIES[country].currency.code }).resolvedOptions().maximumFractionDigits ?? 2;
}
export function integerDigits(rules: NumberRules): number {
  return rules.maxDigits ?? String(Math.floor(Math.max(Math.abs(rules.min), Math.abs(rules.max)))).length;
}
/** Validate the written input as well as its value: exponents and unsafe integers are never silently rounded. */
export function numberError(raw: string | number, rules: NumberRules): ValidationError | null {
  const text = String(raw).trim();
  if (!text) return "required";
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) || !Number.isFinite(Number(text))) return "number";
  const value = Number(text);
  if (value < rules.min) return "min";
  if (value > rules.max) return "max";
  if (rules.integer && !Number.isSafeInteger(value)) return "integer";
  const [whole, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  if (whole.length > integerDigits(rules)) return "digits";
  if (fraction.length > rules.decimals) return rules.integer ? "integer" : "decimals";
  if (whole.length + fraction.length > 15) return "precision";
  return null;
}
export function calculatorRules(field: CalculatorField, country: CountryCode): NumberRules {
  const integer = field.integer ?? (["months", "years"].includes(field.kind) && Number.isInteger(field.step ?? 1));
  return { min: field.min ?? 0, max: field.max ?? (field.kind === "currency" ? MONEY_SCALE[country].lumpMax : 1e12), integer,
    decimals: integer ? 0 : field.kind === "currency" ? currencyDecimals(country) : field.kind === "percent" ? 2 : 6 };
}
export function resolveFields(fields: CalculatorField[], values: FieldValues): CalculatorField[] {
  return fields.map(field => field.resolve ? { ...field, ...field.resolve(values) } : field);
}
export function toolRules(rule: string, country: CountryCode): NumberRules {
  const money = MONEY_SCALE[country];
  const currency = { min: 0, max: money.lumpMax, decimals: currencyDecimals(country) };
  if (["target", "currentSavings", "balance"].includes(rule)) return currency;
  if (["monthlyDeposit", "monthlyPayment", "monthlyIncome"].includes(rule)) return { ...currency, max: rule === "monthlyIncome" ? money.incomeMax / 12 : money.monthlyMax };
  const limits: Record<string, [number, number]> = { factor: [1, MAX_FACTOR_NUMBER], min: [-2147483647, 2147483647], max: [-2147483647, 2147483647], howMany: [1, 100], length: [8, 64], byMonths: [1, 720], holidays: [0, 3660000], amount: [0, 3660000], decimals: [0, 10], diceCount: [1, 100], flipCount: [1, 1000], teamCount: [2, 20], roman: [1, 3999], numerator: [-1e9, 1e9], denominator: [-1e9, 1e9] };
  if (rule in limits) return { min: limits[rule][0], max: limits[rule][1], decimals: 0, integer: true };
  if (rule === "interestRate" || rule === "budgetPercent") return { min: 0, max: 100, decimals: 2 };
  if (rule === "percentage") return { min: -10000, max: 10000, decimals: 2 };
  if (rule === "words") return { min: -MAX_WORD_NUMBER, max: MAX_WORD_NUMBER, decimals: 2 };
  return { min: -1e12, max: 1e12, decimals: 6 };
}
export function numberListError(raw: string): ValidationError | null {
  const items = raw.trim().split(/[\s,;]+/).filter(Boolean);
  if (!items.length) return "required";
  if (raw.length > MAX_LIST_CHARACTERS || items.length > MAX_LIST_ITEMS || items.some(x => numberError(x, { min: -1e12, max: 1e12, decimals: 6 }))) return "list";
  return null;
}
export function calculatorFieldError(field: CalculatorField, value: number | string | boolean, country: CountryCode = "us"): ValidationError | null {
  if (field.kind === "toggle") return typeof value === "boolean" ? null : "number";
  if (field.kind === "select") return field.options?.some(o => o.value === String(value)) ? null : "number";
  if (field.kind === "text") return numberListError(String(value));
  return numberError(String(value), calculatorRules(field, country));
}
/** Domain failures stay explicit in the UI and exports instead of becoming numeric zero. */
export function validatedResult(result: CalculatorResult): CalculatorResult {
  let invalid = false;
  const row = (r: ResultRow): ResultRow => {
    if (typeof r.value === "number" && !Number.isFinite(r.value)) { invalid = true; return { ...r, value: "—", kind: "text" }; }
    return r;
  };
  const rows = result.rows.map(row), primary = row(result.primary);
  const cells = (records: Record<string, number | string>[]) => records.map(record => Object.fromEntries(Object.entries(record).map(([key, value]) => {
    if (typeof value === "number" && !Number.isFinite(value)) { invalid = true; return [key, "—"]; }
    return [key, value];
  })));
  const table = result.table ? { ...result.table, rows: cells(result.table.rows) } : undefined;
  const breakdown = result.breakdown?.map(view => ({ ...view, rows: cells(view.rows) }));
  return { ...result, primary, rows, table, breakdown, chart: result.chart?.filter(s => Number.isFinite(s.value)), notes: invalid ? [...(result.notes ?? []), { key: "validation.undefined" }] : result.notes };
}
export function prepareCalculator(calculator: CalculatorDef): CalculatorDef {
  return { ...calculator, compute: (values, ctx) => {
    const error = calculator.validate?.(values, ctx);
    if (error) return { primary: { labelKey: calculator.titleKey, value: "—", kind: "text", emphasis: true }, rows: [], notes: [{ key: error }] };
    return validatedResult(calculator.compute(values, ctx));
  } };
}
