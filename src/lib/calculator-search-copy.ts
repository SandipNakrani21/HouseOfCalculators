import type { CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";

/** A compact source period for metadata; detailed scope stays on the page. */
export function calculatorMetadataPeriod(period: string): string {
  return period.match(/\b(?:19|20)\d{2}(?:[–\/-](?:\d{4}|\d{2}))?\b/)?.[0] ?? period;
}

/** Translate the reviewed period without changing its source year or scope. */
export function calculatorReviewPeriod(locale: LocaleCode, slug: string, country: CountryCode, period?: string): string | undefined {
  if (locale === "it-IT" && slug === "income-tax" && country === "it") {
    return period?.replace(/full-year ordinary employment$/, "(lavoro dipendente ordinario per l’intero anno)");
  }
  return period;
}

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
