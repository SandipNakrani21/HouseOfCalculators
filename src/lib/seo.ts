import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_CODES,
  type LocaleCode,
} from "@/config/locales";
import { isLanguageReady } from "@/lib/i18n";
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

  const languages: Record<string, string> = {};
  for (const code of alternates) {
    languages[code] = absoluteUrl(swapLocale(path, code));
  }
  if (alternates.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = absoluteUrl(swapLocale(path, DEFAULT_LOCALE));
  }

  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical, languages },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale.replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** JSON-LD helper: renders nothing visible, just the script tag. */
export function jsonLd(data: Record<string, unknown>): string {
  // Angle brackets are escaped so a stray `</script>` in data cannot break out.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
  };
}

export function websiteSchema(locale: LocaleCode): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl(`/${LOCALES[locale].path}`),
    inLanguage: locale,
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
