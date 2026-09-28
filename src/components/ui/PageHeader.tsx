import type { CSSProperties, ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { IconTile } from "@/components/ui/Icon";
import type { Visual } from "@/lib/visuals";

const WIDTH = {
  page: "container-page",
  narrow: "container-narrow",
  prose: "container-prose",
} as const;

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * The hero every inner page opens with: a full-width dark navy band with soft
 * blue glows and a faint dot grid. The icon, label, title and intro sit on
 * the left; the breadcrumb trail sits on the right (above the title on
 * phones). Render it before the page's content container, not inside it.
 *
 * It animates on load rather than on scroll, because it is always above the
 * fold. The title only rises and never fades: it is usually the page's
 * largest element, and fading it would delay LCP.
 */
export function PageHeader({
  title,
  description,
  visual,
  media,
  eyebrow,
  children,
  trail,
  breadcrumbLabel = "Breadcrumb",
  width = "page",
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Icon and colour for the tile beside the title. */
  visual?: Visual;
  /** Anything to show in place of the tile, e.g. a country's flag. */
  media?: ReactNode;
  eyebrow?: string;
  /** Extra lines under the description: a badge, a date, a note. */
  children?: ReactNode;
  /** Home first, current page last. */
  trail?: Crumb[];
  breadcrumbLabel?: string;
  /** Match the width of the content below, so the edges line up. */
  width?: keyof typeof WIDTH;
}) {
  const lead =
    media ??
    (visual ? (
      <IconTile visual={visual} size="xl" shape="rounded" className="ring-4 ring-white/10" />
    ) : null);

  return (
    <header className="page-hero relative isolate mb-10 overflow-hidden bg-navy text-on-navy sm:mb-14">
      {/* Glows and a dot grid, fading downwards. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-drift absolute -end-24 -top-40 h-[26rem] w-[26rem] rounded-full bg-primary/35 blur-3xl" />
        <div className="animate-drift absolute -bottom-40 -start-24 h-[22rem] w-[22rem] rounded-full bg-[var(--brand-sky)]/20 blur-3xl [animation-delay:-8s]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <div className={`${WIDTH[width]} flex flex-col gap-6 py-10 sm:py-14 lg:flex-row-reverse lg:items-start lg:justify-between lg:gap-10`}>
        {trail ? (
          <div className="animate-fade-in shrink-0 lg:pt-1">
            <Breadcrumbs trail={trail} label={breadcrumbLabel} tone="dark" />
          </div>
        ) : null}

        <div className="flex min-w-0 items-start gap-5">
          {lead ? (
            <div className="animate-fade-up hidden shrink-0 sm:block" style={delay(60)}>
              {lead}
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="animate-fade-up mb-3 inline-flex rounded-sm border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="animate-rise text-h1 !text-white">{title}</h1>
            {description ? (
              <p
                className="animate-fade-up mt-3 max-w-2xl text-sm leading-relaxed text-on-navy-muted sm:text-[0.9375rem]"
                style={delay(120)}
              >
                {description}
              </p>
            ) : null}
            {children ? (
              <div className="animate-fade-up" style={delay(180)}>
                {children}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
