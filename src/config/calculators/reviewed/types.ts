import type { CountryCode } from "@/config/countries";
import type { CalcContext, CalculatorField, CalculatorResult, FieldValues } from "../types";
import type { RuleReview } from "../provenance";

/** Independently reviewed country-specific replacement; original engines remain. */
export type ReviewedCountryCalculator = {
  slug: string;
  country: CountryCode;
  fields: (ctx: CalcContext) => CalculatorField[];
  compute: (values: FieldValues, ctx: CalcContext) => CalculatorResult;
  validate?: (values: FieldValues, ctx: CalcContext) => string | null;
  scopeKey: string;
  review: RuleReview;
};
