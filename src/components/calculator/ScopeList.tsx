/** Preserve the entire translated scope while separating its clauses for scanning. */
export function ScopeList({ text, language }: { text: string; language: string }) {
  const sentences = Array.from(new Intl.Segmenter(language, { granularity: "sentence" }).segment(text), part => part.segment);
  const clauses = sentences.flatMap(sentence => sentence.match(/[^;；]+[;；]?/gu) ?? []).filter(part => part.trim());
  return <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed hyphens-auto [overflow-wrap:anywhere]" data-country-scope>{clauses.map((clause, index) => <li key={index}>{clause.trim()}</li>)}</ul>;
}
