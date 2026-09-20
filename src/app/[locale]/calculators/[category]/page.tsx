import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
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

  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  const code = locale.code;
  const name = t(categoryKey("calculators", resolved));

  const items = calculatorsFor(locale.defaultCountry).filter(
    (calc) => !calc.isCountrySpecific && calc.category === resolved,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.calculators"), path: sectionPath(code, "calculators") },
          { name, path: categoryPath(code, "calculators", resolved) },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {t("category.page.title", { category: name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t(`category.calculators.${resolved}.intro`)}
        </p>
      </header>

      {items.length ? (
        <CardGrid>
          {items.map((calc) => (
            <li key={calc.slug}>
              <ContentCard
                href={contentPath(code, "calculators", resolved, calc.slug)}
                icon={calc.icon}
                title={t(calc.titleKey)}
                description={t(calc.descKey)}
              />
            </li>
          ))}
        </CardGrid>
      ) : (
        <p className="rounded-2xl border border-dashed border-border-strong p-10 text-center text-sm text-muted">
          {t("category.empty")}
        </p>
      )}

      <AdSlot slot="category-bottom" placement="leaderboard" />
    </div>
  );
}
