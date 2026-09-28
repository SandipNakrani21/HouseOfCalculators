import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { IconTile } from "@/components/ui/Icon";
import type { Visual } from "@/lib/visuals";

/**
 * The heading every section opens with: title (and optional eyebrow, icon and
 * intro) on the left, a "View all →" link on the right.
 *
 *   <SectionHeader title="Popular calculators" action={<ViewAllLink href=... label="View all" />} />
 */
export function SectionHeader({
  title,
  description,
  action,
  eyebrow,
  visual,
  align = "start",
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Small line above the title, e.g. "Why choose". */
  eyebrow?: string;
  /** A small icon tile beside the title, for category headings. */
  visual?: Visual;
  align?: "start" | "center";
  /** For aria-labelledby on the enclosing section. */
  id?: string;
}) {
  const centered = align === "center";
  return (
    <div
      data-reveal="up"
      className={`mb-8 flex flex-wrap gap-4 sm:mb-10 ${
        centered ? "flex-col items-center text-center" : "items-end justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : undefined}>
        {eyebrow ? <p className="mb-1 text-sm font-semibold text-primary">{eyebrow}</p> : null}
        <h2 id={id} className={`flex items-center gap-3 text-h2 ${centered ? "justify-center" : ""}`}>
          {visual ? <IconTile visual={visual} size="sm" shape="rounded" /> : null}
          {title}
        </h2>
        {description ? (
          <p className={`mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-muted sm:text-sm ${centered ? "mx-auto" : ""}`}>
            {description}
          </p>
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
      className="group inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary hover:text-primary-dark"
    >
      {label}
      <ArrowRight aria-hidden className="card-arrow h-4 w-4" />
    </Link>
  );
}
