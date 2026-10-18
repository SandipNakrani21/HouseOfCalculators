/** Review coverage is deliberately explicit: it does not certify every country tax model. */
export type RuleReview = { revision: number; period: string; reviewed: string; scope: string; sources: string[] };

/** Keep source-review scope translatable without importing compute engines. */
export function reviewScopeKey(slug: string, country: string): string {
  if (["income-tax", "salary", "payroll"].includes(slug)) return `review.scope.${country === "in" ? "india" : "canada"}`;
  if (slug === "401k") return "review.scope.401k";
  if (slug === "social-security-benefit") return "review.scope.socialSecurity";
  return "review.scope.hecs";
}

/** Contextual references, never an individual medical assessment. */
export function healthReferences(slug: string): { scopeKey: string; sources: string[] } | undefined {
  if (slug === "bmi") return { scopeKey: "review.health.bmi", sources: ["https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html"] };
  if (["bmr", "tdee"].includes(slug)) return { scopeKey: "review.health.energy", sources: ["https://pubmed.ncbi.nlm.nih.gov/2305711/"] };
  if (slug === "water-intake") return { scopeKey: "review.health.water", sources: ["https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1459"] };
}
const reviewed = "2026-10-10";
const india: RuleReview = { revision: 2, period: "FY 2025–26 / AY 2026–27", reviewed, scope: "Resident salary slabs, section 87A and surcharge marginal relief", sources: ["https://www.incometaxindia.gov.in/w/resident-benefits-allowable"] };
const canada: RuleReview = { revision: 2, period: "2025", reviewed, scope: "Federal slabs and basic personal credit; excludes provincial tax and other federal credits", sources: ["https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/last-year.html", "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30000-basic-personal-amount.html"] };
export function ruleReview(slug: string, country: string): RuleReview | undefined {
  if (["income-tax", "salary", "payroll"].includes(slug)) return country === "in" ? india : country === "ca" ? canada : undefined;
  if (slug === "401k") return { revision: 2, period: "2025 / 2026", reviewed, scope: "Elective, matching, combined and eligible compensation limits; excludes catch-up contributions", sources: ["https://www.irs.gov/publications/p560", "https://www.irs.gov/retirement-plans/401k-plans-deferrals-and-matching-when-compensation-exceeds-the-annual-limit"] };
  if (slug === "social-security-benefit") return { revision: 2, period: "2025 PIA; FRA 67", reviewed, scope: "Monthly early-claim reduction and delayed credits", sources: ["https://www.ssa.gov/oact/quickcalc/early_late.html"] };
  if (slug === "hecs") return { revision: 2, period: "2025–26", reviewed, scope: "Repayment tiers; projection uses entered indexation and income growth", sources: ["https://www.ato.gov.au/individuals-and-families/study-and-training-support-loans/compulsory-repayments/repayment-thresholds-and-rates"] };
}
