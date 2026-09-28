import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { calculatorCopy } from "@/lib/calculator-copy";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { ViewAllLink } from "@/components/ui/SectionHeader";
import { calculatorsFor } from "@/config/calculators";
import { CALCULATOR_CATEGORIES, categoryKey } from "@/config/categories";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = localeFromPath((await params).locale);
  if (!locale) return {};
  const t = createTranslator(locale.language, locale.code);
  return buildMetadata({
    locale: locale.code,
    path: sectionPath(locale.code, "calculators"),
    title: t("section.calculators"),
    description: t("section.calculators.desc"),
  });
}

export default async function CalculatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeFromPath((await params).locale);
  if (!locale) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  // Generic calculators have one stable URL; the country-specific ones are
  // listed under Country Tools instead, so nothing appears twice.
  const calculators = calculatorsFor(locale.defaultCountry).filter(
    (calc) => !calc.isCountrySpecific,
  );

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.calculators"), path: sectionPath(code, "calculators") },
      ]}
      header={{
        visual: sectionVisual("calculators"),
        title: t("section.calculators"),
        description: t("section.calculators.intro"),
      }}
      groups={CALCULATOR_CATEGORIES.map((category) => ({
        key: category,
        title: t(categoryKey("calculators", category)),
        visual: categoryVisual("calculators", category),
        action: <ViewAllLink href={categoryPath(code, "calculators", category)} label={t("common.viewAll")} />,
        items: calculators
          .filter((calc) => calc.category === category)
          .map((calc) => ({
            key: calc.slug,
            href: contentPath(code, "calculators", category, calc.slug),
            visual: itemVisual("calculators", category, calc.slug),
            ...calculatorCopy(calc, t, locale.defaultCountry, locale.language),
          })),
      }))}
      adSlot="section-bottom"
    />
  );
}
