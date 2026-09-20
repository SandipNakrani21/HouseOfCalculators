import { CALCULATORS, calculatorsFor } from "@/config/calculators";
import type { CalcContext } from "@/config/calculators/types";
import type { Section } from "@/config/categories";
import { CONVERTERS, pairSlug } from "@/config/converters/definitions";
import { findUnit } from "@/config/converters/units";
import type { CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";
import { unitName, type TranslateFn } from "@/lib/i18n";
import { LOCALES } from "@/config/locales";
import {
  calculatorPath,
  categoryPath,
  contentPath,
  countryToolPath,
  sectionPath,
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
      title: t(calc.titleKey, params),
      description: t(calc.descKey, params),
      href: calculatorPath(locale, calc, country),
      keywords: calc.slug.replace(/-/g, " "),
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

      const language = LOCALES[locale].language;
      const names = {
        from: unitName(language, t, fromUnit.labelKey, true),
        to: unitName(language, t, toUnit.labelKey, true),
      };
      items.push({
        id: `converter:${converter.slug}:${from}-${to}`,
        section: "converters",
        category: converter.category,
        slug: pairSlug(converter, from, to),
        icon: converter.icon,
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
        title: t(calc.titleKey),
        description: t(calc.descKey),
        href: countryToolPath(locale, code, calc.slug),
        keywords: `${t(`country.${code}`)} ${calc.slug.replace(/-/g, " ")}`,
      });
    }
  }
  return items;
}

/** Everything indexable for one locale and country context. */
export function allContent(context: BuildContext): ContentItem[] {
  return [
    ...calculatorItems(context),
    ...converterItems(context),
    ...countryItems(context),
  ];
}

/** Items a visitor can reach from the current country, grouped by section. */
export function contentBySection(
  context: BuildContext,
): Record<Section, ContentItem[]> {
  const grouped = {
    calculators: [] as ContentItem[],
    converters: [] as ContentItem[],
    tools: [] as ContentItem[],
    charts: [] as ContentItem[],
    guides: [] as ContentItem[],
    countries: [] as ContentItem[],
  };
  for (const item of allContent(context)) grouped[item.section].push(item);
  return grouped;
}

export function sectionHref(locale: LocaleCode, section: Section): string {
  return sectionPath(locale, section);
}
