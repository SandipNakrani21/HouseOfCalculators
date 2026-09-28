import { ArrowRight, Globe, Search } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { FormDemo, OverlayDemo } from "@/components/design-system/InteractiveDemos";
import { GuideArt } from "@/components/home/GuideArt";
import { Accordion } from "@/components/ui/Accordion";
import { AdSlot } from "@/components/ui/AdSlot";
import { Badge } from "@/components/ui/Badge";
import { BlogCard } from "@/components/ui/BlogCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CalculatorCard, CardGrid, CategoryCard } from "@/components/ui/ContentCard";
import { CountryFlagItem } from "@/components/ui/CountryFlagItem";
import { CTABanner } from "@/components/ui/CTABanner";
import { FeatureItem } from "@/components/ui/FeatureItem";
import { IconTile } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader, ViewAllLink } from "@/components/ui/SectionHeader";
import { Skeleton, SkeletonCard, SkeletonImage, SkeletonText } from "@/components/ui/Skeleton";
import { StatsStrip } from "@/components/ui/StatCard";
import { localeFromPath } from "@/config/locales";
import { localeHome } from "@/lib/routes";
import { TONES } from "@/lib/visuals";

/*
 * The living design system: every token and component, rendered by the real
 * code, so this page cannot drift from what the site uses. It is a developer
 * reference - English only, not indexed, not in the sitemap.
 *
 * docs/DESIGN_SYSTEM.md has the rules; this page shows the result.
 */

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const COLORS: { name: string; token: string }[] = [
  { name: "primary", token: "--primary" },
  { name: "primary-dark", token: "--primary-dark" },
  { name: "primary-light", token: "--primary-light" },
  { name: "navy", token: "--navy" },
  { name: "heading", token: "--heading" },
  { name: "text", token: "--text" },
  { name: "muted", token: "--muted" },
  { name: "subtle", token: "--subtle" },
  { name: "border", token: "--border" },
  { name: "bg", token: "--bg" },
  { name: "bg-soft", token: "--bg-soft" },
  { name: "bg-tint", token: "--bg-tint" },
];

const RADII = [
  { name: "sm", value: "8px", className: "rounded-sm" },
  { name: "md", value: "12px", className: "rounded-md" },
  { name: "lg", value: "16px", className: "rounded-lg" },
  { name: "xl", value: "24px", className: "rounded-xl" },
  { name: "pill", value: "999px", className: "rounded-pill" },
];

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

const REVEALS = ["up", "down", "left", "right", "zoom", "fade"] as const;

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: path } = await params;
  const locale = localeFromPath(path);
  const home = locale ? localeHome(locale.code) : "/";
  const here = `${home}/design-system`;

  return (
    <>
      <PageHeader
        width="page"
        breadcrumbLabel="Breadcrumb"
        trail={[
          { name: "Home", path: home },
          { name: "Design system", path: here },
        ]}
        visual={{ icon: "Paintbrush", tone: "violet" }}
        eyebrow="Reference"
        title="Design system"
        description="Every token and component the site is built from, rendered by the production code. New pages and features use these, not one-off styles."
      />
      <div className="container-page pb-12 sm:pb-16">
        <nav aria-label="Sections" className="mb-12 flex flex-wrap gap-2">
          {["Colours", "Typography", "Spacing", "Buttons", "Badges", "Cards", "Sections", "Forms", "Overlays", "Feedback", "Motion", "Ads"].map(
            (name) => (
              <a key={name} href={`#${name.toLowerCase()}`} className="chip chip-outline">
                {name}
              </a>
            ),
          )}
        </nav>

        <Block id="colours" title="Colours" note="src/styles/tokens.css. Tailwind names: bg-primary, text-heading, border-border, ...">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {COLORS.map((color) => (
              <li key={color.name} className="card overflow-hidden">
                <span className="block h-16 border-b border-border" style={{ background: `var(${color.token})` }} />
                <span className="block px-3 py-2 text-xs">
                  <span className="block font-bold text-heading">{color.name}</span>
                  <code className="text-muted">{color.token}</code>
                </span>
              </li>
            ))}
          </ul>
          <h3 className="mb-3 mt-8 text-h3">Category accents (tone-*)</h3>
          <ul className="flex flex-wrap gap-4">
            {TONES.map((tone) => (
              <li key={tone} className="flex flex-col items-center gap-1.5 text-xs font-semibold text-muted">
                <IconTile visual={{ icon: "Calculator", tone }} size="lg" />
                {tone}
              </li>
            ))}
          </ul>
          <div className="bg-gradient-cta mt-6 rounded-lg px-5 py-4 text-sm font-semibold text-white">--gradient-cta</div>
        </Block>

        <Block id="typography" title="Typography" note="Plus Jakarta Sans. Fluid sizes: text-display, text-h1, text-h2, text-h3, text-body, text-small.">
          <div className="space-y-4">
            <p className="text-display text-heading">
              Everyday Calculations. <span className="text-gradient">One Global Home.</span>
            </p>
            <p className="text-h1 text-heading">Heading 1: page titles</p>
            <p className="text-h2 text-heading">Heading 2: section titles</p>
            <p className="text-h3 text-heading">Heading 3: card titles</p>
            <p className="text-body max-w-2xl">Body text in the text colour, 15 to 16px with relaxed line height for comfortable reading.</p>
            <p className="text-small text-muted">Small text for hints, captions and meta lines.</p>
          </div>
        </Block>

        <Block id="spacing" title="Spacing, radius, shadow" note="4-based spacing; radius sm/md/lg/xl/pill; shadow-card, shadow-lift.">
          <div className="flex flex-wrap items-end gap-3">
            {SPACING.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1 text-xs text-muted">
                <span className="block rounded-sm bg-primary" style={{ width: size, height: size }} />
                {size}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            {RADII.map((radius) => (
              <div key={radius.name} className={`card grid h-20 w-24 place-items-center text-xs font-semibold text-muted ${radius.className}`}>
                {radius.name} · {radius.value}
              </div>
            ))}
            <div className="grid h-20 w-32 place-items-center rounded-lg bg-surface text-xs font-semibold text-muted shadow-lift">shadow-lift</div>
          </div>
        </Block>

        <Block id="buttons" title="Buttons" note="<Button> / <ButtonLink>: variant primary | outline | ghost | white, size sm | md | lg, icon, iconEnd, square.">
          <div className="space-y-4">
            {(["primary", "outline", "ghost"] as const).map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <Button key={size} variant={variant} size={size} iconEnd={<ArrowRight />}>
                    {variant} {size}
                  </Button>
                ))}
                <Button variant={variant} square aria-label="Search" icon={<Search />} />
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </div>
            ))}
            <div className="bg-gradient-cta flex flex-wrap gap-3 rounded-lg p-5">
              <ButtonLink href={here} variant="white" size="lg" iconEnd={<ArrowRight />}>
                White on blue
              </ButtonLink>
            </div>
          </div>
        </Block>

        <Block id="badges" title="Badges and chips" note="<Badge> soft | tone | outline; .chip for quick links.">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" icon={<Globe />}>
              100+ calculators • 22 countries
            </Badge>
            <Badge>Soft badge</Badge>
            {(["blue", "green", "violet", "orange", "pink", "teal"] as const).map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
            <a href="#badges" className="chip">Quick link</a>
            <a href="#badges" className="chip chip-outline">Outline chip</a>
          </div>
        </Block>

        <Block id="cards" title="Cards" note="CategoryCard, CalculatorCard, BlogCard inside a CardGrid (4 → 2 → 1, staggered).">
          <CardGrid columns={4} dense>
            <li>
              <CategoryCard href={here} visual={{ icon: "Landmark", tone: "blue" }} title="Finance" description="Loans, EMI, SIP, mortgage" />
            </li>
            <li>
              <CategoryCard href={here} visual={{ icon: "HeartPulse", tone: "green" }} title="Health" description="BMI, BMR, calories" />
            </li>
            <li>
              <CategoryCard href={here} visual={{ icon: "Sigma", tone: "violet" }} title="Maths" description="Percent, fractions, stats" />
            </li>
            <li>
              <CategoryCard href={here} visual={{ icon: "Hammer", tone: "orange" }} title="Construction" description="Concrete, paint, tiles" />
            </li>
          </CardGrid>
          <div className="mt-6">
            <CardGrid columns={3}>
              <li>
                <CalculatorCard href={here} visual={{ icon: "Percent", tone: "teal" }} title="Calculator card" description="Small icon, name, one-line description." />
              </li>
              <li className="sm:col-span-1 lg:col-span-2">
                <BlogCard
                  href={here}
                  image={<GuideArt icon="TrendingUp" tone="green" glyph="%+" />}
                  tag="Finance"
                  tone="green"
                  title="Blog card: picture, tag, title, read more"
                  readMore="Read more"
                />
              </li>
            </CardGrid>
          </div>
        </Block>

        <Block id="sections" title="Section pieces" note="SectionHeader, StatsStrip, FeatureItem, CountryFlagItem, CTABanner.">
          <SectionHeader title="Section header" description="Title left, View all right." action={<ViewAllLink href={here} label="View all" />} />
          <StatsStrip
            label="Stats"
            stats={[
              { icon: "Calculator", tone: "blue", value: 120, label: "Calculators" },
              { icon: "Wrench", tone: "violet", value: 40, label: "Tools" },
              { icon: "Globe", tone: "sky", value: 22, label: "Countries" },
              { icon: "HeartHandshake", tone: "green", value: 100, suffix: "%", label: "Free" },
            ]}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <FeatureItem visual={{ icon: "Zap", tone: "amber" }} title="Feature item" text="Icon circle, title and a line of text." />
            <FeatureItem visual={{ icon: "ShieldCheck", tone: "green" }} title="Private by design" text="Every calculation runs in the browser." />
          </div>
          <ul className="mt-8 flex flex-wrap gap-6">
            {(["in", "us", "gb", "de", "jp"] as const).map((code) => (
              <li key={code}>
                <CountryFlagItem href={here} code={code} label={code.toUpperCase()} />
              </li>
            ))}
          </ul>
          <CTABanner className="mt-8" title="CTA banner" body="Blue gradient, heading, one line, a white button." cta="Call to action" href={here} />
        </Block>

        <Block id="forms" title="Forms and results" note="Field, Input, Select, SegmentedControl, Switch, Slider, ResultBox, FactList. Inputs left, result right.">
          <FormDemo />
        </Block>

        <Block id="overlays" title="Tabs, accordion, modal, drawer, toast" note="TabList, Accordion, Modal (dialog | drawer), useToast().">
          <OverlayDemo />
          <div className="card mt-6 p-5">
            <Accordion
              items={[
                { id: "a", question: "Does the accordion work without JavaScript?", answer: "Yes. It is built on <details>, so it opens natively and find-in-page can see inside it." },
                { id: "b", question: "Where is it used?", answer: "Every FAQ: calculator, converter, tool and guide pages." },
              ]}
            />
          </div>
        </Block>

        <Block id="feedback" title="Loading states" note="Skeleton, SkeletonText, SkeletonCard, SkeletonImage; LoadMore via <CardGrid pageSize>.">
          <div className="grid gap-4 sm:grid-cols-3">
            <SkeletonCard />
            <div className="card space-y-3 p-5">
              <SkeletonImage className="aspect-[16/9] w-full" />
              <Skeleton className="h-4 w-1/2" />
              <SkeletonText lines={2} />
            </div>
            <div className="card space-y-3 p-5">
              <Skeleton className="h-10 w-10 !rounded-full" />
              <SkeletonText lines={4} />
            </div>
          </div>
          <div className="mt-6">
            <CardGrid columns={4} dense pageSize={4} loadMoreLabel="Load more">
              {Array.from({ length: 10 }, (_, index) => (
                <li key={index}>
                  <CalculatorCard href={here} visual={{ icon: "Hash", tone: TONES[index % TONES.length]! }} title={`Item ${index + 1}`} />
                </li>
              ))}
            </CardGrid>
          </div>
        </Block>

        <Block id="motion" title="Motion" note='data-reveal="up|down|left|right|zoom|fade|stagger"; data-reveal-once; data-parallax; .card-link hover.'>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {REVEALS.map((reveal) => (
              <li key={reveal} data-reveal={reveal} className="card grid h-24 place-items-center text-sm font-bold text-heading">
                {reveal}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Scroll these out of view and back: they fade out and in again. Everything is off under reduced motion.
          </p>
        </Block>

        <Block id="ads" title="Ad slots" note="Placeholders show in development only; live units need NEXT_PUBLIC_ADSENSE_CLIENT.">
          <AdSlot slot="design-leaderboard" placement="leaderboard" />
          <div className="flex flex-wrap justify-center gap-6">
            <AdSlot slot="design-rectangle" placement="rectangle" className="!my-0" />
          </div>
        </Block>
      </div>
    </>
  );
}

function Block({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-28">
      <div data-reveal="up" className="mb-6 border-b border-border pb-3">
        <h2 className="text-h2">{title}</h2>
        <p className="mt-1 text-sm text-muted">
          <code>{note}</code>
        </p>
      </div>
      {children}
    </section>
  );
}
