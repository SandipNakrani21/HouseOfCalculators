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
import { findUnit, conversionFormula, convert } from "@/config/converters/units";
import { conversionExamples, CONVERSION_SOURCES } from "@/config/converters/examples";
import { createFormatter } from "@/lib/format";
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
  const fmt = createFormatter(locale.defaultCountry, locale.language, t);
  const examples = conversionExamples(converter, pair[0], pair[1]);
  const example = { input: fmt.number(examples[1], { decimals: 6 }), output: fmt.number(convert(converter, examples[1], pair[0], pair[1]), { decimals: 6 }), from: fromUnit.symbol, to: toUnit.symbol };

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
              {conversionFormula(converter, pair[0], pair[1])}
            </p>
            <h3 className="mt-6 text-base font-semibold">{t("conv.pair.examples")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("conv.pair.example", example)}</p>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-muted">
              <li>{t("conv.pair.stepInput", example)}</li>
              <li>{t("conv.pair.stepFormula")}</li>
              <li>{t("conv.pair.stepOutput", example)}</li>
            </ol>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm"><caption className="sr-only">{t("conv.pair.examples")}</caption>
                <thead><tr><th scope="col" className="p-3 text-start">{names.from} ({fromUnit.symbol})</th><th scope="col" className="p-3 text-start">{names.to} ({toUnit.symbol})</th></tr></thead>
                <tbody>{examples.map(input => <tr key={input} className="border-t border-border"><th scope="row" className="p-3 text-start font-normal">{fmt.number(input, { decimals: 6 })}</th><td className="p-3">{fmt.number(convert(converter, input, pair[0], pair[1]), { decimals: 6 })}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">{t("conv.pair.precision")}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("conv.pair.unitsCaution")}</p>
            <h3 className="mt-5 font-semibold">{t("calc.sources")}</h3>
            <ul className="mt-2 space-y-2 text-sm">{CONVERSION_SOURCES.map(source => <li key={source.href}><a className="text-primary underline" href={source.href} target="_blank" rel="noreferrer">{source.name}</a></li>)}</ul>
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
