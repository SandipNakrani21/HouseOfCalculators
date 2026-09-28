import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorPageBody } from "@/components/calculator/CalculatorPageBody";
import { CALCULATORS, getCalculator } from "@/config/calculators";
import { categoryKey } from "@/config/categories";
import { COUNTRIES } from "@/config/countries";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string; slug: string };

/** Only generic calculators live here; country-specific ones are country tools. */
const GENERIC = CALCULATORS.filter((calc) => !calc.isCountrySpecific);

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    GENERIC.map((calc) => ({
      locale: LOCALES[code].path,
      category: calc.category,
      slug: calc.slug,
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
  const calculator = getCalculator(slug);
  if (!locale || !calculator || calculator.category !== category) return {};

  const t = createTranslator(locale.language, locale.code);
  const fmt = createFormatter(locale.defaultCountry, locale.language, t);
  const values = calculator.params?.({
    countryCode: locale.defaultCountry,
    country: COUNTRIES[locale.defaultCountry],
    t,
    fmt,
  });

  return buildMetadata({
    locale: locale.code,
    path: contentPath(locale.code, "calculators", category, slug),
    title: t(calculator.titleKey, values),
    description: t(calculator.descKey, values),
  });
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const calculator = getCalculator(slug);

  // A country-specific calculator reached through a subject category is the
  // wrong URL for it, so it is a miss rather than a second copy of the page.
  if (
    !locale ||
    !calculator ||
    calculator.isCountrySpecific ||
    calculator.category !== category
  ) {
    notFound();
  }

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;

  return (
    <CalculatorPageBody
      locale={code}
      language={locale.language}
      calculator={calculator}
      country={locale.defaultCountry}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.calculators"), path: sectionPath(code, "calculators") },
        {
          name: t(categoryKey("calculators", calculator.category)),
          path: categoryPath(code, "calculators", calculator.category),
        },
        {
          name: t(calculator.titleKey),
          path: contentPath(code, "calculators", category, slug),
        },
      ]}
    />
  );
}
