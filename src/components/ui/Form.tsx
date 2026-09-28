"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

/**
 * Form elements every calculator, converter and tool is built from.
 *
 *   <Field label="Amount" hint="Before tax">{(id) => <Input id={id} ... />}</Field>
 *   <Select id=... value=... onChange=...>...</Select>
 *   <SegmentedControl label="Frequency" value=... options=[...] onChange=... />
 *   <Switch checked=... onChange=... />
 *   <Slider min max step value onChange />          (fill tracks the value)
 *   <ResultBox label="Monthly payment" value="$1,234" />
 *   <FactList items={[{ label, value }]} />
 */

/** CSS class names, for native elements that cannot use the components. */
export const inputClass = "input";
export const selectClass = "select";

/** A label, a control and an optional hint, tied together for assistive tech. */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: ReactNode;
  hint?: ReactNode;
  /** Receives the id to put on the control. */
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children(id)}
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function Input({ className = "", ...rest }: ComponentProps<"input">) {
  return <input className={`input ${className}`} {...rest} />;
}

export function Select({ className = "", ...rest }: ComponentProps<"select">) {
  return <select className={`select ${className}`} {...rest} />;
}

/** A radio group drawn as a row of option buttons. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: ReactNode;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <p id={id} className="field-label">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                // Arrow keys move the selection, as in a native radio group.
                const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
                if (!step) return;
                event.preventDefault();
                const index = options.findIndex((item) => item.value === value);
                const next = options[(index + step + options.length) % options.length];
                if (!next) return;
                onChange(next.value);
                const group = event.currentTarget.parentElement;
                requestAnimationFrame(() =>
                  group?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus(),
                );
              }}
              className="segment"
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="text-sm font-semibold text-heading">
        {label}
        {hint ? <span className="field-hint mt-1 block font-normal">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="switch mt-1"
      />
    </label>
  );
}

/** Range input whose filled track follows the value. */
export function Slider({
  min,
  max,
  value,
  className = "",
  style,
  ...rest
}: Omit<ComponentProps<"input">, "type" | "min" | "max" | "value"> & {
  min: number;
  max: number;
  value: number;
}) {
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      className={className}
      style={{ ...style, "--fill": `${Math.max(0, Math.min(100, fill))}%` } as React.CSSProperties}
      {...rest}
    />
  );
}

/**
 * The headline answer. Announced politely, so a screen reader hears the new
 * value without being interrupted on every keystroke. The value flashes
 * softly each time it changes.
 */
export function ResultBox({
  label,
  value,
  detail,
  tone = "primary",
  size = "lg",
  className = "",
}: {
  label: ReactNode;
  value: string;
  detail?: ReactNode;
  /** "md" for long answers such as dates or words. */
  size?: "md" | "lg";
  /** "quiet" is the neutral box, for warnings and empty states. */
  tone?: "primary" | "quiet";
  className?: string;
}) {
  const quiet = tone === "quiet";
  return (
    <div aria-live="polite" className={`result-box ${quiet ? "result-box-quiet" : ""} ${className}`}>
      <p className={`text-sm font-semibold ${quiet ? "text-muted" : "text-white/80"}`}>{label}</p>
      <p
        key={value}
        className={`value-flash tabular mt-1 break-words font-extrabold tracking-tight ${
          size === "lg" ? "text-[1.75rem] sm:text-[2rem]" : "text-2xl"
        } ${
          quiet ? "text-heading" : "text-white"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <div className={`mt-2 text-sm ${quiet ? "text-muted" : "text-white/80"}`}>{detail}</div>
      ) : null}
    </div>
  );
}

/** Label/value rows under a result. */
export function FactList({
  items,
  className = "",
}: {
  items: { label: ReactNode; value: ReactNode; marker?: string }[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <dl className={`divide-y divide-border border-t border-border ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-2.5 transition-colors duration-200 hover:bg-primary-light"
        >
          <dt className="flex items-center gap-2 text-sm text-muted">
            {item.marker ? (
              <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.marker }} />
            ) : null}
            {item.label}
          </dt>
          <dd className="tabular text-end text-sm font-bold text-heading">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
