import type { CalcContext } from "@/config/calculators/types";
import { FOUR_POINT } from "@/config/calculators/definitions/education";

const KEYS: Record<string, string> = { roi: "roi", roas: "roas", "break-even": "breakEven", concrete: "concrete", tile: "tile", "roof-area": "roof", statistics: "statistics", gpa: "gpa" };
const REFERENCES: Record<string, { name: string; href: string }> = {
  roi: { name: "Investor.gov — Fees and expenses", href: "https://www.investor.gov/introduction-investing/getting-started/understanding-fees" },
  "break-even": { name: "SBA — Break-even point", href: "https://legacy.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point" },
  statistics: { name: "NIST — Sample standard deviation", href: "https://www.itl.nist.gov/div898/handbook/prc/section2/prc23.htm" },
};

export const hasInterpretation = (slug: string) => Boolean(KEYS[slug]);

/** Fixed interpretation examples, with no extra client JavaScript. */
export function Interpretation({ slug, ctx }: { slug: string; ctx: CalcContext }) {
  const key = KEYS[slug];
  if (!key) return null;
  const { t, fmt } = ctx;
  const reference = REFERENCES[slug];
  return <section className="mt-5 space-y-3 rounded-md border border-border p-4" data-interpretation={slug}>
    <h3 className="font-semibold">{t("quality.example")}</h3>
    <p className="text-sm leading-relaxed text-muted">{t(`calc.${key}.explain.context`)}</p>
    {slug === "gpa" ? <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">{t("calc.gpa.title")}</caption><thead><tr><th scope="col" className="p-2 text-start">{t("field.courseGrade1")}</th><th scope="col" className="p-2 text-start">{t("calc.gpa.explain.points")}</th></tr></thead><tbody>{FOUR_POINT.map(entry => <tr key={entry.value} className="border-t border-border"><th scope="row" className="p-2 text-start font-normal">{t(entry.labelKey)}</th><td className="tabular p-2">{fmt.number(entry.points, { decimals: 1 })}</td></tr>)}</tbody></table></div> : null}
    {reference ? <p className="text-sm"><a href={reference.href} target="_blank" rel="noreferrer" className="text-primary underline">{reference.name}</a></p> : null}
  </section>;
}
