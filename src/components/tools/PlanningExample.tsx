import type { Formatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n/core";
import { debtPayoff } from "@/lib/tools/planning";

/** Static teaching content, rendered on the server without additional client code. */
export function PlanningExample({ slug, t, fmt }: { slug: string; t: TranslateFn; fmt: Formatter }) {
  if (slug !== "savings-goal" && slug !== "debt-payoff") return null;
  const savings = slug === "savings-goal";
  const debt = debtPayoff({ balance: 1200, annualRate: 12, payment: 100 });
  const rows = [debt.schedule[0], debt.schedule[1], debt.schedule.at(-1)!];
  return <section className="space-y-3" data-planning-detail={slug}>
    <p className="text-sm leading-relaxed text-muted">{t(`tool.${slug}.explain.worked`)}</p>
    {savings ? <p className="result-box tabular text-sm [overflow-wrap:anywhere]">{fmt.currency(1000)} × (1 + 6% / 12) + {fmt.currency(200)} = {fmt.currency(1205)}<br />{fmt.currency(1205)} × (1 + 6% / 12) + {fmt.currency(200)} = {fmt.currency(1411.025)}</p> : <>
      <div className="overflow-x-auto" role="region" aria-label={t("quality.example")} tabIndex={0}>
        <table className="w-full min-w-[30rem] text-sm"><caption className="sr-only">{t("tool.debt-payoff.explain.worked")}</caption>
          <thead><tr>{["table.month", "table.payment", "table.interestPaid", "table.principalPaid", "table.balance"].map(key => <th key={key} scope="col" className="p-3 text-start">{t(key)}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.month} className="border-t border-border"><th scope="row" className="p-3 text-start">{fmt.number(row.month)}</th>{[row.payment, row.interest, row.principal, row.balance].map((value, index) => <td key={index} className="tabular whitespace-nowrap p-3">{fmt.currency(value)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="text-sm leading-relaxed text-muted">{t("tool.debt-payoff.explain.shortfall", { interest: fmt.currency(12), lower: fmt.currency(10), growth: fmt.currency(2) })}</p>
    </>}
  </section>;
}
