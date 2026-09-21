import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  CardGrid,
  ContentCard,
  SectionHeading,
} from "@/components/shared/ContentCard";
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
  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  const code = locale.code;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.guides"), path: sectionPath(code, "guides") },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("section.guides")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t("section.guides.intro")}
        </p>
      </header>

      {GUIDE_CATEGORIES.map((category) => {
        const guides = guidesIn(category);
        if (!guides.length) return null;
        return (
          <section key={category} className="mb-12">
            <SectionHeading title={t(categoryKey("guides", category))} />
            <CardGrid>
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <ContentCard
                    href={contentPath(code, "guides", category, guide.slug)}
                    icon={guide.icon}
                    title={t(guide.titleKey)}
                    description={t(guide.descKey)}
                  />
                </li>
              ))}
            </CardGrid>
          </section>
        );
      })}

      <AdSlot slot="guides-bottom" placement="leaderboard" />
    </div>
  );
}
