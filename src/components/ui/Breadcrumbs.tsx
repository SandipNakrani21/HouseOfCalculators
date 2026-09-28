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
  tone = "light",
}: {
  /** Home first, current page last. */
  trail: Crumb[];
  /** Accessible name for the nav landmark, localized. */
  label: string;
  /** "dark" for the navy page hero. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  if (trail.length < 2) return null;

  return (
    <>
      <nav aria-label={label} className={dark ? "" : "mb-4"}>
        <ol
          className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
            dark
              ? "w-fit rounded-sm border border-white/15 bg-white/10 px-3.5 py-2 text-on-navy-muted backdrop-blur"
              : "text-muted"
          }`}
        >
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className={dark ? "font-semibold text-white" : "text-foreground"}>
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.path} className={dark ? "transition-colors hover:text-white" : "hover:text-primary"}>
                    {crumb.name}
                  </Link>
                )}
                {last ? null : (
                  <span aria-hidden className={dark ? "text-white/40" : "text-border-strong"}>
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
