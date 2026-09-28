import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Children, type ReactNode } from "react";

import { IconTile } from "@/components/ui/Icon";
import { LoadMore } from "@/components/ui/LoadMore";
import type { Visual } from "@/lib/visuals";

/**
 * The one link card every grid on the site uses, so sections look like one
 * product: a pastel icon circle, the title, a short description and an arrow
 * that slides on hover. On hover the card lifts, its border turns blue and the
 * icon pops (see .card-link).
 *
 * `CategoryCard` and `CalculatorCard` below are the two named presets.
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
  /** Emoji fallback for anything without a visual. */
  icon?: string;
  visual?: Visual;
  /** Anything to lead with instead of an icon tile, e.g. a flag. */
  media?: ReactNode;
  title: string;
  description?: string;
  /** Small chip above the title, e.g. a category name. */
  meta?: string;
  /**
   * `row` puts the icon beside the text; `stack` puts it above.
   * `adaptive` sits side by side on one-column phones, stacks in the
   * two-column phone grid (480px+) and sits side by side again from `sm`,
   * so the text is never squeezed.
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
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-light text-2xl"
    >
      {icon}
    </span>
  );

  return (
    <Link
      href={href}
      className={`card card-link group flex h-full ${
        layout === "stack"
          ? "flex-col gap-4 p-6 sm:min-h-[12rem] sm:p-7"
          : layout === "adaptive"
            ? "flex-row gap-4 p-6 xs:flex-col sm:min-h-[9.5rem] sm:flex-row sm:gap-5 sm:p-7"
            : "gap-4 p-6 sm:min-h-[9rem] sm:gap-5 sm:p-7"
      }`}
    >
      {tile}
      <span className="flex min-w-0 flex-1 flex-col">
        {meta ? (
          <span
            className={`badge badge-sm mb-1.5 ${visual ? `tone-${visual.tone} badge-tone` : "badge-soft"}`}
          >
            {meta}
          </span>
        ) : null}
        <span className="text-[0.9375rem] font-bold leading-snug text-heading transition-colors group-hover:text-primary">
          {title}
        </span>
        {description ? (
          <span className="mb-3 mt-1 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[0.8125rem]">
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

/** A category: large pastel circle, name, what it covers. Stacks on phones. */
export function CategoryCard(props: {
  href: string;
  visual: Visual;
  title: string;
  description?: string;
}) {
  return <ContentCard layout="adaptive" {...props} />;
}

/** One calculator or tool: small icon, name, one-line description. */
export function CalculatorCard(props: {
  href: string;
  visual?: Visual;
  title: string;
  description?: string;
  meta?: string;
  media?: ReactNode;
}) {
  return <ContentCard layout="row" {...props} />;
}

/**
 * The grid cards sit in: 3 → 2 → 1 columns (`dense` keeps 2 from 480px),
 * children cascading in 90ms apart as the grid scrolls into view.
 *
 * With `pageSize`, a long list shows that many items and loads the rest in
 * batches as the visitor scrolls (see LoadMore). All items are still in the
 * HTML, so nothing is hidden from search engines or no-script visitors.
 */
export function CardGrid({
  children,
  columns = 3,
  dense = false,
  pageSize,
  loadMoreLabel,
  className = "",
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  /** Two columns even on phones, for grids of adaptive cards. */
  dense?: boolean;
  pageSize?: number;
  /** Required with pageSize: the button text, e.g. "Load more". */
  loadMoreLabel?: string;
  className?: string;
}) {
  const grid = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    // No section shows more than three cards across: 4 is kept as an alias.
    4: "sm:grid-cols-2 lg:grid-cols-3",
  }[columns];
  const classes = `grid ${dense ? "grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:gap-6" : "gap-4 sm:gap-5 lg:gap-6"} ${grid} ${className}`;

  if (pageSize && Children.count(children) > pageSize) {
    return (
      <LoadMore pageSize={pageSize} label={loadMoreLabel ?? "Load more"} className={classes}>
        {children}
      </LoadMore>
    );
  }

  return (
    <ul data-reveal="stagger" className={classes}>
      {children}
    </ul>
  );
}
