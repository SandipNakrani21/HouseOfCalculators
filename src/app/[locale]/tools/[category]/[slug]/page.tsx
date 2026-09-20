import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolRunner } from "@/components/tools/ToolRunner";
import { categoryKey } from "@/config/categories";
import { LOCALES, localeFromPath } from "@/config/locales";
import { TOOLS, getTool, toolsIn } from "@/config/tools/definitions";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";

type Params = { locale: string; category: string; slug: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    TOOLS.map((tool) => ({
      locale: LOCALES[code].path,
      category: tool.category,
      slug: tool.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const tool = getTool(slug);
  if (!locale || !tool || tool.category !== category) return {};

  const t = createTranslator(locale.language);
  return buildMetadata({
    locale: locale.code,
    path: contentPath(locale.code, "tools", category, slug),
    title: t(tool.titleKey),
    description: t(tool.descKey),
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, category, slug } = await params;
  const locale = localeFromPath(path);
  const tool = getTool(slug);
  if (!locale || !tool || tool.category !== category) notFound();

  const t = createTranslator(locale.language);
  const code = locale.code;
  const related = toolsIn(tool.category).filter((item) => item.slug !== slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        label={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t("section.tools"), path: sectionPath(code, "tools") },
          {
            name: t(categoryKey("tools", tool.category)),
            path: categoryPath(code, "tools", tool.category),
          },
          { name: t(tool.titleKey), path: contentPath(code, "tools", category, slug) },
        ]}
      />

      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <span aria-hidden>{tool.icon}</span>
          {t(tool.titleKey)}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">{t(tool.descKey)}</p>
      </header>

      <ToolRunner slug={slug} />

      <AdSlot slot="tool-mid" placement="inline" />

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="mb-3 text-lg font-semibold">{t("calc.howItWorks")}</h2>
        <p className="text-sm leading-relaxed text-muted">{t(tool.explainerKey)}</p>
      </section>

      {related.length ? (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">{t("calc.related")}</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={contentPath(code, "tools", item.category, item.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <span aria-hidden>{item.icon}</span>
                  {t(item.titleKey)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
