"use client";

import { useState } from "react";

import type {
  CalculatorResult,
  FieldValues,
  ResultKind,
} from "@/config/calculators/types";

/**
 * Print, export and share.
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
}: {
  title: string;
  values: FieldValues;
  result: CalculatorResult;
  format: (value: number | string, kind: ResultKind, decimals?: number) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.search = "";
    for (const [key, value] of Object.entries(values)) {
      url.searchParams.set(key, String(value));
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the button simply does nothing.
    }
  };

  const share = async () => {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      // A cancelled share is not an error.
    }
  };

  const downloadCsv = () => {
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

    // Quote every field so separators inside formatted numbers stay put.
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([`﻿${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(title)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buttonClass =
    "rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted";

  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5 print:hidden">
      <button type="button" onClick={() => window.print()} className={buttonClass}>
        {t("actions.print")}
      </button>
      <button type="button" onClick={downloadCsv} className={buttonClass}>
        {t("actions.downloadCsv")}
      </button>
      <button type="button" onClick={copyLink} className={buttonClass}>
        {copied ? t("common.copied") : t("common.copyLink")}
      </button>
      <button type="button" onClick={share} className={buttonClass}>
        {t("actions.share")}
      </button>
    </div>
  );
}

function slugify(value: string): string {
  return (
    value
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "results"
  );
}
