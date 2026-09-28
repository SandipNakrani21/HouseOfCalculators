import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Tone } from "@/lib/visuals";

/**
 * An article card: picture, category tag, title and "Read more →".
 *
 * `image` is any node - an illustration component, or an <img> with
 * loading="lazy" and explicit width/height so nothing shifts as it loads.
 * `layout="row"` puts the picture beside the text (the homepage), "stack"
 * above it (listing grids).
 */
export function BlogCard({
  href,
  image,
  tag,
  tone = "blue",
  title,
  excerpt,
  readMore,
  layout = "row",
}: {
  href: string;
  image: ReactNode;
  tag: string;
  tone?: Tone;
  title: string;
  excerpt?: string;
  readMore: string;
  layout?: "row" | "stack";
}) {
  const row = layout === "row";
  return (
    <Link
      href={href}
      className={`card card-link group flex h-full gap-4 p-4 ${row ? "" : "flex-col"}`}
    >
      <div className={`overflow-hidden rounded-md ${row ? "w-[42%] shrink-0" : "w-full"}`}>
        <div className="transition-transform duration-500 ease-premium group-hover:scale-105">{image}</div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <span className={`badge badge-sm badge-tone tone-${tone}`}>{tag}</span>
        <span className="mt-2 line-clamp-3 text-[0.9375rem] font-bold leading-snug text-heading transition-colors group-hover:text-primary">
          {title}
        </span>
        {excerpt ? <span className="mt-1.5 line-clamp-2 text-xs text-muted sm:text-[0.8125rem]">{excerpt}</span> : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary">
          {readMore}
          <ArrowRight aria-hidden className="card-arrow h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
