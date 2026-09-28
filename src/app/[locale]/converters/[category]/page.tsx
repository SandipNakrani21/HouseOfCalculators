import type { Metadata } from "next";
import { categoryVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/layout/DetailPage";
import { ConverterRunner } from "@/components/converter/ConverterRunner";
import {
  CONVERTERS,
  getConverterByCategory,
  pairSlug,
} from "@/config/converters/definitions";
import { findUnit } from "@/config/converters/units";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";
import { calculatorsCta } from "@/lib/cta";

type Params = { locale: string; category: string };

/** The category page is the converter itself, at /converters/length. */
export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    CONVERTERS.map((converter) => ({
      locale: LOCALES[code].path,
      category: converter.category,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, category } = await params;
  const locale = localeFromPath(path);
  const converter = getConverterByCategory(category);
  if (!locale || !converter) return {};

  const t = createTranslator(locale.language, locale.code);
  return buildMetadata({
    locale: locale.code,
    path: categoryPath(locale.code, "converters", category),
    title: t(converter.titleKey),
    description: t(converter.descKey),
  });
}

export default async function ConverterCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category } = await params;
  const locale = localeFromPath(path);
  const converter = getConverterByCategory(category);
  if (!locale || !converter) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;

  // The converter's featured pairs, as cards below the converter.
  const popular = converter.featuredPairs.flatMap(([from, to]) => {
    const a = findUnit(converter, from);
    const b = findUnit(converter, to);
    if (!a || !b) return [];
    return [
      {
        key: `${from}-${to}`,
        href: contentPath(code, "converters", category, pairSlug(converter, from, to)),
        visual: categoryVisual("converters", converter.category),
        title: t("conv.pair.short", { from: t(a.labelKey), to: t(b.labelKey) }),
      },
    ];
  });

  return (
    <DetailPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.converters"), path: sectionPath(code, "converters") },
        { name: t(converter.titleKey), path: categoryPath(code, "converters", category) },
      ]}
      header={{
        visual: categoryVisual("converters", converter.category),
        eyebrow: t("section.converters"),
        title: t(converter.titleKey),
        description: t(converter.descKey),
      }}
      adPrefix="converter-category"
      howItWorks={{
        title: t("conv.howItWorks"),
        body: (
          <>
            <p className="text-sm leading-relaxed text-muted">{t(converter.explainerKey)}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t("conv.baseUnit", {
                unit: t(findUnit(converter, converter.baseUnit)!.labelKey),
              })}
            </p>
          </>
        ),
      }}
      related={{
        title: t("conv.popular"),
        items: popular,
        viewAll: { href: sectionPath(code, "converters"), label: t("common.viewAll") },
      }}
      cta={calculatorsCta(t, code)}
    >
      <ConverterRunner slug={converter.slug} />
    </DetailPage>
  );
}
