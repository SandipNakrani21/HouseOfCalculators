import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { calculatorCopy } from "@/lib/calculator-copy";
import { categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { calculatorsFor } from "@/config/calculators";
import {
  CALCULATOR_CATEGORIES,
  categoryKey,
  type CalculatorCategory,
} from "@/config/categories";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, localeHome, sectionPath, contentPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    CALCULATOR_CATEGORIES.map((category) => ({
      locale: LOCALES[code].path,
      category,
    })),
  );
}

function resolve(category: string): CalculatorCategory | null {
  return CALCULATOR_CATEGORIES.includes(category as CalculatorCategory)
    ? (category as CalculatorCategory)
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, category } = await params;
  const locale = localeFromPath(path);
  const resolved = resolve(category);
  if (!locale || !resolved) return {};

  const t = createTranslator(locale.language, locale.code);
  const name = t(categoryKey("calculators", resolved));
  return buildMetadata({
    locale: locale.code,
    path: categoryPath(locale.code, "calculators", resolved),
    title: t("category.page.title", { category: name }),
    description: t("category.page.desc", { category: name }),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category } = await params;
  const locale = localeFromPath(path);
  const resolved = resolve(category);
  if (!locale || !resolved) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const name = t(categoryKey("calculators", resolved));

  const items = calculatorsFor(locale.defaultCountry).filter(
    (calc) => !calc.isCountrySpecific && calc.category === resolved,
  );

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.calculators"), path: sectionPath(code, "calculators") },
        { name, path: categoryPath(code, "calculators", resolved) },
      ]}
      header={{
        visual: categoryVisual("calculators", resolved),
        eyebrow: t("section.calculators"),
        title: t("category.page.title", { category: name }),
        description: t(`category.calculators.${resolved}.intro`),
      }}
      items={items.map((calc) => ({
        key: calc.slug,
        href: contentPath(code, "calculators", resolved, calc.slug),
        visual: itemVisual("calculators", resolved, calc.slug),
        ...calculatorCopy(calc, t, locale.defaultCountry, locale.language),
      }))}
      emptyLabel={t("category.empty")}
      adSlot="category-bottom"
    />
  );
}
