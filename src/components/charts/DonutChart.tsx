"use client";

import { useState } from "react";

import type { ChartSlice } from "@/config/calculators/types";
import type { Formatter } from "@/lib/format";
import { useLocale } from "@/lib/locale-context";

const TONE_VAR: Record<ChartSlice["tone"], string> = {
  principal: "var(--tone-principal)",
  returns: "var(--tone-returns)",
  tax: "var(--tone-tax)",
  neutral: "var(--tone-neutral)",
};

const SIZE = 200;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Donut split of the result. Drawn with dash offsets on concentric circles
 * rather than arc paths: fewer trig edge cases, and it animates cleanly.
 * Hovering a segment, or hovering or focusing its legend entry, thickens that
 * segment, dims the others and pops up its amount and share of the total.
 */
export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  params,
  fmt: override,
}: {
  slices: ChartSlice[];
  centerLabel?: string;
  centerValue?: string;
  /** Placeholders for the legend copy, resolved per country. */
  params?: Record<string, string | number>;
  /** Formatter for the page's country, which may differ from the visitor's. */
  fmt?: Formatter;
}) {
  const { t: translate, fmt: localeFmt } = useLocale();
  const fmt = override ?? localeFmt;
  const t = (key: string) => translate(key, params);
  const positive = slices.filter((slice) => slice.value > 0);
  const total = positive.reduce((sum, slice) => sum + slice.value, 0);

  const [active, setActive] = useState<string | null>(null);

  // Each segment's start along the ring, and where its tooltip anchors: the
  // middle of its arc, just outside the ring.
  const lengthOf = (slice: ChartSlice) => (total ? (slice.value / total) * CIRCUMFERENCE : 0);
  const arcs = positive.map((slice, index) => {
    const length = lengthOf(slice);
    const start = positive.slice(0, index).reduce((sum, each) => sum + lengthOf(each), 0);
    const angle = ((start + length / 2) / CIRCUMFERENCE) * 2 * Math.PI - Math.PI / 2;
    const reach = RADIUS + STROKE / 2 + 6;
    return {
      slice,
      length,
      start,
      x: SIZE / 2 + Math.cos(angle) * reach,
      y: SIZE / 2 + Math.sin(angle) * reach,
    };
  });
  const current = arcs.find((arc) => arc.slice.labelKey === active);
  const hover = (key: string | null) => () => setActive(key);

  return (
    <figure className="flex flex-col items-center gap-5">
      <div className="relative">
        <svg
          className="overflow-visible"
          onMouseLeave={hover(null)}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={positive
            .map(
              (slice) =>
                `${t(slice.labelKey)}: ${fmt.currency(slice.value)}`,
            )
            .join(", ")}
        >
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {total === 0 ? (
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--border)"
                strokeWidth={STROKE}
              />
            ) : (
              arcs.map(({ slice, length, start }) => (
                <circle
                  key={slice.labelKey}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={TONE_VAR[slice.tone]}
                  strokeWidth={active === slice.labelKey ? STROKE + 8 : STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-start}
                  opacity={active && active !== slice.labelKey ? 0.45 : 1}
                  onMouseEnter={hover(slice.labelKey)}
                  className="cursor-pointer transition-all duration-300 ease-premium"
                />
              ))
            )}
          </g>
        </svg>

        {centerValue ? (
          <div
            className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-200 ${
              current ? "opacity-0" : ""
            }`}
          >
            {centerLabel ? (
              <span className="px-8 text-[0.6875rem] leading-tight text-muted">
                {centerLabel}
              </span>
            ) : null}
            <span className="tabular text-base font-semibold text-foreground">
              {centerValue}
            </span>
          </div>
        ) : null}

        {current ? (
          <div
            key={current.slice.labelKey}
            aria-hidden
            className="chart-tooltip"
            style={{
              left: current.x,
              top: current.y,
              translate: `${current.x < SIZE * 0.35 ? "-15%" : current.x > SIZE * 0.65 ? "-85%" : "-50%"} ${
                current.y < SIZE / 2 ? "-100%" : "0"
              }`,
            }}
          >
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="h-2 w-2 rounded-full" style={{ background: TONE_VAR[current.slice.tone] }} />
              {t(current.slice.labelKey)}
            </span>
            <span className="tabular block text-sm font-bold text-white">
              {fmt.currency(current.slice.value)}
              <span className="ms-1.5 font-medium text-white/70">
                {fmt.percent((current.slice.value / total) * 100, { decimals: 1 })}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <figcaption className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {slices.map((slice) => (
          <button
            key={slice.labelKey}
            type="button"
            onMouseEnter={hover(slice.labelKey)}
            onMouseLeave={hover(null)}
            onFocus={hover(slice.labelKey)}
            onBlur={hover(null)}
            className={`flex items-center gap-2 rounded-pill px-2.5 py-1 text-xs transition-colors duration-200 hover:bg-primary-light hover:text-heading focus-visible:outline-2 focus-visible:outline-primary ${
              active === slice.labelKey ? "bg-primary-light text-heading" : "text-muted"
            }`}
          >
            <span
              aria-hidden
              className={`h-2.5 w-2.5 rounded-full transition-transform duration-200 ${active === slice.labelKey ? "scale-125" : ""}`}
              style={{ background: TONE_VAR[slice.tone] }}
            />
            {t(slice.labelKey)}
            <span className="sr-only">: {fmt.currency(slice.value)}</span>
          </button>
        ))}
      </figcaption>
    </figure>
  );
}
