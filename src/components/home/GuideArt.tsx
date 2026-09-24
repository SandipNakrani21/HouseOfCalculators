import { Icon } from "@/components/shared/Icon";
import type { IconName, Tone } from "@/lib/visuals";

/**
 * Thumbnail for a guide card. The design comp used stock photographs; this is
 * an illustration in the guide's colour instead: no image requests, nothing
 * licensed, and every card in the family looks related. Decorative.
 */
export function GuideArt({
  icon,
  tone,
  glyph,
}: {
  icon: IconName;
  tone: Tone;
  /** A short formula or symbol set large in the background, e.g. "%". */
  glyph: string;
}) {
  return (
    <div
      aria-hidden
      className={`tone-${tone} relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl bg-[var(--tile-bg)]`}
    >
      {/* Background glyph */}
      <span className="absolute -bottom-4 -end-2 text-[88px] font-extrabold leading-none text-[var(--tile-fg)] opacity-[0.12]">
        {glyph}
      </span>
      {/* Decorative rings */}
      <span className="absolute -start-6 -top-6 h-24 w-24 rounded-full border-[10px] border-[var(--tile-fg)] opacity-[0.08]" />
      <span className="absolute end-5 top-4 h-3 w-3 rounded-full bg-[var(--tile-fg)] opacity-30" />
      <span className="absolute bottom-6 start-6 h-2 w-2 rounded-full bg-[var(--tile-fg)] opacity-40" />

      <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-surface text-[var(--tile-fg)] shadow-[0_16px_30px_-14px_rgba(15,35,120,0.35)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
        <Icon name={icon} className="h-8 w-8" />
      </span>
    </div>
  );
}
