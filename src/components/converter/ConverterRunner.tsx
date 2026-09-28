"use client";

import { ArrowLeftRight } from "lucide-react";
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
import { ActionBar } from "@/components/ui/ActionBar";
import { downloadCsv } from "@/lib/csv";
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

  const selectClass = "select font-medium disabled:cursor-default disabled:opacity-80";

  const reset = () => {
    setValue(1);
    setFrom(initialFrom ?? definition.defaultPair[0]);
    setTo(initialTo ?? definition.defaultPair[1]);
  };

  /** The conversion table below, as a spreadsheet. */
  const exportCsv = () =>
    downloadCsv(`${fromUnit.symbol}-to-${toUnit.symbol}`, [
      [`${t(fromUnit.labelKey)} (${fromUnit.symbol})`, `${t(toUnit.labelKey)} (${toUnit.symbol})`],
      ...TABLE_STEPS.map((step) => [fmt.number(step), show(convert(definition, step, from, to))]),
    ]);

  return (
    <div className="space-y-6">
      <section className="card animate-fade-up p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-2">
            <label
              htmlFor="converter-value"
              className="field-label"
            >
              {t("conv.from")}
            </label>
            <input
              id="converter-value"
              type="number"
              inputMode="decimal"
              value={Number.isFinite(value) ? value : ""}
              onChange={(event) => setValue(Number(event.target.value))}
              className="input tabular !px-4 !py-3 !text-xl font-bold"
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
              className="btn btn-primary btn-md btn-square disabled:opacity-40 disabled:shadow-none"
            >
              <ArrowLeftRight aria-hidden className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
            </button>
          </div>

          <div className="space-y-2">
            <span className="field-label">{t("conv.to")}</span>
            <output
              aria-live="polite"
              className="tabular block overflow-hidden rounded-md bg-gradient-result px-4 py-3 text-xl font-extrabold text-white shadow-primary"
            >
              <span key={show(result)} className="value-flash block truncate">
                {show(result)}
              </span>
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

        <p className="tabular mt-6 inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary">
          {t("conv.rate", {
            from: `1 ${fromUnit.symbol}`,
            to: `${show(ratio)} ${toUnit.symbol}`,
          })}
        </p>

        <ActionBar className="mt-7" onReset={reset} onDownloadCsv={exportCsv} />
      </section>

      {/* Quick reference table: the thing people scan rather than type into. */}
      <section data-reveal="up" className="card p-5 sm:p-7">
        <h2 className="mb-4 text-lg font-bold">
          {t("conv.table.title", {
            from: t(fromUnit.labelKey),
            to: t(toUnit.labelKey),
          })}
        </h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">
                  {t(fromUnit.labelKey)} ({fromUnit.symbol})
                </th>
                <th scope="col">
                  {t(toUnit.labelKey)} ({toUnit.symbol})
                </th>
              </tr>
            </thead>
            <tbody>
              {TABLE_STEPS.map((step) => (
                <tr key={step}>
                  <td className="tabular">{fmt.number(step)}</td>
                  <td className="tabular font-medium">
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
