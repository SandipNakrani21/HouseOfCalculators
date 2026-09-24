import { ArrowRight, Calculator, Globe, HeartHandshake, Wrench } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { AdSlot } from "@/components/ads/AdSlot";
import { DeviceMockup } from "@/components/home/DeviceMockup";
import { GuideArt } from "@/components/home/GuideArt";
import { HeroArt } from "@/components/home/HeroArt";
import { CountUp } from "@/components/motion/CountUp";
import { SearchBox } from "@/components/search/SearchBox";
import {
  CardGrid,
  ContentCard,
  SectionHeading,
  ViewAllLink,
} from "@/components/shared/ContentCard";
import { CountryBadge } from "@/components/shared/CountryBadge";
import { IconTile } from "@/components/shared/Icon";
import { CALCULATORS } from "@/config/calculators";
import {
  CALCULATOR_CATEGORIES,
  categoryKey,
  sectionKey,
  type Section,
} from "@/config/categories";
import { CONVERTERS } from "@/config/converters/definitions";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/config/countries";
import { localeFromPath } from "@/config/locales";
import { TOOLS } from "@/config/tools/definitions";
import { ADS_ENABLED } from "@/lib/ads";
import { allContent, type ContentItem } from "@/lib/content";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { categoryPath, countryPath, sectionPath } from "@/lib/routes";
import { categoryVisual, sectionVisual, type IconName, type Tone } from "@/lib/visuals";

/** The calculators and tools the hero chips and the popular grid point at. */
const POPULAR_IDS = [
  "calculator:loan",
  "calculator:bmi",
  "tool:age",
  "calculator:vat",
  "calculator:sip",
  "tool:percentage",
  "converter:length",
  "calculator:mortgage",
];

const CHIPS: { key: string; id: string }[] = [
  { key: "loan", id: "calculator:loan" },
  { key: "bmi", id: "calculator:bmi" },
  { key: "age", id: "tool:age" },
  { key: "percentage", id: "tool:percentage" },
  { key: "sip", id: "calculator:sip" },
  { key: "mortgage", id: "calculator:mortgage" },
  { key: "discount", id: "calculator:discount" },
  { key: "bmr", id: "calculator:bmr" },
];

const WORLD: CountryCode[] = ["in", "us", "gb", "ca", "au", "ae", "de", "fr", "es", "br", "jp"];

/** Guide cards, with the subject colour and background glyph for each thumbnail. */
const GUIDE_CARDS: { id: string; tone: Tone; icon: IconName; glyph: string }[] = [
  { id: "guide:how-to-calculate-loan-payment", tone: "blue", icon: "Landmark", glyph: "EMI" },
  { id: "guide:what-is-compound-interest", tone: "green", icon: "TrendingUp", glyph: "%+" },
  { id: "guide:how-to-calculate-percentage", tone: "violet", icon: "Percent", glyph: "%" },
];

const MORE_SECTIONS: Section[] = ["converters", "tools", "charts", "guides", "countries"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: path } = await params;
  const locale = localeFromPath(path);
  if (!locale) notFound();

  const t = createTranslator(locale.language);
  const code = locale.code;
  const country = locale.defaultCountry;
  const fmt = createFormatter(country, locale.language);

  const items = allContent({
    locale: code,
    country,
    t,
    calcContext: { countryCode: country, country: COUNTRIES[country], t, fmt },
  });
  const byId = new Map<string, ContentItem>(items.map((item) => [item.id, item]));
  const pick = (ids: string[]) =>
    ids.map((id) => byId.get(id)).filter((item): item is ContentItem => Boolean(item));

  const popular = pick(POPULAR_IDS);
  const chips = CHIPS.map((chip) => ({ ...chip, item: byId.get(chip.id) })).filter(
    (chip) => chip.item,
  );

  // Every figure is counted from the registries, so none can drift from the truth.
  const counts = {
    calculators: CALCULATORS.length,
    tools: TOOLS.length + CONVERTERS.length,
    countries: COUNTRY_CODES.length,
  };

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-8 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-12">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface px-3 py-1.5 text-xs font-semibold text-primary shadow-[var(--shadow-card)]">
              <Globe aria-hidden className="h-3.5 w-3.5" />
              {t("home.hero.badge", counts)}
            </p>

            <h1 className="animate-rise mt-5 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[64px]">
              {t("home.hero.line1")}
              <span className="block bg-gradient-to-r from-primary to-[#3b82f6] bg-clip-text text-transparent">
                {t("home.hero.line2")}
              </span>
            </h1>

            <p
              className="animate-fade-up mt-5 text-lg font-semibold text-heading sm:text-xl"
              style={{ "--delay": "120ms" } as CSSProperties}
            >
              {t("home.hero.tagline")}
            </p>
            <p
              className="animate-fade-up mt-3 max-w-xl text-[15px] leading-relaxed text-muted"
              style={{ "--delay": "180ms" } as CSSProperties}
            >
              {t("home.hero.body")}
            </p>

            <div
              className="animate-fade-up relative z-10 mt-7 max-w-xl"
              style={{ "--delay": "240ms" } as CSSProperties}
            >
              <SearchBox variant="hero" />
            </div>

            <div
              className="animate-fade-up mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm"
              style={{ "--delay": "300ms" } as CSSProperties}
            >
              <span className="me-2 font-bold text-heading">{t("home.hero.popular")}</span>
              {chips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.item!.href}
                  className="rounded-full px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary-soft"
                >
                  {t(`home.chip.${chip.key}`)}
                </Link>
              ))}
            </div>
          </div>

          <div className="animate-fade-up" style={{ "--delay": "150ms" } as CSSProperties}>
            <HeroArt
              title={t("home.hero.art.title")}
              subtitle={t("home.hero.art.subtitle")}
              scriptLines={[t("home.hero.script.1"), t("home.hero.script.2")]}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AdSlot slot="home-top" placement="leaderboard" />

        {/* ---------------------------------------------------------- stats */}
        <section
          data-reveal="up"
          aria-label={t("home.sections.title")}
          className="card mt-6 grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x rtl:lg:divide-x-reverse"
        >
          {[
            { icon: Calculator, value: counts.calculators, label: t("home.stats.calculators"), tone: "blue" },
            { icon: Wrench, value: counts.tools, label: t("home.stats.tools"), tone: "violet" },
            { icon: Globe, value: counts.countries, label: t("home.stats.countries"), tone: "sky" },
            { icon: HeartHandshake, value: 100, suffix: "%", label: t("home.stats.free"), tone: "green" },
          ].map(({ icon: StatIcon, value, suffix, label, tone }) => (
            <div key={label} className="group flex flex-col items-center gap-2 px-4 py-6 text-center">
              <span className={`tile tone-${tone} h-12 w-12 rounded-2xl group-hover:scale-110`}>
                <StatIcon aria-hidden className="h-6 w-6" />
              </span>
              <CountUp
                value={value}
                suffix={suffix}
                className="text-2xl font-extrabold text-heading sm:text-[28px]"
              />
              <span className="text-sm font-medium text-muted">{label}</span>
            </div>
          ))}
        </section>

        {/* ----------------------------------------------------- categories */}
        <section className="pt-16">
          <SectionHeading
            title={t("home.categories.title")}
            action={
              <ViewAllLink
                href={sectionPath(code, "calculators")}
                label={t("home.categories.viewAll")}
              />
            }
          />
          <CardGrid columns={4} dense>
            {CALCULATOR_CATEGORIES.map((category) => (
              <li key={category}>
                <ContentCard
                  layout="adaptive"
                  href={categoryPath(code, "calculators", category)}
                  visual={categoryVisual("calculators", category)}
                  title={t(categoryKey("calculators", category))}
                  description={t(`home.cat.${category}.examples`)}
                />
              </li>
            ))}
          </CardGrid>
        </section>

        <AdSlot slot="home-mid" placement="leaderboard" />

        {/* -------------------------------------------------------- popular */}
        <section className="pt-16">
          <SectionHeading
            title={t("home.popular.title")}
            action={
              <ViewAllLink
                href={sectionPath(code, "calculators")}
                label={t("home.popular.viewAll")}
              />
            }
          />
          <div className={ADS_ENABLED ? "grid gap-6 xl:grid-cols-[1fr_300px]" : ""}>
            <CardGrid columns={4} dense>
              {popular.map((item) => (
                <li key={item.id}>
                  <ContentCard
                    layout="adaptive"
                    href={item.href}
                    visual={item.visual}
                    title={item.title}
                    description={item.description}
                  />
                </li>
              ))}
            </CardGrid>
            {ADS_ENABLED ? (
              <aside className="hidden xl:block">
                <AdSlot slot="home-rail" placement="inline" />
              </aside>
            ) : null}
          </div>
        </section>

        {/* ------------------------------------------------------ more ways */}
        <section className="pt-16">
          <SectionHeading title={t("home.more.title")} description={t("home.more.subtitle")} />
          <ul data-reveal="stagger" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {MORE_SECTIONS.map((section) => (
              <li key={section}>
                <ContentCard
                  layout="stack"
                  href={sectionPath(code, section)}
                  visual={sectionVisual(section)}
                  title={t(sectionKey(section))}
                  description={t(`section.${section}.desc`)}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ------------------------------------------------------ why choose */}
      <section className="mt-20 border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <div data-reveal="up">
              <p className="text-base font-semibold text-muted">{t("home.why.eyebrow")}</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-[40px]">
                {t("home.why.heading", { app: t("app.name") })}
              </h2>
            </div>
            <ul data-reveal="stagger" className="mt-8 grid gap-6 sm:grid-cols-2">
              {(
                [
                  { key: "fast", icon: "Zap", tone: "amber" },
                  { key: "free", icon: "ShieldCheck", tone: "green" },
                  { key: "global", icon: "Globe", tone: "blue" },
                  { key: "device", icon: "Smartphone", tone: "violet" },
                ] as const
              ).map((point) => (
                <li key={point.key} className="group flex gap-4">
                  <IconTile
                    visual={{ icon: point.icon, tone: point.tone }}
                    size="lg"
                    className="group-hover:scale-110"
                  />
                  <div>
                    <h3 className="text-base font-bold">
                      {t(`home.why.${point.key}.title`, { count: counts.countries })}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {t(`home.why.${point.key}.body`)}
                    </p>
                  </div>
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AdSlot slot="home-bottom" placement="leaderboard" />

        {/* -------------------------------------------------------- countries */}
        <section className="pt-16">
          <div data-reveal="up" className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-[32px]">
                {t("home.world.title")}
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-[15px]">
                {t("home.world.subtitle", { count: counts.countries })}
              </p>
            </div>
            <Link
              href={sectionPath(code, "countries")}
              className="rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {t("home.world.button")}
            </Link>
          </div>

          <ul data-reveal="stagger" className="grid grid-cols-4 gap-y-6 sm:grid-cols-6 lg:grid-cols-12">
            {WORLD.map((item) => (
              <li key={item}>
                <Link
                  href={countryPath(code, item)}
                  className="group flex flex-col items-center gap-2 text-center"
                >
                  <CountryBadge
                    code={item}
                    size="xl"
                    className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[var(--shadow-lift)]"
                  />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                    {t(`country.${item}`)}
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={sectionPath(code, "countries")}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-lg font-extrabold text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  •••
                </span>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                  {t("home.world.more")}
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* ----------------------------------------------------------- guides */}
        <section className="pt-20">
          <SectionHeading
            title={t("home.guides.title")}
            action={
              <ViewAllLink href={sectionPath(code, "guides")} label={t("home.guides.viewAll")} />
            }
          />
          <ul data-reveal="stagger" className="grid gap-5 md:grid-cols-3">
            {GUIDE_CARDS.map((card) => {
              const guide = byId.get(card.id);
              if (!guide) return null;
              return (
                <li key={card.id}>
                  <Link
                    href={guide.href}
                    className="card card-link group flex h-full gap-4 p-4"
                  >
                    <div className="w-[42%] shrink-0">
                      <GuideArt icon={card.icon} tone={card.tone} glyph={card.glyph} />
                    </div>
                    <div className="flex min-w-0 flex-col py-1">
                      <span
                        className={`tone-${card.tone} tone-chip w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}
                      >
                        {t(categoryKey("guides", guide.category))}
                      </span>
                      <span className="mt-2 line-clamp-3 text-[15px] font-bold leading-snug text-heading group-hover:text-primary">
                        {guide.title}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary">
                        {t("home.guides.read")}
                        <ArrowRight aria-hidden className="card-arrow h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* -------------------------------------------------------------- cta */}
        <section
          data-reveal="scale"
          className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] px-6 py-10 text-white shadow-[var(--shadow-lift)] sm:px-12"
        >
          <div aria-hidden className="absolute -end-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/10" />
          <div aria-hidden className="absolute -bottom-20 end-40 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {t("home.cta.title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">{t("home.cta.body")}</p>
            </div>
            <Link
              href={sectionPath(code, "calculators")}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t("home.cta.button")}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </div>

    </>
  );
}
