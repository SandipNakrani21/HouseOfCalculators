"use client";

import { useCallback, useMemo, useState } from "react";

import { DonutChart } from "@/components/ui/DonutChart";
import { FieldControl, visibleFields } from "@/components/ui/FieldControl";
import { getCalculator } from "@/config/calculators";
import type {
  CalculatorDef,
  CalcContext,
  FieldValues,
  ResultKind,
  ResultRow,
} from "@/config/calculators/types";
import { useLocale } from "@/lib/locale-context";

const TONE_VAR: Record<NonNullable<ResultRow["tone"]>, string> = {
  principal: "var(--tone-principal)",
  returns: "var(--tone-returns)",
  tax: "var(--tone-tax)",
  neutral: "var(--tone-neutral)",
};

/**
 * Renders any calculator from its definition. The page passes only the slug:
 * a definition holds functions, which cannot cross the server/client boundary,
 * so the client looks it up in the registry itself.
 */
export function CalculatorRunner({ slug }: { slug: string }) {
  const { t: translate, fmt, countryCode, country } = useLocale();
  const calculator = getCalculator(slug);

  const ctx = useMemo<CalcContext>(
    () => ({ countryCode, country, t: translate, fmt }),
    [countryCode, country, translate, fmt],
  );

  // Copy such as "{tax} amount" resolves to GST, VAT or sales tax depending on
  // the country, so every label on this page goes through the same params.
  const params = useMemo(() => calculator?.params?.(ctx), [calculator, ctx]);
  const t = useCallback(
    (key: string, extra?: Record<string, string | number>) =>
      translate(key, { ...params, ...extra }),
    [translate, params],
  );

  const fields = useMemo(
    () => calculator?.fields(ctx) ?? [],
    [calculator, ctx],
  );
  const initial = useMemo(() => defaultsOf(fields), [fields]);
  const [values, setValues] = useState<FieldValues>(initial);

  // A country switch reshapes the fields, so the form resets to that
  // country's defaults rather than carrying rupee amounts into a dollar form.
  const [signature, setSignature] = useState(countryCode);
  if (signature !== countryCode) {
    setSignature(countryCode);
    setValues(initial);
  }

  const shown = visibleFields(fields, values);
  const result = useMemo(
    () => calculator?.compute(values, ctx),
    [calculator, values, ctx],
  );

  if (!calculator || !result) return null;

  const format = (value: number | string, kind: ResultKind) => {
    if (typeof value === "string") return value;
    switch (kind) {
      case "currency":
        return fmt.currency(value);
      case "percent":
        return fmt.percent(value, { decimals: 2 });
      case "years":
        return `${fmt.number(value)} ${t("units.years")}`;
      default:
        return fmt.number(value);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-7">
            <h2 className="sr-only">{t("calc.inputs")}</h2>
            {shown.map((field) => (
              <FieldControl
                key={field.id}
                field={field}
                value={values[field.id] ?? field.default}
                params={params}
                onChange={(next) =>
                  setValues((current) => ({ ...current, [field.id]: next }))
                }
              />
            ))}

            <button
              type="button"
              onClick={() => setValues(initial)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("common.reset")}
            </button>
          </div>

          {result.chart?.length ? (
            <div className="flex items-start justify-center lg:border-s lg:border-border lg:ps-8">
              <DonutChart
                slices={result.chart}
                params={params}
                centerLabel={t(result.primary.labelKey)}
                centerValue={fmt.currencyShort(
                  typeof result.primary.value === "number"
                    ? result.primary.value
                    : 0,
                )}
              />
            </div>
          ) : null}
        </div>

        <dl className="mt-8 divide-y divide-border border-t border-border">
          {result.rows.map((row) => (
            <div
              key={row.labelKey}
              className="flex items-center justify-between gap-4 py-3"
            >
              <dt className="flex items-center gap-2 text-sm text-muted">
                {row.tone ? (
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: TONE_VAR[row.tone] }}
                  />
                ) : null}
                {t(row.labelKey)}
              </dt>
              <dd
                className={`tabular text-end ${
                  row.emphasis
                    ? "text-base font-semibold text-foreground"
                    : "text-sm font-medium text-foreground"
                }`}
              >
                {format(row.value, row.kind)}
              </dd>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm font-medium text-foreground">
              {t(result.primary.labelKey)}
            </dt>
            <dd className="tabular text-end text-xl font-bold text-primary">
              {format(result.primary.value, result.primary.kind)}
            </dd>
          </div>
        </dl>

        {result.notes?.length ? (
          <ul className="mt-4 space-y-1.5">
            {result.notes.map((note) => (
              <li key={note.key} className="text-xs leading-relaxed text-muted">
                {t(note.key, note.params)}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {result.table?.rows.length ? (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            {t("calc.breakdown")}
          </h2>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs uppercase tracking-wide text-muted">
                  {result.table.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="py-2 text-start font-medium first:ps-0 last:pe-0"
                    >
                      {t(column.labelKey)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.table.rows.map((row, index) => (
                  <tr key={index}>
                    {result.table!.columns.map((column) => (
                      <td
                        key={column.key}
                        className="tabular py-2.5 text-start text-foreground"
                      >
                        {format(row[column.key], column.kind)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function defaultsOf(
  fields: ReturnType<CalculatorDef["fields"]>,
): FieldValues {
  return Object.fromEntries(fields.map((field) => [field.id, field.default]));
}
