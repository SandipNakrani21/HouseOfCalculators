import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import {
  TOOL_CATEGORIES,
  categoryKey,
  type ToolCategory,
} from "@/config/categories";
import { LOCALES, localeFromPath } from "@/config/locales";
import { toolsIn } from "@/config/tools/definitions";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    TOOL_CATEGORIES.map((category) => ({
      locale: LOCALES[code].path,
      category,
    })),
  );
}

function resolve(category: string): ToolCategory | null {
  return TOOL_CATEGORIES.includes(category as ToolCategory)
    ? (category as ToolCategory)
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, category } = await params;
  const locale = localeFromPath(path);
  const resolved = resolve(category);
  if (!locale || !resolved) return {};

  const t = createTranslator(locale.language, locale.code);
  const name = t(categoryKey("tools", resolved));
  return buildMetadata({
    locale: locale.code,
    path: categoryPath(locale.code, "tools", resolved),
    title: t("tools.category.title", { category: name }),
    description: t("tools.category.desc", { category: name }),
  });
}

export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category } = await params;
  const locale = localeFromPath(path);
  const resolved = resolve(category);
  if (!locale || !resolved) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const name = t(categoryKey("tools", resolved));

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.tools"), path: sectionPath(code, "tools") },
        { name, path: categoryPath(code, "tools", resolved) },
      ]}
      header={{
        visual: categoryVisual("tools", resolved),
        eyebrow: t("section.tools"),
        title: t("tools.category.title", { category: name }),
        description: t(`category.tools.${resolved}.intro`),
      }}
      items={toolsIn(resolved).map((item) => ({
        key: item.slug,
        href: contentPath(code, "tools", resolved, item.slug),
        visual: itemVisual("tools", resolved, item.slug),
        title: t(item.titleKey),
        description: t(item.descKey),
      }))}
      adSlot="tools-category-bottom"
    />
  );
}
