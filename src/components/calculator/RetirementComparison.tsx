import type { CalcContext, CalculatorDef } from "@/config/calculators/types";

/** Fixed teaching examples; the interactive result remains in CalculatorRunner. */
export function RetirementComparison({ calculator, ctx }: { calculator: CalculatorDef; ctx: CalcContext }) {
  if (calculator.slug !== "retirement") return null;
  const { t, fmt } = ctx;
  const fields = calculator.fields(ctx);
  const defaults = Object.fromEntries(fields.map(field => [field.id, field.default]));
  const rate = Number(defaults.rate);
  const inflation = Number(defaults.inflation);
  const scenarios = [defaults, { ...defaults, rate: Math.max(1, rate - 2), inflation: Math.min(30, inflation + 2) }];
  return (
    <section className="mt-6 rounded-lg border border-border p-4 sm:p-6" data-retirement-comparison>
      <h3 className="font-semibold">{t("calc.retirement.scenarios")}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("calc.retirement.scenarioNote")}</p>
      <div className="mt-4 overflow-x-auto rounded-md border border-border" role="region" aria-label={t("calc.retirement.scenarios")} tabIndex={0}>
        <table className="w-full min-w-[36rem] text-start text-sm">
          <caption className="sr-only">{t("calc.retirement.scenarioNote")}</caption>
          <thead className="bg-bg-soft"><tr>{["field.expectedReturn", "field.inflationRate", "result.corpusAtRetirement", "result.inTodaysMoney"].map(key => <th key={key} scope="col" className="p-3 text-start">{t(key)}</th>)}</tr></thead>
          <tbody>{scenarios.map((values, index) => {
            const result = calculator.compute(values, ctx);
            const present = result.rows.find(row => row.labelKey === "result.inTodaysMoney");
            return <tr key={index} className="border-t border-border">
              <th scope="row" className="tabular p-3 text-start font-normal">{fmt.percent(Number(values.rate))}</th>
              <td className="tabular p-3">{fmt.percent(Number(values.inflation))}</td>
              <td className="tabular whitespace-nowrap p-3">{fmt.currency(Number(result.primary.value))}</td>
              <td className="tabular whitespace-nowrap p-3">{fmt.currency(Number(present?.value))}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      <p className="mt-3 text-sm"><a className="text-primary underline underline-offset-4" href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" target="_blank" rel="noreferrer">Investor.gov — {t("calc.sources")}</a></p>
    </section>
  );
}
