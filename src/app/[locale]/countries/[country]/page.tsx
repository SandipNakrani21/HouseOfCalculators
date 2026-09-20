import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
import { CountryBadge } from "@/components/shared/CountryBadge";
import { calculatorsFor } from "@/config/calculators";
import { COUNTRIES, COUNTRY_CODES, isCountryCode } from "@/config/countries";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import {
  countryPath,
  countryToolPath,
  localeHome,
  sectionPath,
} from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; country: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    COUNTRY_CODES.map((country) => ({ locale: LOCALES[code].path, country })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, country } = await params;
  const locale = localeFromPath(path);
  if (!locale || !isCountryCode(country)) return {};

  const t = createTranslator(locale.language);
  const name = t(`country.${country}`);
  return buildMetadata({
    locale: locale.code,
    path: countryPath(locale.code, country),
    title: t("country.page.title", { country: name }),
    description: t("country.page.desc", { country: name }),
  });
}

export default async function CountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, country } = await params;
  const locale = localeFromPath(path);
  if (!locale || !isCountryCode(country)) notFound();

  const t = createTranslator(locale.language);
  const code = locale.code;
  const name = t(`country.${country}`);
  const config = COUNTRIES[country];
  const tools = calculatorsFor(country).filter((calc) => calc.isCountrySpecific);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.countries"), path: sectionPath(code, "countries") },
          { name, path: countryPath(code, country) },
        ]}
      />

      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <CountryBadge code={country} size="lg" />
          {t("country.page.title", { country: name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t("country.page.intro", { country: name })}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 rounded-2xl border border-border bg-surface p-4">
          <div>
            <dt className="text-xs text-muted">{t("country.currency")}</dt>
            <dd className="text-sm font-medium">
              {config.currency.symbol} {config.currency.code}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t("country.consumptionTax")}</dt>
            <dd className="text-sm font-medium">
              {t(config.consumptionTax.labelKey)} · {config.consumptionTax.standardRate}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t("country.taxYear")}</dt>
            <dd className="tabular text-sm font-medium">{config.fiscalYear.label}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{t("country.numberFormat")}</dt>
            <dd className="tabular text-sm font-medium">
              {new Intl.NumberFormat(`en-${config.region}-u-nu-latn`).format(1234567.89)}
            </dd>
          </div>
        </dl>
      </header>

      {tools.length ? (
        <CardGrid>
          {tools.map((calc) => (
            <li key={calc.slug}>
              <ContentCard
                href={countryToolPath(code, country, calc.slug)}
                icon={calc.icon}
                title={t(calc.titleKey)}
                description={t(calc.descKey)}
              />
            </li>
          ))}
        </CardGrid>
      ) : (
        <p className="rounded-2xl border border-dashed border-border-strong p-10 text-center text-sm text-muted">
          {t("category.empty")}
        </p>
      )}

      <AdSlot slot="country-bottom" placement="leaderboard" />
    </div>
  );
}
