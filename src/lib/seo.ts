import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_CODES,
  type LocaleCode,
} from "@/config/locales";
import { COUNTRIES } from "@/config/countries";
import { LANGUAGES, type LanguageCode } from "@/config/languages";
import { OPERATOR } from "@/config/legal/definitions";
import { createTranslator, isLanguageReady } from "@/lib/i18n";
import { absoluteUrl, swapLocale } from "@/lib/routes";

/**
 * A locale ships once its dictionary covers enough of the site. Gating here as
 * well as in the picker keeps unfinished locales out of hreflang and sitemaps,
 * so search engines are never pointed at a half-translated page.
 */
export function isLocaleReady(locale: LocaleCode): boolean {
  return isLanguageReady(LOCALES[locale].language);
}

export function readyLocales(): LocaleCode[] {
  return LOCALE_CODES.filter(isLocaleReady);
}

export const SITE_NAME = "House of Calculators";

/** What the layout's title template adds, and the longest title worth showing. */
const BRAND_SUFFIX = ` | ${SITE_NAME}`;
const MAX_TITLE = 65;

/** The generated share card. Next serves it from this root-level route. */
const OG_IMAGE = absoluteUrl("/opengraph-image");

type MetaInput = {
  locale: LocaleCode;
  /** Path within the locale, e.g. `/en-us/calculators/finance/mortgage`. */
  path: string;
  title: string;
  description: string;
  /** Locales this page exists in. Defaults to every ready locale. */
  availableIn?: LocaleCode[];
  /** Search should not index thin or duplicated states. */
  noindex?: boolean;
  type?: "website" | "article";
};

/**
 * Canonical, hreflang, Open Graph and Twitter metadata for one page.
 *
 * Every localized version references itself and all its alternates, which is
 * what Google asks for, and `x-default` points at the default locale so an
 * unmatched visitor has somewhere defined to land.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  availableIn,
  noindex,
  type = "website",
}: MetaInput): Metadata {
  const alternates = (availableIn ?? readyLocales()).filter(isLocaleReady);
  const languages = hreflangAlternates(path, alternates);

  const canonical = absoluteUrl(path);

  // Search results show about 150 characters. A short one (under 95) gets the
  // site's promise added, in the page's language, so snippets are not left
  // half empty.
  const fullDescription =
    description.length < 95
      ? `${description} ${createTranslator(LOCALES[locale].language, locale)("seo.descriptionSuffix")}`
      : description;

  return {
    // The layout appends " | House of Calculators". Search results cut titles
    // at roughly 60-65 characters, so where the brand would push a title past
    // that, the page's own words win and the brand is left off.
    title: title.length + BRAND_SUFFIX.length > MAX_TITLE ? { absolute: title } : title,
    description: fullDescription,
    alternates: { canonical, languages },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      // The other market versions of this page (en_GB beside en_US).
      alternateLocale: alternates.filter((code) => code !== locale).map(ogLocale),
      // Named explicitly rather than left to the file convention: setting
      // `openGraph` here replaces it wholesale, so without this every page
      // would be shared with no preview image at all.
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

/**
 * hreflang for one page, used by both the page head and the sitemap so the two
 * always agree:
 *
 *   en-US, en-GB   each market version, spelt and priced for that market
 *   en             a language-only fallback for English readers elsewhere
 *                  (Australia, India, ...), pointing at the language's
 *                  primary locale - the default locale where it shares the
 *                  language, otherwise the first ready one
 *   x-default      where to send anyone else
 */
export function hreflangAlternates(path: string, alternates: LocaleCode[] = readyLocales()): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const code of alternates) {
    languages[code] = absoluteUrl(swapLocale(path, code));
  }
  const byLanguage = new Map<string, LocaleCode[]>();
  for (const code of alternates) {
    const language = LOCALES[code].language;
    byLanguage.set(language, [...(byLanguage.get(language) ?? []), code]);
  }
  for (const [language, codes] of byLanguage) {
    if (codes.length < 2) continue;
    const primary = codes.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : codes[0];
    languages[LANGUAGES[language as LanguageCode].intlTag.split("-")[0]] = absoluteUrl(swapLocale(path, primary));
  }
  if (alternates.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = absoluteUrl(swapLocale(path, DEFAULT_LOCALE));
  }
  return languages;
}

/** Open Graph writes locales with an underscore: en_US. */
function ogLocale(locale: LocaleCode): string {
  return locale.replace("-", "_");
}

/** Each locale's site is its own WebSite entity, in its own language. */
function websiteId(locale: LocaleCode): string {
  return absoluteUrl(`/${LOCALES[locale].path}#website`);
}

/** JSON-LD helper: renders nothing visible, just the script tag. */
export function jsonLd(data: Record<string, unknown>): string {
  // Angle brackets are escaped so a stray `</script>` in data cannot break out.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * One Organization entity for the whole site, identified by `@id`. Every
 * other block (WebSite, WebApplication, Article, WebPage) points at it rather
 * than describing the publisher afresh, so search and answer engines see one
 * consistent business behind every page.
 */
const ORG_ID = absoluteUrl("/#organization");

export function publisherRef(): Record<string, unknown> {
  return { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: absoluteUrl("/") };
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    ...(OPERATOR.entity ? { legalName: OPERATOR.entity } : {}),
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    slogan: "Every Calculation. One Global Home.",
    knowsLanguage: readyLocales(),
    description:
      "Free calculators, converters and guides that follow each country's currency, units and rules. Every calculation runs on the visitor's device.",
    // Only once the operator has published a contact address (legal/definitions).
    ...(OPERATOR.email
      ? { email: OPERATOR.email, contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: OPERATOR.email } }
      : {}),
  };
}

export function websiteSchema(locale: LocaleCode): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(locale),
    name: SITE_NAME,
    url: absoluteUrl(`/${LOCALES[locale].path}`),
    inLanguage: locale,
    // The same site in its other languages and markets.
    workTranslation: readyLocales()
      .filter((code) => code !== locale)
      .map((code) => ({ "@id": websiteId(code) })),
    publisher: { "@id": ORG_ID },
  };
}

/**
 * A plain page (legal pages, reference tables): what it is, which site it
 * belongs to and who publishes it. `type` narrows it where schema.org has a
 * better word: AboutPage, ContactPage.
 */
export function webPageSchema({
  type = "WebPage",
  name,
  description,
  path,
  locale,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  path: string;
  locale: LocaleCode;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: locale,
    isPartOf: { "@id": websiteId(locale) },
    publisher: publisherRef(),
  };
}

/**
 * A section or category page: a collection whose main entity is the list of
 * pages it links to, in the order shown.
 */
export function collectionPageSchema({
  name,
  description,
  path,
  locale,
  items,
}: {
  name: string;
  description: string;
  path: string;
  locale: LocaleCode;
  items: { name: string; path: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: locale,
    isPartOf: { "@id": websiteId(locale) },
    publisher: publisherRef(),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * FAQ markup for the questions a page answers. Answer engines and search
 * both lift these directly, so the text must be exactly what the page shows.
 */
export function faqSchema(
  items: { question: string; answer: string }[],
  locale: LocaleCode,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * A calculator, converter or tool described as a free web application: what
 * it is, what it does, that it runs in any browser and costs nothing.
 */
export function webApplicationSchema({
  name,
  description,
  path,
  locale,
  category = "UtilitiesApplication",
}: {
  name: string;
  description: string;
  path: string;
  locale: LocaleCode;
  /** A schema.org application category, e.g. "FinanceApplication". */
  category?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: locale,
    applicationCategory: category,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    // Free, stated in the currency of the locale's market.
    offers: { "@type": "Offer", price: "0", priceCurrency: COUNTRIES[LOCALES[locale].defaultCountry].currency.code },
    isPartOf: { "@id": websiteId(locale) },
    publisher: publisherRef(),
  };
}
