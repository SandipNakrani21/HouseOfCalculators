import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { GUIDE_CATEGORIES, categoryKey } from "@/config/categories";
import { guidesIn } from "@/config/guides/definitions";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = localeFromPath((await params).locale);
  if (!locale) return {};
  const t = createTranslator(locale.language, locale.code);
  return buildMetadata({
    locale: locale.code,
    path: sectionPath(locale.code, "guides"),
    title: t("section.guides"),
    description: t("section.guides.desc"),
  });
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = localeFromPath((await params).locale);
  if (!locale) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.guides"), path: sectionPath(code, "guides") },
      ]}
      header={{
        visual: sectionVisual("guides"),
        title: t("section.guides"),
        description: t("section.guides.intro"),
      }}
      groups={GUIDE_CATEGORIES.map((category) => ({
        key: category,
        title: t(categoryKey("guides", category)),
        visual: categoryVisual("guides", category),
        items: guidesIn(category).map((item) => ({
          key: item.slug,
          href: contentPath(code, "guides", category, item.slug),
          visual: itemVisual("guides", category, item.slug),
          title: t(item.titleKey),
          description: t(item.descKey),
        })),
      }))}
      adSlot="guides-bottom"
    />
  );
}
