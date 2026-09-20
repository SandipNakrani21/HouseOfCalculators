import { MONEY_SCALE } from "@/config/calculators/scale";
import {
  num,
  type CalcContext,
  type CalculatorDef,
  type CalculatorField,
  type CalculatorResult,
} from "@/config/calculators/types";
import { amortisationSchedule, emi } from "@/lib/finance";

/**
 * Every level-payment loan on the site shares one engine. What differs between
 * a mortgage, a car loan and a student loan is the sensible range of each
 * input and the default rate, so those are the only things a definition below
 * actually specifies.
 */
function loanResult(
  principal: number,
  rate: number,
  years: number,
): CalculatorResult {
  const months = Math.round(years * 12);
  const monthly = emi(principal, rate, months);
  const totalPaid = monthly * months;
  const interest = Math.max(totalPaid - principal, 0);

  return {
    primary: {
      labelKey: "result.monthlyPayment",
      value: monthly,
      kind: "currency",
      emphasis: true,
    },
    rows: [
      {
        labelKey: "result.principal",
        value: principal,
        kind: "currency",
        tone: "principal",
      },
      {
        labelKey: "result.totalInterest",
        value: interest,
        kind: "currency",
        tone: "returns",
      },
      {
        labelKey: "result.totalPayable",
        value: totalPaid,
        kind: "currency",
        tone: "neutral",
      },
    ],
    chart: [
      { labelKey: "result.principal", value: principal, tone: "principal" },
      { labelKey: "result.totalInterest", value: interest, tone: "returns" },
    ],
    table: {
      columns: [
        { key: "year", labelKey: "table.year", kind: "number" },
        { key: "principalPaid", labelKey: "table.principalPaid", kind: "currency" },
        { key: "interestPaid", labelKey: "table.interestPaid", kind: "currency" },
        { key: "balance", labelKey: "table.balance", kind: "currency" },
      ],
      rows: amortisationSchedule(principal, rate, months).map((entry) => ({
        ...entry,
      })),
    },
  };
}

/** Typical headline rate per country, used as the slider's starting point. */
const DEFAULT_MORTGAGE_RATE: Record<string, number> = {
  in: 8.5,
  us: 6.5,
  gb: 4.5,
  ca: 4.75,
  au: 6,
  de: 3.7,
  at: 3.7,
  ch: 1.9,
  fr: 3.3,
  be: 3.3,
  nl: 3.8,
  jp: 1.5,
  es: 3.2,
  mx: 11,
  it: 3.4,
  pt: 3.3,
  br: 11,
  pl: 7.5,
  tr: 40,
  ae: 4.5,
};

function mortgageRate(country: string): number {
  return DEFAULT_MORTGAGE_RATE[country] ?? 5;
}

const ALL = [
  "in",
  "us",
  "gb",
  "ae",
  "ca",
  "au",
  "de",
  "at",
  "ch",
  "fr",
  "be",
  "nl",
  "jp",
  "es",
  "mx",
  "it",
  "pt",
  "br",
  "pl",
  "tr",
] as const;

export const mortgageCalculator: CalculatorDef = {
  slug: "mortgage",
  icon: "🏠",
  category: "loan",
  titleKey: "calc.mortgage.title",
  descKey: "calc.mortgage.desc",
  countries: [...ALL],
  fields: ({ countryCode }: CalcContext): CalculatorField[] => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "price",
        labelKey: "field.propertyPrice",
        kind: "currency",
        min: scale.loanMin,
        max: scale.loanMax,
        step: scale.loanStep,
        default: scale.defaults.property,
      },
      {
        id: "downPayment",
        labelKey: "field.downPayment",
        kind: "percent",
        min: 0,
        max: 90,
        step: 1,
        default: 20,
      },
      {
        id: "rate",
        labelKey: "field.interestRate",
        kind: "percent",
        min: 0.5,
        max: 50,
        step: 0.05,
        default: mortgageRate(countryCode),
      },
      {
        id: "years",
        labelKey: "field.loanTerm",
        kind: "years",
        min: 1,
        max: 40,
        step: 1,
        default: 25,
      },
    ];
  },
  compute: (values) => {
    const price = num(values, "price");
    const principal = price * (1 - num(values, "downPayment") / 100);
    const result = loanResult(principal, num(values, "rate"), num(values, "years"));
    return {
      ...result,
      rows: [
        {
          labelKey: "result.loanAmount",
          value: principal,
          kind: "currency",
          tone: "neutral",
        },
        ...result.rows.slice(1),
      ],
      notes: [{ key: "calc.mortgage.note" }],
    };
  },
  explainerKeys: ["calc.mortgage.explain"],
};

export const autoLoanCalculator: CalculatorDef = {
  slug: "auto-loan",
  icon: "🚗",
  category: "loan",
  titleKey: "calc.auto-loan.title",
  descKey: "calc.auto-loan.desc",
  countries: [...ALL],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "price",
        labelKey: "field.vehiclePrice",
        kind: "currency",
        min: scale.lumpMin,
        max: Math.round(scale.lumpMax / 4),
        step: scale.lumpStep,
        default: Math.round(scale.defaults.property * 0.08),
      },
      {
        id: "downPayment",
        labelKey: "field.downPayment",
        kind: "percent",
        min: 0,
        max: 80,
        step: 1,
        default: 15,
      },
      {
        id: "rate",
        labelKey: "field.interestRate",
        kind: "percent",
        min: 0.5,
        max: 60,
        step: 0.1,
        default: mortgageRate(countryCode) + 2,
      },
      {
        id: "years",
        labelKey: "field.loanTerm",
        kind: "years",
        min: 1,
        max: 8,
        step: 1,
        default: 5,
      },
    ];
  },
  compute: (values) =>
    loanResult(
      num(values, "price") * (1 - num(values, "downPayment") / 100),
      num(values, "rate"),
      num(values, "years"),
    ),
  explainerKeys: ["calc.auto-loan.explain"],
};

export const personalLoanCalculator: CalculatorDef = {
  slug: "loan",
  icon: "🏦",
  category: "loan",
  titleKey: "calc.loan.title",
  descKey: "calc.loan.desc",
  countries: [...ALL],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "principal",
        labelKey: "field.loanAmount",
        kind: "currency",
        min: scale.loanMin,
        max: scale.loanMax,
        step: scale.loanStep,
        default: scale.defaults.loan,
      },
      {
        id: "rate",
        labelKey: "field.interestRate",
        kind: "percent",
        min: 0.5,
        max: 60,
        step: 0.05,
        default: mortgageRate(countryCode) + 3,
      },
      {
        id: "years",
        labelKey: "field.loanTerm",
        kind: "years",
        min: 1,
        max: 30,
        step: 1,
        default: 5,
      },
    ];
  },
  compute: (values) =>
    loanResult(num(values, "principal"), num(values, "rate"), num(values, "years")),
  explainerKeys: ["calc.loan.explain"],
  faqKeys: ["calc.loan.faq.1", "calc.loan.faq.2"],
};

export const studentLoanCalculator: CalculatorDef = {
  slug: "student-loan",
  icon: "🎓",
  category: "loan",
  titleKey: "calc.student-loan.title",
  descKey: "calc.student-loan.desc",
  countries: ["us", "gb", "ca", "au", "in"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "principal",
        labelKey: "field.loanBalance",
        kind: "currency",
        min: scale.lumpMin,
        max: Math.round(scale.lumpMax / 4),
        step: scale.lumpStep,
        default: Math.round(scale.defaults.income * 0.5),
      },
      {
        id: "rate",
        labelKey: "field.interestRate",
        kind: "percent",
        min: 0,
        max: 20,
        step: 0.05,
        default: countryCode === "gb" ? 7.3 : 6,
      },
      {
        id: "years",
        labelKey: "field.repaymentTerm",
        kind: "years",
        min: 1,
        max: 30,
        step: 1,
        default: 10,
      },
    ];
  },
  compute: (values, { countryCode }) => ({
    ...loanResult(
      num(values, "principal"),
      num(values, "rate"),
      num(values, "years"),
    ),
    notes:
      countryCode === "gb" || countryCode === "au"
        ? [{ key: "calc.student-loan.note.incomeContingent" }]
        : [{ key: "calc.student-loan.note.generic" }],
  }),
  explainerKeys: ["calc.student-loan.explain"],
};
