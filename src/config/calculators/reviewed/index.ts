import type { CalculatorDef } from "../types";
import type { ReviewedCountryCalculator } from "./types";
import { rootReviewed } from "./root";
import { germanicReviewed } from "./germanic";
import { asiaReviewed } from "./asia";
import { romanceReviewed } from "./romance";

// Source-reviewed country replacements are registered here after integration.
export const reviewedCountries: ReviewedCountryCalculator[] = [...rootReviewed, ...germanicReviewed, ...asiaReviewed, ...romanceReviewed];

export function reviewedCalculator(slug: string, country: string) {
  return reviewedCountries.find(entry => entry.slug === slug && entry.country === country);
}

/** Keep the original engines available while applying reviewed country models. */
export function applyReviewedCountry(definition: CalculatorDef) {
  const original = { fields: definition.fields, compute: definition.compute, validate: definition.validate };
  definition.fields = ctx => (reviewedCalculator(definition.slug, ctx.countryCode)?.fields ?? original.fields)(ctx);
  definition.compute = (values, ctx) => (reviewedCalculator(definition.slug, ctx.countryCode)?.compute ?? original.compute)(values, ctx);
  definition.validate = (values, ctx) => {
    const replacement = reviewedCalculator(definition.slug, ctx.countryCode);
    return replacement ? replacement.validate?.(values, ctx) ?? null : original.validate?.(values, ctx) ?? null;
  };
  definition.version += 1;
}
