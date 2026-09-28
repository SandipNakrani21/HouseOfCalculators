import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

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

  const t = createTranslator(locale.language, locale.code);
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

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const name = t(categoryKey("charts", resolved));

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.charts"), path: sectionPath(code, "charts") },
        { name, path: categoryPath(code, "charts", resolved) },
      ]}
      header={{
        visual: categoryVisual("charts", resolved),
        eyebrow: t("section.charts"),
        title: t("charts.category.title", { category: name }),
        description: t(`category.charts.${resolved}.intro`),
      }}
      items={chartsIn(resolved).map((item) => ({
        key: item.slug,
        href: contentPath(code, "charts", resolved, item.slug),
        visual: itemVisual("charts", resolved, item.slug),
        title: t(item.titleKey),
        description: t(item.descKey),
      }))}
      adSlot="charts-category-bottom"
    />
  );
}
