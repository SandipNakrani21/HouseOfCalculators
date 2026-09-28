import { CALCULATORS, calculatorsFor } from "@/config/calculators";
import type { CalcContext } from "@/config/calculators/types";
import { categoryKey, type Section } from "@/config/categories";
import { CONVERTERS, pairSlug } from "@/config/converters/definitions";
import { findUnit } from "@/config/converters/units";
import type { CountryCode } from "@/config/countries";
import { TOOLS } from "@/config/tools/definitions";
import { CHARTS } from "@/config/charts/definitions";
import { GUIDES } from "@/config/guides/definitions";
import type { LocaleCode } from "@/config/locales";
import { unitName, type TranslateFn } from "@/lib/i18n/core";
import { calculatorCopy } from "@/lib/calculator-copy";
import { categoryVisual, itemVisual, type Visual } from "@/lib/visuals";
import { LOCALES } from "@/config/locales";
import {
  calculatorPath,
  categoryPath,
  contentPath,
  countryToolPath,
} from "@/lib/routes";

/**
 * One resolved, localized entry in the site. Grids, search, related-content
 * blocks and the sitemap all read from this so a page can never appear in one
 * place and be missing from another.
 */
export type ContentItem = {
  id: string;
  section: Section;
  category: string;
  slug: string;
  icon: string;
  /** Icon and colour family, for cards and search results. */
  visual: Visual;
  title: string;
  description: string;
  href: string;
  /** Extra words to match on in search, beyond the title and description. */
  keywords: string;
};

type BuildContext = {
  locale: LocaleCode;
  country: CountryCode;
  t: TranslateFn;
  calcContext: CalcContext;
};

function calculatorItems({
  locale,
  country,
  t,
  calcContext,
}: BuildContext): ContentItem[] {
  return calculatorsFor(country).map((calc) => {
    const params = calc.params?.(calcContext);
    return {
      id: `calculator:${calc.slug}`,
      section: "calculators" as const,
      category: calc.isCountrySpecific ? country : calc.category,
      slug: calc.slug,
      icon: calc.icon,
      visual: itemVisual("calculators", calc.category, calc.slug),
      title: t(calc.titleKey, params),
      description: t(calc.descKey, params),
      href: calculatorPath(locale, calc, country),
      // The category name ("Math", "Maths", "Health") so a search for the
      // subject finds its calculators.
      keywords: `${calc.slug.replace(/-/g, " ")} ${t(categoryKey("calculators", calc.category))}`,
    };
  });
}

function converterItems({ locale, t }: BuildContext): ContentItem[] {
  const items: ContentItem[] = [];

  for (const converter of CONVERTERS) {
    items.push({
      id: `converter:${converter.slug}`,
      section: "converters",
      category: converter.category,
      slug: converter.slug,
      icon: converter.icon,
      visual: categoryVisual("converters", converter.category),
      title: t(converter.titleKey),
      description: t(converter.descKey),
      href: categoryPath(locale, "converters", converter.category),
      keywords: converter.units.map((unit) => unit.symbol).join(" "),
    });

    // The featured pairs are the pages people actually search for: "meters to
    // feet" rather than "length converter".
    for (const [from, to] of converter.featuredPairs) {
      const fromUnit = findUnit(converter, from);
      const toUnit = findUnit(converter, to);
      if (!fromUnit || !toUnit) continue;

      const names = {
        from: unitName(t, fromUnit.labelKey, true),
        to: unitName(t, toUnit.labelKey, true),
      };
      items.push({
        id: `converter:${converter.slug}:${from}-${to}`,
        section: "converters",
        category: converter.category,
        slug: pairSlug(converter, from, to),
        icon: converter.icon,
        visual: categoryVisual("converters", converter.category),
        title: t("conv.pair.title", names),
        description: t("conv.pair.desc", names),
        href: contentPath(
          locale,
          "converters",
          converter.category,
          pairSlug(converter, from, to),
        ),
        keywords: `${fromUnit.symbol} ${toUnit.symbol}`,
      });
    }
  }

  return items;
}

function countryItems({ locale, t }: BuildContext): ContentItem[] {
  // Country tools are the calculators whose rules, not just currency, differ.
  const specific = CALCULATORS.filter((calc) => calc.isCountrySpecific);
  const items: ContentItem[] = [];

  for (const calc of specific) {
    for (const code of calc.countries) {
      items.push({
        id: `country:${code}:${calc.slug}`,
        section: "countries",
        category: code,
        slug: calc.slug,
        icon: calc.icon,
        visual: itemVisual("calculators", calc.category, calc.slug),
        ...calculatorCopy(calc, t, code, LOCALES[locale].language),
        href: countryToolPath(locale, code, calc.slug),
        keywords: `${t(`country.${code}`)} ${calc.slug.replace(/-/g, " ")} ${t(categoryKey("calculators", calc.category))}`,
      });
    }
  }
  return items;
}

function toolItems({ locale, t }: BuildContext): ContentItem[] {
  return TOOLS.map((tool) => ({
    id: `tool:${tool.slug}`,
    section: "tools" as const,
    category: tool.category,
    slug: tool.slug,
    icon: tool.icon,
    visual: itemVisual("tools", tool.category, tool.slug),
    title: t(tool.titleKey),
    description: t(tool.descKey),
    href: contentPath(locale, "tools", tool.category, tool.slug),
    keywords: tool.keywords,
  }));
}

function chartItems({ locale, t }: BuildContext): ContentItem[] {
  return CHARTS.map((chart) => ({
    id: "chart:" + chart.slug,
    section: "charts" as const,
    category: chart.category,
    slug: chart.slug,
    icon: chart.icon,
    visual: itemVisual("charts", chart.category, chart.slug),
    title: t(chart.titleKey),
    description: t(chart.descKey),
    href: contentPath(locale, "charts", chart.category, chart.slug),
    keywords: chart.keywords,
  }));
}

function guideItems({ locale, t }: BuildContext): ContentItem[] {
  return GUIDES.map((guide) => ({
    id: "guide:" + guide.slug,
    section: "guides" as const,
    category: guide.category,
    slug: guide.slug,
    icon: guide.icon,
    visual: itemVisual("guides", guide.category, guide.slug),
    title: t(guide.titleKey),
    description: t(guide.descKey),
    href: contentPath(locale, "guides", guide.category, guide.slug),
    keywords: guide.keywords,
  }));
}

/** Everything indexable for one locale and country context. */
export function allContent(context: BuildContext): ContentItem[] {
  return [
    ...calculatorItems(context),
    ...converterItems(context),
    ...toolItems(context),
    ...chartItems(context),
    ...guideItems(context),
    ...countryItems(context),
  ];
}
