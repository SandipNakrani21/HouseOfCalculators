import type { CalcContext, CalculatorDef, FieldValues } from "@/config/calculators/types";

/** One-variable illustrations use the published model, never market-rate data. */
export function loanComparisons(calculator: CalculatorDef, ctx: CalcContext) {
  if (!["mortgage", "loan", "auto-loan", "student-loan"].includes(calculator.slug)) return [];
  const fields = calculator.fields(ctx);
  const base: FieldValues = Object.fromEntries(fields.map(field => [field.id, field.default]));
  const cases: { fieldId: string | null; values: FieldValues }[] = [{ fieldId: null, values: base }];
  for (const id of ["rate", "years", "downPayment"]) {
    const field = fields.find(field => field.id === id);
    if (!field || typeof base[id] !== "number") continue;
    const step = id === "rate" ? 1 : id === "years" ? -Math.min(5, Math.max(1, Math.floor(base[id] / 2))) : 10;
    const value = Math.min(field.max ?? Infinity, Math.max(field.min ?? -Infinity, base[id] + step));
    if (value === base[id]) continue;
    const values = { ...base, [id]: value };
    if (calculator.validate?.(values, ctx)) continue;
    cases.push({ fieldId: id, values });
  }
  return cases.map(item => ({ ...item, result: calculator.compute(item.values, ctx) }));
}
