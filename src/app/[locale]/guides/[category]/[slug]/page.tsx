import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { categoryKey } from "@/config/categories";
import { GUIDES, getGuide, guidesIn } from "@/config/guides/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import {
  absoluteUrl,
  categoryPath,
  contentPath,
  localeHome,
  sectionPath,
} from "@/lib/routes";
import { SITE_NAME, buildMetadata, jsonLd, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string; slug: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    GUIDES.map((guide) => ({
      locale: LOCALES[code].path,
      category: guide.category,
      slug: guide.slug,
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
  const guide = getGuide(slug);
  if (!locale || !guide || guide.category !== category) return {};

  const t = createTranslator(locale.language);
  return buildMetadata({
    locale: locale.code,
    path: contentPath(locale.code, "guides", category, slug),
    title: t(guide.titleKey),
    description: t(guide.descKey),
    type: "article",
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const guide = getGuide(slug);
  if (!locale || !guide || guide.category !== category) notFound();

  const t = createTranslator(locale.language);
  const code = locale.code;
  const title = t(guide.titleKey);
  const url = contentPath(code, "guides", category, slug);
  const related = guidesIn(guide.category).filter((item) => item.slug !== slug);

  // Article markup describes what is actually on the page: a dated, titled
  // explanation. Nothing is claimed here that a reader cannot see.
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: t(guide.descKey),
    inLanguage: code,
    dateModified: guide.reviewed,
    mainEntityOfPage: absoluteUrl(url),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.guides"), path: sectionPath(code, "guides") },
          {
            name: t(categoryKey("guides", guide.category)),
            path: categoryPath(code, "guides", guide.category),
          },
          { name: title, path: url },
        ]}
      />

      <article>
        <header className="mb-6">
          <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
            <span aria-hidden>{guide.icon}</span>
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {t(guide.descKey)}
          </p>
          <p className="mt-3 text-xs text-muted">
            {t("guide.reviewed", { date: guide.reviewed })}
          </p>
        </header>

        <div className="space-y-4">
          {guide.introKeys.map((key) => (
            <p key={key} className="text-base leading-relaxed">
              {t(key)}
            </p>
          ))}
        </div>

        {guide.formula ? (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">{t("calc.formula")}</h2>
            <p className="tabular rounded-xl border border-border bg-surface-muted px-5 py-4 text-center text-base font-medium sm:text-lg">
              {guide.formula.expression}
            </p>
            <dl className="mt-4 divide-y divide-border border-t border-border">
              {guide.formula.variables.map((variable) => (
                <div key={variable.symbol} className="flex gap-4 py-2.5">
                  <dt className="tabular w-12 shrink-0 font-semibold text-primary">
                    {variable.symbol}
                  </dt>
                  <dd className="text-sm text-muted">{t(variable.key)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {guide.stepKeys?.length ? (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">{t("guide.steps")}</h2>
            <ol className="space-y-3">
              {guide.stepKeys.map((key, index) => (
                <li key={key} className="flex gap-3">
                  <span
                    aria-hidden
                    className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {guide.workedExample ? (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">{t("guide.workedExample")}</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              {t(guide.workedExample.introKey)}
            </p>
            <dl className="overflow-hidden rounded-xl border border-border">
              {guide.workedExample.rows.map((row) => (
                <div
                  key={row.key}
                  className="flex justify-between gap-4 border-b border-border px-4 py-2.5 last:border-0"
                >
                  <dt className="text-sm text-muted">{t(row.key)}</dt>
                  <dd className="tabular text-sm font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl bg-primary-soft px-5 py-4 text-center">
              <span className="block text-sm text-muted">
                {t(guide.workedExample.resultKey)}
              </span>
              <span className="tabular mt-1 block text-2xl font-bold text-primary">
                {guide.workedExample.resultValue}
              </span>
            </p>
          </section>
        ) : null}

        <AdSlot slot="guide-mid" placement="inline" />

        {guide.notesKeys?.length ? (
          <section className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">{t("guide.worthKnowing")}</h2>
            {guide.notesKeys.map((key) => (
              <p key={key} className="text-sm leading-relaxed text-muted">
                {t(key)}
              </p>
            ))}
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">{t("guide.useTheTool")}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {guide.related.map((link) => (
              <li key={`${link.section}-${link.category}-${link.slug ?? ""}`}>
                <Link
                  href={
                    link.slug
                      ? contentPath(code, link.section, link.category, link.slug)
                      : categoryPath(code, link.section, link.category)
                  }
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {t(`section.${link.section}`)}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">{t("calc.faq")}</h2>
          <div className="divide-y divide-border">
            {guide.faqKeys.map((key) => (
              <details key={key} className="py-3">
                <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                  {t(`${key}.q`)}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`${key}.a`)}
                </p>
              </details>
            ))}
          </div>
        </section>
      </article>

      {related.length ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">{t("guide.moreGuides")}</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={contentPath(code, "guides", item.category, item.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <span aria-hidden>{item.icon}</span>
                  {t(item.titleKey)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(article) }}
      />
    </div>
  );
}
