import Link from "next/link";

import { breadcrumbSchema, jsonLd } from "@/lib/seo";

export type Crumb = { name: string; path: string };

/**
 * Visible breadcrumbs plus matching BreadcrumbList structured data. The two
 * are generated from one list so the markup can never describe a hierarchy
 * different from the one on the page.
 */
export function Breadcrumbs({
  trail,
  label,
}: {
  /** Home first, current page last. */
  trail: Crumb[];
  /** Accessible name for the nav landmark, localized. */
  label: string;
}) {
  if (trail.length < 2) return null;

  return (
    <>
      <nav aria-label={label} className="mb-4">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-foreground">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.path} className="hover:text-primary">
                    {crumb.name}
                  </Link>
                )}
                {last ? null : (
                  <span aria-hidden className="text-border-strong">
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(trail)) }}
      />
    </>
  );
}
