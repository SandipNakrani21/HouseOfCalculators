import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { legalVisual } from "@/lib/visuals";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ui/AdSlot";
import {
  LEGAL_PAGES,
  getLegalPage,
  legalParams,
  missingOperatorDetails,
} from "@/config/legal/definitions";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createTranslator, type TranslateFn } from "@/lib/i18n";
import { localeHome } from "@/lib/routes";
import { buildMetadata, readyLocales, webPageSchema } from "@/lib/seo";

type Params = { locale: string; legal: string };

export function generateStaticParams() {
  return readyLocales().flatMap((code) =>
    LEGAL_PAGES.map((page) => ({
      locale: LOCALES[code].path,
      legal: page.slug,
    })),
  );
}

function legalPath(localePath: string, slug: string): string {
  return `/${localePath}/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: path, legal } = await params;
  const locale = localeFromPath(path);
  const page = getLegalPage(legal);
  if (!locale || !page) return {};

  const t = createTranslator(locale.language, locale.code);
  const app = t("app.name");

  return buildMetadata({
    locale: locale.code,
    path: legalPath(LOCALES[locale.code].path, page.slug),
    title: t(page.titleKey),
    description: t(page.descKey, { app }),
  });
}

/** Renders the body keys of one section, plus its bullets and links. */
function Section({
  section,
  t,
  params,
}: {
  section: (typeof LEGAL_PAGES)[number]["sections"][number];
  t: TranslateFn;
  params: Record<string, string>;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-heading sm:text-xl">
        {t(section.titleKey, params)}
      </h2>

      {section.body.map((key) => (
        <p key={key} className="mb-3 text-sm leading-relaxed text-muted sm:text-base">
          {t(key, params)}
        </p>
      ))}

      {section.bullets ? (
        <ul className="mb-3 ml-5 list-disc space-y-2">
          {section.bullets.map((key) => (
            <li key={key} className="text-sm leading-relaxed text-muted sm:text-base">
              {t(key, params)}
            </li>
          ))}
        </ul>
      ) : null}

      {section.links ? (
        <ul className="mt-3 space-y-1">
          {section.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm text-primary underline underline-offset-2"
              >
                {t(link.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default async function LegalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: path, legal } = await params;
  const locale = localeFromPath(path);
  const page = getLegalPage(legal);
  if (!locale || !page) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const substitutions = { ...legalParams(), app: t("app.name") };
  const missing = missingOperatorDetails();

  return (
    <>
      <PageHeader
        width="prose"
        breadcrumbLabel={t("a11y.breadcrumb")}
        trail={[
          { name: t("nav.home"), path: localeHome(code) },
          { name: t(page.titleKey), path: legalPath(LOCALES[code].path, page.slug) },
        ]}
        visual={legalVisual(page.slug)}
        title={t(page.titleKey)}
        description={t(page.introKey, substitutions)}
      >
        <p className="mt-3 text-xs font-medium text-muted">
          {t("legal.updated", { date: page.updated })}
        </p>
      </PageHeader>
      <div className="container-prose pb-12 sm:pb-16">
        {missing.length > 0 ? (
          // A placeholder that reads like a real company is the kind of thing
          // that ships by accident, so an unfilled page says so on its face.
          <aside
            role="note"
            className="mb-8 rounded-sm border border-border bg-surface-muted p-4"
          >
            <p className="text-sm font-semibold text-heading">
              {t("legal.unconfigured.title")}
            </p>
            <p className="mt-2 text-sm text-muted">{t("legal.unconfigured.body")}</p>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              {missing.map((field) => (
                <li key={field} className="text-sm text-muted">
                  {t(`legal.unconfigured.${field}`)}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        {page.sections.map((section) => (
          <Section
            key={section.titleKey}
            section={section}
            t={t}
            params={substitutions}
          />
        ))}

        <nav aria-labelledby="legal-see-also" className="mt-10 border-t border-border pt-6">
          <h2 id="legal-see-also" className="text-sm font-semibold text-heading">
            {t("legal.seeAlso")}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_PAGES.filter((other) => other.slug !== page.slug).map((other) => (
              <li key={other.slug}>
                <Link
                  href={legalPath(LOCALES[code].path, other.slug)}
                  className="text-sm text-muted hover:text-primary"
                >
                  {t(other.titleKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <AdSlot slot="legal-bottom" placement="leaderboard" />

        <JsonLd
          data={webPageSchema({
            type: page.slug === "about" ? "AboutPage" : page.slug === "contact" ? "ContactPage" : "WebPage",
            name: t(page.titleKey),
            description: t(page.descKey, { app: t("app.name") }),
            path: legalPath(LOCALES[code].path, page.slug),
            locale: code,
          })}
        />
      </div>
    </>
  );
}
