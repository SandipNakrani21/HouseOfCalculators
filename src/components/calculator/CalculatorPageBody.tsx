import { CalculatorCountryNote, CalculatorRunner } from "@/components/calculator/CalculatorRunner";
import { DetailPage } from "@/components/layout/DetailPage";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { calculatorsFor } from "@/config/calculators";
import { countryRelevanceOf } from "@/config/calculators/types";
import type { CalcContext, CalculatorDef } from "@/config/calculators/types";
import { categoryKey } from "@/config/categories";
import { COUNTRIES, type CountryCode } from "@/config/countries";
import type { LanguageCode } from "@/config/languages";
import type { LocaleCode } from "@/config/locales";
import { calculatorCopy } from "@/lib/calculator-copy";
import { createFormatter } from "@/lib/format";
import { guideLinksFor } from "@/lib/guide-links";
import { createTranslator } from "@/lib/i18n";
import { calculatorPath, categoryPath } from "@/lib/routes";
import { itemVisual } from "@/lib/visuals";
import { calculatorsCta } from "@/lib/cta";

/** schema.org application categories for the calculator subjects. */
const APP_CATEGORY: Record<string, string> = {
  finance: "FinanceApplication",
  business: "BusinessApplication",
  health: "HealthApplication",
  education: "EducationalApplication",
  math: "EducationalApplication",
};

/**
 * The calculator page, shared by the subject-category route and the country
 * tool route. Everything except the interactive card is server rendered, so
 * the explanation and FAQ are in the HTML a crawler receives.
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
  const t = createTranslator(language, locale);
  const fmt = createFormatter(country, language, t);
  const ctx: CalcContext = { countryCode: country, country: COUNTRIES[country], t, fmt };
  const params = calculator.params?.(ctx);
  const relevance = countryRelevanceOf(calculator);

  const related = relatedTo(calculator, country)
    .slice(0, 6)
    .map((item) => ({
      key: item.slug,
      href: calculatorPath(locale, item, country),
      visual: itemVisual("calculators", item.category, item.slug),
      ...calculatorCopy(item, t, country, language),
    }));

  return (
    <DetailPage
      trail={trail}
      locale={locale}
      appCategory={APP_CATEGORY[calculator.category] ?? "UtilitiesApplication"}
      breadcrumbLabel={t("a11y.breadcrumb")}
      header={{
        visual: itemVisual("calculators", calculator.category, calculator.slug),
        eyebrow: t(categoryKey("calculators", calculator.category)),
        title: t(calculator.titleKey, params),
        description: t(calculator.descKey, params),
        note:
          relevance === "none" ? null : (
            // Say what the country actually changes here. Claiming a BMI
            // follows a country's rules for a tax year would be simply untrue.
            <CalculatorCountryNote relevance={relevance} lockedCountry={lockCountry ? country : undefined} />
          ),
      }}
      adPrefix="calculator"
      howItWorks={
        calculator.explainerKeys?.length || calculator.formula
          ? {
              title: t("calc.howItWorks"),
              body: (
                <div className="space-y-3">
                  {calculator.explainerKeys?.map((key) => (
                    <p key={key} className="text-sm leading-relaxed text-muted">
                      {t(key, params)}
                    </p>
                  ))}
                  {calculator.formula ? (
                    // The same presentation as a guide's formula block.
                    <div className="pt-2">
                      <h3 className="mb-3 text-base font-bold">{t("calc.formula")}</h3>
                      <p className="result-box tabular text-base font-bold sm:text-lg">
                        {calculator.formula.expression}
                      </p>
                      <dl className="mt-4 divide-y divide-border border-t border-border">
                        {calculator.formula.variables.map((variable) => (
                          <div key={variable.symbol} className="flex gap-4 py-2.5">
                            <dt className="tabular w-8 shrink-0 font-semibold text-primary">
                              {variable.symbol}
                            </dt>
                            <dd className="text-sm text-muted">{t(variable.key, params)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                </div>
              ),
            }
          : undefined
      }
      faq={
        calculator.faqKeys?.length
          ? {
              title: t("calc.faq"),
              items: calculator.faqKeys.map((key) => ({
                id: key,
                question: t(`${key}.q`, params),
                answer: t(`${key}.a`, params),
              })),
            }
          : undefined
      }
      guides={{
        title: t("calc.guides"),
        // Guides link a country tool as "countries", a subject calculator as "calculators".
        items: guideLinksFor(locale, t, lockCountry ? "countries" : "calculators", calculator.slug),
      }}
      related={{
        title: t("calc.related"),
        items: related,
        viewAll: {
          href: categoryPath(locale, "calculators", calculator.category),
          label: t("common.viewAll"),
        },
      }}
      cta={calculatorsCta(t, locale)}
    >
      <CalculatorRunner
        slug={calculator.slug}
        lockedCountry={lockCountry ? country : undefined}
        allowedCountries={calculator.countries}
      />
    </DetailPage>
  );
}

/**
 * Related tools: the ones the definition names first, then others in the same
 * category, then anything else the country offers. Ordering this way keeps the
 * most relevant links at the top where they are actually followed.
 */
function relatedTo(calculator: CalculatorDef, country: CountryCode) {
  const available = calculatorsFor(country).filter((item) => item.slug !== calculator.slug);
  const named = (calculator.relatedCalculators ?? [])
    .map((slug) => available.find((item) => item.slug === slug))
    .filter((item): item is CalculatorDef => Boolean(item));

  const sameCategory = available.filter(
    (item) => item.category === calculator.category && !named.includes(item),
  );
  const rest = available.filter((item) => !named.includes(item) && !sameCategory.includes(item));

  return [...named, ...sameCategory, ...rest];
}
