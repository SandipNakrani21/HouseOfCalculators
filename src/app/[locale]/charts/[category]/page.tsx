import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
import {
  CHART_CATEGORIES,
  categoryKey,
  type ChartCategory,
} from "@/config/categories";
import { chartsIn } from "@/config/charts/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    CHART_CATEGORIES.map((category) => ({ locale: LOCALES[code].path, category })),
  );
}

function resolve(category: string): ChartCategory | null {
  return CHART_CATEGORIES.includes(category as ChartCategory)
    ? (category as ChartCategory)
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
  const name = t(categoryKey("charts", resolved));
  return buildMetadata({
    locale: locale.code,
    path: categoryPath(locale.code, "charts", resolved),
    title: t("charts.category.title", { category: name }),
    description: t("charts.category.desc", { category: name }),
  });
}

export default async function ChartCategoryPage({
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
  const name = t(categoryKey("charts", resolved));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.charts"), path: sectionPath(code, "charts") },
          { name, path: categoryPath(code, "charts", resolved) },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {t("charts.category.title", { category: name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t(`category.charts.${resolved}.intro`)}
        </p>
      </header>

      <CardGrid>
        {chartsIn(resolved).map((chart) => (
          <li key={chart.slug}>
            <ContentCard
              href={contentPath(code, "charts", resolved, chart.slug)}
              icon={chart.icon}
              title={t(chart.titleKey)}
              description={t(chart.descKey)}
            />
          </li>
        ))}
      </CardGrid>
    </div>
  );
}
