import { BookOpen, CircleHelp, Globe2, Lightbulb } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Accordion } from "@/components/ui/Accordion";
import { AdSlot } from "@/components/ui/AdSlot";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { CalculatorCard, CardGrid } from "@/components/ui/ContentCard";
import { CountryBadge } from "@/components/ui/CountryBadge";
import { CTABanner } from "@/components/ui/CTABanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader, ViewAllLink } from "@/components/ui/SectionHeader";
import type { CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";
import { ADS_ENABLED } from "@/lib/ads";
import { faqSchema, jsonLd, webApplicationSchema, webPageSchema } from "@/lib/seo";
import type { Visual } from "@/lib/visuals";

/**
 * The template every calculator, converter and tool page follows:
 *
 *   Breadcrumb → title and intro → the calculator card →
 *   How it works / formula → FAQ → ad → guides → other countries → related grid →
 *   call to action
 *
 * with an ad rail beside the content on desktop that moves below it on
 * phones. New tool-like pages should use this rather than laying out their
 * own, so they all read as one product.
 */

export type RelatedItem = {
  key: string;
  href: string;
  title: string;
  description?: string;
  visual?: Visual;
};

export function DetailPage({
  trail,
  breadcrumbLabel,
  header,
  children,
  adPrefix,
  howItWorks,
  faq,
  guides,
  elsewhere,
  related,
  cta,
  locale,
  appCategory,
  schema = "application",
  rail = true,
  ads = true,
  canonicalPath,
  sources,
}: {
  trail: Crumb[];
  /** For the structured data: the page's locale. */
  locale: LocaleCode;
  /** schema.org application category, e.g. "FinanceApplication". */
  appCategory?: string;
  /** "page" for reference material (tables), which is not an application. */
  schema?: "application" | "page";
  /**
   * The ad beside the content on desktop. false gives the content the full
   * width (the tools, whose inputs sit four to a row) and shows that ad as a
   * horizontal banner below the content instead.
   */
  rail?: boolean;
  /** Exclude models without source coverage and avoid reserving an empty rail. */
  ads?: boolean;
  /** Search identity for a usable alias of an otherwise identical tool. */
  canonicalPath?: string;
  /** Source URLs already rendered in the explanation, also described in JSON-LD. */
  sources?: readonly string[];
  breadcrumbLabel: string;
  header: {
    title: string;
    description?: string;
    eyebrow?: string;
    visual?: Visual;
    /** Extra lines under the intro, e.g. a country note. */
    note?: ReactNode;
  };
  /** The calculator card itself. */
  children: ReactNode;
  /** Ad unit prefix, e.g. "calculator" gives calculator-mid, calculator-rail. */
  adPrefix: string;
  howItWorks?: { title: string; body: ReactNode };
  faq?: { title: string; items: { id: string; question: string; answer: string }[] };
  /** The guides that explain this page (see lib/guide-links). */
  guides?: { title: string; items: RelatedItem[] };
  /** A country tool: the same tool for the other countries that have it. */
  elsewhere?: { title: string; items: { key: string; href: string; label: string; country: CountryCode }[] };
  related?: { title: string; items: RelatedItem[]; viewAll?: { href: string; label: string } };
  cta: { title: string; body: string; cta: string; href: string };
}) {
  // Compact references and converters use one position after their content.
  // Their utility does not justify the full calculator rail + inline layout.
  const singleAd = adPrefix === "chart" || adPrefix.startsWith("converter");
  const showRail = ADS_ENABLED && ads && rail && !singleAd;
  return (
    <div data-detail-page>
      <PageHeader
        width="page"
        trail={trail}
        breadcrumbLabel={breadcrumbLabel}
        visual={header.visual}
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      >
        {header.note}
      </PageHeader>
      <div className="container-page pb-12 sm:pb-16">
        <div className={showRail ? "ad-rail-layout grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" : ""}>
          <div data-detail-content className="min-w-0 space-y-6">
            {children}

            {howItWorks ? (
              <ContentSection icon={<Lightbulb className="h-5 w-5" />} tone="amber" title={howItWorks.title}>
                {howItWorks.body}
              </ContentSection>
            ) : null}

            {faq?.items.length ? (
              <ContentSection icon={<CircleHelp className="h-5 w-5" />} tone="violet" title={faq.title}>
                <Accordion
                  items={faq.items.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))}
                />
              </ContentSection>
            ) : null}

            {ads ? <AdSlot slot={`${adPrefix}-mid`} placement="leaderboard" /> : null}

            {guides?.items.length ? (
              <div data-print-exclude>
              <ContentSection icon={<BookOpen className="h-5 w-5" />} tone="teal" title={guides.title}>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {guides.items.map((item) => (
                    <li key={item.key}>
                      <CalculatorCard href={item.href} visual={item.visual} title={item.title} description={item.description} />
                    </li>
                  ))}
                </ul>
              </ContentSection>
              </div>
            ) : null}

            {elsewhere?.items.length ? (
              <div data-print-exclude>
              <ContentSection icon={<Globe2 className="h-5 w-5" />} tone="blue" title={elsewhere.title}>
                <ul className="flex flex-wrap gap-2">
                  {elsewhere.items.map((item) => (
                    <li key={item.key}>
                      <Link href={item.href} className="chip chip-outline">
                        <CountryBadge code={item.country} />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </ContentSection>
              </div>
            ) : null}
          </div>

          {showRail ? (
            <aside className="ad-rail-col min-w-0">
              {/* Scroll with the page so the full creative remains reachable on short screens. */}
              <div className="hidden lg:block">
                <AdSlot slot={`${adPrefix}-rail`} placement="rail" className="!mt-0" />
              </div>
              <AdSlot slot={`${adPrefix}-rail`} placement="rectangle" className="lg:hidden" />
            </aside>
          ) : null}
        </div>

        {ADS_ENABLED && ads && !rail && !singleAd ? <AdSlot slot={`${adPrefix}-rail`} placement="leaderboard" /> : null}

        {related?.items.length ? (
          <section data-print-exclude className="section-gap">
            <SectionHeader
              title={related.title}
              action={related.viewAll ? <ViewAllLink href={related.viewAll.href} label={related.viewAll.label} /> : undefined}
            />
            <CardGrid columns={3}>
              {related.items.map((item) => (
                <li key={item.key}>
                  <CalculatorCard href={item.href} visual={item.visual} title={item.title} description={item.description} />
                </li>
              ))}
            </CardGrid>
          </section>
        ) : null}

        <div data-print-exclude><CTABanner className="mt-16 lg:mt-20" {...cta} /></div>

        {/* What the page is, and the questions it answers, for search and answer engines. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              schema === "page"
                ? webPageSchema({
                    name: header.title,
                    description: header.description ?? header.title,
                    path: canonicalPath ?? trail[trail.length - 1]?.path ?? "/",
                    locale,
                  })
                : webApplicationSchema({
                    name: header.title,
                    description: header.description ?? header.title,
                    path: canonicalPath ?? trail[trail.length - 1]?.path ?? "/",
                    locale,
                    category: appCategory,
                    sources,
                  }),
            ),
          }}
        />
        {faq?.items.length ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(faq.items, locale)) }}
          />
        ) : null}
      </div>
    </div>
  );
}

/** A white card section with a coloured icon beside its heading. */
export function ContentSection({
  icon,
  tone,
  title,
  children,
}: {
  icon: ReactNode;
  tone: Visual["tone"];
  title: string;
  children: ReactNode;
}) {
  return (
    <section data-reveal="up" className="card p-5 sm:p-7">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
        <span aria-hidden className={`tile tone-${tone} h-9 w-9 rounded-md`}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
