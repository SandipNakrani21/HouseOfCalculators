import { ToolContext, hasToolContext } from "@/components/tools/ToolContext";
import { PlanningExample } from "@/components/tools/PlanningExample";
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
import { toolExamples, toolSources } from "@/config/tools/examples";
import { createFormatter } from "@/lib/format";

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
  const examples = toolExamples(slug, t, createFormatter(locale.defaultCountry, locale.language, t));
  const sources = toolSources(tool.category, slug);

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
        body: <div className="space-y-4" data-tool-examples={slug}>
          <p className="text-sm leading-relaxed text-muted">{t(tool.explainerKey)}</p>
          <h3 className="font-semibold">{t("quality.example")}</h3>
          <p className="text-sm text-muted">{t(["random-number", "dice-roller", "coin-flip", "random-picker", "password-generator"].includes(slug) ? "quality.randomExamples" : "quality.toolExamples")}</p>
          <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">{t("quality.example")}</caption><thead><tr><th scope="col" className="p-3 text-start">{t("quality.inputs")}</th><th scope="col" className="p-3 text-start">{t("quality.outputs")}</th></tr></thead><tbody>{examples.map((example, index) => <tr key={index} className="border-t border-border"><th scope="row" className="tabular p-3 text-start font-normal">{example.input}</th><td className="tabular p-3">{example.output}</td></tr>)}</tbody></table></div>
          <PlanningExample slug={slug} t={t} fmt={createFormatter(locale.defaultCountry, locale.language, t)} />
          <h3 className="font-semibold">{t("quality.limits")}</h3>
          {hasToolContext(slug) ? <ToolContext slug={slug} t={t} /> : <p className="text-sm leading-relaxed text-muted">{t(`quality.toolLimit.${tool.category}`)}</p>}
          {sources.length ? <div><h3 className="font-semibold">{t("calc.sources")}</h3><ul className="mt-2 space-y-2 text-sm">{sources.map(source => <li key={source.href}><a className="text-primary underline" href={source.href} target="_blank" rel="noreferrer">{source.name}</a></li>)}</ul></div> : null}
        </div>,
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
