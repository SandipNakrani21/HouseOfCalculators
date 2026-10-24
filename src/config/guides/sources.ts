/** Further reading supports the topic; it does not imply endorsement of this site. */
const compound = { name: "Investor.gov — Compound interest", href: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" };
const amortisation = { name: "CFPB — Amortization", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/" };
const sources: Record<string, { name: string; href: string }[]> = {
  "how-to-calculate-loan-payment": [amortisation],
  "how-to-calculate-compound-interest": [compound],
  "how-to-calculate-vat": [{ name: "GOV.UK — VAT rates (UK)", href: "https://www.gov.uk/vat-rates" }],
  "what-is-compound-interest": [compound],
  "what-is-amortisation": [amortisation],
  "what-is-inflation": [{ name: "BLS — Consumer Price Index (US)", href: "https://www.bls.gov/cpi/questions-and-answers.htm" }],
  "what-is-a-marginal-tax-rate": [{ name: "IRS — Federal income tax brackets (US)", href: "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets" }],
  "how-to-compare-loan-offers": [{ name: "CFPB — Interest rate and APR", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/" }],
  "how-to-read-an-amortisation-schedule": [amortisation],
  "how-to-plan-monthly-savings": [compound, { name: "Investor.gov — Risk tolerance and time horizon", href: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/gauge-your-risk-tolerance" }],
  "future-value-formula": [compound],
};
export function guideSources(slug: string) { return sources[slug] ?? []; }
