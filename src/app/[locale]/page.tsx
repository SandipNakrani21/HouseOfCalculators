import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { CountryMarquee, type CountryChip } from "@/components/home/CountryMarquee";
import { DeviceMockup } from "@/components/home/DeviceMockup";
import { GuideArt } from "@/components/home/GuideArt";
import { AdSlot } from "@/components/ui/AdSlot";
import { Badge } from "@/components/ui/Badge";
import { BlogCard } from "@/components/ui/BlogCard";
import { ButtonLink } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { CTABanner } from "@/components/ui/CTABanner";
import { FeatureItem } from "@/components/ui/FeatureItem";
import { Glow } from "@/components/ui/Glow";
import { Hero } from "@/components/ui/Hero";
import { PackIcon, type PackIconName } from "@/components/ui/PackIcon";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader, ViewAllLink } from "@/components/ui/SectionHeader";
import { StatsStrip } from "@/components/ui/StatCard";
import { CALCULATORS, calculatorsFor } from "@/config/calculators";
import { categoryKey, sectionKey, type CalculatorCategory, type Section } from "@/config/categories";
import { CONVERTERS } from "@/config/converters/definitions";
import { COUNTRIES, COUNTRY_CODES } from "@/config/countries";
import { localeFromPath } from "@/config/locales";
import { TOOLS } from "@/config/tools/definitions";
import { allContent, type ContentItem } from "@/lib/content";
import { createFormatter } from "@/lib/format";
import { createTranslator, plural } from "@/lib/i18n";
import { categoryPath, countryPath, sectionPath } from "@/lib/routes";
import { jsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import type { IconName, Tone, Visual } from "@/lib/visuals";
import { calculatorsCta } from "@/lib/cta";

/*
 * The landing page, assembled only from the shared components in
 * components/ui (plus the three homepage illustrations). Section order follows
 * the design: hero, stats, categories, popular, more ways, why choose,
 * countries, guides, call to action.
 */

/** The six calculators the popular grid shows, with their icon-pack artwork. */
/**
 * Where each card of a 3 × 2 grid enters from, and how long after the first:
 * the top row drops in from above (left, centre, right), the bottom row rises
 * from below. Shared by the category and popular grids so both move alike.
 */
const GRID_REVEAL: { from: string; delay: number }[] = [
  { from: "top-left", delay: 0 },
  { from: "top", delay: 80 },
  { from: "top-right", delay: 160 },
  { from: "bottom-left", delay: 100 },
  { from: "bottom", delay: 180 },
  { from: "bottom-right", delay: 260 },
];

const POPULAR: { id: string; pack: PackIconName }[] = [
  { id: "calculator:loan", pack: "coins" },
  { id: "calculator:bmi", pack: "health_heart" },
  { id: "tool:age", pack: "calendar" },
  { id: "calculator:vat", pack: "gst" },
  { id: "calculator:sip", pack: "chart" },
  { id: "tool:percentage", pack: "percent" },
];

/** The six categories the landing page features (all eight are one click away). */
const CATEGORIES: { category: CalculatorCategory; pack: PackIconName }[] = [
  { category: "finance", pack: "coins" },
  { category: "math", pack: "math" },
  { category: "health", pack: "health_heart" },
  { category: "business", pack: "chart" },
  { category: "education", pack: "graduation" },
  { category: "engineering", pack: "gear" },
];

/** The "Popular" quick links under the hero search. */
const CHIPS: { key: string; id: string }[] = [
  { key: "loan", id: "calculator:loan" },
  { key: "bmi", id: "calculator:bmi" },
  { key: "age", id: "tool:age" },
  { key: "percentage", id: "tool:percentage" },
  { key: "sip", id: "calculator:sip" },
  { key: "mortgage", id: "calculator:mortgage" },
];


/** Guide cards, with the subject colour and background glyph for each thumbnail. */
const GUIDE_CARDS: { id: string; tone: Tone; icon: IconName; pack: PackIconName; glyph: string }[] = [
  { id: "guide:how-to-calculate-loan-payment", tone: "blue", icon: "Landmark", pack: "calculator", glyph: "EMI" },
  { id: "guide:what-is-compound-interest", tone: "green", icon: "TrendingUp", pack: "chart", glyph: "%+" },
  { id: "guide:how-to-calculate-percentage", tone: "violet", icon: "Percent", pack: "percent", glyph: "%" },
];

/** "More ways to calculate": four sections (guides have their own section below). */
const MORE_SECTIONS: { section: Section; pack: PackIconName }[] = [
  { section: "converters", pack: "currency_exchange" },
  { section: "tools", pack: "sync" },
  { section: "charts", pack: "analytics" },
  { section: "countries", pack: "globe" },
];

/** The "Why choose" points, in the order the design lists them. */
const WHY: { key: string; visual: Visual; pack: PackIconName }[] = [
  { key: "fast", visual: { icon: "Zap", tone: "amber" }, pack: "bolt" },
  { key: "free", visual: { icon: "ShieldCheck", tone: "green" }, pack: "shield_check" },
  { key: "global", visual: { icon: "Globe", tone: "blue" }, pack: "globe" },
  { key: "device", visual: { icon: "Smartphone", tone: "violet" }, pack: "phone" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: path } = await params;
  const locale = localeFromPath(path);
  if (!locale) notFound();

  const t = createTranslator(locale.language, locale.code);
  const code = locale.code;
  const country = locale.defaultCountry;
  const fmt = createFormatter(country, locale.language, t);

  const items = allContent({
    locale: code,
    country,
    t,
    calcContext: { countryCode: country, country: COUNTRIES[country], t, fmt },
  });
  const byId = new Map<string, ContentItem>(items.map((item) => [item.id, item]));
  const popular = POPULAR.flatMap(({ id, pack }) => {
    const item = byId.get(id);
    return item ? [{ item, pack }] : [];
  });
  const chips = CHIPS.flatMap((chip) => {
    const item = byId.get(chip.id);
    return item ? [{ key: chip.key, label: t(`home.chip.${chip.key}`), href: item.href }] : [];
  });

  // Every figure is counted from the registries, so none can drift from the truth.
  // Every country, for the floating flag rows: in the locale's alphabetical
  // order, split into two rows that drift in opposite directions.
  const countryChips: CountryChip[] = COUNTRY_CODES.map((each) => {
    const tools = calculatorsFor(each).filter((calc) => calc.isCountrySpecific).length;
    const { symbol, code: iso } = COUNTRIES[each].currency;
    return {
      code: each,
      name: t(`country.${each}`),
      href: countryPath(code, each),
      currency: symbol === iso ? iso : `${symbol} ${iso}`,
      tools: plural(t, fmt.locale, "home.world.tools", tools, { display: fmt.number(tools) }),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, code));
  const countryRows = [countryChips];

  const counts = {
    calculators: CALCULATORS.length,
    tools: TOOLS.length + CONVERTERS.length,
    countries: COUNTRY_CODES.length,
  };

  return (
    <>
      <Hero
        badge={
          <Badge variant="outline" size="lg" icon={<Globe />}>
            {t("home.hero.badge", counts)}
          </Badge>
        }
        line1={t("home.hero.line1")}
        line2={t("home.hero.line2")}
        lead={t("home.hero.subtitle")}
        video={{ src: "/videos/hero-720.mp4", mobileSrc: "/videos/hero-360.mp4", poster: "/videos/hero-poster.webp" }}
      >
        <SearchBar popularLabel={t("home.hero.popular")} chips={chips} centered />
      </Hero>

      <div className="container-page">
        <div className="mt-6">
          <StatsStrip
            label={t("home.sections.title")}
            stats={[
              { icon: "Calculator", tone: "blue", pack: "calculator", value: counts.calculators, label: t("home.stats.calculators") },
              { icon: "Wrench", tone: "violet", pack: "gear", value: counts.tools, label: t("home.stats.tools") },
              { icon: "Globe", tone: "sky", pack: "globe", value: counts.countries, label: t("home.stats.countries") },
              { icon: "HeartHandshake", tone: "green", pack: "heart", value: 100, suffix: "%", label: t("home.stats.free") },
            ]}
          />
        </div>

        <AdSlot slot="home-top" placement="leaderboard" />

        {/* ------------------------------------------------------ categories */}
        <section className="section-gap relative isolate">
          <Glow tone="violet" className="-start-56 top-24" />
          <Glow tone="teal" className="-end-56 bottom-0" size={360} delay={6000} />
          <SectionHeader
            title={t("home.categories.title")}
            action={<ViewAllLink href={sectionPath(code, "calculators")} label={t("home.categories.viewAll")} />}
          />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {CATEGORIES.map(({ category, pack }, index) => (
              <RevealCard
                key={category}
                index={index}
                href={categoryPath(code, "calculators", category)}
                media={<PackIcon name={pack} size={56} />}
                title={t(categoryKey("calculators", category))}
                description={t(`home.cat.${category}.examples`)}
              />
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------------- popular */}
        <section className="section-gap relative isolate">
          <Glow tone="blue" className="-end-48 top-16" delay={3000} />
          <SectionHeader
            title={t("home.popular.title")}
            action={<ViewAllLink href={sectionPath(code, "calculators")} label={t("home.popular.viewAll")} />}
          />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {popular.map(({ item, pack }, index) => (
              <RevealCard
                key={item.id}
                index={index}
                href={item.href}
                media={<PackIcon name={pack} size={56} />}
                title={item.title}
                description={item.description}
              />
            ))}
          </ul>
        </section>

        <AdSlot slot="home-mid" placement="leaderboard" />

        {/* ------------------------------------------------------- more ways */}
        <section className="section-gap relative isolate">
          <Glow tone="pink" className="-start-48 top-10" size={380} delay={9000} />
          <SectionHeader title={t("home.more.title")} description={t("home.more.subtitle")} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 [&_a:hover>span:first-child]:scale-105">
            {MORE_SECTIONS.map(({ section, pack }, index) => (
              <li
                key={section}
                data-reveal="right"
                data-reveal-once
                className="grid-reveal"
                style={{ "--delay": `${index * 80}ms` } as CSSProperties}
              >
                <ContentCard
                  layout="stack"
                  href={sectionPath(code, section)}
                  media={<PackIcon name={pack} size={64} />}
                  title={t(sectionKey(section))}
                  description={t(`section.${section}.desc`)}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------------ why choose */}
        {/* A black panel inside the page container: top-right and bottom-left
            rounded, the other two corners square. */}
        <section className="relative isolate mt-20 overflow-hidden rounded-tr-xl rounded-bl-xl bg-black">
          <Glow tone="indigo" className="-end-40 -top-20" size={460} delay={5000} />
          <div className="grid grid-cols-1 items-center gap-14 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:py-24">
            {/* Light text on the black band: headings white, body a soft
                grey-white. Scoped to this column so the device mockup keeps its
                own colours. */}
            <div className="[--heading:#fff] [--muted:var(--color-on-navy-muted)]">
              <div data-reveal="up">
                <p className="text-base font-semibold text-primary">{t("home.why.eyebrow")}</p>
                <h2 className="mt-1 text-h2">{t("home.why.heading", { app: t("app.name") })}</h2>
              </div>
              <ul data-reveal="stagger" className="mt-10 grid gap-8 sm:grid-cols-2">
                {WHY.map((point) => (
                  <li key={point.key}>
                    <FeatureItem
                      visual={point.visual}
                      media={<PackIcon name={point.pack} size={56} />}
                      title={t(`home.why.${point.key}.title`, { count: counts.countries })}
                      text={t(`home.why.${point.key}.body`)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal="right">
              <DeviceMockup
                appName={t("app.name")}
                titleLines={[t("home.device.title.1"), t("home.device.title.2")]}
                searchLabel={t("home.device.search")}
                fields={[t("home.device.loanAmount"), t("home.device.rate"), t("home.device.tenure")]}
                buttonLabel={t("home.device.button")}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- countries */}
        <section className="section-gap relative isolate">
          <Glow tone="sky" className="-end-40 top-0" delay={4000} />
          <Glow tone="green" className="-start-48 bottom-0" size={340} delay={12000} />
          <SectionHeader
            title={t("home.world.title")}
            description={t("home.world.subtitle", { count: counts.countries })}
            action={
              <ButtonLink href={sectionPath(code, "countries")} variant="outline" size="md">
                {t("home.world.button")}
              </ButtonLink>
            }
          />
          {/* Full-bleed: the flag rows float across the whole width of the
              window, out of the page container (main clips the overflow). */}
          <div className="mx-[calc(50%-50vw)] mt-2">
            <CountryMarquee
              rows={countryRows}
              labels={{
                currency: t("home.world.currency"),
                tools: t("home.world.toolsLabel"),
                view: t("home.world.view"),
              }}
            />
          </div>
        </section>

        <AdSlot slot="home-bottom" placement="leaderboard" />

        {/* ---------------------------------------------------------- guides */}
        <section className="section-gap relative isolate">
          <Glow tone="amber" className="-start-40 top-20" size={360} delay={7000} />
          <SectionHeader
            title={t("home.guides.title")}
            action={<ViewAllLink href={sectionPath(code, "guides")} label={t("home.guides.viewAll")} />}
          />
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {GUIDE_CARDS.map((card, index) => {
              const guide = byId.get(card.id);
              if (!guide) return null;
              return (
                <li
                  key={card.id}
                  data-reveal="left"
                  data-reveal-once
                  className="grid-reveal"
                  style={{ "--delay": `${index * 100}ms` } as CSSProperties}
                >
                  <BlogCard
                    href={guide.href}
                    image={<GuideArt icon={card.icon} pack={card.pack} tone={card.tone} glyph={card.glyph} />}
                    tag={t(categoryKey("guides", guide.category))}
                    tone={card.tone}
                    title={guide.title}
                    readMore={t("home.guides.read")}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <CTABanner
          className="mt-20"
          {...calculatorsCta(t, code)}
        />
      </div>

      {/* Site-wide structured data: who publishes the site, and its search. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema(code)) }} />
    </>
  );
}

/**
 * A tall linked card for the homepage's 3 × 2 grids (categories, popular):
 * icon in a soft circle, title, description, arrow. It enters once as the
 * grid scrolls into view, from the side GRID_REVEAL gives its position, with
 * a short stagger; below lg it simply rises (.grid-reveal). Hover (lift,
 * shadow, blue border, icon and arrow nudge) is on the inner link, so it never
 * fights the entrance transform on the list item.
 */
function RevealCard({
  index,
  href,
  media,
  title,
  description,
}: {
  index: number;
  href: string;
  media: ReactNode;
  title: string;
  description?: string;
}) {
  const motion = GRID_REVEAL[index % GRID_REVEAL.length];
  return (
    <li
      data-reveal={motion.from}
      data-reveal-once
      className="grid-reveal"
      style={{ "--delay": `${motion.delay}ms` } as CSSProperties}
    >
      <Link
        href={href}
        className="card card-link group flex h-full items-start gap-5 p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-[13rem] sm:gap-6 sm:p-8"
      >
        <span className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-full bg-primary-light ring-1 ring-primary/10 transition-transform duration-300 ease-premium group-hover:scale-105 sm:h-20 sm:w-20">
          {media}
        </span>
        <span className="flex min-w-0 flex-1 flex-col self-stretch">
          <span className="text-lg font-bold leading-snug text-heading transition-colors group-hover:text-primary sm:text-xl">
            {title}
          </span>
          {description ? (
            <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{description}</span>
          ) : null}
          <span className="mt-auto pt-5">
            <ArrowRight aria-hidden className="card-arrow h-5 w-5 text-primary" />
          </span>
        </span>
      </Link>
    </li>
  );
}
