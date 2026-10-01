import { CALCULATORS } from "@/config/calculators";
import {
  CALCULATOR_CATEGORIES,
  SECTIONS,
  type Section,
} from "@/config/categories";
import { CONVERTERS, pairSlug } from "@/config/converters/definitions";
import { COUNTRY_CODES } from "@/config/countries";
import { TOOLS } from "@/config/tools/definitions";
import { CHART_CATEGORIES, GUIDE_CATEGORIES, TOOL_CATEGORIES } from "@/config/categories";
import { CHARTS } from "@/config/charts/definitions";
import { GUIDES } from "@/config/guides/definitions";
import { LEGAL_PAGES } from "@/config/legal/definitions";
import {
  absoluteUrl,
  categoryPath,
  contentPath,
  countryPath,
  countryToolPath,
  localeHome,
  sectionPath,
} from "@/lib/routes";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { hreflangAlternates, readyLocales } from "@/lib/seo";

export type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
  /** hreflang code -> URL, the same set the page head declares (lib/seo). */
  languages: Record<string, string>;
};

/**
 * Every indexable page of one locale, with `languages` on each entry so the
 * localized versions are declared here as well as in the page head. Served as
 * one sitemap per locale under /sitemaps/, listed by the index at /sitemap.xml.
 *
 * Sections that have no content yet are left out rather than listed as empty
 * pages. Nothing is added to the sitemap that a visitor could not use.
 */
export function sitemapEntries(locale: LocaleCode): SitemapEntry[] {
  const locales = readyLocales();
  const entries: SitemapEntry[] = [];

  // `lastModified` only where the date is real (a guide's review date).
  // Stamping every URL with the build time tells search engines that all 700
  // pages changed on every deploy, and they learn to ignore the field.
  const add = (
    path: string,
    priority: number,
    frequency: "daily" | "weekly" | "monthly",
    lastModified?: string,
  ) => {
    entries.push({
      url: absoluteUrl(path),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: frequency,
      priority,
      languages: hreflangAlternates(path, locales),
    });
  };

  // Sections that currently hold content. Empty ones are excluded until they do.
  const liveSections: Section[] = SECTIONS.filter((section) =>
    ["calculators", "converters", "tools", "charts", "guides", "countries"].includes(section),
  );

  add(localeHome(locale), 1, "weekly");

  for (const section of liveSections) {
    add(sectionPath(locale, section), 0.8, "weekly");
  }

  for (const category of CALCULATOR_CATEGORIES) {
    if (!CALCULATORS.some((calc) => !calc.isCountrySpecific && calc.category === category)) {
      continue;
    }
    add(categoryPath(locale, "calculators", category), 0.7, "monthly");
  }

  for (const calc of CALCULATORS) {
    if (calc.isCountrySpecific) continue;
    add(contentPath(locale, "calculators", calc.category, calc.slug), 0.9, "monthly");
  }

  for (const converter of CONVERTERS) {
    add(categoryPath(locale, "converters", converter.category), 0.8, "monthly");
    for (const [from, to] of converter.featuredPairs) {
      add(
        contentPath(locale, "converters", converter.category, pairSlug(converter, from, to)),
        0.7,
        "monthly",
      );
    }
  }

  for (const category of TOOL_CATEGORIES) {
    add(categoryPath(locale, "tools", category), 0.7, "monthly");
  }

  for (const tool of TOOLS) {
    add(contentPath(locale, "tools", tool.category, tool.slug), 0.8, "monthly");
  }

  for (const category of CHART_CATEGORIES) {
    add(categoryPath(locale, "charts", category), 0.7, "monthly");
  }

  for (const chart of CHARTS) {
    add(contentPath(locale, "charts", chart.category, chart.slug), 0.8, "monthly");
  }

  for (const category of GUIDE_CATEGORIES) {
    add(categoryPath(locale, "guides", category), 0.7, "monthly");
  }

  for (const guide of GUIDES) {
    add(contentPath(locale, "guides", guide.category, guide.slug), 0.8, "monthly", guide.reviewed);
  }

  for (const country of COUNTRY_CODES) {
    add(countryPath(locale, country), 0.7, "monthly");
  }

  // Listed so they are indexable and discoverable, but low priority: they
  // exist to be found when looked for, not to compete with the tools.
  for (const page of LEGAL_PAGES) {
    add(`${localeHome(locale)}/${page.slug}`, 0.3, "monthly");
  }

  for (const calc of CALCULATORS) {
    if (!calc.isCountrySpecific) continue;
    for (const country of calc.countries) {
      add(countryToolPath(locale, country, calc.slug), 0.9, "monthly");
    }
  }

  return entries;
}


const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Where one locale's sitemap lives, e.g. /sitemaps/en-us.xml. */
export function localeSitemapPath(locale: LocaleCode): string {
  return `/sitemaps/${LOCALES[locale].path}.xml`;
}

/** One locale's pages as a sitemaps.org urlset, with xhtml:link language alternates. */
export function localeSitemapXml(locale: LocaleCode): string {
  const urls = sitemapEntries(locale).map((entry) => {
    const alternates = Object.entries(entry.languages)
      .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(href)}" />`)
      .join("\n");
    return [
      "<url>",
      `<loc>${xmlEscape(entry.url)}</loc>`,
      alternates,
      entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : "",
      `<changefreq>${entry.changeFrequency}</changefreq>`,
      `<priority>${entry.priority}</priority>`,
      "</url>",
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** The index at /sitemap.xml: one child sitemap per ready locale. */
export function sitemapIndexXml(): string {
  const children = readyLocales().map(
    (locale) => `<sitemap><loc>${xmlEscape(absoluteUrl(localeSitemapPath(locale)))}</loc></sitemap>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...children,
    "</sitemapindex>",
    "",
  ].join("\n");
}
