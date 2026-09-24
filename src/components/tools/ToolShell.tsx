"use client";

import { useId, type ReactNode } from "react";

/** Card the tools render inside, so every tool page has the same frame. */
export function ToolCard({ children }: { children: ReactNode }) {
  return (
    <section className="card animate-fade-up p-5 sm:p-8">
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
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-[var(--ring)]";

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
      className={`relative mt-6 overflow-hidden rounded-2xl px-5 py-6 text-center ${
        tone === "warning"
          ? "border border-border bg-surface-muted"
          : "bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] text-white shadow-[var(--shadow-primary)]"
      }`}
    >
      {tone === "warning" ? null : (
        <span aria-hidden className="absolute -end-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/10" />
      )}
      <p className={`relative text-sm font-semibold ${tone === "warning" ? "text-muted" : "text-blue-100"}`}>
        {label}
      </p>
      <p
        key={value}
        className={`value-flash tabular relative mt-1 break-words text-2xl font-extrabold tracking-tight sm:text-3xl ${
          tone === "warning" ? "text-heading" : "text-white"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <div className={`relative mt-2 text-sm ${tone === "warning" ? "text-muted" : "text-blue-100"}`}>
          {detail}
        </div>
      ) : null}
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
          <dd className="tabular text-end text-sm font-bold text-heading">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
