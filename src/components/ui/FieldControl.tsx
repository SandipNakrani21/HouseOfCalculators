"use client";

import { useId } from "react";

import type { CalculatorField, FieldValues } from "@/config/calculators/types";
import { useLocale } from "@/lib/locale-context";

type Props = {
  field: CalculatorField;
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
  /** Placeholders for the label copy, e.g. the country name for its tax. */
  params?: Record<string, string | number>;
};

/**
 * One labelled input. Numeric fields pair an editable box with a slider,
 * the way a finance calculator is usually driven: type an exact figure, or
 * drag to explore.
 */
export function FieldControl({ field, value, onChange, params }: Props) {
  const { t: translate, fmt } = useLocale();
  const t = (key: string) => translate(key, params);
  const id = useId();

  if (field.kind === "select") {
    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
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
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary-soft font-medium text-primary"
                    : "border-border bg-surface text-muted hover:border-border-strong"
                }`}
              >
                {option.label ?? t(option.labelKey)}
              </button>
            );
          })}
        </div>
        {field.hintKey ? (
          <p className="text-xs text-muted">{t(field.hintKey)}</p>
        ) : null}
      </div>
    );
  }

  if (field.kind === "toggle") {
    const checked = value === true || value === "true";
    return (
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="text-sm font-medium text-foreground">
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
          className="mt-1 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-border transition-colors before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-surface before:transition-transform checked:bg-primary checked:before:translate-x-4.5"
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {t(field.labelKey)}
        </label>

        <div className="flex items-center gap-1 rounded-lg bg-primary-soft px-2.5 py-1.5 text-primary focus-within:ring-2 focus-within:ring-[var(--ring)]">
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
            className="tabular w-24 bg-transparent text-end text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix ? <span className="text-sm font-medium">{suffix}</span> : null}
        </div>
      </div>

      {field.slider === false ? null : (
        <div className="space-y-1">
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
          <div className="flex justify-between text-[11px] text-muted">
            <span className="tabular">{edgeLabel(min, field, fmt.currencyShort)}</span>
            <span className="tabular">{edgeLabel(max, field, fmt.currencyShort)}</span>
          </div>
        </div>
      )}

      {field.hintKey ? (
        <p className="text-xs text-muted">{t(field.hintKey)}</p>
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
