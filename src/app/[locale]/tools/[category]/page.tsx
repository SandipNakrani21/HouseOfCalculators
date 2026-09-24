import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
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

  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  const code = locale.code;
  const name = t(categoryKey("tools", resolved));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.tools"), path: sectionPath(code, "tools") },
          { name, path: categoryPath(code, "tools", resolved) },
        ]}
      />

      <PageHeader
        visual={categoryVisual("tools", resolved)}
        eyebrow={t("section.tools")}
        title={t("tools.category.title", { category: name })}
        description={t(`category.tools.${resolved}.intro`)}
      />

      <CardGrid>
        {toolsIn(resolved).map((tool) => (
          <li key={tool.slug}>
            <ContentCard
              href={contentPath(code, "tools", resolved, tool.slug)}
              visual={itemVisual("tools", resolved, tool.slug)}
              title={t(tool.titleKey)}
              description={t(tool.descKey)}
            />
          </li>
        ))}
      </CardGrid>
    </div>
  );
}
