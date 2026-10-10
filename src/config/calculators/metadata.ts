import data from "./metadata.json";
import type { CalculatorDef } from "./types";
export type CalculatorMetadata = Pick<CalculatorDef, "slug" | "icon" | "version" | "category" | "titleKey" | "descKey" | "countries" | "isCountrySpecific" | "countryRelevance" | "params"> & { engineGroup: string };
export const CALCULATOR_METADATA: CalculatorMetadata[] = data.map(item => ({ ...item,
  params: item.taxName ? ({ country, t }) => ({ tax: t(country.consumptionTax.labelKey) }) : undefined,
})) as CalculatorMetadata[];
