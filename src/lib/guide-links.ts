import type { RelatedItem } from "@/components/layout/DetailPage";
import type { Section } from "@/config/categories";
import { guidesFor } from "@/config/guides/definitions";
import type { LocaleCode } from "@/config/locales";
import type { TranslateFn } from "@/lib/i18n/core";
import { contentPath } from "@/lib/routes";
import { itemVisual } from "@/lib/visuals";

/**
 * The guides that link to a page, as cards for that page: the reverse of a
 * guide's own "related" list, so a calculator links to the guide explaining
 * it without the two lists having to be kept in step by hand.
 */
export function guideLinksFor(
  locale: LocaleCode,
  t: TranslateFn,
  section: Section,
  slug: string,
): RelatedItem[] {
  return guidesFor(section, slug).map((guide) => ({
    key: `guide:${guide.slug}`,
    href: contentPath(locale, "guides", guide.category, guide.slug),
    title: t(guide.titleKey),
    description: t(guide.descKey),
    visual: itemVisual("guides", guide.category, guide.slug),
  }));
}
