import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { CHART_CATEGORIES, categoryKey } from "@/config/categories";
import { chartsIn } from "@/config/charts/definitions";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { contentPath, localeHome, sectionPath } from "@/lib/routes";
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
    path: sectionPath(locale.code, "charts"),
    title: t("section.charts"),
    description: t("section.charts.desc"),
  });
}

export default async function ChartsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeFromPath((await params).locale);
  if (!locale) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.charts"), path: sectionPath(code, "charts") },
      ]}
      header={{
        visual: sectionVisual("charts"),
        title: t("section.charts"),
        description: t("section.charts.intro"),
      }}
      groups={CHART_CATEGORIES.map((category) => ({
        key: category,
        title: t(categoryKey("charts", category)),
        visual: categoryVisual("charts", category),
        items: chartsIn(category).map((item) => ({
          key: item.slug,
          href: contentPath(code, "charts", category, item.slug),
          visual: itemVisual("charts", category, item.slug),
          title: t(item.titleKey),
          description: t(item.descKey),
        })),
      }))}
      adSlot="charts-bottom"
    />
  );
}
