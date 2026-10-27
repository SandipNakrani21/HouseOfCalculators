import type { ChartTable } from "@/config/charts/definitions";
import type { TranslateFn } from "@/lib/i18n/core";

export const CONVERSION_CONTEXT_SLUGS = ["length-conversion-table", "area-conversion-table", "volume-conversion-table", "pressure-conversion-table", "temperature-conversion-table", "speed-conversion-table"];
export const CONVERSION_REFERENCE = "https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors";

export function ConversionContext({ slug, table, t }: { slug: string; table: ChartTable; t: TranslateFn }) {
  if (!CONVERSION_CONTEXT_SLUGS.includes(slug)) return null;
  return <section className="mt-4 space-y-3 text-sm leading-relaxed text-muted" data-conversion-context={slug}>
    <h3 className="font-semibold text-heading">{t("quality.example")}</h3>
    {slug !== "temperature-conversion-table" ? <p>{t("chart.conversion.explain.lookup")}</p> : null}
    <dl className="divide-y divide-border rounded-md border border-border px-3">{table.columns.map(column => <div className="flex flex-wrap justify-between gap-3 py-2" key={column.key}><dt>{column.label}</dt><dd className="tabular">{table.rows[0][column.key]}</dd></div>)}</dl>
    {slug === "volume-conversion-table" ? <p>{t("chart.volume.explain.context")}</p> : null}
    {slug === "pressure-conversion-table" ? <p>{t("chart.pressure.explain.context")}</p> : null}
    <h3 className="font-semibold text-heading">{t("calc.sources")}</h3>
    <a href={CONVERSION_REFERENCE} target="_blank" rel="noreferrer" className="text-primary underline">NIST SP 811 — Conversion factors</a>
  </section>;
}
