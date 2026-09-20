import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorPageBody } from "@/components/calculator/CalculatorPageBody";
import { CALCULATORS, getCalculator } from "@/config/calculators";
import { COUNTRIES, isCountryCode, type CountryCode } from "@/config/countries";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { countryPath, countryToolPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; country: string; slug: string };

/** Country tools are the calculators whose rules, not just currency, differ. */
const COUNTRY_TOOLS = CALCULATORS.filter((calc) => calc.isCountrySpecific);

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    COUNTRY_TOOLS.flatMap((calc) =>
      calc.countries.map((country) => ({
        locale: LOCALES[code].path,
        country,
        slug: calc.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, country, slug } = await params;
  const locale = localeFromPath(path);
  const calculator = getCalculator(slug);
  if (!locale || !calculator || !isCountryCode(country)) return {};

  const t = createTranslator(locale.language);
  const fmt = createFormatter(country, locale.language);
  const values = calculator.params?.({
    countryCode: country,
    country: COUNTRIES[country],
    t,
    fmt,
  });

  const countryName = t(`country.${country}`);
  return buildMetadata({
    locale: locale.code,
    path: countryToolPath(locale.code, country, slug),
    // The country belongs in the title: this page answers a country-specific
    // question, and that is what people search for.
    title: t("country.tool.title", {
      country: countryName,
      tool: t(calculator.titleKey, values),
    }),
    description: t(calculator.descKey, values),
  });
}

export default async function CountryToolPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, country, slug } = await params;
  const locale = localeFromPath(path);
  const calculator = getCalculator(slug);

  if (
    !locale ||
    !calculator ||
    !calculator.isCountrySpecific ||
    !isCountryCode(country) ||
    !calculator.countries.includes(country as CountryCode)
  ) {
    notFound();
  }

  const t = createTranslator(locale.language);
  const code = locale.code;
  const countryName = t(`country.${country}`);

  return (
    <CalculatorPageBody
      locale={code}
      language={locale.language}
      calculator={calculator}
      country={country}
      lockCountry
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.countries"), path: sectionPath(code, "countries") },
        { name: countryName, path: countryPath(code, country) },
        {
          name: t(calculator.titleKey),
          path: countryToolPath(code, country, slug),
        },
      ]}
    />
  );
}
