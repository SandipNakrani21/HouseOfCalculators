import Link from "next/link";

import { AdSlot } from "@/components/ads/AdSlot";
import { CalculatorRunner } from "@/components/calculator/CalculatorRunner";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { CountryBadge } from "@/components/shared/CountryBadge";
import { calculatorsFor } from "@/config/calculators";
import type { CalcContext, CalculatorDef } from "@/config/calculators/types";
import { COUNTRIES, type CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { calculatorPath } from "@/lib/routes";
import type { LanguageCode } from "@/config/languages";

/**
 * The calculator page, shared by the subject-category route and the country
 * tool route. Everything except the interactive card is server rendered, so
 * the explanation, formula and FAQ are in the HTML a crawler receives.
 */
export function CalculatorPageBody({
  locale,
  language,
  calculator,
  country,
  trail,
  /** Country tools are about one country and do not offer a country switch. */
  lockCountry = false,
}: {
  locale: LocaleCode;
  language: LanguageCode;
  calculator: CalculatorDef;
  country: CountryCode;
  trail: Crumb[];
  lockCountry?: boolean;
}) {
  const t = createTranslator(language);
  const fmt = createFormatter(country, language);
  const ctx: CalcContext = { countryCode: country, country: COUNTRIES[country], t, fmt };
  const params = calculator.params?.(ctx);

  const title = t(calculator.titleKey, params);
  const related = relatedTo(calculator, country)
    .slice(0, 6)
    .map((item) => ({
      slug: item.slug,
      icon: item.icon,
      title: t(item.titleKey, item.params?.(ctx)),
      href: calculatorPath(locale, item, country),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs trail={trail} label={t("a11y.breadcrumb")} />

      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <span aria-hidden>{calculator.icon}</span>
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t(calculator.descKey, params)}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs text-muted">
          <CountryBadge code={country} />
          {t("calc.countryNote", {
            country: t(`country.${country}`),
            year: COUNTRIES[country].fiscalYear.label,
          })}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <CalculatorRunner
            slug={calculator.slug}
            lockedCountry={lockCountry ? country : undefined}
            allowedCountries={calculator.countries}
          />

          <AdSlot slot="calculator-mid" placement="inline" />

          {calculator.explainerKeys?.length ? (
            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
              <h2 className="mb-3 text-lg font-semibold">{t("calc.howItWorks")}</h2>
              <div className="space-y-3">
                {calculator.explainerKeys.map((key) => (
                  <p key={key} className="text-sm leading-relaxed text-muted">
                    {t(key, params)}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {calculator.faqKeys?.length ? (
            <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
              <h2 className="mb-3 text-lg font-semibold">{t("calc.faq")}</h2>
              <div className="divide-y divide-border">
                {calculator.faqKeys.map((key) => (
                  <details key={key} className="group py-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                      {t(`${key}.q`, params)}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {t(`${key}.a`, params)}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold">{t("calc.related")}</h2>
            <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
              {related.map((item) => (
                <li key={item.slug} className="border-b border-border last:border-0">
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
                  >
                    <span aria-hidden>{item.icon}</span>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <AdSlot slot="calculator-rail" placement="rail" className="hidden lg:flex" />
        </aside>
      </div>
    </div>
  );
}

/**
 * Related tools: the ones the definition names first, then others in the same
 * category, then anything else the country offers. Ordering this way keeps the
 * most relevant links at the top where they are actually followed.
 */
function relatedTo(calculator: CalculatorDef, country: CountryCode) {
  const available = calculatorsFor(country).filter(
    (item) => item.slug !== calculator.slug,
  );
  const named = (calculator.relatedCalculators ?? [])
    .map((slug) => available.find((item) => item.slug === slug))
    .filter((item): item is CalculatorDef => Boolean(item));

  const sameCategory = available.filter(
    (item) =>
      item.category === calculator.category && !named.includes(item),
  );
  const rest = available.filter(
    (item) => !named.includes(item) && !sameCategory.includes(item),
  );

  return [...named, ...sameCategory, ...rest];
}
