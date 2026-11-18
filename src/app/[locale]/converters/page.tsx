import type { Metadata } from "next";
import Link from "next/link";
import { ListingPage } from "@/components/layout/ListingPage";
import { sectionVisual, categoryVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { CONVERTERS, getConverterByCategory, pairSlug } from "@/config/converters/definitions";
import { findUnit } from "@/config/converters/units";
import { localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
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
  const popular = ["weight", "length", "temperature"].flatMap(category => {
    const converter = getConverterByCategory(category)!;
    return converter.featuredPairs.slice(0, category === "weight" ? 2 : 1).map(([from, to]) => ({
      href: contentPath(code, "converters", category, pairSlug(converter, from, to)),
      label: t("conv.pair.short", { from: t(findUnit(converter, from)!.labelKey), to: t(findUnit(converter, to)!.labelKey) }),
    }));
  });

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
        children: (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">{t("conv.popular")}</p>
            <ul className="flex flex-wrap gap-2">
              {popular.map(({ href, label }) => (
                <li key={href}><Link href={href} className="chip chip-outline">{label}</Link></li>
              ))}
            </ul>
          </div>
        ),
      }}
      items={CONVERTERS.map((converter) => ({
        key: converter.slug,
        href: categoryPath(code, "converters", converter.category),
        visual: categoryVisual("converters", converter.category),
        title: t(converter.titleKey),
        description: t(converter.descKey),
      }))}
    />
  );
}
