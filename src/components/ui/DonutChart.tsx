"use client";

import type { ChartSlice } from "@/config/calculators/types";
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
 */
export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  params,
}: {
  slices: ChartSlice[];
  centerLabel?: string;
  centerValue?: string;
  /** Placeholders for the legend copy, resolved per country. */
  params?: Record<string, string | number>;
}) {
  const { t: translate, fmt } = useLocale();
  const t = (key: string) => translate(key, params);
  const positive = slices.filter((slice) => slice.value > 0);
  const total = positive.reduce((sum, slice) => sum + slice.value, 0);

  let offset = 0;

  return (
    <figure className="flex flex-col items-center gap-5">
      <div className="relative">
        <svg
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
              positive.map((slice) => {
                const length = (slice.value / total) * CIRCUMFERENCE;
                const dash = `${length} ${CIRCUMFERENCE - length}`;
                const element = (
                  <circle
                    key={slice.labelKey}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={TONE_VAR[slice.tone]}
                    strokeWidth={STROKE}
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                    className="transition-all duration-500 ease-out"
                  />
                );
                offset += length;
                return element;
              })
            )}
          </g>
        </svg>

        {centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerLabel ? (
              <span className="px-8 text-[11px] leading-tight text-muted">
                {centerLabel}
              </span>
            ) : null}
            <span className="tabular text-base font-semibold text-foreground">
              {centerValue}
            </span>
          </div>
        ) : null}
      </div>

      <figcaption className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {slices.map((slice) => (
          <span
            key={slice.labelKey}
            className="flex items-center gap-2 text-xs text-muted"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: TONE_VAR[slice.tone] }}
            />
            {t(slice.labelKey)}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
