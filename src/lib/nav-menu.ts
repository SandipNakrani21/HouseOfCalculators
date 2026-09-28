import type { CalcContext } from "@/config/calculators/types";
import type { Section } from "@/config/categories";
import { COUNTRIES, type CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";
import { allContent, type ContentItem } from "@/lib/content";
import type { TranslateFn } from "@/lib/i18n/core";
import { countryPath } from "@/lib/routes";
import { sectionVisual, type Visual } from "@/lib/visuals";

export type NavMenuLink = { title: string; href: string; visual: Visual };

/** The header's hover menus: the three most visited pages of each section. */
export type NavMenu = Partial<Record<Section, NavMenuLink[]>>;

const TOP: Record<Exclude<Section, "countries">, string[]> = {
  calculators: ["calculator:loan", "calculator:mortgage", "calculator:sip"],
  converters: ["converter:length", "converter:weight", "converter:temperature"],
  tools: ["tool:percentage", "tool:age", "tool:date-difference"],
  charts: ["chart:multiplication-table", "chart:length-conversion-table", "chart:cooking-measurements"],
  guides: [
    "guide:how-to-calculate-loan-payment",
    "guide:what-is-compound-interest",
    "guide:how-to-calculate-percentage",
  ],
};

const TOP_COUNTRIES: CountryCode[] = ["us", "gb", "in"];

export function buildNavMenu(context: {
  locale: LocaleCode;
  country: CountryCode;
  t: TranslateFn;
  calcContext: CalcContext;
}): NavMenu {
  const byId = new Map<string, ContentItem>(allContent(context).map((item) => [item.id, item]));
  const menu: NavMenu = {};
  for (const [section, ids] of Object.entries(TOP) as [Section, string[]][]) {
    menu[section] = ids.flatMap((id) => {
      const item = byId.get(id);
      return item ? [{ title: item.title, href: item.href, visual: item.visual }] : [];
    });
  }
  menu.countries = TOP_COUNTRIES.filter((code) => code in COUNTRIES).map((code) => ({
    title: context.t(`country.${code}`),
    href: countryPath(context.locale, code),
    visual: sectionVisual("countries"),
  }));
  return menu;
}
