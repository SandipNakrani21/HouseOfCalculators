import type { CSSProperties } from "react";

import type { Tone } from "@/lib/visuals";

/**
 * A soft, blurred colour glow that slowly wanders behind a section: colour
 * and motion without competing with the content. Place it inside a
 * `relative` section; it sits behind everything and ignores the pointer.
 *
 *   <Glow tone="violet" className="-start-40 top-10" />
 */
export function Glow({
  tone = "blue",
  className = "",
  size = 420,
  delay = 0,
}: {
  tone?: Tone;
  /** Position utilities, e.g. "-end-32 top-0". */
  className?: string;
  size?: number;
  /** Offsets the drift so neighbouring glows move out of step. */
  delay?: number;
}) {
  return (
    <div
      aria-hidden
      className={`animate-drift pointer-events-none absolute -z-10 rounded-full opacity-[0.3] blur-3xl tone-${tone} ${className}`}
      style={
        {
          width: size,
          height: size,
          background: "radial-gradient(circle, var(--tile-fg) 0%, transparent 65%)",
          "--delay": `${-delay}ms`,
        } as CSSProperties
      }
    />
  );
}
