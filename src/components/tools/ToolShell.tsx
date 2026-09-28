"use client";

import { createContext, useContext, type ReactNode } from "react";

import { ActionBar } from "@/components/ui/ActionBar";
import { FactList, ResultBox } from "@/components/ui/Form";

/*
 * The tools' frame, built from the shared form components in
 * components/ui/Form. The names here are the ones the tool files already use.
 */
export { Field, inputClass, selectClass } from "@/components/ui/Form";

/**
 * Set by ToolRunner: starts the tool over. ToolCard puts it, with print and
 * share, in the same button block the calculators end with.
 */
export const ToolResetContext = createContext<(() => void) | null>(null);

/** Card the tools render inside, so every tool page has the same frame. */
export function ToolCard({ children }: { children: ReactNode }) {
  const reset = useContext(ToolResetContext);
  return (
    <section className="card animate-fade-up p-5 sm:p-8">
      {children}
      {reset ? <ActionBar className="mt-7" layout="row" onReset={reset} /> : null}
    </section>
  );
}

/** Inputs four to a row on desktop (two on tablets, one on phones). */
export function ToolFields({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

/** The tool's answer: the shared ResultBox, with space above it. */
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
    <ResultBox
      className="mt-6"
      label={label}
      value={value}
      size="md"
      detail={detail}
      tone={tone === "warning" ? "quiet" : "primary"}
    />
  );
}

/** Secondary facts under the headline answer. */
export function ToolFacts({ items }: { items: { label: string; value: string }[] }) {
  return <FactList className="mt-4" items={items} />;
}
