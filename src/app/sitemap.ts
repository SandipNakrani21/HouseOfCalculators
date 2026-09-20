import type { MetadataRoute } from "next";

import { CALCULATORS } from "@/config/calculators";
import {
  CALCULATOR_CATEGORIES,
  SECTIONS,
  type Section,
} from "@/config/categories";
import { CONVERTERS, pairSlug } from "@/config/converters/definitions";
import { COUNTRY_CODES } from "@/config/countries";
import { TOOLS } from "@/config/tools/definitions";
import { CHART_CATEGORIES, TOOL_CATEGORIES } from "@/config/categories";
import { CHARTS } from "@/config/charts/definitions";
import {
  absoluteUrl,
  categoryPath,
  contentPath,
  countryPath,
  countryToolPath,
  localeHome,
  sectionPath,
  swapLocale,
} from "@/lib/routes";
import { readyLocales } from "@/lib/seo";

/**
 * One sitemap covering every locale, with `alternates.languages` on each entry
 * so the localized versions are declared here as well as in the page head.
 *
 * Sections that have no content yet are left out rather than listed as empty
 * pages. Nothing is added to the sitemap that a visitor could not use.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = readyLocales();
  const entries: MetadataRoute.Sitemap = [];

  const add = (path: string, priority: number, frequency: "daily" | "weekly" | "monthly") => {
    entries.push({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: frequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [code, absoluteUrl(swapLocale(path, code))]),
        ),
      },
    });
  };

  // Sections that currently hold content. Empty ones are excluded until they do.
  const liveSections: Section[] = SECTIONS.filter((section) =>
    ["calculators", "converters", "tools", "charts", "countries"].includes(section),
  );

  for (const locale of locales) {
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

    for (const country of COUNTRY_CODES) {
      add(countryPath(locale, country), 0.7, "monthly");
    }

    for (const calc of CALCULATORS) {
      if (!calc.isCountrySpecific) continue;
      for (const country of calc.countries) {
        add(countryToolPath(locale, country, calc.slug), 0.9, "monthly");
      }
    }
  }

  return entries;
}

