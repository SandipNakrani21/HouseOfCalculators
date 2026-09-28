import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Accordion } from "@/components/ui/Accordion";
import { AdSlot } from "@/components/ui/AdSlot";
import { CalculatorCard, CardGrid } from "@/components/ui/ContentCard";
import { CTABanner } from "@/components/ui/CTABanner";
import { IconTile } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader, ViewAllLink } from "@/components/ui/SectionHeader";
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
import { buildMetadata, faqSchema, jsonLd, publisherRef, readyLocales } from "@/lib/seo";
import { itemVisual, sectionVisual } from "@/lib/visuals";
import { calculatorsCta } from "@/lib/cta";

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

  const t = createTranslator(locale.language, locale.code);
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

  const t = createTranslator(locale.language, locale.code);
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
    author: publisherRef(),
    publisher: { ...publisherRef(), logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
  };

  return (
    <>
      <PageHeader
        width="prose"
        breadcrumbLabel={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.guides"), path: sectionPath(code, "guides") },
          {
          name: t(categoryKey("guides", guide.category)),
          path: categoryPath(code, "guides", guide.category),
          },
          { name: title, path: url },
        ]}
        visual={itemVisual("guides", guide.category, guide.slug)}
        eyebrow={t("section.guides")}
        title={title}
        description={t(guide.descKey)}
      >
        <p className="mt-3 text-xs font-medium text-muted">
          {/* Written the way the locale writes dates (September 21, 2026 /
              21 September 2026); the machine-readable form stays ISO. */}
          <time dateTime={guide.reviewed}>
            {t("guide.reviewed", {
              date: new Intl.DateTimeFormat(code, { dateStyle: "long", timeZone: "UTC" }).format(new Date(guide.reviewed)),
            })}
          </time>
        </p>
      </PageHeader>
      <div className="container-prose pb-12 sm:pb-16">
        <article>
          <div className="space-y-4">
            {guide.introKeys.map((key) => (
              <p key={key} className="text-base leading-relaxed">
                {t(key)}
              </p>
            ))}
          </div>

          {guide.formula ? (
            <section data-reveal="up" className="mt-10">
              <h2 className="mb-3 text-xl font-bold">{t("calc.formula")}</h2>
              <p className="result-box tabular text-lg font-bold sm:text-xl">
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
            <section data-reveal="up" className="mt-10">
              <h2 className="mb-3 text-xl font-bold">{t("guide.steps")}</h2>
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
            <section data-reveal="up" className="mt-10">
              <h2 className="mb-3 text-xl font-bold">{t("guide.workedExample")}</h2>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                {t(guide.workedExample.introKey)}
              </p>
              <dl className="card overflow-hidden">
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
              <p className="mt-4 rounded-md bg-primary-soft px-5 py-4 text-center">
                <span className="block text-sm text-muted">
                  {t(guide.workedExample.resultKey)}
                </span>
                <span className="tabular mt-1 block text-2xl font-bold text-primary">
                  {guide.workedExample.resultValue}
                </span>
              </p>
            </section>
          ) : null}

          <AdSlot slot="guide-mid" placement="rectangle" />

          {guide.notesKeys?.length ? (
            <section data-reveal="up" className="mt-10 space-y-4">
              <h2 className="text-xl font-bold">{t("guide.worthKnowing")}</h2>
              {guide.notesKeys.map((key) => (
                <p key={key} className="text-sm leading-relaxed text-muted">
                  {t(key)}
                </p>
              ))}
            </section>
          ) : null}

          <section data-reveal="up" className="mt-10">
            <h2 className="mb-3 text-xl font-bold">{t("guide.useTheTool")}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {guide.related.map((link) => (
                <li key={`${link.section}-${link.category}-${link.slug ?? ""}`}>
                  <Link
                    href={
                      link.slug
                        ? contentPath(code, link.section, link.category, link.slug)
                        : categoryPath(code, link.section, link.category)
                    }
                    className="card card-link group flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-heading hover:text-primary"
                  >
                    <span className="flex items-center gap-3">
                      <IconTile visual={sectionVisual(link.section)} size="sm" shape="rounded" />
                      {t(`section.${link.section}`)}
                    </span>
                    <ArrowRight aria-hidden className="card-arrow h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section data-reveal="up" className="mt-10">
            <h2 className="mb-3 text-xl font-bold">{t("calc.faq")}</h2>
            <Accordion
              items={guide.faqKeys.map((key) => ({ id: key, question: t(`${key}.q`), answer: t(`${key}.a`) }))}
            />
          </section>
        </article>

        {related.length ? (
          <section className="section-gap">
            <SectionHeader
              title={t("guide.moreGuides")}
              action={<ViewAllLink href={categoryPath(code, "guides", guide.category)} label={t("common.viewAll")} />}
            />
            <CardGrid columns={2}>
              {related.slice(0, 6).map((item) => (
                <li key={item.slug}>
                  <CalculatorCard
                    href={contentPath(code, "guides", item.category, item.slug)}
                    visual={itemVisual("guides", item.category, item.slug)}
                    title={t(item.titleKey)}
                    description={t(item.descKey)}
                  />
                </li>
              ))}
            </CardGrid>
          </section>
        ) : null}

        <CTABanner
          className="mt-16"
          {...calculatorsCta(t, code)}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(article) }}
        />
        {guide.faqKeys.length ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd(
                faqSchema(
                  guide.faqKeys.map((key) => ({ question: t(`${key}.q`), answer: t(`${key}.a`) })),
                  code,
                ),
              ),
            }}
          />
        ) : null}
      </div>
    </>
  );
}
