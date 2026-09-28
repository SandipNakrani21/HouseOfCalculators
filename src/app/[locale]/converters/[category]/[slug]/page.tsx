import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConverterRunner } from "@/components/converter/ConverterRunner";
import { DetailPage } from "@/components/layout/DetailPage";
import {
  CONVERTERS,
  getConverterByCategory,
  pairSlug,
  parsePairSlug,
} from "@/config/converters/definitions";
import { findUnit, unitRatio } from "@/config/converters/units";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator, unitName } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";
import { categoryVisual } from "@/lib/visuals";
import { calculatorsCta } from "@/lib/cta";

type Params = { locale: string; category: string; slug: string };

/**
 * Two kinds of page share this route: the category converter (any unit to any
 * unit) and a featured pair (meters to feet). Pairs exist only for conversions
 * people actually search for - generating every permutation would produce
 * hundreds of pages with nothing of their own to say.
 */
export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    CONVERTERS.flatMap((converter) =>
      converter.featuredPairs.map(([from, to]) => ({
        locale: LOCALES[code].path,
        category: converter.category,
        slug: pairSlug(converter, from, to),
      })),
    ),
  );
}

function resolve(category: string, slug: string) {
  const converter = getConverterByCategory(category);
  if (!converter) return null;
  const pair = parsePairSlug(converter, slug);
  return pair ? { converter, pair } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const resolved = resolve(category, slug);
  if (!locale || !resolved) return {};

  const t = createTranslator(locale.language, locale.code);
  const { converter, pair } = resolved;
  const names = {
    from: unitName(t, findUnit(converter, pair[0])!.labelKey, true),
    to: unitName(t, findUnit(converter, pair[1])!.labelKey, true),
  };
  return buildMetadata({
    locale: locale.code,
    path: contentPath(locale.code, "converters", category, slug),
    title: t("conv.pair.title", names),
    description: t("conv.pair.desc", names),
  });
}

export default async function ConverterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const resolved = resolve(category, slug);
  if (!locale || !resolved) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const { converter, pair } = resolved;

  const fromUnit = findUnit(converter, pair[0]);
  const toUnit = findUnit(converter, pair[1]);
  if (!fromUnit || !toUnit) notFound();

  const names = {
    from: unitName(t, fromUnit.labelKey, true),
    to: unitName(t, toUnit.labelKey, true),
  };
  const title = t("conv.pair.title", names);
  const description = t("conv.pair.desc", names);

  const related = converter.featuredPairs
    .filter(([from, to]) => pairSlug(converter, from, to) !== slug)
    .flatMap(([from, to]) => {
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
        { name: title, path: contentPath(code, "converters", category, slug) },
      ]}
      header={{
        visual: categoryVisual("converters", converter.category),
        eyebrow: t("section.converters"),
        title,
        description,
      }}
      adPrefix="converter"
      howItWorks={{
        title: t("conv.howItWorks"),
        body: (
          <>
            <p className="text-sm leading-relaxed text-muted">{t(converter.explainerKey)}</p>
            <p className="tabular mt-4 rounded-md bg-bg-soft px-4 py-3 text-sm font-semibold text-heading">
              <span className="me-2 text-primary">{t("calc.formula")}:</span>
              {t("conv.formula", {
                from: fromUnit.symbol,
                to: toUnit.symbol,
                factor: unitRatio(converter, pair[0], pair[1]).toPrecision(8),
              })}
            </p>
          </>
        ),
      }}
      related={{
        title: t("conv.related"),
        items: related,
        viewAll: { href: categoryPath(code, "converters", category), label: t("common.viewAll") },
      }}
      cta={calculatorsCta(t, code)}
    >
      <ConverterRunner slug={converter.slug} initialFrom={pair[0]} initialTo={pair[1]} lockUnits />
    </DetailPage>
  );
}
