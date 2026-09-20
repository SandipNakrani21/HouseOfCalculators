"use client";

import { useState } from "react";

import type { BreakdownView, ResultKind } from "@/config/calculators/types";

const PAGE_SIZE = 24;

/**
 * Tabbed breakdown. The tab strip and table are shared by every calculator;
 * only the rows differ, which is what keeps a monthly amortisation schedule
 * and a tax band table looking like the same product.
 *
 * On narrow screens each row becomes a stacked card rather than a table that
 * scrolls sideways, because a horizontally scrolling table on a phone is
 * technically responsive and practically unusable.
 */
export function BreakdownPanel({
  views,
  format,
  t,
}: {
  views: BreakdownView[];
  format: (value: number | string, kind: ResultKind) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [activeId, setActiveId] = useState(views[0]?.id);
  const [page, setPage] = useState(0);

  const active = views.find((view) => view.id === activeId) ?? views[0];
  if (!active) return null;

  const paginated = active.paginate === true;
  const pageCount = paginated ? Math.ceil(active.rows.length / PAGE_SIZE) : 1;
  const rows = paginated
    ? active.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    : active.rows;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("calc.breakdown")}</h2>

        {views.length > 1 ? (
          <div role="tablist" aria-label={t("calc.breakdown")} className="flex gap-1">
            {views.map((view) => {
              const selected = view.id === active.id;
              return (
                <button
                  key={view.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveId(view.id);
                    setPage(0);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-surface-muted"
                  }`}
                >
                  {t(view.labelKey)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Table for tablet and up */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{t(active.labelKey)}</caption>
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              {active.columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="py-2 text-start font-medium"
                >
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index}>
                {active.columns.map((column) => (
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

      {/* Stacked cards on phones */}
      <ul className="space-y-3 sm:hidden">
        {rows.map((row, index) => (
          <li
            key={index}
            className="rounded-xl border border-border bg-surface-muted p-3"
          >
            <dl className="space-y-1">
              {active.columns.map((column) => (
                <div key={column.key} className="flex justify-between gap-3">
                  <dt className="text-xs text-muted">{t(column.labelKey)}</dt>
                  <dd className="tabular text-xs font-medium text-foreground">
                    {format(row[column.key], column.kind)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <nav
          aria-label={t("calc.breakdownPages")}
          className="mt-4 flex items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={page === 0}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
          >
            {t("common.previous")}
          </button>
          <span className="tabular text-xs text-muted">
            {t("common.pageOf", { current: page + 1, total: pageCount })}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(current + 1, pageCount - 1))
            }
            disabled={page >= pageCount - 1}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
          >
            {t("common.next")}
          </button>
        </nav>
      ) : null}
    </section>
  );
}
