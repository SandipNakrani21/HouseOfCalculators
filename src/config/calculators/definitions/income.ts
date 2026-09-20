import { MONEY_SCALE } from "@/config/calculators/scale";
import {
  num,
  str,
  type CalculatorDef,
  type ResultRow,
} from "@/config/calculators/types";
import type { CountryCode } from "@/config/countries";
import { INCOME_TAX_RULES, contribution } from "@/lib/finance/tax";

const ALL: CountryCode[] = [
  "in", "us", "gb", "ae", "ca", "au", "de", "at", "ch", "fr",
  "be", "nl", "jp", "es", "mx", "it", "pt", "br", "pl", "tr",
  "ru", "cn",
];

/* ---------------------------------------------------------------- Salary */

export const salaryCalculator: CalculatorDef = {
  slug: "salary",
  icon: "💼",
  version: 1,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.salary.title",
  descKey: "calc.salary.desc",
  countries: ALL,
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    const rules = INCOME_TAX_RULES[countryCode];
    return [
      {
        id: "salary",
        labelKey: "field.grossSalary",
        kind: "currency",
        min: scale.incomeMin,
        max: scale.incomeMax,
        step: scale.incomeStep,
        default: scale.defaults.income,
      },
      {
        id: "period",
        labelKey: "field.payPeriod",
        kind: "select",
        default: "year",
        options: [
          { value: "year", labelKey: "option.perYear" },
          { value: "month", labelKey: "option.perMonth" },
        ],
      },
      ...(rules.regimes.length > 1
        ? [
            {
              id: "regime",
              labelKey: "field.regime",
              kind: "select" as const,
              default: rules.defaultRegime,
              options: rules.regimes.map((regime) => ({
                value: regime.value,
                labelKey: regime.labelKey,
              })),
            },
          ]
        : []),
    ];
  },
  compute: (values, { countryCode }) => {
    const rules = INCOME_TAX_RULES[countryCode];
    const entered = num(values, "salary");
    // The slider works in annual money; a monthly figure is scaled up to match.
    const annual = str(values, "period", "year") === "month" ? entered * 12 : entered;

    const result = rules.compute({
      grossIncome: annual,
      regime: str(values, "regime", rules.defaultRegime),
    });

    const socialTotal = result.social.reduce((sum, levy) => sum + levy.amount, 0);

    const rows: ResultRow[] = [
      { labelKey: "result.grossAnnual", value: annual, kind: "currency", tone: "neutral" },
      { labelKey: "result.incomeTax", value: result.incomeTax, kind: "currency", tone: "tax" },
    ];

    for (const levy of result.social) {
      rows.push({ labelKey: levy.labelKey, value: levy.amount, kind: "currency", tone: "tax" });
    }

    rows.push(
      {
        labelKey: "result.totalDeductions",
        value: result.totalTax,
        kind: "currency",
        tone: "tax",
      },
      {
        labelKey: "result.monthlyTakeHome",
        value: result.netIncome / 12,
        kind: "currency",
        emphasis: true,
        tone: "principal",
      },
      {
        labelKey: "result.effectiveRate",
        value: result.effectiveRate,
        kind: "percent",
        tone: "neutral",
      },
    );

    return {
      primary: {
        labelKey: "result.annualTakeHome",
        value: result.netIncome,
        kind: "currency",
        emphasis: true,
      },
      rows,
      chart: [
        { labelKey: "result.annualTakeHome", value: result.netIncome, tone: "principal" },
        { labelKey: "result.incomeTax", value: result.incomeTax, tone: "tax" },
        { labelKey: "result.socialContributions", value: socialTotal, tone: "neutral" },
      ],
      notes: [{ key: result.noteKey }],
    };
  },
  explainerKeys: ["calc.salary.explain"],
};

/* ------------------------------------------ Social contributions, by name */

/**
 * The same underlying contributions, presented as the calculator each country
 * actually searches for: National Insurance in the UK, CPP and EI in Canada,
 * Sozialversicherung in Germany. Each one filters the payroll levies its own
 * page is about.
 */
function contributionsCalculator({
  slug,
  icon,
  countries,
  titleKey,
  descKey,
  keep,
}: {
  slug: string;
  icon: string;
  countries: CountryCode[];
  titleKey: string;
  descKey: string;
  /** Which levy labels this page shows. Omit to show all of them. */
  keep?: string[];
}): CalculatorDef {
  return {
    slug,
    icon,
    version: 1,
    category: "finance",
    isCountrySpecific: true,
    titleKey,
    descKey,
    countries,
    fields: ({ countryCode }) => {
      const scale = MONEY_SCALE[countryCode];
      return [
        {
          id: "salary",
          labelKey: "field.grossSalary",
          kind: "currency",
          min: scale.incomeMin,
          max: scale.incomeMax,
          step: scale.incomeStep,
          default: scale.defaults.income,
        },
      ];
    },
    compute: (values, { countryCode }) => {
      const salary = num(values, "salary");
      const result = INCOME_TAX_RULES[countryCode].compute({ grossIncome: salary });
      const levies = keep
        ? result.social.filter((levy) => keep.includes(levy.labelKey))
        : result.social;
      const total = levies.reduce((sum, levy) => sum + levy.amount, 0);

      return {
        primary: {
          labelKey: "result.annualContribution",
          value: total,
          kind: "currency",
          emphasis: true,
        },
        rows: [
          ...levies.map((levy) => ({
            labelKey: levy.labelKey,
            value: levy.amount,
            kind: "currency" as const,
            tone: "tax" as const,
          })),
          {
            labelKey: "result.monthlyContribution",
            value: total / 12,
            kind: "currency",
            tone: "neutral",
          },
          {
            labelKey: "result.effectiveRate",
            value: salary > 0 ? (total / salary) * 100 : 0,
            kind: "percent",
            tone: "neutral",
          },
        ],
        chart: [
          { labelKey: "result.takeHome", value: salary - total, tone: "principal" },
          { labelKey: "result.annualContribution", value: total, tone: "tax" },
        ],
        notes: [{ key: `calc.${slug}.note` }],
      };
    },
    explainerKeys: [`calc.${slug}.explain`],
  };
}

export const nationalInsuranceCalculator = contributionsCalculator({
  slug: "national-insurance",
  icon: "🇬🇧",
  countries: ["gb"],
  titleKey: "calc.national-insurance.title",
  descKey: "calc.national-insurance.desc",
});

export const cppCalculator = contributionsCalculator({
  slug: "cpp",
  icon: "🍁",
  countries: ["ca"],
  titleKey: "calc.cpp.title",
  descKey: "calc.cpp.desc",
  keep: ["levy.cpp"],
});

export const eiCalculator = contributionsCalculator({
  slug: "ei",
  icon: "🧰",
  countries: ["ca"],
  titleKey: "calc.ei.title",
  descKey: "calc.ei.desc",
  keep: ["levy.ei"],
});

export const socialSecurityCalculator = contributionsCalculator({
  slug: "social-security",
  icon: "🛡️",
  countries: ["de", "at", "ch", "fr", "be", "es", "it", "pt", "pl", "jp", "tr", "us", "mx", "br", "cn"],
  titleKey: "calc.social-security.title",
  descKey: "calc.social-security.desc",
});

/* ------------------------------------------------ Netherlands 30% ruling */

export const thirtyPercentRulingCalculator: CalculatorDef = {
  slug: "30-percent-ruling",
  icon: "🧳",
  version: 1,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.30-percent-ruling.title",
  descKey: "calc.30-percent-ruling.desc",
  countries: ["nl"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "salary",
        labelKey: "field.grossSalary",
        kind: "currency",
        min: 40_000,
        max: scale.incomeMax,
        step: scale.incomeStep,
        default: 75_000,
      },
      {
        id: "rate",
        labelKey: "field.exemptShare",
        kind: "select",
        default: "30",
        options: [
          { value: "30", labelKey: "", label: "30%" },
          { value: "27", labelKey: "", label: "27%" },
        ],
      },
    ];
  },
  compute: (values) => {
    const salary = num(values, "salary");
    const share = num(values, "rate", 30) / 100;

    // The exemption applies up to the capped salary only.
    const CAP = 246_000;
    const exempt = Math.min(salary, CAP) * share;
    const taxableSalary = salary - exempt;

    const rules = INCOME_TAX_RULES.nl;
    const withRuling = rules.compute({ grossIncome: taxableSalary });
    const without = rules.compute({ grossIncome: salary });

    const netWith = withRuling.netIncome + exempt;
    const benefit = netWith - without.netIncome;

    return {
      primary: {
        labelKey: "result.annualBenefit",
        value: benefit,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.exemptAmount", value: exempt, kind: "currency", tone: "returns" },
        { labelKey: "result.taxableSalary", value: taxableSalary, kind: "currency", tone: "neutral" },
        { labelKey: "result.netWithoutRuling", value: without.netIncome, kind: "currency", tone: "neutral" },
        { labelKey: "result.netWithRuling", value: netWith, kind: "currency", tone: "principal" },
        { labelKey: "result.monthlyBenefit", value: benefit / 12, kind: "currency", tone: "returns" },
      ],
      chart: [
        { labelKey: "result.netWithoutRuling", value: without.netIncome, tone: "neutral" },
        { labelKey: "result.annualBenefit", value: Math.max(benefit, 0), tone: "returns" },
      ],
      notes: [{ key: "calc.30-percent-ruling.note" }],
    };
  },
  explainerKeys: ["calc.30-percent-ruling.explain"],
};

/* ------------------------------------------------------ Dutch employer cost */

export const payrollCalculator: CalculatorDef = {
  slug: "payroll",
  icon: "🧾",
  version: 1,
  category: "business",
  isCountrySpecific: true,
  titleKey: "calc.payroll.title",
  descKey: "calc.payroll.desc",
  countries: ["nl", "de", "be", "fr"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "salary",
        labelKey: "field.grossSalary",
        kind: "currency",
        min: scale.incomeMin,
        max: scale.incomeMax,
        step: scale.incomeStep,
        default: scale.defaults.income,
      },
      {
        id: "holidayPay",
        labelKey: "field.holidayAllowance",
        kind: "percent",
        min: 0,
        max: 15,
        step: 0.5,
        default: countryCode === "nl" ? 8 : 0,
      },
    ];
  },
  compute: (values, { countryCode }) => {
    const salary = num(values, "salary");
    const holiday = (salary * num(values, "holidayPay")) / 100;
    const base = salary + holiday;

    // Indicative employer social charges as a share of gross pay.
    const employerRate: Record<string, number> = { nl: 20, de: 21, be: 25, fr: 42 };
    const employer = contribution(base, employerRate[countryCode] ?? 20);
    const employee = INCOME_TAX_RULES[countryCode].compute({ grossIncome: base });

    return {
      primary: {
        labelKey: "result.employerCost",
        value: base + employer,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.grossAnnual", value: salary, kind: "currency", tone: "principal" },
        ...(holiday > 0
          ? [
              {
                labelKey: "result.holidayAllowance",
                value: holiday,
                kind: "currency" as const,
                tone: "neutral" as const,
              },
            ]
          : []),
        { labelKey: "result.employerContributions", value: employer, kind: "currency", tone: "tax" },
        { labelKey: "result.annualTakeHome", value: employee.netIncome, kind: "currency", tone: "returns" },
      ],
      chart: [
        { labelKey: "result.annualTakeHome", value: employee.netIncome, tone: "principal" },
        { labelKey: "result.totalDeductions", value: employee.totalTax, tone: "neutral" },
        { labelKey: "result.employerContributions", value: employer, tone: "tax" },
      ],
      notes: [{ key: "calc.payroll.note" }],
    };
  },
  explainerKeys: ["calc.payroll.explain"],
};

/* ------------------------------------------------- Türkiye severance pay */

export const severancePayCalculator: CalculatorDef = {
  slug: "severance-pay",
  icon: "📤",
  version: 1,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.severance-pay.title",
  descKey: "calc.severance-pay.desc",
  countries: ["tr"],
  fields: () => [
    {
      id: "salary",
      labelKey: "field.monthlyGrossSalary",
      kind: "currency",
      min: 20_000,
      max: 500_000,
      step: 1_000,
      default: 50_000,
    },
    {
      id: "years",
      labelKey: "field.yearsOfService",
      kind: "years",
      min: 1,
      max: 40,
      step: 1,
      default: 5,
    },
  ],
  compute: (values) => {
    const salary = num(values, "salary");
    const years = num(values, "years");

    // One month's gross pay per year of service, capped per year.
    const CEILING = 53_919.68;
    const perYear = Math.min(salary, CEILING);
    const severance = perYear * years;

    // Statutory notice pay rises in steps with tenure.
    const noticeWeeks = years < 0.5 ? 2 : years < 1.5 ? 4 : years < 3 ? 6 : 8;
    const notice = (salary / 4) * noticeWeeks;

    // Severance pay is exempt from income tax but bears stamp duty.
    const stampDuty = severance * 0.00759;

    return {
      primary: {
        labelKey: "result.severancePay",
        value: severance - stampDuty,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.grossSeverance", value: severance, kind: "currency", tone: "principal" },
        { labelKey: "result.stampDuty", value: stampDuty, kind: "currency", tone: "tax" },
        { labelKey: "result.noticePay", value: notice, kind: "currency", tone: "returns" },
        {
          labelKey: "result.cappedAt",
          value: perYear,
          kind: "currency",
          tone: "neutral",
          hintKey: "calc.severance-pay.capHint",
        },
      ],
      chart: [
        { labelKey: "result.severancePay", value: severance - stampDuty, tone: "principal" },
        { labelKey: "result.noticePay", value: notice, tone: "returns" },
      ],
      notes: [{ key: "calc.severance-pay.note" }],
    };
  },
  explainerKeys: ["calc.severance-pay.explain"],
};

/* --------------------------------------------------------- Tip splitting */

export const tipCalculator: CalculatorDef = {
  slug: "tip",
  icon: "🧾",
  version: 1,
  category: "everyday",
  titleKey: "calc.tip.title",
  descKey: "calc.tip.desc",
  countries: ["us", "ca", "gb", "au"],
  fields: ({ countryCode }) => [
    {
      id: "bill",
      labelKey: "field.billAmount",
      kind: "currency",
      min: 0,
      max: 1_000,
      step: 1,
      slider: false,
      default: 80,
    },
    {
      id: "tip",
      labelKey: "field.tipPercent",
      kind: "percent",
      min: 0,
      max: 30,
      step: 1,
      default: countryCode === "us" ? 18 : 10,
    },
    {
      id: "people",
      labelKey: "field.people",
      kind: "number",
      min: 1,
      max: 20,
      step: 1,
      default: 2,
    },
  ],
  compute: (values) => {
    const bill = num(values, "bill");
    const tip = (bill * num(values, "tip")) / 100;
    const people = Math.max(num(values, "people", 1), 1);

    return {
      primary: {
        labelKey: "result.perPerson",
        value: (bill + tip) / people,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.billAmount", value: bill, kind: "currency", tone: "principal" },
        { labelKey: "result.tipAmount", value: tip, kind: "currency", tone: "returns" },
        { labelKey: "result.totalAmount", value: bill + tip, kind: "currency", tone: "neutral" },
        { labelKey: "result.tipPerPerson", value: tip / people, kind: "currency", tone: "returns" },
      ],
      chart: [
        { labelKey: "result.billAmount", value: bill, tone: "principal" },
        { labelKey: "result.tipAmount", value: tip, tone: "returns" },
      ],
    };
  },
  explainerKeys: ["calc.tip.explain"],
};
