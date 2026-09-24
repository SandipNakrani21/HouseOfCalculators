import type { ReactNode } from "react";

import { IconTile } from "@/components/shared/Icon";
import type { Visual } from "@/lib/visuals";

/**
 * The heading every inner page opens with, styled after the landing hero: a
 * large pastel icon, a small eyebrow chip, a heavy title and the intro line,
 * sitting on the page's blue wash.
 *
 * It animates on load rather than on scroll, because it is always above the
 * fold. The title only rises and never fades, since it is usually the page's
 * largest element and fading it would delay LCP.
 */
export function PageHeader({
  title,
  description,
  visual,
  media,
  eyebrow,
  children,
  className = "mb-8",
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
  className?: string;
}) {
  const lead = media ?? (visual ? (
    <IconTile
      visual={visual}
      size="xl"
      shape="rounded"
      className="shadow-[var(--shadow-card)] ring-4 ring-surface"
    />
  ) : null);

  return (
    <header className={className}>
      <div className="flex items-start gap-4 sm:gap-5">
        {lead ? (
          <div className="animate-fade-up hidden shrink-0 sm:block" style={{ "--delay": "60ms" } as React.CSSProperties}>
            {lead}
          </div>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p
              className={`animate-fade-up mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                visual
                  ? `tone-${visual.tone} tone-text border border-border bg-surface shadow-[var(--shadow-card)]`
                  : "border border-border bg-surface text-primary shadow-[var(--shadow-card)]"
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1 className="animate-rise text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-[40px]">
            {title}
          </h1>
          {description ? (
            <p
              className="animate-fade-up mt-3 max-w-3xl text-[15px] leading-relaxed text-muted sm:text-base"
              style={{ "--delay": "120ms" } as React.CSSProperties}
            >
              {description}
            </p>
          ) : null}
          {children ? (
            <div className="animate-fade-up" style={{ "--delay": "180ms" } as React.CSSProperties}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
