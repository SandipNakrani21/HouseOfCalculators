import type { Metadata } from "next";
import { ListingPage } from "@/components/layout/ListingPage";
import { sectionVisual, categoryVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { CONVERTERS } from "@/config/converters/definitions";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, localeHome, sectionPath } from "@/lib/routes";
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

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;

  return (
    <ListingPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      loadMoreLabel={t("common.loadMore")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.converters"), path: sectionPath(code, "converters") },
      ]}
      header={{
        visual: sectionVisual("converters"),
        title: t("section.converters"),
        description: t("section.converters.intro"),
      }}
      items={CONVERTERS.map((converter) => ({
        key: converter.slug,
        href: categoryPath(code, "converters", converter.category),
        visual: categoryVisual("converters", converter.category),
        title: t(converter.titleKey),
        description: t(converter.descKey),
      }))}
      adSlot="converters-bottom"
    />
  );
}
