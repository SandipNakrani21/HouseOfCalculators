import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
import { CONVERTERS } from "@/config/converters/definitions";
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
    path: sectionPath(locale.code, "converters"),
    title: t("section.converters"),
    description: t("section.converters.desc"),
  });
}

export default async function ConvertersPage({
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
          { name: t("section.converters"), path: sectionPath(code, "converters") },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("section.converters")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t("section.converters.intro")}
        </p>
      </header>

      <CardGrid>
        {CONVERTERS.map((converter) => (
          <li key={converter.slug}>
            <ContentCard
              href={contentPath(code, "converters", converter.category, converter.slug)}
              icon={converter.icon}
              title={t(converter.titleKey)}
              description={t(converter.descKey)}
            />
          </li>
        ))}
      </CardGrid>

      <AdSlot slot="converters-bottom" placement="leaderboard" />
    </div>
  );
}
