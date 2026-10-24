import type { CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";

/** Copy for the two exact pages reviewed against the October 2026 GSC exports. */
export function calculatorSearchCopy(
  locale: LocaleCode,
  slug: string,
  country: CountryCode,
  reviewedPeriod?: string,
): { title: string; metadataTitle: string; description: string } | undefined {
  if (locale !== "en-US") return undefined;

  if (slug === "loan" && country === "us") {
    return {
      title: "Loan Calculator",
      metadataTitle: "Loan Calculator – Monthly Payments & Total Interest",
      description:
        "Calculate monthly loan payments, total interest and an amortization schedule from your amount, fixed annual interest rate and loan term. Excludes fees.",
    };
  }

  if (slug === "income-tax" && country === "pl") {
    // Take the year from the reviewed model, never the current calendar date.
    const year = reviewedPeriod?.match(/^\d{4}\b/)?.[0];
    if (!year) return undefined;
    return {
      title: `Poland Income Tax Calculator ${year}`,
      metadataTitle: `Poland Income Tax Calculator ${year} – Employment PIT`,
      description:
        `Estimate ${year} Poland employment income tax (PIT) in PLN. Includes modeled employee deductions for single residents with one full-time, full-year local job.`,
    };
  }

  return undefined;
}
