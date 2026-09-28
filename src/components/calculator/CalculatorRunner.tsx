"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { BreakdownPanel } from "@/components/calculator/BreakdownPanel";
import { ResultActions } from "@/components/calculator/ResultActions";
import { FieldControl, visibleFields } from "@/components/calculator/FieldControl";
import { DonutChart } from "@/components/charts/DonutChart";
import { FactList, ResultBox } from "@/components/ui/Form";
import { CountrySelector } from "@/components/navigation/CountrySelector";
import { CountryBadge } from "@/components/ui/CountryBadge";
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
import { plural } from "@/lib/i18n/core";
import { useLocale } from "@/lib/locale-context";
import { readShareQuery } from "@/lib/share-link";

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
    setCountry,
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
        ? createFormatter(lockedCountry, locale.language, translate)
        : preferredFmt,
    [lockedCountry, locale.language, translate, preferredFmt],
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

  // A share link: the sender's inputs, and the country they calculated for.
  // Read after hydration (the page is static, so the server sees no query);
  // the defaults paint first and the shared values replace them at once.
  const search = useSyncExternalStore(subscribeNever, readSearch, readNoSearch);
  const shared = useMemo(() => readShareQuery(search, fields), [search, fields]);
  const sharedCountry =
    shared?.country &&
    !lockedCountry &&
    calculator && countryRelevanceOf(calculator) !== "none" &&
    (!allowedCountries || allowedCountries.includes(shared.country))
      ? shared.country
      : null;

  // Switch to the link's country once. Never again: the visitor may change
  // it afterwards, and the link must not keep pulling it back.
  const countrySwitched = useRef(false);
  useEffect(() => {
    if (!sharedCountry || countrySwitched.current) return;
    countrySwitched.current = true;
    if (sharedCountry !== countryCode) setCountry(sharedCountry);
  }, [sharedCountry, countryCode, setCountry]);

  // Then the values, once the fields are that country's. After the reset
  // above, so a country switch in the same render does not wipe them.
  const [restored, setRestored] = useState(false);
  if (!restored && shared && (!sharedCountry || sharedCountry === countryCode)) {
    setRestored(true);
    setValues({ ...initial, ...shared.values });
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
          return plural(t, fmt.locale, "units.yearsCount", value, {
            display: fmt.number(value, { decimals }),
            decimals,
          });
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
      <section className="card animate-fade-up @container p-5 sm:p-8">
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

        {/* Inputs left, results right once the card is wide enough; stacked
            below that. A container query, so it adapts to the column the card
            sits in (narrower beside an ad rail) rather than the window. */}
        <div
          className={
            calculator.splitEarly
              ? "grid gap-8 @xl:grid-cols-2 @xl:gap-8 @3xl:gap-10"
              : "grid gap-8 @2xl:grid-cols-2 @2xl:gap-10"
          }
        >
          <div className="space-y-9">
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

            <ResultActions
              title={t(calculator.titleKey)}
              values={values}
              result={result}
              format={format}
              t={t}
              country={lockedCountry || countryRelevanceOf(calculator) === "none" ? undefined : countryCode}
              onReset={() => setValues(initial)}
            />
          </div>

          <div
            className={`min-w-0 space-y-4 ${
              calculator.splitEarly
                ? "@xl:border-s @xl:border-border @xl:ps-8 @3xl:ps-10"
                : "@2xl:border-s @2xl:border-border @2xl:ps-10"
            }`}
          >
            <h2 className="sr-only">{t("calc.results")}</h2>
            {/* The headline answer, announced to assistive technology when it changes. */}
            <ResultBox
              label={t(result.primary.labelKey)}
              value={format(result.primary.value, result.primary.kind, result.primary.decimals)}
            />

            {emphasisRows.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {emphasisRows.map((row) => (
                  <li
                    key={row.labelKey}
                    className="rounded-md border border-border bg-bg-soft px-4 py-3 transition-colors hover:border-primary/30"
                  >
                    <p className="text-xs font-medium text-muted">{t(row.labelKey)}</p>
                    <p className="tabular mt-0.5 text-lg font-bold text-heading">
                      {format(row.value, row.kind, row.decimals)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            {result.chart?.length ? (
              <div className="flex justify-center py-2">
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

            <FactList
              items={summaryRows.map((row) => ({
                label: t(row.labelKey),
                value: format(row.value, row.kind, row.decimals),
                marker: row.tone ? TONE_VAR[row.tone] : undefined,
              }))}
            />

            {result.notes?.length ? (
              <ul className="space-y-1.5">
                {result.notes.map((note) => (
                  <li key={note.key} className="text-xs leading-relaxed text-muted">
                    {t(note.key, note.params)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
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

/**
 * The line under the page title saying what the country changes here. It
 * follows the country picked in the calculator (or the tool's fixed one), so
 * it never says "USD" above a rupee result. The server renders the page's
 * default country; the visitor's choice replaces it after hydration.
 */
export function CalculatorCountryNote({
  relevance,
  lockedCountry,
}: {
  relevance: Exclude<ReturnType<typeof countryRelevanceOf>, "none">;
  lockedCountry?: CountryCode;
}) {
  const { t, countryCode: preferred } = useLocale();
  const code = lockedCountry ?? preferred;
  return (
    <p className="badge badge-outline badge-md mt-4 !font-medium !text-muted">
      <CountryBadge code={code} />
      {t(`calc.countryNote.${relevance}`, {
        country: t(`country.${code}`),
        year: COUNTRIES[code].fiscalYear.label,
        currency: COUNTRIES[code].currency.code,
      })}
    </p>
  );
}

const subscribeNever = () => () => {};
const readSearch = () => window.location.search;
const readNoSearch = () => "";

function defaultsOf(fields: ReturnType<CalculatorDef["fields"]>): FieldValues {
  return Object.fromEntries(fields.map((field) => [field.id, field.default]));
}
