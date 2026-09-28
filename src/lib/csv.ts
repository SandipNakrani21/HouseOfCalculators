/**
 * CSV export for the "Download CSV" button: every field quoted, so separators
 * inside formatted numbers stay put, with a BOM so Excel reads it as UTF-8.
 */
export function downloadCsv(name: string, rows: string[][]): void {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(name)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
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
