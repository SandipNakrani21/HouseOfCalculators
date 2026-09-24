import type { CalcContext, CalculatorDef } from "@/config/calculators/types";
import { COUNTRIES, type CountryCode } from "@/config/countries";
import type { LanguageCode } from "@/config/languages";
import { createFormatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n";

/**
 * A calculator's title and description, with its placeholders filled for a
 * country.
 *
 * Several definitions word themselves per country through `params` - the
 * consumption-tax calculator is "GST" in India and "Sales Tax" in the US - so
 * translating the keys without them left a literal "{tax} Calculator" on the
 * country pages, in search results and in the footer. Every listing goes
 * through here instead.
 */
export function calculatorCopy(
  calculator: CalculatorDef,
  t: TranslateFn,
  country: CountryCode,
  language: LanguageCode,
): { title: string; description: string } {
  const context: CalcContext = {
    countryCode: country,
    country: COUNTRIES[country],
    t,
    fmt: createFormatter(country, language),
  };
  const params = calculator.params?.(context);
  return {
    title: t(calculator.titleKey, params),
    description: t(calculator.descKey, params),
  };
}
