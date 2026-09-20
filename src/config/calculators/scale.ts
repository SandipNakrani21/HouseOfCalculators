import { COUNTRY_CODES, type CountryCode } from "@/config/countries";

/**
 * Sensible slider ranges per country. A rupee monthly contribution and a euro
 * one live two orders of magnitude apart, and a yen one two more, so ranges
 * are derived from the currency's rough scale rather than hard-coded inside
 * each calculator.
 */
export type MoneyScale = {
  /** Slider step for monthly contributions. */
  monthlyStep: number;
  monthlyMin: number;
  monthlyMax: number;
  /** One-off amounts: lump sums, deposits, purchase prices. */
  lumpStep: number;
  lumpMin: number;
  lumpMax: number;
  /** Annual income range for tax and salary calculators. */
  incomeStep: number;
  incomeMin: number;
  incomeMax: number;
  /** Loan principal range. */
  loanStep: number;
  loanMin: number;
  loanMax: number;
  /** Typical starting values, so a page is useful before anything is touched. */
  defaults: {
    monthly: number;
    lump: number;
    income: number;
    loan: number;
    /** Property price, for mortgage and stamp duty. */
    property: number;
  };
};

/**
 * How many units of the local currency roughly equal one euro. Only the order
 * of magnitude matters - these size sliders, they never convert money.
 */
const UNITS_PER_EUR: Record<CountryCode, number> = {
  us: 1,
  gb: 0.85,
  ca: 1.5,
  au: 1.65,
  de: 1,
  at: 1,
  ch: 0.95,
  fr: 1,
  be: 1,
  nl: 1,
  jp: 165,
  es: 1,
  mx: 20,
  it: 1,
  pt: 1,
  br: 6,
  pl: 4.3,
  tr: 40,
  ae: 4,
  in: 90,
};

/** Typical annual gross income and property price, in local currency. */
const TYPICAL: Record<CountryCode, { income: number; property: number }> = {
  us: { income: 85_000, property: 420_000 },
  gb: { income: 45_000, property: 300_000 },
  ca: { income: 70_000, property: 650_000 },
  au: { income: 95_000, property: 800_000 },
  de: { income: 50_000, property: 400_000 },
  at: { income: 48_000, property: 380_000 },
  ch: { income: 90_000, property: 900_000 },
  fr: { income: 40_000, property: 300_000 },
  be: { income: 45_000, property: 320_000 },
  nl: { income: 45_000, property: 450_000 },
  jp: { income: 4_500_000, property: 45_000_000 },
  es: { income: 30_000, property: 220_000 },
  mx: { income: 300_000, property: 2_500_000 },
  it: { income: 30_000, property: 220_000 },
  pt: { income: 22_000, property: 250_000 },
  br: { income: 60_000, property: 500_000 },
  pl: { income: 90_000, property: 600_000 },
  tr: { income: 600_000, property: 4_000_000 },
  ae: { income: 300_000, property: 1_800_000 },
  in: { income: 1_200_000, property: 6_000_000 },
};

/** Rounds up to the nearest 1, 2 or 5 times a power of ten, so steps read well. */
function nice(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalised = value / magnitude;
  const stepped = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  return stepped * magnitude;
}

function buildScale(country: CountryCode): MoneyScale {
  const factor = UNITS_PER_EUR[country];
  const typical = TYPICAL[country];
  const at = (euros: number) => nice(euros * factor);

  return {
    monthlyStep: at(25),
    monthlyMin: at(25),
    monthlyMax: at(20_000),
    lumpStep: at(500),
    lumpMin: at(500),
    lumpMax: at(2_000_000),
    incomeStep: at(1_000),
    incomeMin: at(10_000),
    incomeMax: at(1_000_000),
    loanStep: at(5_000),
    loanMin: at(5_000),
    loanMax: at(2_000_000),
    defaults: {
      monthly: at(400),
      lump: at(10_000),
      income: typical.income,
      loan: Math.round(typical.property * 0.8),
      property: typical.property,
    },
  };
}

export const MONEY_SCALE: Record<CountryCode, MoneyScale> = Object.fromEntries(
  COUNTRY_CODES.map((code) => [code, buildScale(code)]),
) as Record<CountryCode, MoneyScale>;

/** Widens a country's income ceiling when a calculator needs headroom. */
export function incomeCeiling(country: CountryCode): number {
  return Math.max(MONEY_SCALE[country].incomeMax, TYPICAL[country].income * 10);
}
