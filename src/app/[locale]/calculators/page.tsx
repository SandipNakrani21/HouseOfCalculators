import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  CardGrid,
  ContentCard,
  SectionHeading,
} from "@/components/shared/ContentCard";
import { calculatorsFor } from "@/config/calculators";
import { CALCULATOR_CATEGORIES, categoryKey } from "@/config/categories";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
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
    path: sectionPath(locale.code, "calculators"),
    title: t("section.calculators"),
    description: t("section.calculators.desc"),
  });
}

export default async function CalculatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeFromPath((await params).locale);
  if (!locale) notFound();

  const t = createTranslator(locale.language);
  const code = locale.code;
  // Generic calculators have one stable URL; the country-specific ones are
  // listed under Country Tools instead, so nothing appears twice.
  const calculators = calculatorsFor(locale.defaultCountry).filter(
    (calc) => !calc.isCountrySpecific,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.calculators"), path: sectionPath(code, "calculators") },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("section.calculators")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t("section.calculators.intro")}
        </p>
      </header>

      {CALCULATOR_CATEGORIES.map((category) => {
        const items = calculators.filter((calc) => calc.category === category);
        if (!items.length) return null;

        return (
          <section key={category} className="mb-12">
            <SectionHeading title={t(categoryKey("calculators", category))} />
            <CardGrid>
              {items.map((calc) => (
                <li key={calc.slug}>
                  <ContentCard
                    href={contentPath(code, "calculators", category, calc.slug)}
                    icon={calc.icon}
                    title={t(calc.titleKey)}
                    description={t(calc.descKey)}
                  />
                </li>
              ))}
            </CardGrid>
            <a
              href={categoryPath(code, "calculators", category)}
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              {t("common.viewAll")}
            </a>
          </section>
        );
      })}

      <AdSlot slot="section-bottom" placement="leaderboard" />
    </div>
  );
}
