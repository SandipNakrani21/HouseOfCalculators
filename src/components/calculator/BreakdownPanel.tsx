"use client";

import { useState, useSyncExternalStore } from "react";

import { TabList } from "@/components/ui/Tabs";
import type { BreakdownView, ResultKind } from "@/config/calculators/types";

const PAGE_SIZE = 24;
const mobileQuery = "(max-width: 639px)";
const subscribeSize = (callback: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const isMobile = () => window.matchMedia(mobileQuery).matches;

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
  format: (value: number | string, kind: ResultKind, decimals?: number) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [activeId, setActiveId] = useState(views[0]?.id);
  const [page, setPage] = useState(0);
  const mobile = useSyncExternalStore(subscribeSize, isMobile, () => false);
  const pageSize = mobile ? 6 : PAGE_SIZE;

  const active = views.find((view) => view.id === activeId) ?? views[0];
  if (!active) return null;

  const paginated = active.paginate === true;
  const pageCount = paginated ? Math.max(1, Math.ceil(active.rows.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount - 1);
  // A shorter schedule can remove the selected page. Persist the correction
  // before rendering so growing it again does not restore a stale page index.
  if (page !== currentPage) setPage(currentPage);
  const rows = paginated
    ? active.rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : active.rows;

  const pagination = pageCount > 1 ? (
        <nav
          aria-label={t("calc.breakdownPages")}
          className="mt-4 flex items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={currentPage === 0}
            className="rounded-md border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-heading transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            {t("common.previous")}
          </button>
          <span className="tabular text-xs text-muted">
            {t("common.pageOf", { current: currentPage + 1, total: pageCount })}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(current + 1, pageCount - 1))
            }
            disabled={currentPage >= pageCount - 1}
            className="rounded-md border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-heading transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            {t("common.next")}
          </button>
        </nav>
      ) : null;

  return (
    <section data-reveal="up" className="card p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{t("calc.breakdown")}</h2>

        {views.length > 1 ? (
          <TabList
            label={t("calc.breakdown")}
            idPrefix="breakdown"
            tabs={views.map((view) => ({ id: view.id, label: t(view.labelKey) }))}
            value={active.id}
            onChange={(id) => {
              setActiveId(id);
              setPage(0);
            }}
          />
        ) : null}
      </div>

      <div className="mb-4">{pagination}</div>

      {/* Table for tablet and up */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="data-table">
          <caption className="sr-only">{t(active.labelKey)}</caption>
          <thead>
            <tr>
              {active.columns.map((column) => (
                <th key={column.key} scope="col">
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {active.columns.map((column) => (
                  <td
                    key={column.key}
                    className="tabular text-foreground"
                  >
                    {format(row[column.key], column.kind, column.decimals)}
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
            className="rounded-md border border-border bg-surface-muted p-3 transition-colors duration-200 hover:border-primary/30 hover:bg-primary-light"
          >
            <dl className="space-y-1">
              {active.columns.map((column) => (
                <div key={column.key} className="flex justify-between gap-3">
                  <dt className="text-xs text-muted">{t(column.labelKey)}</dt>
                  <dd className="tabular text-xs font-medium text-foreground">
                    {format(row[column.key], column.kind, column.decimals)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pagination}

    </section>
  );
}
