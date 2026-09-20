import { MONEY_SCALE } from "@/config/calculators/scale";
import { num, type CalculatorDef } from "@/config/calculators/types";
import { amortisationSchedule, emi } from "@/lib/finance";

/**
 * Level-payment loan instalment. Called EMI in India and the Gulf, and simply
 * the monthly payment in the US and UK, which is why the copy is keyed per
 * country through the dictionary rather than fixed here.
 */
export const emiCalculator: CalculatorDef = {
  slug: "emi",
  icon: "🏦",
  category: "loan",
  titleKey: "calc.emi.title",
  descKey: "calc.emi.desc",
  countries: ["in", "us", "gb", "ae"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "principal",
        labelKey: "calc.emi.field.principal",
        kind: "currency",
        min: scale.loanMin,
        max: scale.loanMax,
        step: scale.loanStep,
        default: scale.defaults.loan,
      },
      {
        id: "rate",
        labelKey: "calc.emi.field.rate",
        kind: "percent",
        min: 1,
        max: 25,
        step: 0.05,
        default: countryCode === "in" ? 8.5 : countryCode === "us" ? 6.5 : 5.5,
      },
      {
        id: "years",
        labelKey: "calc.emi.field.years",
        kind: "years",
        min: 1,
        max: 35,
        step: 1,
        default: 20,
      },
    ];
  },
  compute: (values) => {
    const principal = num(values, "principal");
    const rate = num(values, "rate");
    const months = Math.round(num(values, "years") * 12);

    const monthly = emi(principal, rate, months);
    const totalPaid = monthly * months;
    const interest = Math.max(totalPaid - principal, 0);
    const schedule = amortisationSchedule(principal, rate, months);

    return {
      primary: {
        labelKey: "calc.emi.result.monthly",
        value: monthly,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        {
          labelKey: "calc.emi.result.principal",
          value: principal,
          kind: "currency",
          tone: "principal",
        },
        {
          labelKey: "calc.emi.result.interest",
          value: interest,
          kind: "currency",
          tone: "returns",
        },
        {
          labelKey: "calc.emi.result.total",
          value: totalPaid,
          kind: "currency",
          tone: "neutral",
        },
      ],
      chart: [
        {
          labelKey: "calc.emi.result.principal",
          value: principal,
          tone: "principal",
        },
        {
          labelKey: "calc.emi.result.interest",
          value: interest,
          tone: "returns",
        },
      ],
      table: {
        columns: [
          { key: "year", labelKey: "calc.emi.table.year", kind: "number" },
          {
            key: "principalPaid",
            labelKey: "calc.emi.table.principal",
            kind: "currency",
          },
          {
            key: "interestPaid",
            labelKey: "calc.emi.table.interest",
            kind: "currency",
          },
          { key: "balance", labelKey: "calc.emi.table.balance", kind: "currency" },
        ],
        rows: schedule.map((entry) => ({ ...entry })),
      },
    };
  },
  explainerKeys: ["calc.emi.explain.1", "calc.emi.explain.2"],
  faqKeys: ["calc.emi.faq.1", "calc.emi.faq.2"],
};
