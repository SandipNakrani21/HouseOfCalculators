"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { BreakdownPanel } from "@/components/calculator/BreakdownPanel";
import { ResultActions } from "@/components/calculator/ResultActions";
import { FieldControl, numericFieldError, visibleFields } from "@/components/calculator/FieldControl";
import { DonutChart } from "@/components/charts/DonutChart";
import { FactList, ResultBox } from "@/components/ui/Form";
import { CountrySelector } from "@/components/navigation/CountrySelector";
import { CountryBadge } from "@/components/ui/CountryBadge";
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
import INCOME_TAX_RULES from "@/config/calculators/tax-metadata.json";
import { currencyDecimals, resolveFields } from "@/lib/validation";
import { reviewedCalculator } from "@/config/calculators/reviewed";

const TONE_VAR: Record<NonNullable<ResultRow["tone"]>, string> = {
  principal: "var(--tone-principal)",
  returns: "var(--tone-returns)",
  tax: "var(--tone-tax)",
  neutral: "var(--tone-neutral)",
};

/**
 * Renders a calculator definition supplied by its client engine group. The
 * server passes a slug to CalculatorEntry, which loads the relevant group.
 *
 * Calculation is deterministic and runs here, in the browser. There is no
 * round trip between moving a slider and seeing the answer.
 */
export function CalculatorRunner({
  slug,
  calculator,
  /** Country tools are about one country and ignore the visitor's preference. */
  lockedCountry,
  allowedCountries,
}: {
  slug: string;
  calculator: CalculatorDef;
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

  const supported = calculator?.countries ?? allowedCountries ?? [preferredCountry];
  const requestedCountry = lockedCountry ?? preferredCountry;
  const countryCode = supported.includes(requestedCountry) ? requestedCountry : supported[0];
  const country = COUNTRIES[countryCode];
  // A locked country needs its own formatter: the provider's one follows the
  // visitor's preference, which a country tool deliberately ignores.
  const localeFmt = useMemo(
    () =>
      countryCode !== preferredCountry
        ? createFormatter(countryCode, locale.language, translate)
        : preferredFmt,
    [countryCode, preferredCountry, locale.language, translate, preferredFmt],
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
  // Static HTML arrives before handlers are attached. Keep controls disabled
  // until hydration so an early edit cannot be overwritten by initial state.
  const interactive = useSyncExternalStore(subscribeNever, readInteractive, readNotInteractive);

  const baseFields = useMemo(() => calculator?.fields(ctx) ?? [], [calculator, ctx]);
  const initial = useMemo(() => defaultsOf(baseFields), [baseFields]);
  const [values, setValues] = useState<FieldValues>(initial);
  const [resetGeneration, setResetGeneration] = useState(0);
  const inputCard = useRef<HTMLElement>(null);
  useEffect(() => {
    if (resetGeneration > 0) inputCard.current?.querySelector<HTMLElement>('input:not([type="range"]), button[role="radio"][aria-checked="true"]')?.focus();
  }, [resetGeneration]);
  const fields = useMemo(() => resolveFields(baseFields, values), [baseFields, values]);

  // Formatting-only country changes preserve the entered scenario.
  const [signature, setSignature] = useState(countryCode);
  if (signature !== countryCode) {
    setSignature(countryCode);
    if (calculator && ["rules", "units"].includes(countryRelevanceOf(calculator))) setValues(initial);
  }

  // A share link: the sender's inputs, and the country they calculated for.
  // Read after hydration (the page is static, so the server sees no query);
  // the defaults paint first and the shared values replace them at once.
  const search = useSyncExternalStore(subscribeNever, readSearch, readNoSearch);
  const changedEarlier = (slug === "capital-gains" && ["fr", "de"].includes(countryCode))
    || (["income-tax", "salary", "social-security"].includes(slug) && countryCode === "pl")
    || (slug === "30-percent-ruling" && countryCode === "nl")
    || (["income-tax", "salary"].includes(slug) && ["au", "in"].includes(countryCode))
    || slug === "hecs";
  const shareVersion = reviewedCalculator(slug, countryCode) || changedEarlier ? calculator.version : undefined;
  const shared = useMemo(() => readShareQuery(search, baseFields, shareVersion), [search, baseFields, shareVersion]);
  const [oldLinkDismissed, setOldLinkDismissed] = useState(false);
  const sharedCountry =
    shared?.country &&
    !lockedCountry &&
    calculator && countryRelevanceOf(calculator) !== "none" &&
    supported.includes(shared.country)
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
  const domainError = shared?.obsolete && !oldLinkDismissed ? "review.shareChanged" : calculator?.validate?.(values, ctx);
  const result = useMemo(
    () => {
      const valid = visibleFields(fields, values).every((field) => !numericFieldError(field, values[field.id] ?? field.default, countryCode));
      return valid && !domainError ? calculator?.compute(values, ctx) : undefined;
    },
    [calculator, fields, values, ctx, countryCode, domainError],
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

  if (!calculator) return null;
  const resetInputs = () => {
    setValues(initial);
    setOldLinkDismissed(true);
    // Recreate the reset card to discard field-local state and stale layout
    // after validation recovery, then return keyboard focus to its first input.
    setResetGeneration(generation => generation + 1);
  };

  const summaryRows = result?.rows.filter((row) => !row.emphasis) ?? [];
  const emphasisRows = result?.rows.filter((row) => row.emphasis) ?? [];

  return (
    <fieldset disabled={!interactive} aria-busy={!interactive} className="min-w-0 space-y-6">
      <legend className="sr-only">{t("calc.inputs")}</legend>
      <section key={resetGeneration} ref={inputCard} className="card p-5 sm:p-8">
        {slug === "income-tax" ? <div className="mb-6 rounded-md border border-border bg-bg-soft p-4">
          <p className="font-bold text-heading">{t("calc.taxYear", { year: reviewedCalculator(slug, countryCode)?.review.period.match(/^\d{4}(?:[–/]\d{2,4})?/)?.[0] ?? INCOME_TAX_RULES[countryCode].taxYear })}</p>
          <p className="mt-1 text-sm text-muted">{t("calc.taxCoverage")}</p>
        </div> : null}
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
              <p className="mt-1 text-xs text-muted">{t(["rules", "units"].includes(countryRelevanceOf(calculator)) ? "calc.countryResetHint" : "calc.countryPreserveHint")}</p>
            </div>
            <CountrySelector only={supported} value={countryCode} />
          </div>
        )}

        {/* Intrinsic columns adapt to the card width without size containment,
            which can leave this editable grid without layout after recovery. */}
        <div
          className={
            calculator.splitEarly
              ? "grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-8"
              : "grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-6"
          }
        >
          <div className="min-w-0 space-y-6">
            <h2 className="sr-only">{t("calc.inputs")}</h2>
            {countryCode !== requestedCountry ? <p role="status" className="field-hint">{t("validation.countryFallback", { country: t(`country.${countryCode}`) })}</p> : null}
            {domainError ? <p role="status" className="text-sm text-alert">{t(domainError)}</p> : null}
            {shown.map((field) => (
              <FieldControl
                key={field.id}
                field={field}
                value={values[field.id] ?? field.default}
                params={params}
                fmt={fmt}
                countryCode={countryCode}
                onChange={(next) => setValues(current => {
                  const updated = { ...current, [field.id]: next };
                  if (slug === "salary" && field.id === "period" && next !== current.period) {
                    const amount = Number(current.salary);
                    if (Number.isFinite(amount)) updated.salary = Number((next === "month" ? amount / 12 : amount * 12).toFixed(currencyDecimals(countryCode)));
                  }
                  return updated;
                })}
              />
            ))}

          </div>

          <div
            className="min-w-0 space-y-4"
          >
            <h2 className="sr-only">{t("calc.results")}</h2>
            {/* The headline answer, announced to assistive technology when it changes. */}
            <ResultBox
              label={result ? t(result.primary.labelKey) : t("calc.results")}
              value={result ? format(result.primary.value, result.primary.kind, result.primary.decimals) : t("calc.validation.incomplete")}
              detail={result?.primary.hintKey ? t(result.primary.hintKey) : undefined}
              tone={result ? "primary" : "quiet"}
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
                    {row.hintKey ? <p className="field-hint">{t(row.hintKey)}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {result?.chart?.length ? (
              <div className="flex justify-center py-2">
                <DonutChart
                  slices={result.chart}
                  params={params}
                  fmt={fmt}
                  formatValue={slice => {
                    const row = [result.primary, ...result.rows].find(row => row.labelKey === slice.labelKey);
                    const kind = row?.kind ?? (result.primary.kind === "currency" ? "currency" : "number");
                    const unit = slice.hintKey ?? row?.hintKey;
                    return format(slice.value, kind, row?.decimals ?? 2) + (unit ? ` (${t(unit)})` : "");
                  }}
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
                value: format(row.value, row.kind, row.decimals) + (row.hintKey ? ` (${t(row.hintKey)})` : ""),
                marker: row.tone ? TONE_VAR[row.tone] : undefined,
              }))}
            />

            {result?.notes?.length ? (
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
        {result ? <ResultActions title={t(calculator.titleKey)} values={values} result={result} format={format} t={t}
          country={lockedCountry || countryRelevanceOf(calculator) === "none" ? undefined : countryCode} version={shareVersion}
          onReset={resetInputs} /> : <button type="button" className="btn btn-outline btn-md mt-6" onClick={resetInputs}>{t("common.reset")}</button>}
      </section>

      {result?.table?.rows.length ? (
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

      {result?.breakdown?.length ? (
        <BreakdownPanel views={result.breakdown} format={format} t={t} />
      ) : null}
    </fieldset>
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
  supportedCountries,
  year,
}: {
  relevance: Exclude<ReturnType<typeof countryRelevanceOf>, "none">;
  lockedCountry?: CountryCode;
  supportedCountries?: CountryCode[];
  year?: string;
}) {
  const { t, countryCode: preferred } = useLocale();
  const requested = lockedCountry ?? preferred;
  const code = supportedCountries && !supportedCountries.includes(requested) ? supportedCountries[0] : requested;
  return (
    <p className="badge badge-outline badge-md mt-4 !font-medium !text-muted">
      <CountryBadge code={code} />
      {t(`calc.countryNote.${relevance}`, {
        country: t(`country.${code}`),
        year: year ?? COUNTRIES[code].fiscalYear.label,
        currency: COUNTRIES[code].currency.code,
      })}
    </p>
  );
}

const subscribeNever = () => () => {};
const readInteractive = () => true;
const readNotInteractive = () => false;
const readSearch = () => window.location.hash.startsWith("#calc=") ? window.location.hash : window.location.search;
const readNoSearch = () => "";

function defaultsOf(fields: ReturnType<CalculatorDef["fields"]>): FieldValues {
  return Object.fromEntries(fields.map((field) => [field.id, field.default]));
}
