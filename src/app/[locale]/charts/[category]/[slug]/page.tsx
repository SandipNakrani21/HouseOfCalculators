import type { Metadata } from "next";
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

      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <span aria-hidden>{chart.icon}</span>
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">{t(chart.descKey)}</p>
      </header>

      <ReferenceTable table={table} caption={title} />

      <AdSlot slot="chart-mid" placement="inline" />

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-3 text-lg font-semibold">{t("chart.about")}</h2>
        <p className="text-sm leading-relaxed text-muted">{t(chart.explainerKey)}</p>
      </section>

      {/* A table always points at the tool it belongs with, and vice versa. */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">{t("chart.useInstead")}</h2>
        <ul className="flex flex-wrap gap-2">
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
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <span aria-hidden>{item.icon}</span>
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
