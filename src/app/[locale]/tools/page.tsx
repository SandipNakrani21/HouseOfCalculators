import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { sectionVisual, categoryVisual, itemVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  CardGrid,
  ContentCard,
  SectionHeading,
} from "@/components/shared/ContentCard";
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
  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  const code = locale.code;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.tools"), path: sectionPath(code, "tools") },
        ]}
      />

      <PageHeader
        visual={sectionVisual("tools")}
        title={t("section.tools")}
        description={t("section.tools.intro")}
      />

      {TOOL_CATEGORIES.map((category) => {
        const tools = toolsIn(category);
        if (!tools.length) return null;
        return (
          <section key={category} className="mb-12">
            <SectionHeading visual={categoryVisual("tools", category)} title={t(categoryKey("tools", category))} />
            <CardGrid>
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <ContentCard
                    href={contentPath(code, "tools", category, tool.slug)}
                    visual={itemVisual("tools", category, tool.slug)}
                    title={t(tool.titleKey)}
                    description={t(tool.descKey)}
                  />
                </li>
              ))}
            </CardGrid>
          </section>
        );
      })}

      <AdSlot slot="tools-bottom" placement="leaderboard" />
    </div>
  );
}
