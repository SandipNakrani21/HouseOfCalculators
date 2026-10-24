import type { CalcContext, CalculatorDef, ResultRow } from "@/config/calculators/types";
import { resolveFields } from "@/lib/validation";
import { plural } from "@/lib/i18n/core";

/** The published illustration uses the same defaults and engine as the tool. */
export function WorkedExample({ calculator, ctx, omitNoteKey }: { calculator: CalculatorDef; ctx: CalcContext; omitNoteKey?: string }) {
  const { t, fmt } = ctx;
  const baseFields = calculator.fields(ctx);
  const values = Object.fromEntries(baseFields.map(field => [field.id, field.default]));
  const fields = resolveFields(baseFields, values).filter(field => !field.visibleWhen || field.visibleWhen(values));
  const validation = calculator.validate?.(values, ctx);
  if (validation) return <section data-worked-example={calculator.slug} className="rounded-lg border border-border p-4 sm:p-6">
    <h3 className="font-semibold text-heading">{t("quality.example")}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted">{t(validation)}</p>
  </section>;
  const result = calculator.compute(values, ctx);
  const format = (row: ResultRow): string => {
    if (row.kind === "label") return t(String(row.value));
    if (typeof row.value === "string") return row.value;
    if (row.kind === "currency") return fmt.currency(row.value, row.decimals === undefined ? undefined : { decimals: row.decimals });
    if (row.kind === "percent") return fmt.percent(row.value, { decimals: row.decimals ?? 2 });
    if (row.kind === "years") return plural(t, fmt.locale, "units.yearsCount", row.value, { display: fmt.number(row.value, { decimals: row.decimals }) });
    return fmt.number(row.value, { decimals: row.decimals ?? (Number.isInteger(row.value) ? 0 : 2) });
  };
  return <section data-worked-example={calculator.slug} className="rounded-lg border border-border p-4 sm:p-6">
    <h3 className="font-semibold text-heading">{t("quality.example")}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted">{t("quality.exampleIntro", { country: t(`country.${ctx.countryCode}`), version: calculator.version })}</p>
    <div className="mt-4 grid gap-5 md:grid-cols-2">
      <div><h4 className="mb-2 font-semibold">{t("quality.inputs")}</h4><dl className="divide-y divide-border">{fields.map(field => {
        const value = values[field.id];
        const option = field.options?.find(option => option.value === value);
        const display = typeof value === "boolean" ? t(value ? "common.yes" : "common.no") : option ? (option.label ?? t(option.labelKey)) : typeof value === "number" ? field.kind === "currency" ? fmt.currency(value) : field.kind === "percent" ? fmt.percent(value) : fmt.number(value, { decimals: Number.isInteger(value) ? 0 : 4 }) : String(value);
        return <div key={field.id} className="flex justify-between gap-4 py-2 text-sm"><dt className="min-w-0 text-muted [overflow-wrap:anywhere]">{t(field.labelKey, calculator.params?.(ctx))}</dt><dd className="tabular min-w-0 max-w-[60%] shrink-0 text-end [overflow-wrap:anywhere]">{display}</dd></div>;
      })}</dl></div>
      <div><h4 className="mb-2 font-semibold">{t("quality.outputs")}</h4><dl className="divide-y divide-border">{[result.primary, ...result.rows.filter(row => row.labelKey !== result.primary.labelKey)].map((row, index) => <div key={`${row.labelKey}-${index}`} className="flex justify-between gap-4 py-2 text-sm"><dt className="min-w-0 text-muted [overflow-wrap:anywhere]">{t(row.labelKey)}</dt><dd className="tabular min-w-0 max-w-[60%] shrink-0 text-end [overflow-wrap:anywhere]">{format(row)}{row.hintKey ? ` (${t(row.hintKey)})` : ""}</dd></div>)}</dl></div>
    </div>
    {result.notes?.filter(note => note.key !== omitNoteKey).map((note, index) => <p key={index} className="mt-3 text-sm text-muted">{t(note.key, note.params)}</p>)}
    <p className="mt-4 text-sm leading-relaxed text-muted">{t("quality.assumptions")}</p>
    <p className="mt-3 text-sm leading-relaxed text-muted">{t(`quality.limit.${calculator.category}`)}</p>
  </section>;
}
