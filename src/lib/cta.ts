import type { LocaleCode } from "@/config/locales";
import type { TranslateFn } from "@/lib/i18n/core";
import { sectionPath } from "@/lib/routes";

/**
 * The call to action every page ends with ("Ready to start calculating?"),
 * pointing at the calculators. One definition, so its copy and link are the
 * same on the homepage, detail pages and guides.
 */
export function calculatorsCta(t: TranslateFn, locale: LocaleCode) {
  return {
    title: t("home.cta.title"),
    body: t("home.cta.body"),
    cta: t("home.cta.button"),
    href: sectionPath(locale, "calculators"),
  };
}
