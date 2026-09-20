import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { SearchBox } from "@/components/search/SearchBox";
import {
  CardGrid,
  ContentCard,
  SectionHeading,
} from "@/components/shared/ContentCard";
import { CountryBadge } from "@/components/shared/CountryBadge";
import { calculatorsFor } from "@/config/calculators";
import {
  CALCULATOR_CATEGORIES,
  SECTIONS,
  SECTION_ICONS,
  categoryKey,
  sectionKey,
} from "@/config/categories";
import { CONVERTERS } from "@/config/converters/definitions";
import { COUNTRY_CODES } from "@/config/countries";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import {
  categoryPath,
  contentPath,
  countryPath,
  sectionPath,
} from "@/lib/routes";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: path } = await params;
  const locale = localeFromPath(path);
  if (!locale) notFound();

  const t = createTranslator(locale.language);
  const code = locale.code;
  const country = locale.defaultCountry;

  // Generic calculators only: these have stable, country-independent URLs, so
  // the links on the landing page mean the same thing for every visitor.
  const generic = calculatorsFor(country).filter(
    (calc) => !calc.isCountrySpecific,
  );
  const countryTools = calculatorsFor(country).filter(
    (calc) => calc.isCountrySpecific,
  );

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            {t("home.hero.line1")}
            <span className="block text-primary">{t("home.hero.line2")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            {t("home.hero.subtitle")}
          </p>
          <div className="mx-auto mt-8 max-w-xl text-start">
            <SearchBox />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Sections */}
        <section className="mb-14">
          <SectionHeading
            title={t("home.sections.title")}
            description={t("home.sections.subtitle")}
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <li key={section}>
                <ContentCard
                  href={sectionPath(code, section)}
                  icon={SECTION_ICONS[section]}
                  title={t(sectionKey(section))}
                  description={t(`section.${section}.desc`)}
                />
              </li>
            ))}
          </ul>
        </section>

        <AdSlot slot="home-top" placement="leaderboard" />

        {/* Popular calculators */}
        <section className="mb-14">
          <SectionHeading
            title={t("home.popularCalculators")}
            action={
              <Link
                href={sectionPath(code, "calculators")}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("common.viewAll")}
              </Link>
            }
          />
          <CardGrid>
            {generic.slice(0, 6).map((calc) => (
              <li key={calc.slug}>
                <ContentCard
                  href={contentPath(code, "calculators", calc.category, calc.slug)}
                  icon={calc.icon}
                  title={t(calc.titleKey)}
                  description={t(calc.descKey)}
                  meta={t(categoryKey("calculators", calc.category))}
                />
              </li>
            ))}
          </CardGrid>
        </section>

        {/* Popular converters */}
        <section className="mb-14">
          <SectionHeading
            title={t("home.popularConverters")}
            action={
              <Link
                href={sectionPath(code, "converters")}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("common.viewAll")}
              </Link>
            }
          />
          <CardGrid>
            {CONVERTERS.slice(0, 6).map((converter) => (
              <li key={converter.slug}>
                <ContentCard
                  href={contentPath(
                    code,
                    "converters",
                    converter.category,
                    converter.slug,
                  )}
                  icon={converter.icon}
                  title={t(converter.titleKey)}
                  description={t(converter.descKey)}
                />
              </li>
            ))}
          </CardGrid>
        </section>

        {/* Calculator categories */}
        <section className="mb-14">
          <SectionHeading title={t("home.categories")} />
          <ul className="flex flex-wrap gap-2">
            {CALCULATOR_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={categoryPath(code, "calculators", category)}
                  className="inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {t(categoryKey("calculators", category))}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <AdSlot slot="home-mid" placement="inline" />

        {/* Country tools */}
        <section className="mb-14">
          <SectionHeading
            title={t("home.countryTools")}
            description={t("home.countryTools.subtitle")}
            action={
              <Link
                href={sectionPath(code, "countries")}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("common.viewAll")}
              </Link>
            }
          />
          <ul className="flex flex-wrap gap-2">
            {COUNTRY_CODES.map((item) => (
              <li key={item}>
                <Link
                  href={countryPath(code, item)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <CountryBadge code={item} />
                  {t(`country.${item}`)}
                </Link>
              </li>
            ))}
          </ul>
          {countryTools.length ? (
            <p className="mt-4 text-sm text-muted">
              {t("home.countryTools.count", {
                count: countryTools.length,
                country: t(`country.${country}`),
              })}
            </p>
          ) : null}
        </section>

        {/* Why */}
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <SectionHeading title={t("home.why.title")} />
          <ul className="grid gap-6 sm:grid-cols-3">
            {(["accurate", "local", "fast"] as const).map((point) => (
              <li key={point}>
                <h3 className="text-sm font-semibold">
                  {t(`home.why.${point}.title`)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {t(`home.why.${point}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Final call to action */}
        <section className="mt-14 rounded-2xl bg-primary-soft p-8 text-center sm:p-12">
          <h2 className="text-xl font-bold sm:text-2xl">{t("home.cta.title")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            {t("home.cta.body")}
          </p>
          <Link
            href={sectionPath(code, "calculators")}
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover"
          >
            {t("home.cta.button")}
          </Link>
        </section>
      </div>
    </>
  );
}
