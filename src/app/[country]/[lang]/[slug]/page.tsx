import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CalculatorRunner } from "@/components/CalculatorRunner";
import { CountryBadge } from "@/components/ui/CountryBadge";
import { CALCULATORS, calculatorsFor, getCalculator } from "@/config/calculators";
import type { CalcContext } from "@/config/calculators/types";
import { COUNTRIES, isCountryCode, type CountryCode } from "@/config/countries";
import { isLanguageCode, type LanguageCode } from "@/config/languages";
import { createFormatter } from "@/lib/format";
import { countryParams, createTranslator } from "@/lib/i18n";

type PageParams = { country: string; lang: string; slug: string };

export function generateStaticParams() {
  return CALCULATORS.flatMap((calc) =>
    calc.countries.flatMap((country) =>
      COUNTRIES[country].languages.map((lang) => ({
        country,
        lang,
        slug: calc.slug,
      })),
    ),
  );
}

/** Rebuilds the context a definition needs outside of React. */
function serverContext(country: CountryCode, lang: LanguageCode): CalcContext {
  return {
    countryCode: country,
    country: COUNTRIES[country],
    t: createTranslator(lang),
    fmt: createFormatter(country, lang),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { country, lang, slug } = await params;
  if (!isCountryCode(country) || !isLanguageCode(lang)) return {};

  const calculator = getCalculator(slug);
  if (!calculator) return {};

  const ctx = serverContext(country, lang);
  const values = calculator.params?.(ctx);

  return {
    title: ctx.t(calculator.titleKey, values),
    description: ctx.t(calculator.descKey, values),
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { country, lang, slug } = await params;
  if (!isCountryCode(country) || !isLanguageCode(lang)) notFound();

  const calculator = getCalculator(slug);
  if (!calculator) notFound();

  const ctx = serverContext(country, lang);
  const { t } = ctx;
  const names = countryParams(t, country);
  const base = `/${country}/${lang}`;

  // The calculator exists but this country does not offer it - say so and
  // point at what is available rather than 404ing.
  if (!calculator.countries.includes(country)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-foreground">
          {t("calc.notAvailable", names)}
        </h1>
        <Link
          href={base}
          className="mt-5 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast hover:bg-primary-hover"
        >
          {t("calc.seeAvailable", names)}
        </Link>
      </div>
    );
  }

  const values = calculator.params?.(ctx);
  const related = calculatorsFor(country)
    .filter(
      (item) =>
        item.slug !== calculator.slug && item.category === calculator.category,
    )
    .concat(
      calculatorsFor(country).filter(
        (item) =>
          item.slug !== calculator.slug && item.category !== calculator.category,
      ),
    )
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted">
        <Link href={base} className="hover:text-primary">
          {t("home.title")}
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-foreground">
          {t(calculator.titleKey, values)}
        </span>
      </nav>

      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground sm:text-3xl">
          <span aria-hidden>{calculator.icon}</span>
          {t(calculator.titleKey, values)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {t(calculator.descKey, values)}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs text-muted">
          <CountryBadge code={country} />
          {t("calc.countryNote", {
            ...names,
            year: COUNTRIES[country].fiscalYear.label,
          })}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-6">
          <CalculatorRunner slug={calculator.slug} />

          {calculator.explainerKeys?.length ? (
            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
              <h2 className="mb-3 text-base font-semibold text-foreground">
                {t("calc.howItWorks")}
              </h2>
              <div className="space-y-3">
                {calculator.explainerKeys.map((key) => (
                  <p key={key} className="text-sm leading-relaxed text-muted">
                    {t(key, values)}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {calculator.faqKeys?.length ? (
            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
              <h2 className="mb-3 text-base font-semibold text-foreground">
                {t("calc.faq")}
              </h2>
              <div className="divide-y divide-border">
                {calculator.faqKeys.map((key) => (
                  <details key={key} className="group py-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                      {t(`${key}.q`, values)}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {t(`${key}.a`, values)}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t("calc.related")}
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
            {related.map((item) => (
              <li key={item.slug} className="border-b border-border last:border-0">
                <Link
                  href={`${base}/${item.slug}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
                >
                  <span aria-hidden>{item.icon}</span>
                  {t(item.titleKey, item.params?.(ctx))}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
