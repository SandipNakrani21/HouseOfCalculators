import type { CountryCode } from "@/config/countries";

/**
 * Sensible slider ranges per country. A rupee monthly SIP and a dollar one
 * live two orders of magnitude apart, so ranges are data rather than
 * hard-coded numbers inside each calculator.
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
  };
};

export const MONEY_SCALE: Record<CountryCode, MoneyScale> = {
  in: {
    monthlyStep: 500,
    monthlyMin: 500,
    monthlyMax: 1_000_000,
    lumpStep: 1_000,
    lumpMin: 1_000,
    lumpMax: 10_000_000,
    incomeStep: 10_000,
    incomeMin: 100_000,
    incomeMax: 50_000_000,
    loanStep: 50_000,
    loanMin: 50_000,
    loanMax: 50_000_000,
    defaults: { monthly: 25_000, lump: 500_000, income: 1_200_000, loan: 5_000_000 },
  },
  us: {
    monthlyStep: 50,
    monthlyMin: 50,
    monthlyMax: 20_000,
    lumpStep: 500,
    lumpMin: 500,
    lumpMax: 2_000_000,
    incomeStep: 1_000,
    incomeMin: 10_000,
    incomeMax: 1_000_000,
    loanStep: 5_000,
    loanMin: 5_000,
    loanMax: 2_000_000,
    defaults: { monthly: 500, lump: 10_000, income: 85_000, loan: 350_000 },
  },
  gb: {
    monthlyStep: 25,
    monthlyMin: 25,
    monthlyMax: 15_000,
    lumpStep: 500,
    lumpMin: 500,
    lumpMax: 1_500_000,
    incomeStep: 1_000,
    incomeMin: 10_000,
    incomeMax: 500_000,
    loanStep: 5_000,
    loanMin: 5_000,
    loanMax: 1_500_000,
    defaults: { monthly: 400, lump: 10_000, income: 45_000, loan: 250_000 },
  },
  ae: {
    monthlyStep: 100,
    monthlyMin: 100,
    monthlyMax: 100_000,
    lumpStep: 1_000,
    lumpMin: 1_000,
    lumpMax: 10_000_000,
    incomeStep: 5_000,
    incomeMin: 30_000,
    incomeMax: 5_000_000,
    loanStep: 25_000,
    loanMin: 25_000,
    loanMax: 10_000_000,
    defaults: { monthly: 2_000, lump: 50_000, income: 300_000, loan: 1_500_000 },
  },
};
