import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CountryBadge } from "@/components/shared/CountryBadge";
import { sectionVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
import { calculatorsFor } from "@/config/calculators";
import { COUNTRY_CODES } from "@/config/countries";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { countryPath, localeHome, sectionPath } from "@/lib/routes";
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
    path: sectionPath(locale.code, "countries"),
    title: t("section.countries"),
    description: t("section.countries.desc"),
  });
}

export default async function CountriesPage({
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
          { name: t("section.countries"), path: sectionPath(code, "countries") },
        ]}
      />

      <PageHeader
        visual={sectionVisual("countries")}
        title={t("section.countries")}
        description={t("section.countries.intro")}
      />

      <CardGrid>
        {COUNTRY_CODES.map((country) => {
          const count = calculatorsFor(country).filter(
            (calc) => calc.isCountrySpecific,
          ).length;
          return (
            <li key={country}>
              <ContentCard
                href={countryPath(code, country)}
                media={<CountryBadge code={country} size="lg" />}
                title={t(`country.${country}`)}
                description={t("country.toolCount", { count })}
              />
            </li>
          );
        })}
      </CardGrid>
    </div>
  );
}
