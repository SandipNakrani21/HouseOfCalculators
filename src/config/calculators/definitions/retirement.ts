import { applyReviewedCountry } from "../reviewed";
import { MONEY_SCALE } from "@/config/calculators/scale";
import { num, str, type CalculatorDef } from "@/config/calculators/types";
import type { CountryCode } from "@/config/countries";
import { applySlabs, type Slab } from "@/lib/finance/tax";
import { inflationAdjusted, sipFutureValue } from "@/lib/finance";

const ALL: CountryCode[] = [
  "in", "us", "gb", "ae", "ca", "au", "de", "at", "ch", "fr",
  "be", "nl", "jp", "es", "mx", "it", "pt", "br", "pl", "tr",
  "ru", "cn",
];

/** Growth of an existing pot plus ongoing monthly contributions. */
function projectPot(
  current: number,
  monthly: number,
  rate: number,
  years: number,
): { corpus: number; contributed: number; growth: number } {
  // Existing money and monthly deposits must use the same monthly rate.
  // Deposits follow sipFutureValue's beginning-of-month convention.
  const corpus = current * Math.pow(1 + rate / 1200, Math.round(years * 12)) + sipFutureValue(monthly, rate, years);
  const contributed = current + monthly * Math.round(years * 12);
  return { corpus, contributed, growth: Math.max(corpus - contributed, 0) };
}

/* ------------------------------------------------------------ Retirement */

export const retirementCalculator: CalculatorDef = {
  slug: "retirement",
  icon: "🌴",
  version: 3,
  category: "finance",
  titleKey: "calc.retirement.title",
  descKey: "calc.retirement.desc",
  countries: ALL,
  validate: values => num(values, "retireAge") < num(values, "age") ? "validation.retirementAge" : null,
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      { id: "age", labelKey: "field.currentAge", kind: "number", min: 18, max: 70, integer: true, step: 1, default: 30 },
      { id: "retireAge", labelKey: "field.retirementAge", kind: "number", min: 45, max: 80, integer: true, step: 1, default: 60 },
      {
        id: "current",
        labelKey: "field.currentSavings",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        default: scale.defaults.lump,
      },
      {
        id: "monthly",
        labelKey: "field.monthlyContribution",
        kind: "currency",
        min: scale.monthlyMin,
        max: scale.monthlyMax,
        step: scale.monthlyStep,
        default: scale.defaults.monthly,
      },
      { id: "rate", labelKey: "field.expectedReturn", kind: "percent", min: 1, max: 20, step: 0.5, default: 8 },
      { id: "inflation", labelKey: "field.inflationRate", kind: "percent", min: 0, max: 30, step: 0.5, default: 5 },
    ];
  },
  compute: (values) => {
    const years = Math.max(num(values, "retireAge") - num(values, "age"), 0);
    const { corpus, contributed, growth } = projectPot(
      num(values, "current"),
      num(values, "monthly"),
      num(values, "rate"),
      years,
    );
    const { presentValue } = inflationAdjusted(corpus, num(values, "inflation"), years);
    const existingFuture = num(values, "current") * Math.pow(1 + num(values, "rate") / 1200, Math.round(years * 12));

    return {
      primary: { labelKey: "result.corpusAtRetirement", value: corpus, kind: "currency", emphasis: true },
      rows: [
        { labelKey: "result.yearsToRetirement", value: years, kind: "years", tone: "neutral" },
        { labelKey: "result.retirementExistingFuture", value: existingFuture, kind: "currency", tone: "neutral" },
        { labelKey: "result.retirementDepositsFuture", value: corpus - existingFuture, kind: "currency", tone: "neutral" },
        { labelKey: "result.totalContributed", value: contributed, kind: "currency", tone: "principal" },
        { labelKey: "result.investmentGrowth", value: growth, kind: "currency", tone: "returns" },
        {
          labelKey: "result.inTodaysMoney",
          value: presentValue,
          kind: "currency",
          tone: "neutral",
          hintKey: "calc.retirement.todayHint",
        },
        // Arithmetic illustration only; not a sustainable-income determination.
        { labelKey: "result.annualIncomeAt4", value: corpus * 0.04, kind: "currency", tone: "returns", hintKey: "calc.retirement.limits" },
      ],
      chart: [
        { labelKey: "result.totalContributed", value: contributed, tone: "principal" },
        { labelKey: "result.investmentGrowth", value: growth, tone: "returns" },
      ],
      notes: [{ key: "calc.projection.timing" }, { key: "calc.retirement.limits" }],
    };
  },
  explainerKeys: ["calc.retirement.explain", "calc.retirement.breakdown", "calc.retirement.limits"],
  formula: {
    expression: "t = R − A; n = 12t; i = r / 1200; FV = P(1+i)^n + C × ((1+i)^n − 1) / i × (1+i); PV = FV / (1+f/100)^t",
    variables: [
      { symbol: "P", key: "field.currentSavings" },
      { symbol: "C", key: "field.monthlyContribution" },
      { symbol: "r", key: "field.expectedReturn" },
      { symbol: "f", key: "field.inflationRate" },
      { symbol: "R", key: "field.retirementAge" },
      { symbol: "A", key: "field.currentAge" },
    ],
  },
};

/* --------------------------------------------------------------- Pension */

export const pensionCalculator: CalculatorDef = {
  slug: "pension",
  icon: "👴",
  version: 2,
  category: "finance",
  countryRelevance: "currency",
  titleKey: "calc.pension.title",
  descKey: "calc.pension.desc",
  countries: ALL,
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "salary",
        labelKey: "field.annualGrossSalary",
        kind: "currency",
        min: scale.incomeMin,
        max: scale.incomeMax,
        step: scale.incomeStep,
        default: scale.defaults.income,
      },
      { id: "employee", labelKey: "field.employeeContribution", kind: "percent", min: 0, max: 30, step: 0.5, default: 5 },
      { id: "employer", labelKey: "field.employerContribution", kind: "percent", min: 0, max: 30, step: 0.5, default: 3 },
      {
        id: "current",
        labelKey: "field.currentPot",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        default: scale.defaults.lump,
      },
      { id: "years", labelKey: "field.yearsToRetirement", kind: "years", min: 1, max: 45, step: 1, default: 25 },
      { id: "rate", labelKey: "field.expectedReturn", kind: "percent", min: 0, max: 15, step: 0.5, default: 5 },
    ];
  },
  compute: (values) => {
    const salary = num(values, "salary");
    const monthly =
      (salary * (num(values, "employee") + num(values, "employer"))) / 100 / 12;
    const years = num(values, "years");
    const { corpus, contributed, growth } = projectPot(
      num(values, "current"),
      monthly,
      num(values, "rate"),
      years,
    );

    return {
      primary: { labelKey: "result.pensionPot", value: corpus, kind: "currency", emphasis: true },
      rows: [
        { labelKey: "result.monthlyContribution", value: monthly, kind: "currency", tone: "neutral" },
        { labelKey: "result.totalContributed", value: contributed, kind: "currency", tone: "principal" },
        { labelKey: "result.investmentGrowth", value: growth, kind: "currency", tone: "returns" },
        { labelKey: "result.annualIncomeAt4", value: corpus * 0.04, kind: "currency", tone: "returns" },
      ],
      chart: [
        { labelKey: "result.totalContributed", value: contributed, tone: "principal" },
        { labelKey: "result.investmentGrowth", value: growth, tone: "returns" },
      ],
      notes: [{ key: "calc.pension.scope" }, { key: "calc.projection.timing" }],
    };
  },
  explainerKeys: ["calc.pension.explain"],
  formula: {
    expression: "i = r / 1200; n = 12t; FV = P(1+i)^n + C × ((1+i)^n − 1) / i × (1+i); i = 0: FV = P + Cn",
    variables: [
      { symbol: "P", key: "field.currentPot" },
      { symbol: "C", key: "result.monthlyContribution" },
      { symbol: "r", key: "field.expectedReturn" },
      { symbol: "t", key: "field.yearsToRetirement" },
    ],
  },
};

/* ------------------------------------------------------------- US 401(k) */

export const fourOhOneKCalculator: CalculatorDef = {
  slug: "401k",
  icon: "🥚",
  version: 3,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.401k.title",
  descKey: "calc.401k.desc",
  countries: ["us"],
  fields: () => [
    { id: "taxYear", labelKey: "calc.taxYearLabel", kind: "select", default: "2026", options: [{ value: "2025", labelKey: "", label: "2025" }, { value: "2026", labelKey: "", label: "2026" }] },
    { id: "salary", labelKey: "field.annualSalary", kind: "currency", min: 20_000, max: 1_000_000, step: 1_000, default: 85_000 },
    { id: "contribution", labelKey: "field.contributionPercent", kind: "percent", min: 0, max: 30, step: 0.5, default: 6 },
    { id: "match", labelKey: "field.employerMatch", kind: "percent", min: 0, max: 100, step: 5, default: 50 },
    { id: "matchLimit", labelKey: "field.matchLimit", kind: "percent", min: 0, max: 15, step: 0.5, default: 6 },
    { id: "current", labelKey: "field.currentBalance", kind: "currency", min: 0, max: 2_000_000, step: 1_000, default: 25_000 },
    { id: "years", labelKey: "field.yearsToRetirement", kind: "years", min: 1, max: 45, step: 1, default: 30 },
    { id: "rate", labelKey: "field.expectedReturn", kind: "percent", min: 1, max: 15, step: 0.5, default: 7 },
  ],
  compute: (values) => {
    const salary = num(values, "salary");
    const ownRate = num(values, "contribution");

    const limits = str(values, "taxYear", "2026") === "2025"
      ? { elective: 23_500, combined: 70_000, compensation: 350_000 }
      : { elective: 24_500, combined: 72_000, compensation: 360_000 };
    const ownAnnual = Math.min((salary * ownRate) / 100, limits.elective);
    const matchedAmount = Math.min(ownAnnual, Math.min(salary, limits.compensation) * num(values, "matchLimit") / 100);
    const employerAnnual = Math.min(matchedAmount * num(values, "match") / 100, limits.combined - ownAnnual, salary - ownAnnual);

    const years = num(values, "years");
    const { corpus, contributed, growth } = projectPot(
      num(values, "current"),
      (ownAnnual + employerAnnual) / 12,
      num(values, "rate"),
      years,
    );

    return {
      primary: { labelKey: "result.balanceAtRetirement", value: corpus, kind: "currency", emphasis: true },
      rows: [
        { labelKey: "result.yourContribution", value: ownAnnual, kind: "currency", tone: "principal" },
        { labelKey: "result.employerMatch", value: employerAnnual, kind: "currency", tone: "returns" },
        { labelKey: "result.totalContributed", value: contributed, kind: "currency", tone: "neutral" },
        { labelKey: "result.investmentGrowth", value: growth, kind: "currency", tone: "returns" },
      ],
      chart: [
        { labelKey: "result.totalContributed", value: contributed, tone: "principal" },
        { labelKey: "result.investmentGrowth", value: growth, tone: "returns" },
      ],
      notes: [{ key: "calc.401k.limits", params: { year: str(values, "taxYear", "2026"), elective: limits.elective, combined: limits.combined, compensation: limits.compensation } }, { key: "calc.projection.timing" }],
    };
  },
  explainerKeys: ["calc.401k.explain"],
};

/* ------------------------------------------ US Social Security estimate */

// 2026 first-eligibility cohort. Input is annualised indexed earnings, not wages.
const PIA_BENDS: Slab[] = [
  { from: 0, rate: 90 },
  { from: 1_286, rate: 32 },
  { from: 7_749, rate: 15 },
];

export const socialSecurityBenefitCalculator: CalculatorDef = {
  slug: "social-security-benefit",
  icon: "🇺🇸",
  version: 3,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.social-security-benefit.title",
  descKey: "calc.social-security-benefit.desc",
  countries: ["us"],
  fields: () => [
    { id: "earnings", labelKey: "field.averageAnnualEarnings", kind: "currency", min: 10_000, max: 200_000, step: 1_000, default: 70_000 },
    {
      id: "claimAge",
      labelKey: "field.claimingAge",
      kind: "select",
      default: "67",
      options: [
        { value: "62", labelKey: "", label: "62" },
        { value: "65", labelKey: "", label: "65" },
        { value: "67", labelKey: "", label: "67" },
        { value: "70", labelKey: "", label: "70" },
      ],
    },
  ],
  compute: (values) => {
    // Benefits are built from average indexed *monthly* earnings.
    const aime = Math.floor(num(values, "earnings") / 12);
    const pia = Math.floor((applySlabs(aime, PIA_BENDS).tax + 1e-9) * 10) / 10;

    // Claiming early cuts the benefit; delaying past full retirement age adds
    // delayed retirement credits.
    const claimAge = num(values, "claimAge", 67);
    const earlyMonths = Math.max((67 - claimAge) * 12, 0);
    const adjustment = claimAge >= 67 ? 1 + Math.min(claimAge - 67, 3) * 0.08
      : 1 - Math.min(earlyMonths, 36) * (5 / 9) / 100 - Math.max(earlyMonths - 36, 0) * (5 / 12) / 100;
    const monthly = Math.floor(pia * adjustment + 1e-9);

    return {
      primary: { labelKey: "result.monthlyBenefit", value: monthly, kind: "currency", emphasis: true },
      rows: [
        { labelKey: "result.fullBenefit", value: pia, kind: "currency", tone: "principal" },
        { labelKey: "result.claimingAdjustment", value: (adjustment - 1) * 100, kind: "percent", tone: "neutral" },
        { labelKey: "result.annualBenefit", value: monthly * 12, kind: "currency", tone: "returns" },
      ],
      notes: [{ key: "calc.social-security-benefit.note" }],
    };
  },
  explainerKeys: ["calc.social-security-benefit.explain"],
};

/* ---------------------------------------------- Australian superannuation */

export const superannuationCalculator: CalculatorDef = {
  slug: "superannuation",
  icon: "🦘",
  version: 3,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.superannuation.title",
  descKey: "calc.superannuation.desc",
  countries: ["au"],
  fields: () => [
    { id: "salary", labelKey: "field.annualSalary", kind: "currency", min: 20_000, max: 500_000, step: 1_000, default: 95_000 },
    { id: "balance", labelKey: "field.currentBalance", kind: "currency", min: 0, max: 2_000_000, step: 1_000, default: 60_000 },
    { id: "extra", labelKey: "field.extraContribution", kind: "percent", min: 0, max: 15, step: 0.5, default: 0 },
    { id: "years", labelKey: "field.yearsToRetirement", kind: "years", min: 1, max: 45, step: 1, default: 30 },
    { id: "rate", labelKey: "field.expectedReturn", kind: "percent", min: 1, max: 15, step: 0.5, default: 7 },
  ],
  compute: (values) => {
    const salary = num(values, "salary");
    // Superannuation Guarantee is 12% from 1 July 2025.
    const sgRate = 12;
    const gross = (salary * (sgRate + num(values, "extra"))) / 100;
    // Concessional contributions are taxed at 15% going in.
    const net = gross * 0.85;

    const years = num(values, "years");
    const { corpus, contributed, growth } = projectPot(
      num(values, "balance"),
      net / 12,
      num(values, "rate"),
      years,
    );

    return {
      primary: { labelKey: "result.balanceAtRetirement", value: corpus, kind: "currency", emphasis: true },
      rows: [
        { labelKey: "result.annualContribution", value: gross, kind: "currency", tone: "principal" },
        { labelKey: "result.contributionsTax", value: gross - net, kind: "currency", tone: "tax" },
        { labelKey: "result.totalContributed", value: contributed, kind: "currency", tone: "neutral" },
        { labelKey: "result.investmentGrowth", value: growth, kind: "currency", tone: "returns" },
      ],
      chart: [
        { labelKey: "result.totalContributed", value: contributed, tone: "principal" },
        { labelKey: "result.investmentGrowth", value: growth, tone: "returns" },
      ],
      notes: [{ key: "calc.superannuation.note" }, { key: "calc.projection.timing" }],
    };
  },
  explainerKeys: ["calc.superannuation.explain"],
};

/* -------------------------------------------------- Australian HECS-HELP */

// Repayment is marginal from 2025-26: nothing below the threshold, then a
// rate on each slice of income above it.
export function helpRepayment(income: number, year = "2025–26"): number {
  // The ATO publishes a fixed second-band base: do not derive it by
  // integrating the first band (2026–27 publishes 9028, not 9028.35).
  // Whole-dollar repayment income makes the published inclusive bands explicit.
  const x = Math.floor(Math.max(0, income));
  const current = year === "2026–27";
  const floor = current ? 69_528 : 67_000;
  const middle = current ? 129_717 : 125_000;
  const top = current ? 186_051 : 179_286;
  const amount = x >= top ? x * .1 : x > middle
    ? (current ? 9_028 : 8_700) + (x - middle) * .17
    : Math.max(0, x - floor) * .15;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export const hecsCalculator: CalculatorDef = {
  slug: "hecs",
  icon: "🎓",
  version: 3,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.hecs.title",
  descKey: "calc.hecs.desc",
  countries: ["au"],
  fields: () => [
    { id: "taxYear", labelKey: "calc.taxYearLabel", kind: "select", default: "2026–27", options: [{ value: "2025–26", labelKey: "", label: "2025–26" }, { value: "2026–27", labelKey: "", label: "2026–27" }] },
    { id: "debt", labelKey: "field.helpDebt", kind: "currency", min: 0, max: 200_000, step: 1_000, default: 30_000 },
    { id: "income", labelKey: "review.hecs.repaymentIncome", kind: "currency", integer: true, min: 0, max: 300_000, step: 1_000, default: 85_000 },
    { id: "indexation", labelKey: "field.indexationRate", kind: "percent", min: 0, max: 10, step: 0.1, default: 3.2 },
    { id: "growth", labelKey: "review.hecs.growth", kind: "percent", min: 0, max: 10, step: 0.5, default: 3 },
  ],
  compute: (values) => {
    const year = str(values, "taxYear", "2026–27");
    const indexation = num(values, "indexation") / 100;
    const growth = num(values, "growth") / 100;

    let debt = num(values, "debt");
    let income = num(values, "income");
    let years = 0;
    let totalRepaid = 0;
    const firstRepayment = Math.min(helpRepayment(income, year), debt * (1 + indexation));

    // Walk forward a year at a time: indexation is applied, then the
    // compulsory repayment for that year's income.
    while (debt > 0 && years < 40) {
      debt *= 1 + indexation;
      const repayment = Math.min(helpRepayment(income, year), debt);
      debt -= repayment;
      totalRepaid += repayment;
      income *= 1 + growth;
      years += 1;
    }

    const cleared = debt <= 0.01;

    return {
      primary: {
        labelKey: cleared ? "result.yearsToClear" : "result.remainingDebt",
        value: cleared ? years : debt,
        kind: cleared ? "years" : "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.annualRepayment", value: firstRepayment, kind: "currency", tone: "principal" },
        { labelKey: "result.monthlyRepayment", value: firstRepayment / 12, kind: "currency", tone: "neutral" },
        { labelKey: "result.totalRepaid", value: totalRepaid, kind: "currency", tone: "tax" },
        {
          labelKey: "result.repaymentRate",
          value: num(values, "income") > 0 ? (firstRepayment / num(values, "income")) * 100 : 0,
          kind: "percent",
          tone: "neutral",
        },
      ],
      notes: [{ key: "calc.hecs.note", params: { year } as Record<string, string | number> }, ...(!cleared ? [{ key: "calc.hecs.horizon", params: { years: 40 } }] : [])],
    };
  },
  explainerKeys: ["calc.hecs.explain"],
};

/* ------------------------------------------------------ Generic savings */

export const inflationCalculator: CalculatorDef = {
  slug: "inflation",
  icon: "📉",
  version: 1,
  category: "finance",
  titleKey: "calc.inflation.title",
  descKey: "calc.inflation.desc",
  countries: ALL,
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "amount",
        labelKey: "field.amount",
        kind: "currency",
        min: scale.lumpMin,
        max: scale.lumpMax,
        step: scale.lumpStep,
        default: scale.defaults.lump,
      },
      {
        id: "rate",
        labelKey: "field.inflationRate",
        kind: "percent",
        min: 0,
        max: 80,
        step: 0.5,
        default: countryCode === "tr" ? 35 : countryCode === "in" ? 6 : 3,
      },
      { id: "years", labelKey: "field.years", kind: "years", min: 1, max: 40, step: 1, default: 10 },
      {
        id: "direction",
        labelKey: "field.direction",
        kind: "select",
        default: "future",
        options: [
          { value: "future", labelKey: "option.futureCost" },
          { value: "past", labelKey: "option.todaysValue" },
        ],
      },
    ];
  },
  compute: (values) => {
    const amount = num(values, "amount");
    const years = num(values, "years");
    const { futureCost, presentValue } = inflationAdjusted(
      amount,
      num(values, "rate"),
      years,
    );
    const forward = str(values, "direction", "future") === "future";
    const answer = forward ? futureCost : presentValue;

    return {
      primary: {
        labelKey: forward ? "result.futureCost" : "result.todaysValue",
        value: answer,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.enteredAmount", value: amount, kind: "currency", tone: "principal" },
        {
          labelKey: forward ? "result.increase" : "result.purchasingPowerLost",
          value: Math.abs(answer - amount),
          kind: "currency",
          tone: "tax",
        },
        {
          labelKey: "result.changePercent",
          value: amount > 0 ? ((answer - amount) / amount) * 100 : 0,
          kind: "percent",
          tone: "neutral",
        },
      ],
      chart: [
        { labelKey: "result.todaysAmount", value: Math.min(amount, answer), tone: "principal" },
        { labelKey: "result.difference", value: Math.abs(answer - amount), tone: "tax" },
      ],
    };
  },
  explainerKeys: ["calc.inflation.explain"],
};

// Apply only independently source-reviewed country replacements.
applyReviewedCountry(superannuationCalculator);
