import { ruleReview } from "./provenance";

/** Editorial release gate; internal definitions remain available for review. */
export function isCalculatorPublished(calculator: { slug: string; isCountrySpecific?: boolean }, country: string): boolean {
  return !calculator.isCountrySpecific || Boolean(ruleReview(calculator.slug, country));
}
