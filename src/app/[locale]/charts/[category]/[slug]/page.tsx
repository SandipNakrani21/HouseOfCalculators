import type { Metadata } from "next";
import { DetailPage } from "@/components/layout/DetailPage";
import { itemVisual } from "@/lib/visuals";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReferenceTable } from "@/components/charts/ReferenceTable";
import { categoryKey } from "@/config/categories";
import { CHARTS, chartsIn, getChart } from "@/config/charts/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { guideLinksFor } from "@/lib/guide-links";
import { createTranslator } from "@/lib/i18n";
import {
  categoryPath,
  contentPath,
  localeHome,
  sectionPath,
} from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";
import { calculatorsCta } from "@/lib/cta";

type Params = { locale: string; category: string; slug: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    CHARTS.map((chart) => ({
      locale: LOCALES[code].path,
      category: chart.category,
      slug: chart.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const chart = getChart(slug);
  if (!locale || !chart || chart.category !== category) return {};

  const t = createTranslator(locale.language, locale.code);
  return buildMetadata({
    locale: locale.code,
    path: contentPath(locale.code, "charts", category, slug),
    title: t(chart.titleKey),
    description: t(chart.descKey),
  });
}

export default async function ChartPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const chart = getChart(slug);
  if (!locale || !chart || chart.category !== category) notFound();

  const t = createTranslator(locale.language, locale.code);
  // Tables are reference material rather than a personal calculation, so they
  // use the locale's own number formatting rather than a chosen country's.
  const fmt = createFormatter(locale.defaultCountry, locale.language, t);
  const code = locale.code;
  const table = chart.build({ t, fmt });
  const title = t(chart.titleKey);

  const related = chartsIn(chart.category).filter((item) => item.slug !== slug);

  return (
    <DetailPage
      locale={code}
      schema="page"
      breadcrumbLabel={t("a11y.breadcrumb")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.charts"), path: sectionPath(code, "charts") },
        {
          name: t(categoryKey("charts", chart.category)),
          path: categoryPath(code, "charts", chart.category),
        },
        { name: title, path: contentPath(code, "charts", category, slug) },
      ]}
      header={{
        visual: itemVisual("charts", chart.category, chart.slug),
        eyebrow: t("section.charts"),
        title,
        description: t(chart.descKey),
      }}
      adPrefix="chart"
      howItWorks={{
        title: t("chart.about"),
        body: (
          <>
            <p className="text-sm leading-relaxed text-muted">{t(chart.explainerKey)}</p>
            {/* A table always points at the tool it belongs with, and vice versa. */}
            <h3 className="mb-3 mt-5 text-sm font-semibold text-heading">{t("chart.useInstead")}</h3>
            <ul className="flex flex-wrap gap-2.5">
              {chart.related.map((link) => (
                <li key={`${link.section}-${link.category}-${link.slug ?? ""}`}>
                  <Link
                    href={
                      link.slug
                        ? contentPath(code, link.section, link.category, link.slug)
                        : categoryPath(code, link.section, link.category)
                    }
                    className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {t(`section.${link.section}`)}
                    {" · "}
                    {t(categoryKey(link.section, link.category))}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ),
      }}
      guides={{ title: t("calc.guides"), items: guideLinksFor(code, t, "charts", slug) }}
      related={{
        title: t("calc.related"),
        items: related.map((item) => ({
          key: item.slug,
          href: contentPath(code, "charts", item.category, item.slug),
          visual: itemVisual("charts", item.category, item.slug),
          title: t(item.titleKey),
          description: t(item.descKey),
        })),
        viewAll: { href: categoryPath(code, "charts", chart.category), label: t("common.viewAll") },
      }}
      cta={calculatorsCta(t, code)}
    >
      <ReferenceTable table={table} caption={title} />
    </DetailPage>
  );
}
