import type { CountryCode } from "@/config/countries";

import { consumptionTaxCalculator } from "./definitions/consumption-tax";
import { emiCalculator } from "./definitions/emi";
import { incomeTaxCalculator } from "./definitions/income-tax";
import { sipCalculator } from "./definitions/sip";
import type { CalculatorDef } from "./types";

/**
 * The registry. Adding a calculator is: write a definition, add its keys to
 * the dictionaries, and list it here. Order is the order on the home grid.
 */
export const CALCULATORS: CalculatorDef[] = [
  sipCalculator,
  emiCalculator,
  incomeTaxCalculator,
  consumptionTaxCalculator,
];

export function calculatorsFor(country: CountryCode): CalculatorDef[] {
  return CALCULATORS.filter((calc) => calc.countries.includes(country));
}

export function getCalculator(slug: string): CalculatorDef | undefined {
  return CALCULATORS.find((calc) => calc.slug === slug);
}

/** Countries where a given calculator exists, for the "not available" fallback. */
export function countriesOffering(slug: string): CountryCode[] {
  return getCalculator(slug)?.countries ?? [];
}

export type { CalculatorDef };
