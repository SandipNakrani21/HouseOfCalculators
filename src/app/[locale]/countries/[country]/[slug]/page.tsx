import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { CalculatorPageBody } from "@/components/calculator/CalculatorPageBody";
import { CALCULATORS, getCalculator } from "@/config/calculators";
import { ruleReview } from "@/config/calculators/provenance";
import { canonicalCountryToolSlug, isCalculatorPublished } from "@/config/calculators/publication";
import { COUNTRIES, isCountryCode, type CountryCode } from "@/config/countries";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { calculatorSearchCopy } from "@/lib/calculator-search-copy";
import { contentPath, countryPath, countryToolPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; country: string; slug: string };

/** Country tools are the calculators whose rules, not just currency, differ. */
const COUNTRY_TOOLS = CALCULATORS.filter((calc) => calc.isCountrySpecific);

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    COUNTRY_TOOLS.flatMap((calc) =>
      calc.countries.filter(country => isCalculatorPublished(calc, country)).map((country) => ({
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

  const t = createTranslator(locale.language, locale.code);
  const fmt = createFormatter(country, locale.language, t);
  const values = calculator.params?.({
    countryCode: country,
    country: COUNTRIES[country],
    t,
    fmt,
  });

  const countryName = t(`country.${country}`);
  const searchCopy = calculatorSearchCopy(locale.code, slug, country, ruleReview(slug, country)?.period);
  return buildMetadata({
    locale: locale.code,
    path: countryToolPath(locale.code, country, canonicalCountryToolSlug(slug, country)),
    // The country belongs in the title: this page answers a country-specific
    // question, and that is what people search for.
    title: searchCopy?.metadataTitle ?? t("country.tool.title", {
      country: countryName,
      tool: t(calculator.titleKey, values),
    }),
    // The same tool exists for up to 22 countries; the description says which
    // one this is (as the page's own badge does), so no two are identical.
    description: searchCopy?.description ?? t("country.tool.metaDesc", {
      description: t(calculator.descKey, values),
      country: countryName,
      year: ruleReview(slug, country)?.period ?? COUNTRIES[country].fiscalYear.label,
      currency: COUNTRIES[country].currency.code,
    }),
    noindex: !ruleReview(slug, country),
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

  // These are now shared input-driven arithmetic tools, not duplicated
  // national rule models. Keep incoming country links useful and canonical.
  if (locale && calculator && isCountryCode(country) && ["vat", "pension", "property-tax"].includes(slug)) {
    permanentRedirect(contentPath(locale.code, "calculators", calculator.category, slug));
  }

  if (
    !locale ||
    !calculator ||
    !calculator.isCountrySpecific ||
    !isCountryCode(country) ||
    !calculator.countries.includes(country as CountryCode) ||
    !isCalculatorPublished(calculator, country)
  ) {
    notFound();
  }

  const t = createTranslator(locale.language, locale.code);
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
          name: t(calculator.titleKey, calculator.params?.({ countryCode: country, country: COUNTRIES[country], t, fmt: createFormatter(country, locale.language, t) })),
          path: countryToolPath(code, country, slug),
        },
      ]}
    />
  );
}
