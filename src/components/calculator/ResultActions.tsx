"use client";

import { ActionBar } from "@/components/ui/ActionBar";
import type {
  CalculatorResult,
  FieldValues,
  ResultKind,
} from "@/config/calculators/types";
import type { CountryCode } from "@/config/countries";
import { downloadCsv } from "@/lib/csv";
import { buildShareUrl } from "@/lib/share-link";

/**
 * Reset, print, export and share for a calculator: the shared ActionBar, with
 * the calculator's own CSV (headline, rows, breakdown tables) and a share
 * link that carries its inputs.
 *
 * The share link carries the inputs as query parameters, which are the
 * visitor's own numbers - so the link is only created when they ask for it,
 * and the parameters are deliberately not part of any canonical URL.
 */
export function ResultActions({
  title,
  values,
  result,
  format,
  t,
  country,
  onReset,
}: {
  title: string;
  values: FieldValues;
  result: CalculatorResult;
  format: (value: number | string, kind: ResultKind, decimals?: number) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Carried in the link when the answer depends on the country. */
  country?: CountryCode;
  onReset: () => void;
}) {
  const exportCsv = () => {
    const rows: string[][] = [[t("export.item"), t("export.value")]];
    rows.push([
      t(result.primary.labelKey),
      format(result.primary.value, result.primary.kind, result.primary.decimals),
    ]);
    for (const row of result.rows) {
      rows.push([t(row.labelKey), format(row.value, row.kind, row.decimals)]);
    }

    for (const view of result.breakdown ?? []) {
      rows.push([], [t(view.labelKey)]);
      rows.push(view.columns.map((column) => t(column.labelKey)));
      for (const entry of view.rows) {
        rows.push(
          view.columns.map((column) => format(entry[column.key], column.kind, column.decimals)),
        );
      }
    }

    downloadCsv(title, rows);
  };

  return (
    <ActionBar
      onReset={onReset}
      onDownloadCsv={exportCsv}
      shareUrl={() => buildShareUrl(window.location.href, values, country)}
      shareTitle={title}
    />
  );
}
