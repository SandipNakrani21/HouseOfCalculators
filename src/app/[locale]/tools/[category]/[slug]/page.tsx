import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/layout/DetailPage";
import { ToolRunner } from "@/components/tools/ToolRunner";
import { categoryKey } from "@/config/categories";
import { LOCALES, localeFromPath } from "@/config/locales";
import { TOOLS, getTool, toolsIn } from "@/config/tools/definitions";
import { guideLinksFor } from "@/lib/guide-links";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, contentPath, localeHome, sectionPath } from "@/lib/routes";
import { buildMetadata, readyLocales } from "@/lib/seo";
import { itemVisual } from "@/lib/visuals";
import { calculatorsCta } from "@/lib/cta";

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

  const t = createTranslator(locale.language, locale.code);
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

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const related = toolsIn(tool.category).filter((item) => item.slug !== slug);

  return (
    <DetailPage
      locale={code}
      breadcrumbLabel={t("a11y.breadcrumb")}
      trail={[
        { name: t("nav.home"), path: localeHome(code) },
        { name: t("section.tools"), path: sectionPath(code, "tools") },
        {
          name: t(categoryKey("tools", tool.category)),
          path: categoryPath(code, "tools", tool.category),
        },
        { name: t(tool.titleKey), path: contentPath(code, "tools", category, slug) },
      ]}
      header={{
        visual: itemVisual("tools", tool.category, tool.slug),
        eyebrow: t("section.tools"),
        title: t(tool.titleKey),
        description: t(tool.descKey),
      }}
      adPrefix="tool"
      rail={false}
      howItWorks={{
        title: t("calc.howItWorks"),
        body: <p className="text-sm leading-relaxed text-muted">{t(tool.explainerKey)}</p>,
      }}
      guides={{ title: t("calc.guides"), items: guideLinksFor(code, t, "tools", slug) }}
      related={{
        title: t("calc.related"),
        items: related.map((item) => ({
          key: item.slug,
          href: contentPath(code, "tools", item.category, item.slug),
          visual: itemVisual("tools", item.category, item.slug),
          title: t(item.titleKey),
          description: t(item.descKey),
        })),
        viewAll: { href: categoryPath(code, "tools", tool.category), label: t("common.viewAll") },
      }}
      cta={calculatorsCta(t, code)}
    >
      <ToolRunner slug={slug} />
    </DetailPage>
  );
}
