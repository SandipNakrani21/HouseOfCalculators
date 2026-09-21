import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CardGrid, ContentCard } from "@/components/shared/ContentCard";
import {
  GUIDE_CATEGORIES,
  categoryKey,
  type GuideCategory,
} from "@/config/categories";
import { guidesIn } from "@/config/guides/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    GUIDE_CATEGORIES.map((category) => ({ locale: LOCALES[code].path, category })),
  );
}

function resolve(category: string): GuideCategory | null {
  return GUIDE_CATEGORIES.includes(category as GuideCategory)
    ? (category as GuideCategory)
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
  const name = t(categoryKey("guides", resolved));
  return buildMetadata({
    locale: locale.code,
    path: categoryPath(locale.code, "guides", resolved),
    title: t("guides.category.title", { category: name }),
    description: t("guides.category.desc", { category: name }),
  });
}

export default async function GuideCategoryPage({
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
  const name = t(categoryKey("guides", resolved));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.guides"), path: sectionPath(code, "guides") },
          { name, path: categoryPath(code, "guides", resolved) },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {t("guides.category.title", { category: name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t(`category.guides.${resolved}.intro`)}
        </p>
      </header>

      <CardGrid>
        {guidesIn(resolved).map((guide) => (
          <li key={guide.slug}>
            <ContentCard
              href={contentPath(code, "guides", resolved, guide.slug)}
              icon={guide.icon}
              title={t(guide.titleKey)}
              description={t(guide.descKey)}
            />
          </li>
        ))}
      </CardGrid>
    </div>
  );
}
