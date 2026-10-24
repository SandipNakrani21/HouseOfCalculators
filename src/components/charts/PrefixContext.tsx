import type { TranslateFn } from "@/lib/i18n/core";

export const PREFIX_SOURCES = ["https://www.nist.gov/pml/owm/metric-si-prefixes", "https://pml.nist.gov/cuu/Units/binary.html"];
export function PrefixContext({ slug, t }: { slug: string; t: TranslateFn }) {
  if (slug !== "metric-prefixes") return null;
  return <section className="mt-4 space-y-3 text-sm leading-relaxed text-muted" data-prefix-context>
    <p>{t("chart.prefixes.explain.context")}</p>
    <h3 className="font-semibold">{t("calc.sources")}</h3>
    <ul>{PREFIX_SOURCES.map(href => <li key={href}><a href={href} className="text-primary underline" target="_blank" rel="noreferrer">NIST — {href.includes("binary") ? "Binary prefixes" : "SI prefixes"}</a></li>)}</ul>
  </section>;
}
