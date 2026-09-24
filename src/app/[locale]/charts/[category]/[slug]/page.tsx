import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { IconTile } from "@/components/shared/Icon";
import { itemVisual } from "@/lib/visuals";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { ReferenceTable } from "@/components/charts/ReferenceTable";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { categoryKey } from "@/config/categories";
import { CHARTS, chartsIn, getChart } from "@/config/charts/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import {
  categoryPath,
  contentPath,
  localeHome,
  sectionPath,
} from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

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

  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  // Tables are reference material rather than a personal calculation, so they
  // use the locale's own number formatting rather than a chosen country's.
  const fmt = createFormatter(locale.defaultCountry, locale.language);
  const code = locale.code;
  const table = chart.build({ t, fmt });
  const title = t(chart.titleKey);

  const related = chartsIn(chart.category).filter((item) => item.slug !== slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.charts"), path: sectionPath(code, "charts") },
          {
            name: t(categoryKey("charts", chart.category)),
            path: categoryPath(code, "charts", chart.category),
          },
          { name: title, path: contentPath(code, "charts", category, slug) },
        ]}
      />

      <PageHeader
        className="mb-6"
        visual={itemVisual("charts", chart.category, chart.slug)}
        eyebrow={t("section.charts")}
        title={title}
        description={t(chart.descKey)}
      />

      <ReferenceTable table={table} caption={title} />

      <AdSlot slot="chart-mid" placement="inline" />

      <section data-reveal="up" className="card p-5 sm:p-7">
        <h2 className="mb-3 text-lg font-bold">{t("chart.about")}</h2>
        <p className="text-sm leading-relaxed text-muted">{t(chart.explainerKey)}</p>
      </section>

      {/* A table always points at the tool it belongs with, and vice versa. */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">{t("chart.useInstead")}</h2>
        <ul data-reveal="stagger" className="flex flex-wrap gap-2.5">
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
      </section>

      {related.length ? (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">{t("calc.related")}</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={contentPath(code, "charts", item.category, item.slug)}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 ps-1.5 pe-4 text-sm font-semibold text-heading shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <IconTile visual={itemVisual("charts", item.category, item.slug)} size="xs" className="group-hover:scale-110" />
                  {t(item.titleKey)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
