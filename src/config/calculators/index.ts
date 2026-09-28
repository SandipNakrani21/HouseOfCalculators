import type { CountryCode } from "@/config/countries";

import {
  cppCalculator,
  eiCalculator,
  nationalInsuranceCalculator,
  payrollCalculator,
  salaryCalculator,
  severancePayCalculator,
  socialSecurityCalculator,
  thirtyPercentRulingCalculator,
  tipCalculator,
} from "./definitions/income";
import { BUSINESS_CALCULATORS, EVERYDAY_CALCULATORS } from "./definitions/business";
import { CONSTRUCTION_CALCULATORS, ENGINEERING_CALCULATORS } from "./definitions/construction";
import { EDUCATION_CALCULATORS } from "./definitions/education";
import { HEALTH_CALCULATORS } from "./definitions/health";
import {
  autoLoanCalculator,
  mortgageCalculator,
  personalLoanCalculator,
  studentLoanCalculator,
} from "./definitions/loans";
import {
  fourOhOneKCalculator,
  hecsCalculator,
  inflationCalculator,
  pensionCalculator,
  retirementCalculator,
  socialSecurityBenefitCalculator,
  superannuationCalculator,
} from "./definitions/retirement";
import { MATH_CALCULATORS } from "./definitions/maths";
import { sipCalculator } from "./definitions/sip";
import {
  capitalGainsCalculator,
  churchTaxCalculator,
  consumptionTaxCalculator,
  incomeTaxCalculator,
  propertyTaxCalculator,
  stampDutyCalculator,
} from "./definitions/tax";
import type { CalculatorDef } from "./types";

/**
 * The registry. Adding a calculator is: write a definition, add its keys to
 * the dictionaries, and list it here. Order is the order on the home grid,
 * so the ones most people arrive looking for come first.
 */
export const CALCULATORS: CalculatorDef[] = [
  mortgageCalculator,
  incomeTaxCalculator,
  salaryCalculator,
  personalLoanCalculator,
  autoLoanCalculator,
  consumptionTaxCalculator,
  retirementCalculator,
  pensionCalculator,
  capitalGainsCalculator,
  sipCalculator,
  studentLoanCalculator,
  inflationCalculator,
  socialSecurityCalculator,
  nationalInsuranceCalculator,
  fourOhOneKCalculator,
  socialSecurityBenefitCalculator,
  superannuationCalculator,
  hecsCalculator,
  cppCalculator,
  eiCalculator,
  stampDutyCalculator,
  churchTaxCalculator,
  propertyTaxCalculator,
  thirtyPercentRulingCalculator,
  payrollCalculator,
  severancePayCalculator,
  tipCalculator,

  // Generic, country-independent sets. Grouped rather than interleaved so
  // the finance tools most visitors arrive for stay at the top of the grid.
  ...HEALTH_CALCULATORS,
  ...MATH_CALCULATORS,
  ...BUSINESS_CALCULATORS,
  ...EVERYDAY_CALCULATORS,
  ...EDUCATION_CALCULATORS,
  ...CONSTRUCTION_CALCULATORS,
  ...ENGINEERING_CALCULATORS,
];

export function calculatorsFor(country: CountryCode): CalculatorDef[] {
  return CALCULATORS.filter((calc) => calc.countries.includes(country));
}

export function getCalculator(slug: string): CalculatorDef | undefined {
  return CALCULATORS.find((calc) => calc.slug === slug);
}

export type { CalculatorDef };
