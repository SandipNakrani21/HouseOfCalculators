import type { Metadata } from "next";
import Link from "next/link";
import { categoryVisual } from "@/lib/visuals";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/layout/DetailPage";
import { ConverterRunner } from "@/components/converter/ConverterRunner";
import {
  CONVERTERS,
  getConverterByCategory,
  pairSlug,
} from "@/config/converters/definitions";
import { convert, findUnit } from "@/config/converters/units";
import { CONVERSION_SOURCES } from "@/config/converters/examples";
import { LOCALES, localeFromPath } from "@/config/locales";
import { calculatorsCta } from "@/lib/cta";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

const WEIGHT_EXAMPLES = [
  { from: "kilogram", to: "pound", relation: "≈" },
  { from: "pound", to: "kilogram", relation: "=" },
] as const;

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
  const format = createFormatter(locale.defaultCountry, locale.language, t);

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
      rail={false}
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
            {converter.id === "weight" ? (
              <>
                <h3 className="mt-6 font-semibold">{t("conv.pair.examples")}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {WEIGHT_EXAMPLES.map(({ from, to, relation }) => {
                    const input = findUnit(converter, from)!;
                    const output = findUnit(converter, to)!;
                    const factor = format.number(convert(converter, 1, from, to), { decimals: 8 });
                    const example = format.number(convert(converter, 10, from, to), { decimals: 4 });
                    return (
                      <li key={from} className="rounded-md bg-bg-soft p-4 text-sm">
                        <Link className="font-semibold text-primary underline underline-offset-2" href={contentPath(code, "converters", category, pairSlug(converter, from, to))}>
                          {t("conv.pair.short", { from: t(input.labelKey), to: t(output.labelKey) })}
                        </Link>
                        <p className="tabular mt-2 text-heading" dir="ltr">{output.symbol} {relation} {input.symbol} × {factor}</p>
                        <p className="tabular mt-1 text-muted" dir="ltr">{format.number(10)} {input.symbol} ≈ {example} {output.symbol}</p>
                      </li>
                    );
                  })}
                </ul>
                <h3 className="mt-5 font-semibold">{t("calc.sources")}</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {CONVERSION_SOURCES.map(source => (
                    <li key={source.href}><a className="text-primary underline" href={source.href}>{source.name}</a></li>
                  ))}
                </ul>
              </>
            ) : null}
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
