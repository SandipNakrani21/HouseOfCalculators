"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { BreakdownPanel } from "@/components/calculator/BreakdownPanel";
import { ResultActions } from "@/components/calculator/ResultActions";
import { FieldControl, visibleFields } from "@/components/calculator/FieldControl";
import { DonutChart } from "@/components/charts/DonutChart";
import { CountrySelector } from "@/components/navigation/CountrySelector";
import { getCalculator } from "@/config/calculators";
import { countryRelevanceOf } from "@/config/calculators/types";
import type {
  CalcContext,
  CalculatorDef,
  FieldValues,
  ResultKind,
  ResultRow,
} from "@/config/calculators/types";
import { COUNTRIES, type CountryCode } from "@/config/countries";
import { createFormatter } from "@/lib/format";
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
 *
 * Calculation is deterministic and runs here, in the browser. There is no
 * round trip between moving a slider and seeing the answer.
 */
export function CalculatorRunner({
  slug,
  /** Country tools are about one country and ignore the visitor's preference. */
  lockedCountry,
  allowedCountries,
}: {
  slug: string;
  lockedCountry?: CountryCode;
  allowedCountries?: CountryCode[];
}) {
  const {
    t: translate,
    fmt: preferredFmt,
    countryCode: preferredCountry,
    locale,
  } = useLocale();
  const calculator = getCalculator(slug);

  const countryCode = lockedCountry ?? preferredCountry;
  const country = COUNTRIES[countryCode];
  // A locked country needs its own formatter: the provider's one follows the
  // visitor's preference, which a country tool deliberately ignores.
  const localeFmt = useMemo(
    () =>
      lockedCountry
        ? createFormatter(lockedCountry, locale.language)
        : preferredFmt,
    [lockedCountry, locale.language, preferredFmt],
  );

  const ctx = useMemo<CalcContext>(
    () => ({ countryCode, country, t: translate, fmt: localeFmt }),
    [countryCode, country, translate, localeFmt],
  );

  // Copy such as "{tax} amount" resolves to GST, VAT or sales tax depending on
  // the country, so every label on this page goes through the same params.
  const params = useMemo(() => calculator?.params?.(ctx), [calculator, ctx]);
  const t = useCallback(
    (key: string, extra?: Record<string, string | number>) =>
      translate(key, { ...params, ...extra }),
    [translate, params],
  );
  const fmt = localeFmt;

  const fields = useMemo(() => calculator?.fields(ctx) ?? [], [calculator, ctx]);
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

  const format = useCallback(
    (value: number | string, kind: ResultKind, decimals?: number) => {
      if (kind === "label") return t(String(value));
      if (typeof value === "string") return value;
      switch (kind) {
        case "currency":
          return fmt.currency(value, decimals === undefined ? undefined : { decimals });
        case "percent":
          return fmt.percent(value, { decimals: decimals ?? 2 });
        case "years":
          return `${fmt.number(value, { decimals })} ${t("units.years")}`;
        default:
          return fmt.number(value, { decimals });
      }
    },
    [fmt, t],
  );

  if (!calculator || !result) return null;

  const summaryRows = result.rows.filter((row) => !row.emphasis);
  const emphasisRows = result.rows.filter((row) => row.emphasis);

  return (
    <div className="space-y-6">
      <section className="card animate-fade-up p-5 sm:p-8">
        {lockedCountry || countryRelevanceOf(calculator) === "none" ? null : (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <h2 className="text-sm font-semibold">{t("calc.countryContext")}</h2>
              {/* Says what the country changes here, for the same reason the
                  badge above does: "currency, formatting and rules" is wrong
                  on a calculator where it only sets the units. */}
              <p className="text-xs text-muted">
                {t(`calc.countryContextHint.${countryRelevanceOf(calculator)}`)}
              </p>
            </div>
            <CountrySelector only={allowedCountries} />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-7">
            <h2 className="sr-only">{t("calc.inputs")}</h2>
            {shown.map((field) => (
              <FieldControl
                key={field.id}
                field={field}
                value={values[field.id] ?? field.default}
                params={params}
                fmt={fmt}
                onChange={(next) =>
                  setValues((current) => ({ ...current, [field.id]: next }))
                }
              />
            ))}

            <button
              type="button"
              onClick={() => setValues(initial)}
              className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
              {t("common.reset")}
            </button>
          </div>

          {result.chart?.length ? (
            <div className="flex items-start justify-center lg:border-s lg:border-border lg:ps-8">
              <DonutChart
                slices={result.chart}
                params={params}
                fmt={fmt}
                centerLabel={t(result.primary.labelKey)}
                // Money is abbreviated so a long figure fits inside the ring.
                // Anything else is formatted normally: rendering a 40% margin
                // through the currency formatter produced "$40".
                centerValue={
                  result.primary.kind === "currency" &&
                  typeof result.primary.value === "number"
                    ? fmt.currencyShort(result.primary.value)
                    : format(
                        result.primary.value,
                        result.primary.kind,
                        result.primary.decimals,
                      )
                }
              />
            </div>
          ) : null}
        </div>

        {/* The headline answer, announced to assistive technology when it changes. */}
        <div
          aria-live="polite"
          className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] px-5 py-6 text-center text-white shadow-[var(--shadow-primary)]"
        >
          {/* Decorative rings, as on the landing page's call to action. */}
          <span aria-hidden className="absolute -end-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/10" />
          <span aria-hidden className="absolute -bottom-12 -start-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
          <p className="relative text-sm font-semibold text-blue-100">
            {t(result.primary.labelKey)}
          </p>
          {/* Keyed on the value so each new answer replays the flash. */}
          <p
            key={String(result.primary.value)}
            className="value-flash tabular relative mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {format(result.primary.value, result.primary.kind, result.primary.decimals)}
          </p>
        </div>

        {emphasisRows.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {emphasisRows.map((row) => (
              <li
                key={row.labelKey}
                className="rounded-xl border border-border bg-surface-muted px-4 py-3 transition-colors hover:border-primary/30"
              >
                <p className="text-xs font-medium text-muted">{t(row.labelKey)}</p>
                <p className="tabular mt-0.5 text-lg font-bold text-heading">
                  {format(row.value, row.kind, row.decimals)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="mt-6 divide-y divide-border border-t border-border">
          {summaryRows.map((row) => (
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
              <dd className="tabular text-end text-sm font-bold text-heading">
                {format(row.value, row.kind, row.decimals)}
              </dd>
            </div>
          ))}
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

        <ResultActions
          title={t(calculator.titleKey)}
          values={values}
          result={result}
          format={format}
          t={t}
        />
      </section>

      {result.table?.rows.length ? (
        <BreakdownPanel
          views={[
            {
              id: "table",
              labelKey: "calc.breakdown",
              columns: result.table.columns,
              rows: result.table.rows,
            },
          ]}
          format={format}
          t={t}
        />
      ) : null}

      {result.breakdown?.length ? (
        <BreakdownPanel views={result.breakdown} format={format} t={t} />
      ) : null}
    </div>
  );
}

function defaultsOf(fields: ReturnType<CalculatorDef["fields"]>): FieldValues {
  return Object.fromEntries(fields.map((field) => [field.id, field.default]));
}
