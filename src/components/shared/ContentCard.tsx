import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { IconTile } from "@/components/shared/Icon";
import type { Visual } from "@/lib/visuals";

/**
 * The one card used by every grid on the site, so sections look like one
 * product. Laid out as in the landing-page design: a pastel icon circle, the
 * title and a short description, and an arrow that slides on hover.
 *
 * `visual` is the icon and colour family. `icon` (an emoji) is still
 * accepted as a fallback for anything that has not been given a visual.
 */
export function ContentCard({
  href,
  icon,
  visual,
  media,
  title,
  description,
  meta,
  layout = "row",
}: {
  href: string;
  icon?: string;
  visual?: Visual;
  /** Anything to lead with instead of an icon tile, e.g. a flag. */
  media?: React.ReactNode;
  title: string;
  description?: string;
  /** Small chip above the title, e.g. a category name. */
  meta?: string;
  /**
   * `row` puts the icon beside the text; `stack` puts it above.
   * `adaptive` stacks on phones and goes side by side from `sm`, so a grid
   * can run two columns on a phone without squeezing the text.
   */
  layout?: "row" | "stack" | "adaptive";
}) {
  const tile = media ? (
    <span className="shrink-0 self-start transition-transform duration-300 group-hover:scale-110">{media}</span>
  ) : visual ? (
    <IconTile
      visual={visual}
      size={layout === "row" ? "lg" : "md"}
      className={`self-start ${layout === "adaptive" ? "sm:h-14 sm:w-14" : ""}`}
    />
  ) : (
    <span
      aria-hidden
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-2xl"
    >
      {icon}
    </span>
  );

  return (
    <Link
      href={href}
      className={`card card-link group flex h-full ${
        layout === "stack"
          ? "flex-col gap-4 p-5"
          : layout === "adaptive"
            ? "flex-col gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5"
            : "gap-4 p-5"
      }`}
    >
      {tile}
      <span className="flex min-w-0 flex-1 flex-col">
        {meta ? (
          <span
            className={`mb-1.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              visual ? `tone-${visual.tone} tone-chip` : "bg-primary-soft text-primary"
            }`}
          >
            {meta}
          </span>
        ) : null}
        <span className="text-[15px] font-bold leading-snug text-heading transition-colors group-hover:text-primary">
          {title}
        </span>
        {description ? (
          <span className="mb-3 mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
            {description}
          </span>
        ) : null}
        <ArrowRight
          aria-hidden
          className="card-arrow mt-auto h-4 w-4 shrink-0 text-heading group-hover:text-primary"
        />
      </span>
    </Link>
  );
}

export function CardGrid({
  children,
  columns = 3,
  dense = false,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  /** Two columns even on phones, for grids of adaptive cards. */
  dense?: boolean;
}) {
  const grid = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return (
    <ul
      data-reveal="stagger"
      className={`grid ${dense ? "grid-cols-2 gap-3 sm:gap-4" : "gap-4"} ${grid}`}
    >
      {children}
    </ul>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  eyebrow,
  visual,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Small line above the title, e.g. "Why choose". */
  eyebrow?: string;
  /** A small icon tile beside the title, for category headings. */
  visual?: Visual;
}) {
  return (
    <div data-reveal="up" className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-sm font-semibold text-muted">{eyebrow}</p>
        ) : null}
        <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-[28px]">
          {visual ? <IconTile visual={visual} size="sm" shape="rounded" /> : null}
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-[15px]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** The "View all →" link that sits beside a section heading. */
export function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
    >
      {label}
      <ArrowRight
        aria-hidden
        className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
      />
    </Link>
  );
}
