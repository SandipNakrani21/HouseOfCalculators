import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { ConverterRunner } from "@/components/converter/ConverterRunner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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

  const t = createTranslator(locale.language);
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

  const t = createTranslator(locale.language);
  const code = locale.code;

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
        ]}
      />

      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <span aria-hidden>{converter.icon}</span>
          {t(converter.titleKey)}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          {t(converter.descKey)}
        </p>
      </header>

      <ConverterRunner slug={converter.slug} />

      <AdSlot slot="converter-category-mid" placement="inline" />

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-3 text-lg font-semibold">{t("conv.howItWorks")}</h2>
        <p className="text-sm leading-relaxed text-muted">
          {t(converter.explainerKey)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t("conv.baseUnit", {
            unit: t(findUnit(converter, converter.baseUnit)!.labelKey),
          })}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">{t("conv.popular")}</h2>
        <ul className="flex flex-wrap gap-2">
          {converter.featuredPairs.map(([from, to]) => {
            const a = findUnit(converter, from);
            const b = findUnit(converter, to);
            if (!a || !b) return null;
            return (
              <li key={`${from}-${to}`}>
                <Link
                  href={contentPath(code, "converters", category, pairSlug(converter, from, to))}
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
        </ul>
      </section>
    </div>
  );
}
