import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { TOOL_CATEGORIES, categoryKey } from "@/config/categories";
import { toolsIn } from "@/config/tools/definitions";
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
    path: sectionPath(locale.code, "tools"),
    title: t("section.tools"),
    description: t("section.tools.desc"),
  });
}

export default async function ToolsPage({
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
        { name: t("section.tools"), path: sectionPath(code, "tools") },
      ]}
      header={{
        visual: sectionVisual("tools"),
        title: t("section.tools"),
        description: t("section.tools.intro"),
      }}
      groups={TOOL_CATEGORIES.map((category) => ({
        key: category,
        title: t(categoryKey("tools", category)),
        visual: categoryVisual("tools", category),
        items: toolsIn(category).map((item) => ({
          key: item.slug,
          href: contentPath(code, "tools", category, item.slug),
          visual: itemVisual("tools", category, item.slug),
          title: t(item.titleKey),
          description: t(item.descKey),
        })),
      }))}
      adSlot="tools-bottom"
    />
  );
}
