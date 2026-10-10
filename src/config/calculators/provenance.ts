/** Review coverage is deliberately explicit: it does not certify every country tax model. */
export type RuleReview = { revision: number; period: string; reviewed: string; scope: string; sources: string[] };
const reviewed = "2026-10-10";
const india: RuleReview = { revision: 2, period: "FY 2025–26 / AY 2026–27", reviewed, scope: "Resident salary slabs, section 87A and surcharge marginal relief", sources: ["https://www.incometaxindia.gov.in/w/resident-benefits-allowable"] };
const canada: RuleReview = { revision: 2, period: "2025", reviewed, scope: "Federal slabs and basic personal credit; excludes provincial tax and other federal credits", sources: ["https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/last-year.html", "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30000-basic-personal-amount.html"] };
export function ruleReview(slug: string, country: string): RuleReview | undefined {
  if (["income-tax", "salary", "payroll"].includes(slug)) return country === "in" ? india : country === "ca" ? canada : undefined;
  if (slug === "401k") return { revision: 2, period: "2025 / 2026", reviewed, scope: "Elective, matching, combined and eligible compensation limits; excludes catch-up contributions", sources: ["https://www.irs.gov/publications/p560", "https://www.irs.gov/retirement-plans/401k-plans-deferrals-and-matching-when-compensation-exceeds-the-annual-limit"] };
  if (slug === "social-security-benefit") return { revision: 2, period: "2025 PIA; FRA 67", reviewed, scope: "Monthly early-claim reduction and delayed credits", sources: ["https://www.ssa.gov/oact/quickcalc/early_late.html"] };
  if (slug === "hecs") return { revision: 2, period: "2025–26", reviewed, scope: "Repayment tiers; projection uses entered indexation and income growth", sources: ["https://www.ato.gov.au/individuals-and-families/study-and-training-support-loans/compulsory-repayments/repayment-thresholds-and-rates"] };
}
