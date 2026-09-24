import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  CardGrid,
  ContentCard,
  SectionHeading,
} from "@/components/shared/ContentCard";
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
  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  const code = locale.code;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.charts"), path: sectionPath(code, "charts") },
        ]}
      />

      <PageHeader
        visual={sectionVisual("charts")}
        title={t("section.charts")}
        description={t("section.charts.intro")}
      />

      {CHART_CATEGORIES.map((category) => {
        const charts = chartsIn(category);
        if (!charts.length) return null;
        return (
          <section key={category} className="mb-12">
            <SectionHeading visual={categoryVisual("charts", category)} title={t(categoryKey("charts", category))} />
            <CardGrid>
              {charts.map((chart) => (
                <li key={chart.slug}>
                  <ContentCard
                    href={contentPath(code, "charts", category, chart.slug)}
                    visual={itemVisual("charts", category, chart.slug)}
                    title={t(chart.titleKey)}
                    description={t(chart.descKey)}
                  />
                </li>
              ))}
            </CardGrid>
          </section>
        );
      })}

      <AdSlot slot="charts-bottom" placement="leaderboard" />
    </div>
  );
}
