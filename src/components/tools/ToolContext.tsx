import type { TranslateFn } from "@/lib/i18n/core";
import { PASSWORD_CHARACTER_SETS } from "@/config/tools/password";

const CONTEXT_TOOLS = new Set(["percentage", "number-to-words", "words-to-number", "password-generator", "working-days", "age", "countdown"]);

export const hasToolContext = (slug: string) => CONTEXT_TOOLS.has(slug);

/** Page-specific interpretation, separate from the interactive tool. */
export function ToolContext({ slug, t }: { slug: string; t: TranslateFn }) {
  if (!CONTEXT_TOOLS.has(slug)) return null;
  return <section className="space-y-3 text-sm leading-relaxed text-muted" data-tool-context={slug}>
    <p>{t(`tool.${slug}.explain.context`)}</p>
    {slug === "password-generator" ? <ul className="list-disc space-y-2 ps-5">{Object.entries(PASSWORD_CHARACTER_SETS).map(([key, value]) => <li key={key}><span>{t(key === "lower" ? "tool.field.lowercase" : key === "upper" ? "tool.field.uppercase" : `tool.field.${key}`)}: </span><code className="[overflow-wrap:anywhere]">{value}</code></li>)}</ul> : null}
  </section>;
}
