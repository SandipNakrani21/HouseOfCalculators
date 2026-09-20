import type { Metadata } from "next";
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

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("section.tools")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t("section.tools.intro")}
        </p>
      </header>

      {TOOL_CATEGORIES.map((category) => {
        const tools = toolsIn(category);
        if (!tools.length) return null;
        return (
          <section key={category} className="mb-12">
            <SectionHeading title={t(categoryKey("tools", category))} />
            <CardGrid>
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <ContentCard
                    href={contentPath(code, "tools", category, tool.slug)}
                    icon={tool.icon}
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
