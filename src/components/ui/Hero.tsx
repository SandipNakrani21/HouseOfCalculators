import type { CSSProperties, ReactNode } from "react";
import { preload } from "react-dom";

import { HeroVideo } from "@/components/ui/HeroVideo";

/**
 * The homepage hero: a full-width background video behind centred content -
 * badge, a two-line heading whose second line is in the brand gradient, a
 * lead and whatever goes under it (the search bar).
 *
 * The video is decorative: muted, looping, no controls, hidden from assistive
 * technology, and not shown under reduced motion, where the page's soft blue
 * background stands in (as it does while the video loads). A light overlay
 * keeps the text readable without darkening the hero.
 *
 * The heading types itself out, letter by letter, with a travelling caret
 * (see .type-char in animations.css): about 1.8s in all, CSS only, the full
 * text in the HTML from the start, and shown at once under reduced motion.
 */
export function Hero({
  badge,
  line1,
  line2,
  lead,
  video,
  children,
}: {
  badge?: ReactNode;
  line1: string;
  /** The second line, in the brand gradient ("One Global Home."). */
  line2: string;
  lead?: string;
  /** Background video, from /public: a still poster, the desktop file and an optional phone file. */
  video?: { src: string; mobileSrc?: string; poster: string };
  /** Under the text: the search bar. */
  children?: ReactNode;
}) {
  // The poster is the hero's largest image: fetch it with the page, first.
  if (video) preload(video.poster, { as: "image", fetchPriority: "high" });
  const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
  return (
    <section className="relative isolate flex min-h-[28rem] items-center overflow-hidden sm:min-h-[32rem] lg:min-h-[36rem]">
      {video ? <HeroVideo src={video.src} mobileSrc={video.mobileSrc} poster={video.poster} /> : null}
      {/* Light wash over the video: readable text, still a light hero. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-bg/80 via-bg/65 to-bg" />

      {/* The wider container: less empty space either side of the text. */}
      <div className="container-page py-10 text-center [--container:var(--container-wide)] sm:py-12 lg:py-14">
        <div className="mx-auto max-w-6xl">
          {badge ? <div className="animate-fade-up flex justify-center">{badge}</div> : null}

          <h1 className="mt-5 text-hero sm:mt-6" style={{ "--step": `${TYPE_STEP_MS}ms` } as CSSProperties}>
            {typed(line1, 0, { last: false })}
            {/* The brand gradient: per letter when typed (a clipped
                background would ignore the letters' own visibility), as a
                clipped background when the line is shown whole. */}
            <span className={`block pb-1 ${SEPARABLE.test(line2) ? "" : "text-gradient"}`}>
              {typed(line2, line1.length, { last: true, gradient: true })}
            </span>
          </h1>

          {lead ? (
            <p
              className="animate-fade-up mx-auto mt-5 max-w-4xl text-lg leading-relaxed text-text sm:text-xl lg:text-2xl"
              style={delay(180)}
            >
              {lead}
            </p>
          ) : null}

          {children ? (
            <div className="animate-fade-up relative z-10 mt-8 sm:mt-9" style={delay(240)}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Time between characters, and before the first one. */
const TYPE_STEP_MS = 45;
const TYPE_START_MS = 250;

/**
 * Scripts whose letters stand alone, so each can be its own span. Joined
 * scripts (Arabic, Devanagari, Gujarati...) would lose their shaping if split,
 * so their heading is shown whole, without the typing.
 */
const SEPARABLE = /^[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{N}\p{P}\p{Zs}\p{S}]+$/u;

/**
 * One line of the heading as typed characters, each with its start time.
 * `offset` continues the timing from the previous line; `last` marks the
 * final character, where the caret stays to blink; `gradient` colours each
 * letter at its point along the brand gradient (--gradient-cta: primary-dark
 * to brand-sky), which reads as the same gradient as the clipped version.
 */
function typed(text: string, offset: number, { last, gradient = false }: { last: boolean; gradient?: boolean }): ReactNode {
  if (!SEPARABLE.test(text)) return text;
  const chars = [...text];
  return chars.map((char, index) => {
    const style: Record<string, string> = { "--d": `${TYPE_START_MS + (offset + index) * TYPE_STEP_MS}ms` };
    if (gradient) {
      const at = chars.length > 1 ? Math.round((index / (chars.length - 1)) * 100) : 0;
      style.color = `color-mix(in oklab, var(--primary-dark), var(--brand-sky) ${at}%)`;
    }
    return (
      <span
        key={index}
        className={`type-char${last && index === chars.length - 1 ? " type-last" : ""}`}
        style={style as CSSProperties}
      >
        {char}
      </span>
    );
  });
}
