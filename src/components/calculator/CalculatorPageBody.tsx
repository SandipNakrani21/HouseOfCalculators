import { ChevronDown, CircleHelp, Lightbulb } from "lucide-react";
import Link from "next/link";

import { IconTile } from "@/components/shared/Icon";
import { PageHeader } from "@/components/shared/PageHeader";
import { categoryKey } from "@/config/categories";
import { itemVisual } from "@/lib/visuals";

import { AdSlot } from "@/components/ads/AdSlot";
import { CalculatorRunner } from "@/components/calculator/CalculatorRunner";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { CountryBadge } from "@/components/shared/CountryBadge";
import { calculatorsFor } from "@/config/calculators";
import { countryRelevanceOf } from "@/config/calculators/types";
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
  const relevance = countryRelevanceOf(calculator);

  const title = t(calculator.titleKey, params);
  const related = relatedTo(calculator, country)
    .slice(0, 6)
    .map((item) => ({
      slug: item.slug,
      visual: itemVisual("calculators", item.category, item.slug),
      title: t(item.titleKey, item.params?.(ctx)),
      href: calculatorPath(locale, item, country),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs trail={trail} label={t("a11y.breadcrumb")} />

      <PageHeader
        className="mb-6"
        visual={itemVisual("calculators", calculator.category, calculator.slug)}
        eyebrow={t(categoryKey("calculators", calculator.category))}
        title={title}
        description={t(calculator.descKey, params)}
      >
        {relevance === "none" ? null : (
          // Say what the country actually changes here. Claiming a BMI follows
          // a country's rules for a tax year would be simply untrue.
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-[var(--shadow-card)]">
            <CountryBadge code={country} />
            {t(`calc.countryNote.${relevance}`, {
              country: t(`country.${country}`),
              year: COUNTRIES[country].fiscalYear.label,
              currency: COUNTRIES[country].currency.code,
            })}
          </p>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <CalculatorRunner
            slug={calculator.slug}
            lockedCountry={lockCountry ? country : undefined}
            allowedCountries={calculator.countries}
          />

          <AdSlot slot="calculator-mid" placement="inline" />

          {calculator.explainerKeys?.length ? (
            <section data-reveal="up" className="card p-5 sm:p-7">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
                <span className="tile tone-amber h-9 w-9 rounded-xl">
                  <Lightbulb aria-hidden className="h-5 w-5" />
                </span>
                {t("calc.howItWorks")}
              </h2>
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
            <section data-reveal="up" className="card p-5 sm:p-7">
              <h2 className="mb-2 flex items-center gap-3 text-lg font-bold">
                <span className="tile tone-violet h-9 w-9 rounded-xl">
                  <CircleHelp aria-hidden className="h-5 w-5" />
                </span>
                {t("calc.faq")}
              </h2>
              <div className="divide-y divide-border">
                {calculator.faqKeys.map((key) => (
                  <details key={key} className="faq group py-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-[15px] font-semibold text-heading transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                      {t(`${key}.q`, params)}
                      <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-primary" />
                    </summary>
                    <p className="faq-answer pb-4 text-sm leading-relaxed text-muted">
                      {t(`${key}.a`, params)}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section data-reveal="left" className="lg:sticky lg:top-24">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">{t("calc.related")}</h2>
            <ul className="card overflow-hidden p-1.5">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-heading transition-all hover:bg-primary-soft hover:text-primary"
                  >
                    <IconTile visual={item.visual} size="sm" shape="rounded" className="group-hover:scale-110" />
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
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
