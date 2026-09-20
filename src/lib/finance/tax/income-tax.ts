import type { CountryCode } from "@/config/countries";

import { applySlabs, marginalRate, type Slab, type SlabPortion } from "./slabs";

/**
 * Statutory rates change every year. Everything a country needs sits in one
 * object below, so an annual update is a data edit rather than a code change.
 * `verifiedFor` records the tax year each rule set was written against.
 */
export type IncomeTaxInput = {
  grossIncome: number;
  /** Country-specific regime or filing status, e.g. "new" | "old" | "single". */
  regime?: string;
  /** Deductions the user claims, where the country allows them. */
  deductions?: number;
};

export type IncomeTaxResult = {
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  /** Tax from the slabs, before rebate, surcharge and add-ons. */
  baseTax: number;
  rebate: number;
  surcharge: number;
  /** Cess (IN), FICA (US), National Insurance (GB) - country-specific add-ons. */
  additional: { labelKey: string; amount: number }[];
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
  portions: SlabPortion[];
  taxYear: string;
};

export type RegimeOption = { value: string; labelKey: string };

export type IncomeTaxRules = {
  taxYear: string;
  verifiedFor: string;
  regimes: RegimeOption[];
  defaultRegime: string;
  /** Whether the UI should show a deductions input at all. */
  allowsDeductions: (regime: string) => boolean;
  compute: (input: IncomeTaxInput) => IncomeTaxResult;
};

/* ------------------------------------------------------------------ India */

// FY 2025-26 (AY 2026-27).
const IN_NEW_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 400_000, rate: 5 },
  { from: 800_000, rate: 10 },
  { from: 1_200_000, rate: 15 },
  { from: 1_600_000, rate: 20 },
  { from: 2_000_000, rate: 25 },
  { from: 2_400_000, rate: 30 },
];

const IN_OLD_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 250_000, rate: 5 },
  { from: 500_000, rate: 20 },
  { from: 1_000_000, rate: 30 },
];

const IN_SURCHARGE: { threshold: number; rate: number }[] = [
  { threshold: 50_000_000, rate: 37 },
  { threshold: 20_000_000, rate: 25 },
  { threshold: 10_000_000, rate: 15 },
  { threshold: 5_000_000, rate: 10 },
];

function indiaSurcharge(
  tax: number,
  taxableIncome: number,
  regime: string,
): number {
  // The new regime caps surcharge at 25 percent.
  const bands =
    regime === "new"
      ? IN_SURCHARGE.filter((band) => band.rate <= 25)
      : IN_SURCHARGE;
  const band = bands.find((entry) => taxableIncome > entry.threshold);
  return band ? (tax * band.rate) / 100 : 0;
}

const INDIA_RULES: IncomeTaxRules = {
  taxYear: "2025-26",
  verifiedFor: "FY 2025-26 (AY 2026-27)",
  regimes: [
    { value: "new", labelKey: "calc.income-tax.regime.new" },
    { value: "old", labelKey: "calc.income-tax.regime.old" },
  ],
  defaultRegime: "new",
  allowsDeductions: (regime) => regime === "old",
  compute: ({ grossIncome, regime = "new", deductions = 0 }) => {
    const isNew = regime === "new";
    const standardDeduction = Math.min(isNew ? 75_000 : 50_000, grossIncome);
    const room = Math.max(grossIncome - standardDeduction, 0);
    const otherDeductions = isNew ? 0 : Math.min(deductions, room);
    const taxableIncome = Math.max(room - otherDeductions, 0);

    const slabs = isNew ? IN_NEW_SLABS : IN_OLD_SLABS;
    const { tax: baseTax, portions } = applySlabs(taxableIncome, slabs);

    // Section 87A rebate: full relief up to the regime threshold.
    const rebateCeiling = isNew ? 1_200_000 : 500_000;
    const rebateCap = isNew ? 60_000 : 12_500;
    const rebate = taxableIncome <= rebateCeiling ? Math.min(baseTax, rebateCap) : 0;

    const afterRebate = Math.max(baseTax - rebate, 0);
    const surcharge = indiaSurcharge(afterRebate, taxableIncome, regime);
    const cess = (afterRebate + surcharge) * 0.04;
    const totalTax = afterRebate + surcharge + cess;

    return {
      grossIncome,
      standardDeduction,
      otherDeductions,
      taxableIncome,
      baseTax,
      rebate,
      surcharge,
      additional: [{ labelKey: "calc.income-tax.cess", amount: cess }],
      totalTax,
      netIncome: grossIncome - totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      marginalRate: marginalRate(taxableIncome, slabs),
      portions,
      taxYear: "2025-26",
    };
  },
};

/* ----------------------------------------------------------- United States */

// Federal brackets, tax year 2025.
const US_SINGLE_SLABS: Slab[] = [
  { from: 0, rate: 10 },
  { from: 11_925, rate: 12 },
  { from: 48_475, rate: 22 },
  { from: 103_350, rate: 24 },
  { from: 197_300, rate: 32 },
  { from: 250_525, rate: 35 },
  { from: 626_350, rate: 37 },
];

const US_JOINT_SLABS: Slab[] = [
  { from: 0, rate: 10 },
  { from: 23_850, rate: 12 },
  { from: 96_950, rate: 22 },
  { from: 206_700, rate: 24 },
  { from: 394_600, rate: 32 },
  { from: 501_050, rate: 35 },
  { from: 751_600, rate: 37 },
];

const US_HEAD_SLABS: Slab[] = [
  { from: 0, rate: 10 },
  { from: 17_000, rate: 12 },
  { from: 64_850, rate: 22 },
  { from: 103_350, rate: 24 },
  { from: 197_300, rate: 32 },
  { from: 250_500, rate: 35 },
  { from: 626_350, rate: 37 },
];

const US_CONFIG: Record<string, { slabs: Slab[]; standardDeduction: number }> = {
  single: { slabs: US_SINGLE_SLABS, standardDeduction: 15_750 },
  joint: { slabs: US_JOINT_SLABS, standardDeduction: 31_500 },
  head: { slabs: US_HEAD_SLABS, standardDeduction: 23_625 },
};

const US_RULES: IncomeTaxRules = {
  taxYear: "2025",
  verifiedFor: "Tax year 2025, federal only",
  regimes: [
    { value: "single", labelKey: "calc.income-tax.status.single" },
    { value: "joint", labelKey: "calc.income-tax.status.joint" },
    { value: "head", labelKey: "calc.income-tax.status.head" },
  ],
  defaultRegime: "single",
  allowsDeductions: () => true,
  compute: ({ grossIncome, regime = "single", deductions = 0 }) => {
    const config = US_CONFIG[regime] ?? US_CONFIG.single;
    // Itemised deductions replace the standard deduction when they exceed it.
    const standard = Math.min(config.standardDeduction, grossIncome);
    const itemising = deductions > standard;
    const standardDeduction = itemising ? 0 : standard;
    const otherDeductions = itemising ? Math.min(deductions, grossIncome) : 0;
    const taxableIncome = Math.max(
      grossIncome - standardDeduction - otherDeductions,
      0,
    );

    const { tax: baseTax, portions } = applySlabs(taxableIncome, config.slabs);

    // FICA: Social Security up to the wage base, Medicare on everything with
    // the extra 0.9 percent above the high-earner threshold.
    const socialSecurity = Math.min(grossIncome, 176_100) * 0.062;
    const medicare =
      grossIncome * 0.0145 + Math.max(grossIncome - 200_000, 0) * 0.009;
    const totalTax = baseTax + socialSecurity + medicare;

    return {
      grossIncome,
      standardDeduction,
      otherDeductions,
      taxableIncome,
      baseTax,
      rebate: 0,
      surcharge: 0,
      additional: [
        { labelKey: "calc.income-tax.socialSecurity", amount: socialSecurity },
        { labelKey: "calc.income-tax.medicare", amount: medicare },
      ],
      totalTax,
      netIncome: grossIncome - totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      marginalRate: marginalRate(taxableIncome, config.slabs),
      portions,
      taxYear: "2025",
    };
  },
};

/* --------------------------------------------------------- United Kingdom */

// England, Wales and Northern Ireland, 2025/26. Slab floors are measured
// above the personal allowance, which is why they start at 0.
const GB_SLABS: Slab[] = [
  { from: 0, rate: 20 },
  { from: 37_700, rate: 40 },
  { from: 112_570, rate: 45 },
];

const GB_PERSONAL_ALLOWANCE = 12_570;

const GB_RULES: IncomeTaxRules = {
  taxYear: "2025/26",
  verifiedFor: "Tax year 2025/26, England, Wales and Northern Ireland",
  regimes: [
    { value: "employee", labelKey: "calc.income-tax.status.employee" },
    { value: "selfEmployed", labelKey: "calc.income-tax.status.selfEmployed" },
  ],
  defaultRegime: "employee",
  allowsDeductions: () => true,
  compute: ({ grossIncome, regime = "employee", deductions = 0 }) => {
    const claimed = Math.min(deductions, grossIncome);
    const afterDeductions = Math.max(grossIncome - claimed, 0);

    // The personal allowance tapers by 1 pound for every 2 above 100,000.
    const taper = Math.max(afterDeductions - 100_000, 0) / 2;
    const personalAllowance = Math.max(GB_PERSONAL_ALLOWANCE - taper, 0);
    const taxableIncome = Math.max(afterDeductions - personalAllowance, 0);

    const { tax: baseTax, portions } = applySlabs(taxableIncome, GB_SLABS);

    // Class 1 employee NI, or Class 4 for the self-employed.
    const niLower = 12_570;
    const niUpper = 50_270;
    const mainRate = regime === "employee" ? 0.08 : 0.06;
    const nationalInsurance =
      Math.max(Math.min(afterDeductions, niUpper) - niLower, 0) * mainRate +
      Math.max(afterDeductions - niUpper, 0) * 0.02;

    const totalTax = baseTax + nationalInsurance;

    return {
      grossIncome,
      standardDeduction: personalAllowance,
      otherDeductions: claimed,
      taxableIncome,
      baseTax,
      rebate: 0,
      surcharge: 0,
      additional: [
        {
          labelKey: "calc.income-tax.nationalInsurance",
          amount: nationalInsurance,
        },
      ],
      totalTax,
      netIncome: grossIncome - totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      marginalRate: marginalRate(taxableIncome, GB_SLABS),
      portions,
      taxYear: "2025/26",
    };
  },
};

/* -------------------------------------------------------------------- UAE */

const AE_RULES: IncomeTaxRules = {
  taxYear: "2025",
  verifiedFor: "2025 - the UAE levies no personal income tax on salaries",
  regimes: [{ value: "resident", labelKey: "calc.income-tax.status.resident" }],
  defaultRegime: "resident",
  allowsDeductions: () => false,
  compute: ({ grossIncome }) => ({
    grossIncome,
    standardDeduction: 0,
    otherDeductions: 0,
    taxableIncome: 0,
    baseTax: 0,
    rebate: 0,
    surcharge: 0,
    additional: [],
    totalTax: 0,
    netIncome: grossIncome,
    effectiveRate: 0,
    marginalRate: 0,
    portions: [],
    taxYear: "2025",
  }),
};

export const INCOME_TAX_RULES: Record<CountryCode, IncomeTaxRules> = {
  in: INDIA_RULES,
  us: US_RULES,
  gb: GB_RULES,
  ae: AE_RULES,
};
