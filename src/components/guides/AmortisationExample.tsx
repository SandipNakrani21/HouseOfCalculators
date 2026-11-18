import { ButtonLink } from "@/components/ui/Button";
import type { GuideDefinition } from "@/config/guides/definitions";
import type { LocaleCode } from "@/config/locales";
import { amortisationMonths } from "@/lib/finance";
import type { Formatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n/core";
import { contentPath } from "@/lib/routes";

/** Server-rendered teaching example, with no separate calculation model. */
export function AmortisationExample({ example, t, fmt, locale }: {
  example: NonNullable<GuideDefinition["amortisationExample"]>;
  t: TranslateFn;
  fmt: Formatter;
  locale: LocaleCode;
}) {
  const { principal, annualRate, months } = example;
  const rows = amortisationMonths(principal, annualRate, months);
  const first = rows[0];
  const selected = rows.filter((row) => row.period <= 2 || row.period === months);
  const number = (value: number) => fmt.number(value, { decimals: 2 });
  const totalInterest = rows.reduce((sum, row) => sum + row.interestPaid, 0);
  const totals: [string, number][] = [
    ["result.principal", principal],
    ["result.totalInterest", totalInterest],
    ["result.totalPayable", principal + totalInterest],
  ];
  return (
    <>
      <section className="mt-10" aria-labelledby="schedule-columns">
        <h2 id="schedule-columns" className="mb-3 text-xl font-bold">{t("guide.read-schedule.columns.title")}</h2>
        <p className="text-sm leading-relaxed">{t("guide.read-schedule.columns.body")}</p>
      </section>
      <section className="mt-10" aria-labelledby="schedule-example">
        <h2 id="schedule-example" className="mb-3 text-xl font-bold">{t("guide.read-schedule.example.title")}</h2>
        <p className="mb-4 text-sm leading-relaxed">{t("guide.read-schedule.example.assumptions", {
          amount: number(principal), rate: fmt.number(annualRate), months: fmt.number(months),
        })}</p>
        <div className="overflow-x-auto rounded-sm border border-border focus-visible:outline-2 focus-visible:outline-primary" role="region" aria-labelledby="schedule-table-caption" tabIndex={0}>
          <table className="data-table w-full tabular text-sm">
            <caption id="schedule-table-caption" className="px-4 py-3 text-start text-sm font-semibold">{t("guide.read-schedule.example.title")}</caption>
            <thead><tr>
              {["table.month", "guide.read-schedule.opening", "table.payment", "table.interestPaid", "table.principalPaid", "table.balance"].map((key) => <th key={key} scope="col">{t(key)}</th>)}
            </tr></thead>
            <tbody>{selected.map((row) => (
              <tr key={row.period}>
                <th scope="row">{fmt.number(row.period)}</th>
                <td>{number(row.period === 1 ? principal : rows[row.period - 2].balance)}</td>
                <td>{number(row.payment)}</td>
                <td>{number(row.interestPaid)}</td>
                <td>{number(row.principalPaid)}</td>
                <td>{number(row.balance)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <h3 className="mb-2 mt-6 text-lg font-semibold">{t("guide.read-schedule.check.title")}</h3>
        <p className="text-sm leading-relaxed">{t("guide.read-schedule.check.body", {
          opening: number(principal), monthlyRate: fmt.number(annualRate / 12, { decimals: 2 }),
          interest: number(first.interestPaid), payment: number(first.payment),
          principal: number(first.principalPaid), closing: number(first.balance),
        })}</p>
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {totals.map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><dt>{t(key)}</dt><dd className="tabular font-semibold">{number(value)}</dd></div>)}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted">{t("guide.read-schedule.rounding")}</p>
        <p className="mb-4 mt-6 text-sm leading-relaxed">{t("guide.read-schedule.try")}</p>
        <ButtonLink href={contentPath(locale, "calculators", "finance", "loan")} variant="primary">{t("calc.loan.title")}</ButtonLink>
      </section>
    </>
  );
}
