"use client";

import { ArrowRight, Coins, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import type { CountryCode } from "@/config/countries";

export type CountryChip = {
  code: CountryCode;
  name: string;
  href: string;
  /** "$ USD", ready to show. */
  currency: string;
  /** "7 country tools", already pluralised for the locale. */
  tools: string;
};

type Active = { chip: CountryChip; x: number; top: number; bottom: number };

const POPUP_WIDTH = 256;

/**
 * Every country the site covers, as big round flags floating across the page
 * in two rows that drift in opposite directions. Hovering (or focusing) a
 * flag lifts it and opens a small card with its currency and how many
 * country-specific tools it has; the rows pause while the pointer or focus is
 * on them, so a flag never slides out from under the card.
 *
 * The card is portalled to <body>: the moving row is transformed and clips its
 * overflow, which would otherwise carry the card along and cut it off.
 * Under reduced motion the rows stand still and wrap (see .marquee).
 */
export function CountryMarquee({
  rows,
  labels,
}: {
  rows: CountryChip[][];
  labels: { currency: string; tools: string; view: string };
}) {
  const [active, setActive] = useState<Active | null>(null);
  const popupId = useId();
  // Portals need the document, which only exists after hydration.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  // The card is placed against the viewport, so it closes on scroll.
  useEffect(() => {
    if (!active) return;
    const close = () => setActive(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [active]);

  const show = (chip: CountryChip, element: HTMLElement) => {
    const box = element.getBoundingClientRect();
    setActive({ chip, x: box.left + box.width / 2, top: box.top, bottom: box.bottom });
  };
  const hide = () => setActive(null);

  return (
    <div className="space-y-2 sm:space-y-4">
      {rows.map((row, index) => (
        <div
          key={index}
          data-reveal={index % 2 ? "right" : "left"}
          className="marquee py-4"
          // Duration grows with the row, so the drift stays slow however many
          // countries it carries.
          style={{ "--marquee-duration": `${row.length * 6 + index * 10}s` } as CSSProperties}
        >
          <ul
            className={`marquee-track motion-reduce:flex-wrap motion-reduce:justify-center ${
              index % 2 ? "[animation-direction:reverse]" : ""
            }`}
          >
            {/* The row twice, so the loop is seamless; the copy is hidden from
                assistive technology and the tab order. */}
            {[...row, ...row].map((chip, position) => {
              const copy = position >= row.length;
              return (
                // One ninth of the window on desktop (fewer, wider slots below),
                // so about nine flags are in view at once.
                <li
                  key={`${chip.code}-${position}`}
                  aria-hidden={copy || undefined}
                  className="w-[calc(100vw/3)] shrink-0 sm:w-[calc(100vw/5)] lg:w-[calc(100vw/7)] xl:w-[calc(100vw/9)]"
                >
                  <Link
                    href={chip.href}
                    tabIndex={copy ? -1 : undefined}
                    aria-describedby={active?.chip.code === chip.code && !copy ? popupId : undefined}
                    onMouseEnter={(event) => show(chip, event.currentTarget)}
                    onMouseLeave={hide}
                    onFocus={(event) => show(chip, event.currentTarget)}
                    onBlur={hide}
                    className="group mx-auto flex max-w-full flex-col items-center gap-3 rounded-lg px-2 py-1 outline-none"
                  >
                    <span className="relative transition-transform duration-500 ease-premium group-hover:-translate-y-1 group-hover:scale-[1.04] group-focus-visible:-translate-y-1 group-focus-visible:scale-[1.04]">
                      {/* The white band round the flag fills with brand blue on hover. */}
                      <span className="relative block h-[5.5rem] w-[5.5rem] rounded-full bg-surface p-1 shadow-[var(--shadow-card)] ring-1 ring-border transition-[box-shadow,background-color] duration-500 group-hover:bg-primary group-hover:shadow-lift group-hover:ring-primary group-focus-visible:bg-primary group-focus-visible:shadow-lift group-focus-visible:ring-primary sm:h-[6.5rem] sm:w-[6.5rem] xl:h-[7rem] xl:w-[7rem]">
                        <Image
                          src={`/flags/${chip.code}.svg`}
                          alt=""
                          width={126}
                          height={126}
                          unoptimized
                          // The drift moves flags in with a transform, which
                          // never triggers lazy loading: load them up front.
                          loading="eager"
                          className="h-full w-full rounded-full object-cover"
                        />
                      </span>
                      {/* Blue ring that draws itself anti-clockwise from the top
                          on hover and unwinds when the pointer leaves: the
                          circle is mirrored (anti-clockwise), then turned a
                          quarter so the stroke starts at twelve o'clock. */}
                      <svg
                        aria-hidden
                        viewBox="0 0 100 100"
                        className="pointer-events-none absolute -inset-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+0.75rem)] max-w-none rotate-90 -scale-x-100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          // Wide enough to overlap the flag's blue band, so
                          // no pale gap shows between band and ring.
                          r="46"
                          pathLength={100}
                          fill="none"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="100"
                          className="stroke-primary [stroke-dashoffset:100] transition-[stroke-dashoffset] duration-700 ease-premium group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0]"
                        />
                      </svg>
                    </span>
                    <span className="text-center text-sm font-semibold leading-tight text-heading transition-colors group-hover:text-primary sm:text-[0.9375rem]">
                      {chip.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {mounted && active
        ? createPortal(<Popup id={popupId} active={active} labels={labels} />, document.body)
        : null}
    </div>
  );
}

function Popup({
  id,
  active,
  labels,
}: {
  id: string;
  active: Active;
  labels: { currency: string; tools: string; view: string };
}) {
  const { chip } = active;
  // Above the flag, unless it sits too near the top of the viewport.
  const above = active.top > 190;
  const left = Math.min(Math.max(active.x, POPUP_WIDTH / 2 + 8), window.innerWidth - POPUP_WIDTH / 2 - 8);

  return (
    // Positioned by the outer element; the inner one animates in. (The
    // entrance animation sets its own transform, which would otherwise
    // replace the centring one.)
    <div
      className="pointer-events-none fixed z-[60]"
      style={{
        width: POPUP_WIDTH,
        left,
        top: above ? active.top - 14 : active.bottom + 14,
        transform: `translate(-50%, ${above ? "-100%" : "0"})`,
      }}
    >
      <div id={id} role="tooltip" className="animate-menu rounded-lg border border-border bg-surface p-4 shadow-lift">
        <div className="flex items-center gap-3">
          <Image
            src={`/flags/${chip.code}.svg`}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.08)]"
          />
          <p className="font-bold leading-tight text-heading">{chip.name}</p>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <Coins aria-hidden className="h-4 w-4 shrink-0 text-primary" />
            <dt className="text-muted">{labels.currency}</dt>
            <dd className="ms-auto font-semibold text-heading">{chip.currency}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Wrench aria-hidden className="h-4 w-4 shrink-0 text-primary" />
            <dt className="sr-only">{labels.tools}</dt>
            <dd className="font-semibold text-heading">{chip.tools}</dd>
          </div>
        </dl>
        <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-sm font-semibold text-primary">
          {labels.view}
          <ArrowRight aria-hidden className="h-4 w-4 rtl:-scale-x-100" />
        </p>
      </div>
    </div>
  );
}

const subscribeNever = () => () => {};
