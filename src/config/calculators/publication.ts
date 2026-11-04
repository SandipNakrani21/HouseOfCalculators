import { ruleReview } from "./provenance";

/** Editorial release gate; internal definitions remain available for review. */
export function isCalculatorPublished(calculator: { slug: string; isCountrySpecific?: boolean }, country: string): boolean {
  return !calculator.isCountrySpecific || Boolean(ruleReview(calculator.slug, country));
}

/** These wage-only salary tools expose the same inputs and model as income tax.
 * Keep saved tools usable while consolidating their search/sitemap identity.
 * CH/JP have additional salary inputs; other reviewed salary tools have periods.
 */
export { canonicalCountryToolSlug } from "./canonical-slug";
