import type { CountryCode } from "@/config/countries";

import { contribution, defineRules, type IncomeTaxRules } from "./define";
import type { Slab } from "./slabs";

/**
 * Personal income tax, one rule set per country.
 *
 * Every figure here is statutory and changes at least yearly. `verifiedFor`
 * records the tax year each set was written against - treat that field as the
 * checklist when rates are refreshed. Where a country's real system has parts
 * this cannot model (US state tax, Swiss cantonal tax, Indian regime choices
 * beyond the two below), the `noteKey` says so on the page rather than letting
 * the number pass for the whole answer.
 */

/* ------------------------------------------------------------------ India */

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

const IN_SURCHARGE = [
  { threshold: 50_000_000, rate: 37 },
  { threshold: 20_000_000, rate: 25 },
  { threshold: 10_000_000, rate: 15 },
  { threshold: 5_000_000, rate: 10 },
];

const india = defineRules({
  taxYear: "2025-26",
  verifiedFor: "FY 2025-26 (AY 2026-27), salaried resident individual",
  noteKey: "calc.income-tax.note.in",
  regimes: [
    { value: "new", labelKey: "calc.income-tax.regime.new" },
    { value: "old", labelKey: "calc.income-tax.regime.old" },
  ],
  defaultRegime: "new",
  deductions: (regime) => regime === "old",
  allowance: (_gross, regime) => (regime === "new" ? 75_000 : 50_000),
  slabs: (regime) => (regime === "new" ? IN_NEW_SLABS : IN_OLD_SLABS),
  // Section 87A: full relief up to the regime's threshold.
  credit: ({ taxable, tax, regime }) => {
    const ceiling = regime === "new" ? 1_200_000 : 500_000;
    const cap = regime === "new" ? 60_000 : 12_500;
    return taxable <= ceiling ? Math.min(tax, cap) : 0;
  },
  surtax: ({ taxable, tax, regime }) => {
    // The new regime caps surcharge at 25 percent.
    const bands = regime === "new" ? IN_SURCHARGE.filter((b) => b.rate <= 25) : IN_SURCHARGE;
    const band = bands.find((entry) => taxable > entry.threshold);
    const surcharge = band ? (tax * band.rate) / 100 : 0;
    return [
      { labelKey: "levy.surcharge", amount: surcharge },
      { labelKey: "levy.cess", amount: (tax + surcharge) * 0.04 },
    ];
  },
});

/* ----------------------------------------------------------- United States */

const US_SINGLE: Slab[] = [
  { from: 0, rate: 10 },
  { from: 11_925, rate: 12 },
  { from: 48_475, rate: 22 },
  { from: 103_350, rate: 24 },
  { from: 197_300, rate: 32 },
  { from: 250_525, rate: 35 },
  { from: 626_350, rate: 37 },
];

const US_JOINT: Slab[] = [
  { from: 0, rate: 10 },
  { from: 23_850, rate: 12 },
  { from: 96_950, rate: 22 },
  { from: 206_700, rate: 24 },
  { from: 394_600, rate: 32 },
  { from: 501_050, rate: 35 },
  { from: 751_600, rate: 37 },
];

const US_HEAD: Slab[] = [
  { from: 0, rate: 10 },
  { from: 17_000, rate: 12 },
  { from: 64_850, rate: 22 },
  { from: 103_350, rate: 24 },
  { from: 197_300, rate: 32 },
  { from: 250_500, rate: 35 },
  { from: 626_350, rate: 37 },
];

const US_STANDARD_DEDUCTION: Record<string, number> = {
  single: 15_750,
  joint: 31_500,
  head: 23_625,
};

const unitedStates = defineRules({
  taxYear: "2025",
  verifiedFor: "Tax year 2025, federal only - no state or local income tax",
  noteKey: "calc.income-tax.note.us",
  regimes: [
    { value: "single", labelKey: "calc.income-tax.status.single" },
    { value: "joint", labelKey: "calc.income-tax.status.joint" },
    { value: "head", labelKey: "calc.income-tax.status.head" },
  ],
  allowance: (_gross, regime) => US_STANDARD_DEDUCTION[regime] ?? US_STANDARD_DEDUCTION.single,
  slabs: (regime) =>
    regime === "joint" ? US_JOINT : regime === "head" ? US_HEAD : US_SINGLE,
  social: ({ gross }) => [
    // Social Security stops at the wage base; Medicare does not, and adds
    // 0.9 percent above the high-earner threshold.
    { labelKey: "levy.socialSecurity", amount: contribution(gross, 6.2, { ceiling: 176_100 }) },
    {
      labelKey: "levy.medicare",
      amount: contribution(gross, 1.45) + contribution(gross, 0.9, { floor: 200_000 }),
    },
  ],
});

/* --------------------------------------------------------- United Kingdom */

// Bands measured above the personal allowance.
const GB_SLABS: Slab[] = [
  { from: 0, rate: 20 },
  { from: 37_700, rate: 40 },
  { from: 112_570, rate: 45 },
];

const unitedKingdom = defineRules({
  taxYear: "2025/26",
  verifiedFor: "Tax year 2025/26, England, Wales and Northern Ireland",
  noteKey: "calc.income-tax.note.gb",
  regimes: [
    { value: "employee", labelKey: "calc.income-tax.status.employee" },
    { value: "selfEmployed", labelKey: "calc.income-tax.status.selfEmployed" },
  ],
  // The personal allowance tapers by 1 for every 2 above 100,000.
  allowance: (gross) => Math.max(12_570 - Math.max(gross - 100_000, 0) / 2, 0),
  slabs: GB_SLABS,
  social: ({ gross, regime }) => [
    {
      labelKey: "levy.nationalInsurance",
      amount:
        contribution(gross, regime === "employee" ? 8 : 6, {
          floor: 12_570,
          ceiling: 50_270,
        }) + contribution(gross, 2, { floor: 50_270 }),
    },
  ],
});

/* ----------------------------------------------------------------- Canada */

const CA_FEDERAL: Slab[] = [
  { from: 0, rate: 15 },
  { from: 57_375, rate: 20.5 },
  { from: 114_750, rate: 26 },
  { from: 177_882, rate: 29 },
  { from: 253_414, rate: 33 },
];

const canada = defineRules({
  taxYear: "2025",
  verifiedFor: "Tax year 2025, federal only - provincial tax not included",
  noteKey: "calc.income-tax.note.ca",
  allowance: 16_129, // Basic personal amount.
  slabs: CA_FEDERAL,
  social: ({ gross }) => [
    {
      labelKey: "levy.cpp",
      amount:
        contribution(gross, 5.95, { floor: 3_500, ceiling: 71_300 }) +
        contribution(gross, 4, { floor: 71_300, ceiling: 81_200 }),
    },
    { labelKey: "levy.ei", amount: contribution(gross, 1.64, { ceiling: 65_700 }) },
  ],
});

/* -------------------------------------------------------------- Australia */

const AU_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 18_200, rate: 16 },
  { from: 45_000, rate: 30 },
  { from: 135_000, rate: 37 },
  { from: 190_000, rate: 45 },
];

const australia = defineRules({
  taxYear: "2025-26",
  verifiedFor: "Tax year 2025-26, resident individual, excluding offsets",
  noteKey: "calc.income-tax.note.au",
  slabs: AU_SLABS,
  surtax: ({ gross }) => [
    // Medicare levy, ignoring the low-income reduction and the surcharge.
    { labelKey: "levy.medicareLevy", amount: gross > 27_222 ? gross * 0.02 : 0 },
  ],
});

/* ---------------------------------------------------------------- Germany */

/**
 * Einkommensteuer follows a closed-form schedule (EStG §32a), not a table of
 * bands: the marginal rate rises continuously through the two progression
 * zones before flattening at 42 and then 45 percent.
 */
function germanIncomeTax(taxable: number): number {
  const zvE = Math.floor(taxable);
  if (zvE <= 12_096) return 0;
  if (zvE <= 17_443) {
    const y = (zvE - 12_096) / 10_000;
    return (932.3 * y + 1_400) * y;
  }
  if (zvE <= 68_480) {
    const z = (zvE - 17_443) / 10_000;
    return (176.64 * z + 2_397) * z + 1_015.13;
  }
  if (zvE <= 277_825) return 0.42 * zvE - 10_911.92;
  return 0.45 * zvE - 19_246.67;
}

const germany = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, tax class I, EStG §32a basic schedule",
  noteKey: "calc.income-tax.note.de",
  allowance: 1_230, // Arbeitnehmer-Pauschbetrag; the Grundfreibetrag sits in the schedule.
  formula: germanIncomeTax,
  surtax: ({ tax }) => [
    // Solidaritätszuschlag only applies above the exemption limit.
    { labelKey: "levy.solidarity", amount: tax > 19_950 ? tax * 0.055 : 0 },
  ],
  social: ({ gross }) => [
    { labelKey: "levy.pensionInsurance", amount: contribution(gross, 9.3, { ceiling: 96_600 }) },
    { labelKey: "levy.healthInsurance", amount: contribution(gross, 8.55, { ceiling: 66_150 }) },
    { labelKey: "levy.unemploymentInsurance", amount: contribution(gross, 1.3, { ceiling: 96_600 }) },
    { labelKey: "levy.careInsurance", amount: contribution(gross, 1.8, { ceiling: 66_150 }) },
  ],
});

/* ---------------------------------------------------------------- Austria */

const AT_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 13_308, rate: 20 },
  { from: 21_617, rate: 30 },
  { from: 35_836, rate: 40 },
  { from: 69_166, rate: 48 },
  { from: 103_072, rate: 50 },
  { from: 1_000_000, rate: 55 },
];

const austria = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, employee, excluding Absetzbeträge",
  noteKey: "calc.income-tax.note.at",
  slabs: AT_SLABS,
  social: ({ gross }) => [
    { labelKey: "levy.socialInsurance", amount: contribution(gross, 18.07, { ceiling: 90_300 }) },
  ],
});

/* ------------------------------------------------------------ Switzerland */

// Federal direct tax, single taxpayer. Cantonal and communal tax is typically
// larger than this and is not modelled.
const CH_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 15_000, rate: 0.77 },
  { from: 32_800, rate: 0.88 },
  { from: 42_900, rate: 2.64 },
  { from: 57_200, rate: 2.97 },
  { from: 75_200, rate: 5.94 },
  { from: 81_000, rate: 6.6 },
  { from: 107_400, rate: 8.8 },
  { from: 139_600, rate: 11 },
  { from: 182_600, rate: 13.2 },
];

const switzerland = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, federal direct tax only, single taxpayer",
  noteKey: "calc.income-tax.note.ch",
  slabs: CH_SLABS,
  social: ({ gross }) => [
    { labelKey: "levy.ahv", amount: contribution(gross, 5.3) },
    { labelKey: "levy.unemploymentInsurance", amount: contribution(gross, 1.1, { ceiling: 148_200 }) },
  ],
});

/* ----------------------------------------------------------------- France */

const FR_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 11_497, rate: 11 },
  { from: 29_315, rate: 30 },
  { from: 83_823, rate: 41 },
  { from: 180_294, rate: 45 },
];

const france = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 barème, single share (one part), salaried",
  noteKey: "calc.income-tax.note.fr",
  // Abattement of 10% on salary, floored and capped.
  allowance: (gross) => Math.min(Math.max(gross * 0.1, 504), 14_426),
  slabs: FR_SLABS,
  social: ({ gross }) => [
    { labelKey: "levy.socialContributions", amount: contribution(gross, 22) },
    { labelKey: "levy.csgCrds", amount: contribution(gross * 0.9825, 9.7) },
  ],
});

/* ---------------------------------------------------------------- Belgium */

const BE_SLABS: Slab[] = [
  { from: 0, rate: 25 },
  { from: 16_320, rate: 40 },
  { from: 28_800, rate: 45 },
  { from: 49_840, rate: 50 },
];

const belgium = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, single taxpayer, excluding regional differences",
  noteKey: "calc.income-tax.note.be",
  allowance: 10_570,
  slabs: BE_SLABS,
  surtax: ({ tax }) => [
    { labelKey: "levy.communalTax", amount: tax * 0.07 },
  ],
  social: ({ gross }) => [
    { labelKey: "levy.socialSecurity", amount: contribution(gross, 13.07) },
  ],
});

/* ------------------------------------------------------------ Netherlands */

const NL_SLABS: Slab[] = [
  { from: 0, rate: 35.82 },
  { from: 38_441, rate: 37.48 },
  { from: 76_817, rate: 49.5 },
];

const netherlands = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, box 1, below state pension age",
  noteKey: "calc.income-tax.note.nl",
  slabs: NL_SLABS,
  // The general and labour tax credits both taper away with income.
  credit: ({ taxable }) => {
    const general = Math.max(3_068 - Math.max(taxable - 28_406, 0) * 0.06337, 0);
    const labour =
      taxable <= 43_071
        ? Math.min(taxable * 0.13, 5_599)
        : Math.max(5_599 - (taxable - 43_071) * 0.0651, 0);
    return general + labour;
  },
});

/* ------------------------------------------------------------------ Japan */

const JP_SLABS: Slab[] = [
  { from: 0, rate: 5 },
  { from: 1_950_000, rate: 10 },
  { from: 3_300_000, rate: 20 },
  { from: 6_950_000, rate: 23 },
  { from: 9_000_000, rate: 33 },
  { from: 18_000_000, rate: 40 },
  { from: 40_000_000, rate: 45 },
];

/** 給与所得控除 - the employment income deduction, by income band. */
function japanEmploymentDeduction(gross: number): number {
  if (gross <= 1_625_000) return 550_000;
  if (gross <= 1_800_000) return gross * 0.4 - 100_000;
  if (gross <= 3_600_000) return gross * 0.3 + 80_000;
  if (gross <= 6_600_000) return gross * 0.2 + 440_000;
  if (gross <= 8_500_000) return gross * 0.1 + 1_100_000;
  return 1_950_000;
}

const japan = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, employee, national tax plus flat-rate resident tax",
  noteKey: "calc.income-tax.note.jp",
  allowance: (gross) => japanEmploymentDeduction(gross) + 480_000,
  slabs: JP_SLABS,
  surtax: ({ taxable, tax }) => [
    { labelKey: "levy.reconstructionSurtax", amount: tax * 0.021 },
    // Residents pay a broadly flat 10% local tax on much the same base.
    { labelKey: "levy.residentTax", amount: taxable * 0.1 },
  ],
  social: ({ gross }) => [
    { labelKey: "levy.socialInsurance", amount: contribution(gross, 15, { ceiling: 16_500_000 }) },
  ],
});

/* ------------------------------------------------------------------ Spain */

const ES_SLABS: Slab[] = [
  { from: 0, rate: 19 },
  { from: 12_450, rate: 24 },
  { from: 20_200, rate: 30 },
  { from: 35_200, rate: 37 },
  { from: 60_000, rate: 45 },
  { from: 300_000, rate: 47 },
];

const spain = defineRules({
  taxYear: "2025",
  verifiedFor: "2025, state plus indicative regional scale, single taxpayer",
  noteKey: "calc.income-tax.note.es",
  allowance: 5_550, // Mínimo personal.
  slabs: ES_SLABS,
  social: ({ gross }) => [
    { labelKey: "levy.socialSecurity", amount: contribution(gross, 6.48, { ceiling: 58_908 }) },
  ],
});

/* ----------------------------------------------------------------- Mexico */

const MX_SLABS: Slab[] = [
  { from: 0, rate: 1.92 },
  { from: 8_952.5, rate: 6.4 },
  { from: 75_984.55, rate: 10.88 },
  { from: 133_536.07, rate: 16 },
  { from: 155_229.8, rate: 17.92 },
  { from: 185_852.57, rate: 21.36 },
  { from: 374_837.88, rate: 23.52 },
  { from: 590_796, rate: 30 },
  { from: 1_127_926.84, rate: 32 },
  { from: 1_503_902.46, rate: 34 },
  { from: 4_511_707.37, rate: 35 },
];

const mexico = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 annual ISR tariff, excluding subsidio para el empleo",
  noteKey: "calc.income-tax.note.mx",
  slabs: MX_SLABS,
  social: ({ gross }) => [
    { labelKey: "levy.imss", amount: contribution(gross, 2.775) },
  ],
});

/* ------------------------------------------------------------------ Italy */

const IT_SLABS: Slab[] = [
  { from: 0, rate: 23 },
  { from: 28_000, rate: 35 },
  { from: 50_000, rate: 43 },
];

const italy = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 IRPEF, employee, indicative regional and municipal rates",
  noteKey: "calc.income-tax.note.it",
  slabs: IT_SLABS,
  surtax: ({ taxable }) => [
    { labelKey: "levy.regionalTax", amount: taxable * 0.0173 },
    { labelKey: "levy.municipalTax", amount: taxable * 0.008 },
  ],
  social: ({ gross }) => [
    { labelKey: "levy.inps", amount: contribution(gross, 9.19, { ceiling: 120_607 }) },
  ],
});

/* --------------------------------------------------------------- Portugal */

const PT_SLABS: Slab[] = [
  { from: 0, rate: 13 },
  { from: 8_059, rate: 16.5 },
  { from: 12_160, rate: 22 },
  { from: 17_233, rate: 25 },
  { from: 22_306, rate: 32 },
  { from: 28_400, rate: 35.5 },
  { from: 41_629, rate: 43.5 },
  { from: 44_987, rate: 45 },
  { from: 83_696, rate: 48 },
];

const portugal = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 IRS, mainland Portugal, single taxpayer without dependants",
  noteKey: "calc.income-tax.note.pt",
  allowance: 4_462, // Dedução específica.
  slabs: PT_SLABS,
  surtax: ({ taxable }) => [
    {
      labelKey: "levy.solidaritySurcharge",
      amount:
        Math.max(Math.min(taxable, 250_000) - 80_000, 0) * 0.025 +
        Math.max(taxable - 250_000, 0) * 0.05,
    },
  ],
  social: ({ gross }) => [
    { labelKey: "levy.socialSecurity", amount: contribution(gross, 11) },
  ],
});

/* ----------------------------------------------------------------- Brazil */

const BR_SLABS: Slab[] = [
  { from: 0, rate: 0 },
  { from: 27_110.4, rate: 7.5 },
  { from: 33_919.8, rate: 15 },
  { from: 45_012.6, rate: 22.5 },
  { from: 55_976.16, rate: 27.5 },
];

const brazil = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 IRPF annualised from the monthly table, simplified deduction",
  noteKey: "calc.income-tax.note.br",
  allowance: (gross) => Math.min(gross * 0.2, 16_754.34),
  slabs: BR_SLABS,
  social: ({ gross }) => [
    {
      labelKey: "levy.inss",
      // INSS is banded, and each band applies only to the slice inside it.
      amount:
        contribution(gross, 7.5, { ceiling: 18_216 }) +
        contribution(gross, 9, { floor: 18_216, ceiling: 33_526.56 }) +
        contribution(gross, 12, { floor: 33_526.56, ceiling: 50_289.96 }) +
        contribution(gross, 14, { floor: 50_289.96, ceiling: 97_888.92 }),
    },
  ],
});

/* ----------------------------------------------------------------- Poland */

const PL_SLABS: Slab[] = [
  { from: 0, rate: 12 },
  { from: 120_000, rate: 32 },
];

const poland = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 PIT scale, employment contract",
  noteKey: "calc.income-tax.note.pl",
  allowance: 30_000, // Kwota wolna, applied as a zero-rate band.
  slabs: PL_SLABS,
  surtax: ({ gross }) => [
    { labelKey: "levy.solidarityLevy", amount: Math.max(gross - 1_000_000, 0) * 0.04 },
  ],
  social: ({ gross }) => [
    { labelKey: "levy.zus", amount: contribution(gross, 13.71) },
    { labelKey: "levy.healthInsurance", amount: contribution(gross * 0.8629, 9) },
  ],
});

/* ---------------------------------------------------------------- Türkiye */

const TR_SLABS: Slab[] = [
  { from: 0, rate: 15 },
  { from: 158_000, rate: 20 },
  { from: 330_000, rate: 27 },
  { from: 800_000, rate: 35 },
  { from: 4_300_000, rate: 40 },
];

const turkiye = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 gelir vergisi tarifesi, employee",
  noteKey: "calc.income-tax.note.tr",
  slabs: TR_SLABS,
  social: ({ gross }) => [
    { labelKey: "levy.sgk", amount: contribution(gross, 14, { ceiling: 1_953_000 }) },
    { labelKey: "levy.unemploymentInsurance", amount: contribution(gross, 1, { ceiling: 1_953_000 }) },
  ],
});

/* -------------------------------------------------------------------- UAE */

const uae = defineRules({
  taxYear: "2025",
  verifiedFor: "2025 - the UAE levies no personal income tax on salaries",
  noteKey: "calc.income-tax.note.ae",
  deductions: false,
  slabs: [{ from: 0, rate: 0 }],
});

export const INCOME_TAX_RULES: Record<CountryCode, IncomeTaxRules> = {
  in: india,
  us: unitedStates,
  gb: unitedKingdom,
  ca: canada,
  au: australia,
  de: germany,
  at: austria,
  ch: switzerland,
  fr: france,
  be: belgium,
  nl: netherlands,
  jp: japan,
  es: spain,
  mx: mexico,
  it: italy,
  pt: portugal,
  br: brazil,
  pl: poland,
  tr: turkiye,
  ae: uae,
};

export type { IncomeTaxRules };
