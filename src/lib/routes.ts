import type { Section } from "@/config/categories";
import type { CountryCode } from "@/config/countries";
import { LOCALES, type LocaleCode } from "@/config/locales";

/**
 * Every internal URL is built here so the shape stays in one place. Slugs are
 * lowercase and hyphenated, no query parameters on anything indexable.
 *
 *   /{locale}
 *   /{locale}/{section}
 *   /{locale}/{section}/{category}
 *   /{locale}/{section}/{category}/{slug}
 *   /{locale}/countries/{country}
 *   /{locale}/countries/{country}/{slug}
 */

export function localeHome(locale: LocaleCode): string {
  return `/${LOCALES[locale].path}`;
}

export function sectionPath(locale: LocaleCode, section: Section): string {
  return `${localeHome(locale)}/${section}`;
}

export function categoryPath(
  locale: LocaleCode,
  section: Section,
  category: string,
): string {
  return `${sectionPath(locale, section)}/${category}`;
}

export function contentPath(
  locale: LocaleCode,
  section: Section,
  category: string,
  slug: string,
): string {
  return `${categoryPath(locale, section, category)}/${slug}`;
}

export function countryPath(locale: LocaleCode, country: CountryCode): string {
  return `${sectionPath(locale, "countries")}/${country}`;
}

export function countryToolPath(
  locale: LocaleCode,
  country: CountryCode,
  slug: string,
): string {
  return `${countryPath(locale, country)}/${slug}`;
}

/**
 * Where a calculator lives. Country-specific calculators are canonically a
 * country tool, because their rules - not just their currency - differ; the
 * rest sit under their subject category.
 */
export function calculatorPath(
  locale: LocaleCode,
  calculator: { slug: string; category: string; isCountrySpecific?: boolean },
  country: CountryCode,
): string {
  return calculator.isCountrySpecific
    ? countryToolPath(locale, country, calculator.slug)
    : contentPath(locale, "calculators", calculator.category, calculator.slug);
}

/** Swaps the locale prefix on a path, keeping the rest of the route intact. */
export function swapLocale(pathname: string, next: LocaleCode): string {
  const segments = pathname.split("/").filter(Boolean);
  segments[0] = LOCALES[next].path;
  return `/${segments.join("/")}`;
}

/** Absolute URL for canonical tags, hreflang and sitemaps. */
export function absoluteUrl(path: string): string {
  const base = siteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Site origin with no trailing slash. Configured per environment so preview
 * deployments do not emit production canonicals.
 */
export function siteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  return (configured ?? "https://houseofcalculators.com").replace(/\/$/, "");
}
