"use client";

import { useMemo, useState } from "react";

import {
  getConverter,
} from "@/config/converters/definitions";
import {
  TABLE_STEPS,
  convert,
  findUnit,
  unitRatio,
} from "@/config/converters/units";
import { useLocale } from "@/lib/locale-context";

/**
 * The converter UI. Like the calculators, the conversion is deterministic and
 * runs in the browser - typing a number and waiting for a server round trip
 * would be a worse experience for no benefit.
 */
export function ConverterRunner({
  slug,
  /** Fixed pair for a dedicated pair page, e.g. meters to feet. */
  initialFrom,
  initialTo,
  /** Pair pages keep their units; the category page lets you change both. */
  lockUnits = false,
}: {
  slug: string;
  initialFrom?: string;
  initialTo?: string;
  lockUnits?: boolean;
}) {
  const { t, fmt } = useLocale();
  const definition = getConverter(slug);

  const [from, setFrom] = useState(
    initialFrom ?? definition?.defaultPair[0] ?? "",
  );
  const [to, setTo] = useState(initialTo ?? definition?.defaultPair[1] ?? "");
  const [value, setValue] = useState(1);

  const result = useMemo(
    () => (definition ? convert(definition, value, from, to) : 0),
    [definition, value, from, to],
  );

  const ratio = useMemo(
    () => (definition ? unitRatio(definition, from, to) : 0),
    [definition, from, to],
  );

  if (!definition) return null;

  const fromUnit = findUnit(definition, from);
  const toUnit = findUnit(definition, to);
  if (!fromUnit || !toUnit) return null;

  const decimals = toUnit.decimals ?? 4;
  const show = (input: number) =>
    fmt.number(input, { decimals: trimDecimals(input, decimals) });

  const selectClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2">
            <label
              htmlFor="converter-value"
              className="block text-sm font-medium"
            >
              {t("conv.from")}
            </label>
            <input
              id="converter-value"
              type="number"
              inputMode="decimal"
              value={Number.isFinite(value) ? value : ""}
              onChange={(event) => setValue(Number(event.target.value))}
              className="tabular w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary"
            />
            <select
              aria-label={t("conv.fromUnit")}
              value={from}
              disabled={lockUnits}
              onChange={(event) => setFrom(event.target.value)}
              className={selectClass}
            >
              {definition.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {t(unit.labelKey)} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center pb-2">
            <button
              type="button"
              aria-label={t("conv.swap")}
              disabled={lockUnits}
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              className="rounded-full border border-border p-2.5 transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h12l-3-3M16 13H4l3 3" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium">{t("conv.to")}</span>
            <output
              aria-live="polite"
              className="tabular block rounded-lg bg-primary-soft px-3 py-2.5 text-lg font-bold text-primary"
            >
              {show(result)}
            </output>
            <select
              aria-label={t("conv.toUnit")}
              value={to}
              disabled={lockUnits}
              onChange={(event) => setTo(event.target.value)}
              className={selectClass}
            >
              {definition.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {t(unit.labelKey)} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="tabular mt-5 border-t border-border pt-4 text-sm text-muted">
          {t("conv.rate", {
            from: `1 ${fromUnit.symbol}`,
            to: `${show(ratio)} ${toUnit.symbol}`,
          })}
        </p>
      </section>

      {/* Quick reference table: the thing people scan rather than type into. */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
        <h2 className="mb-4 text-lg font-semibold">
          {t("conv.table.title", {
            from: t(fromUnit.labelKey),
            to: t(toUnit.labelKey),
          })}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="py-2 text-start font-medium">
                  {t(fromUnit.labelKey)} ({fromUnit.symbol})
                </th>
                <th scope="col" className="py-2 text-start font-medium">
                  {t(toUnit.labelKey)} ({toUnit.symbol})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TABLE_STEPS.map((step) => (
                <tr key={step}>
                  <td className="tabular py-2.5">{fmt.number(step)}</td>
                  <td className="tabular py-2.5 font-medium">
                    {show(convert(definition, step, from, to))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/**
 * Small results need their decimals, large ones do not: showing
 * 3,280.840000 helps nobody, and 0.000000 helps even less.
 */
function trimDecimals(value: number, max: number): number {
  const magnitude = Math.abs(value);
  if (magnitude === 0) return 0;
  if (magnitude >= 1000) return 0;
  if (magnitude >= 100) return Math.min(max, 2);
  if (magnitude >= 1) return Math.min(max, 4);
  return Math.min(max + 4, 8);
}
