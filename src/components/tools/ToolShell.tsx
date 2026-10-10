"use client";

import { createContext, useContext, type ReactNode } from "react";

import { ActionBar } from "@/components/ui/ActionBar";
import { FactList, ResultBox } from "@/components/ui/Form";
import { ToolValidationContext } from "./ValidatedInput";
import { useLocale } from "@/lib/locale-context";
export { NumberInput, ToolButton, EntryInput } from "./ValidatedInput";

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
  const { invalid } = useContext(ToolValidationContext);
  const { t } = useLocale();
  return (
    <section className="card animate-fade-up p-5 sm:p-8">
      {children}
      {invalid ? <p role="status" className="mt-6 rounded-md bg-bg-soft p-4 text-alert">{t("calc.validation.incomplete")}</p> : null}
      {reset ? invalid ? <button type="button" onClick={reset} className="btn btn-outline btn-md mt-7">{t("common.reset")}</button> : <ActionBar className="mt-7" layout="row" onReset={reset} /> : null}
    </section>
  );
}

/** Leave space for translated labels, currency values and validation hints. */
export function ToolFields({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

/** The tool's answer: the shared ResultBox, with space above it. */
export function ToolResult({
  label,
  value,
  detail,
  tone = "primary",
  live = "polite",
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  tone?: "primary" | "warning";
  live?: "polite" | "off";
}) {
  const { invalid } = useContext(ToolValidationContext);
  if (invalid) return null;
  return (
    <ResultBox
      className="mt-6"
      label={label}
      value={value}
      size="md"
      detail={detail}
      live={live}
      tone={tone === "warning" ? "quiet" : "primary"}
    />
  );
}

/** Secondary facts under the headline answer. */
export function ToolFacts({ items }: { items: { label: string; value: string }[] }) {
  const { invalid } = useContext(ToolValidationContext);
  if (invalid) return null;
  return <FactList className="mt-4" items={items} />;
}
