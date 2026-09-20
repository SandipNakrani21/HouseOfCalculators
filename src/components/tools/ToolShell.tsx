"use client";

import { useId, type ReactNode } from "react";

/** Card the tools render inside, so every tool page has the same frame. */
export function ToolCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
      {children}
    </section>
  );
}

export function ToolFields({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

/** Labelled input. Keeps the label, control and hint tied together for a11y. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

/**
 * The tool's answer. Announced politely so a screen reader hears the new value
 * without being interrupted mid-sentence on every keystroke.
 */
export function ToolResult({
  label,
  value,
  detail,
  tone = "primary",
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  tone?: "primary" | "warning";
}) {
  return (
    <div
      aria-live="polite"
      className={`mt-6 rounded-xl px-5 py-4 text-center ${
        tone === "warning" ? "bg-surface-muted" : "bg-primary-soft"
      }`}
    >
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`tabular mt-1 text-2xl font-bold sm:text-3xl ${
          tone === "warning" ? "text-foreground" : "text-primary"
        }`}
      >
        {value}
      </p>
      {detail ? <div className="mt-2 text-sm text-muted">{detail}</div> : null}
    </div>
  );
}

/** Secondary facts under the headline answer. */
export function ToolFacts({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  if (!items.length) return null;
  return (
    <dl className="mt-4 divide-y divide-border border-t border-border">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between gap-4 py-2.5">
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className="tabular text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
