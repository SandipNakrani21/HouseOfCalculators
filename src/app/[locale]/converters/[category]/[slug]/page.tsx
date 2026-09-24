import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { categoryVisual } from "@/lib/visuals";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { ConverterRunner } from "@/components/converter/ConverterRunner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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

  const t = createTranslator(locale.language);
  const { converter, pair } = resolved;
  const names = {
    from: unitName(locale.language, t, findUnit(converter, pair[0])!.labelKey, true),
    to: unitName(locale.language, t, findUnit(converter, pair[1])!.labelKey, true),
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

  const t = createTranslator(locale.language);
  const code = locale.code;
  const { converter, pair } = resolved;

  const fromUnit = findUnit(converter, pair[0]);
  const toUnit = findUnit(converter, pair[1]);
  if (!fromUnit || !toUnit) notFound();

  const names = {
    from: unitName(locale.language, t, fromUnit.labelKey, true),
    to: unitName(locale.language, t, toUnit.labelKey, true),
  };
  const title = t("conv.pair.title", names);
  const description = t("conv.pair.desc", names);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.converters"), path: sectionPath(code, "converters") },
          {
            name: t(converter.titleKey),
            path: categoryPath(code, "converters", category),
          },
          { name: title, path: contentPath(code, "converters", category, slug) },
        ]}
      />

      <PageHeader
        className="mb-6"
        visual={categoryVisual("converters", converter.category)}
        eyebrow={t("section.converters")}
        title={title}
        description={description}
      />

      <ConverterRunner
        slug={converter.slug}
        initialFrom={pair[0]}
        initialTo={pair[1]}
        lockUnits
      />

      <AdSlot slot="converter-mid" placement="inline" />

      <section data-reveal="up" className="card p-5 sm:p-7">
        <h2 className="mb-3 text-lg font-semibold">{t("conv.howItWorks")}</h2>
        <p className="text-sm leading-relaxed text-muted">
          {t(converter.explainerKey)}
        </p>
        <p className="tabular mt-3 rounded-lg bg-surface-muted px-4 py-3 text-sm">
          {t("conv.formula", {
            from: fromUnit.symbol,
            to: toUnit.symbol,
            factor: unitRatio(converter, pair[0], pair[1]).toPrecision(8),
          })}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">{t("conv.related")}</h2>
        <ul className="flex flex-wrap gap-2">
          {converter.featuredPairs
            .filter(([from, to]) => pairSlug(converter, from, to) !== slug)
            .map(([from, to]) => {
              const a = findUnit(converter, from);
              const b = findUnit(converter, to);
              if (!a || !b) return null;
              return (
                <li key={`${from}-${to}`}>
                  <Link
                    href={contentPath(
                      code,
                      "converters",
                      category,
                      pairSlug(converter, from, to),
                    )}
                    className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {t("conv.pair.short", {
                      from: t(a.labelKey),
                      to: t(b.labelKey),
                    })}
                  </Link>
                </li>
              );
            })}
          <li>
            <Link
              href={categoryPath(code, "converters", category)}
              className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary"
            >
              {t("common.viewAll")}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
