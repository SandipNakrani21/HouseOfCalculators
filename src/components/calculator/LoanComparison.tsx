import type { CalcContext, CalculatorDef } from "@/config/calculators/types";
import { loanComparisons } from "@/lib/loan-comparisons";

export function LoanComparison({ calculator, ctx }: { calculator: CalculatorDef; ctx: CalcContext }) {
  const scenarios = loanComparisons(calculator, ctx);
  if (!scenarios.length) return null;
  const { t, fmt } = ctx;
  const fields = calculator.fields(ctx);
  return <section data-loan-comparison={calculator.slug} className="mt-6 rounded-lg border border-border p-4 sm:p-6">
    <h3 className="font-semibold text-heading">{t("comparison.loan.title")}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted">{t("comparison.loan.intro")}</p>
    <div className="mt-4 overflow-x-auto rounded-md border border-border" role="region" aria-label={t("comparison.loan.title")} tabIndex={0}>
      <table className="w-full min-w-[38rem] text-start text-sm">
        <caption className="sr-only">{t("comparison.loan.intro")}</caption>
        <thead className="bg-bg-soft"><tr>{["quality.inputs", "result.monthlyPayment", "result.totalInterest", "result.totalPayable"].map(key => <th key={key} scope="col" className="p-3 text-start font-semibold">{t(key)}</th>)}</tr></thead>
        <tbody>{scenarios.map(({ fieldId, values, result }) => {
          const field = fields.find(item => item.id === fieldId);
          const value = fieldId ? Number(values[fieldId]) : 0;
          const label = field ? `${t(field.labelKey)}: ${field.kind === "percent" ? fmt.percent(value) : fmt.number(value)}` : t("comparison.loan.base");
          return <tr key={fieldId ?? "base"} className="border-t border-border">
            <th scope="row" className="p-3 text-start font-medium">{label}</th>
            {[result.primary, result.rows.find(row => row.labelKey === "result.totalInterest"), result.rows.find(row => row.labelKey === "result.totalPayable")].map((row, index) => <td key={index} className="tabular whitespace-nowrap p-3">{row && typeof row.value === "number" ? fmt.currency(row.value) : "—"}</td>)}
          </tr>;
        })}</tbody>
      </table>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-muted">{t("comparison.loan.scope")}</p>
    <p className="mt-3 text-sm leading-relaxed text-muted">{t("comparison.loan.apr")}</p>
    <p className="mt-3 text-sm"><a className="text-primary underline" href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/" target="_blank" rel="noreferrer">CFPB — Interest rate / APR (US)</a></p>
  </section>;
}
