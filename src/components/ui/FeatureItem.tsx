import type { ReactNode } from "react";

import { IconTile } from "@/components/ui/Icon";
import type { Visual } from "@/lib/visuals";

/** Icon circle, title and a line of text: the "Why choose" points. */
export function FeatureItem({
  visual,
  media,
  title,
  text,
}: {
  visual: Visual;
  /** Artwork to show instead of the icon tile, e.g. a PackIcon. */
  media?: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group flex gap-4">
      {media ? (
        <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{media}</span>
      ) : (
        <IconTile visual={visual} size="lg" className="group-hover:scale-110" />
      )}
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{text}</p>
      </div>
    </div>
  );
}
