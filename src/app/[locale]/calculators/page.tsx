import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { calculatorCopy } from "@/lib/calculator-copy";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
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

      <PageHeader
        visual={sectionVisual("calculators")}
        title={t("section.calculators")}
        description={t("section.calculators.intro")}
      />

      {CALCULATOR_CATEGORIES.map((category) => {
        const items = calculators.filter((calc) => calc.category === category);
        if (!items.length) return null;

        return (
          <section key={category} className="mb-12">
            <SectionHeading visual={categoryVisual("calculators", category)} title={t(categoryKey("calculators", category))} />
            <CardGrid>
              {items.map((calc) => (
                <li key={calc.slug}>
                  <ContentCard
                    href={contentPath(code, "calculators", category, calc.slug)}
                    visual={itemVisual("calculators", category, calc.slug)}
                    {...calculatorCopy(calc, t, locale.defaultCountry, locale.language)}
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
