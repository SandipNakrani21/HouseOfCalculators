"use client";

import { useId } from "react";

import type { CalculatorField, FieldValues } from "@/config/calculators/types";
import type { Formatter } from "@/lib/format";
import { useLocale } from "@/lib/locale-context";
import { MAX_TEXT } from "@/lib/share-link";

type Props = {
  field: CalculatorField;
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
  /** Placeholders for the label copy, e.g. the country name for its tax. */
  params?: Record<string, string | number>;
  /** Formatter for the page's country, which may differ from the visitor's. */
  fmt?: Formatter;
};

/**
 * One labelled input. Numeric fields pair an editable box with a slider,
 * the way a finance calculator is usually driven: type an exact figure, or
 * drag to explore.
 */
export function FieldControl({ field, value, onChange, params, fmt: override }: Props) {
  const { t: translate, fmt: localeFmt } = useLocale();
  const fmt = override ?? localeFmt;
  const t = (key: string) => translate(key, params);
  const id = useId();

  if (field.kind === "select") {
    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="field-label"
        >
          {t(field.labelKey)}
        </label>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const active = String(value) === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={active}
                className="segment"
              >
                {option.label ?? t(option.labelKey)}
              </button>
            );
          })}
        </div>
        {field.hintKey ? (
          <p className="field-hint">{t(field.hintKey)}</p>
        ) : null}
      </div>
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
          // The same cap a share link is held to (lib/share-link).
          maxLength={MAX_TEXT}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className="input"
        />
        {field.hintKey ? (
          <p className="field-hint">{t(field.hintKey)}</p>
        ) : null}
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
            <span className="mt-1 block text-xs font-normal text-muted">
              {t(field.hintKey)}
            </span>
          ) : null}
        </span>
        <input
          type="checkbox"
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
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="field-label">
          {t(field.labelKey)}
        </label>

        <div className="flex h-11 items-center gap-1 rounded-sm bg-primary-light px-3 text-primary transition-shadow focus-within:ring-2 focus-within:ring-[var(--ring)]">
          {field.kind === "currency" ? (
            <span className="text-sm font-medium">{fmt.symbol}</span>
          ) : null}
          <input
            id={id}
            type="number"
            inputMode="decimal"
            value={Number.isFinite(numeric) ? numeric : ""}
            min={field.min}
            max={field.max}
            step={step}
            onChange={(event) => {
              const next = event.target.value === "" ? 0 : Number(event.target.value);
              onChange(Number.isFinite(next) ? next : 0);
            }}
            onBlur={(event) => {
              // Clamp only on blur so typing an intermediate value is not fought.
              const next = Number(event.target.value);
              if (!Number.isFinite(next)) return onChange(min);
              onChange(Math.min(Math.max(next, min), max));
            }}
            className="tabular h-full w-24 bg-transparent text-end text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix ? <span className="text-sm font-medium">{suffix}</span> : null}
        </div>
      </div>

      {field.slider === false ? null : (
        <div className="space-y-2">
          <input
            type="range"
            aria-label={t(field.labelKey)}
            value={Math.min(Math.max(numeric, min), max)}
            min={min}
            max={max}
            step={step}
            onChange={(event) => onChange(Number(event.target.value))}
            style={{ "--fill": `${fill}%` } as React.CSSProperties}
          />
          <div className="flex justify-between text-[0.6875rem] text-muted">
            <span className="tabular">{edgeLabel(min, field, fmt.currencyShort)}</span>
            <span className="tabular">{edgeLabel(max, field, fmt.currencyShort)}</span>
          </div>
        </div>
      )}

      {field.hintKey ? (
        <p className="field-hint">{t(field.hintKey)}</p>
      ) : null}
    </div>
  );
}

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
