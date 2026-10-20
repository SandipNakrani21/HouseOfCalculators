"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import type { ChartTable } from "@/config/charts/definitions";
import { useLocale } from "@/lib/locale-context";

/**
 * The full table is server rendered. A visitor can filter it locally without
 * creating indexed query variants or replacing the published reference data.
 *
 * Wide tables scroll horizontally inside their own container rather than
 * pushing the page sideways, and the first column is the row's label so the
 * table still makes sense when scrolled.
 */
export function ReferenceTable({ table, caption }: { table: ChartTable; caption: string }) {
  const { t } = useLocale();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const interactive = useSyncExternalStore(subscribeNever, readInteractive, readNotInteractive);
  const rows = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length ? table.rows.filter(row => {
      const text = table.columns.map(column => row[column.key] ?? "").join(" ").toLowerCase();
      return terms.every(term => text.includes(term));
    }) : table.rows;
  }, [query, table]);
  return (
    <figure data-reveal="up" className="card p-5 sm:p-7">
      <div data-print-exclude className="mb-4 space-y-2">
        <label htmlFor={inputId} className="field-label">{t("chart.filter")}</label>
        <div className="flex flex-wrap gap-3">
          <input id={inputId} type="search" value={query} disabled={!interactive} onChange={event => setQuery(event.target.value)}
            aria-describedby={`${inputId}-hint`} className="input min-w-0 flex-1" />
          <button type="button" className="btn btn-outline btn-md" onClick={() => setQuery("")} disabled={!interactive || !query}>{t("common.reset")}</button>
        </div>
        <p id={`${inputId}-hint`} className="field-hint">{t("chart.filterHint")}</p>
      </div>
      <div tabIndex={0} role="region" aria-label={caption} className="max-h-[65dvh] overflow-auto overscroll-contain rounded-md border border-border focus-visible:outline-2 focus-visible:outline-primary">
        <table className="data-table reference-table">
          <caption className="sr-only">{caption}{query.trim() ? ` — ${query.trim()}` : ""}</caption>
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column.key} scope="col" className="whitespace-nowrap pe-4">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {table.columns.map((column, columnIndex) =>
                  columnIndex === 0 ? (
                    <th
                      key={column.key}
                      scope="row"
                      className="tabular whitespace-nowrap pe-4 font-medium text-foreground"
                    >
                      {row[column.key]}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      className="tabular whitespace-nowrap pe-4 text-muted"
                    >
                      {row[column.key]}
                    </td>
                  ),
                )}
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={table.columns.length} role="status">{t("chart.filterEmpty")}</td></tr> : null}
          </tbody>
        </table>
      </div>

      {table.note ? (
        <figcaption className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">
          {table.note}
        </figcaption>
      ) : null}
    </figure>
  );
}

const subscribeNever = () => () => {};
const readInteractive = () => true;
const readNotInteractive = () => false;
