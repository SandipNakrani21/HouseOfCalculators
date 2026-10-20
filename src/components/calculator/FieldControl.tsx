"use client";

import { useId } from "react";

import type { CalculatorField, FieldValues } from "@/config/calculators/types";
import type { Formatter } from "@/lib/format";
import { useLocale } from "@/lib/locale-context";
import { SegmentedControl } from "@/components/ui/Form";
import { calculatorFieldError, calculatorRules, integerDigits, normalizeNumericInput, MAX_LIST_CHARACTERS } from "@/lib/validation";
import type { CountryCode } from "@/config/countries";

type Props = {
  field: CalculatorField;
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
  /** Placeholders for the label copy, e.g. the country name for its tax. */
  params?: Record<string, string | number>;
  /** Formatter for the page's country, which may differ from the visitor's. */
  fmt?: Formatter;
  countryCode?: CountryCode;
};

/**
 * One labelled input. Numeric fields pair an editable box with a slider,
 * the way a finance calculator is usually driven: type an exact figure, or
 * drag to explore.
 */
export function FieldControl({ field, value, onChange, params, fmt: override, countryCode: overrideCountry }: Props) {
  const { t: translate, fmt: localeFmt, countryCode: preferredCountry } = useLocale();
  const countryCode = overrideCountry ?? preferredCountry;
  const fmt = override ?? localeFmt;
  const t = (key: string) => translate(key, params);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const error = numericFieldError(field, value, countryCode);
  const rules = calculatorRules(field, countryCode);
  const bound = (value: number) => field.kind === "currency" ? fmt.currency(value) : fmt.number(value, { decimals: Math.min(rules.decimals, (String(value).split(".")[1] ?? "").length) });
  const errorParams = { min: bound(rules.min), max: bound(rules.max), digits: integerDigits(rules), decimals: rules.decimals, count: 100 };

  if (field.kind === "select") {
    return (
      <SegmentedControl label={t(field.labelKey)} value={String(value)}
        onChange={onChange} hint={field.hintKey ? t(field.hintKey) : undefined}
        options={(field.options ?? []).map((option) => ({ value: option.value, label: option.label ?? t(option.labelKey) }))} />
    );
  }

  if (field.kind === "text") {
    // For inputs that are a list rather than a single number, such as the set
    // of values a statistics calculator works over.
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="field-label">
          {t(field.labelKey)}
        </label>
        <input
          id={id}
          type="text"
          aria-invalid={!!error}
          aria-describedby={[field.hintKey ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
          // Bound list size consistently with validation and shared links.
          maxLength={MAX_LIST_CHARACTERS}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className="input"
        />
        {field.hintKey ? (
          <p id={hintId} className="field-hint">{t(field.hintKey)}</p>
        ) : null}
        {error ? <p id={errorId} role="status" className="text-sm text-alert">{translate(`validation.${error}`, errorParams)}</p> : null}
      </div>
    );
  }

  if (field.kind === "toggle") {
    const checked = value === true || value === "true";
    return (
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="field-label">
          {t(field.labelKey)}
          {field.hintKey ? (
            <span id={hintId} className="mt-1 block text-xs font-normal text-muted">
              {t(field.hintKey)}
            </span>
          ) : null}
        </span>
        <input
          type="checkbox"
          aria-describedby={field.hintKey ? hintId : undefined}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="switch mt-1"
        />
      </label>
    );
  }

  const numeric = typeof value === "number" ? value : Number(value) || 0;
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const fill = max > min ? ((numeric - min) / (max - min)) * 100 : 0;
  const description = [field.hintKey ? hintId : "", `${id}-bounds`, error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  const suffix =
    field.kind === "percent"
      ? "%"
      : field.kind === "years"
        ? t("units.years")
        : field.kind === "months"
          ? t("units.months")
          : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="field-label">
          {t(field.labelKey)}
        </label>

        <div className="flex h-11 items-center gap-1 rounded-sm bg-primary-light px-3 text-primary transition-shadow focus-within:ring-2 focus-within:ring-[var(--ring)]">
          {field.kind === "currency" ? (
            <span className="text-sm font-medium">{fmt.symbol}</span>
          ) : null}
          <input
            id={id}
            type="text"
            maxLength={32}
            inputMode="decimal"
            value={value === "" ? "" : Number.isFinite(numeric) ? value as number | string : ""}
            aria-invalid={!!error}
            aria-describedby={description}
            min={field.min}
            max={field.max}
            step={step}
            onChange={(event) => {
              onChange(normalizeNumericInput(event.target.value, fmt.locale));
            }}
            className="tabular h-full w-36 max-w-full bg-transparent text-end text-sm font-semibold outline-none sm:w-44 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix ? <span className="text-sm font-medium">{suffix}</span> : null}
        </div>
      </div>

      {field.slider === false ? null : (
        <div className="space-y-2">
          <input
            type="range"
            aria-label={t(field.labelKey)}
            aria-describedby={description}
            value={Math.min(Math.max(numeric, min), max)}
            min={min}
            max={max}
            step={step}
            onChange={(event) => onChange(Number(event.target.value))}
            style={{ "--fill": `${Math.max(0, Math.min(100, fill))}%` } as React.CSSProperties}
          />
          <div className="flex justify-between text-[0.6875rem] text-muted">
            <span className="tabular">{edgeLabel(min, field, fmt.currencyShort)}</span>
            <span className="tabular">{edgeLabel(max, field, fmt.currencyShort)}</span>
          </div>
        </div>
      )}

      {field.hintKey ? (
        <p id={hintId} className="field-hint">{t(field.hintKey)}</p>
      ) : null}
      <p id={`${id}-bounds`} className="field-hint">{translate("validation.bounds", errorParams)}</p>
      {error ? <p id={errorId} role="status" className="text-sm font-medium text-alert">{translate(`validation.${error}`, errorParams)}</p> : null}
    </div>
  );
}

export const numericFieldError = calculatorFieldError;

function edgeLabel(
  value: number,
  field: CalculatorField,
  short: (value: number) => string,
): string {
  if (field.kind === "currency") return short(value);
  if (field.kind === "percent") return `${value}%`;
  return String(value);
}

/** Fields can hide themselves based on other answers, e.g. regime-only inputs. */
export function visibleFields(
  fields: CalculatorField[],
  values: FieldValues,
): CalculatorField[] {
  return fields.filter((field) => field.visibleWhen?.(values) ?? true);
}
