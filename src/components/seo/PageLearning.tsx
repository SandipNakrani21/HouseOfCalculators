import Link from "next/link";
import { pageLearning } from "@/config/page-learning";

/** Visible, server-rendered explanations; the calculator remains the main task. */
export function PageLearning({ path, className = "" }: { path?: string; className?: string }) {
  const content = pageLearning(path);
  if (!content) return null;
  return <section data-page-learning={path} className={`card space-y-4 p-5 sm:p-7 ${className}`}>
    <h2 className="text-lg font-bold text-heading">{content.title}</h2>
    <p className="text-sm leading-relaxed text-muted">{content.answer}</p>
    <div className="overflow-x-auto">
      <table className="data-table">
        <caption className="mb-3 text-start text-sm font-medium text-heading">{content.caption}</caption>
        <thead><tr>{content.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{content.rows.map((row, index) => <tr key={index}>{row.map((value, cell) => cell === 0
          ? <th scope="row" key={cell}>{value}</th>
          : <td className="tabular" key={cell}>{value}</td>)}</tr>)}</tbody>
      </table>
    </div>
    {content.notes.map(note => <p key={note} className="text-sm leading-relaxed text-muted">{note}</p>)}
    {content.sources?.map(source => <p key={source.href} className="text-sm"><a href={source.href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{source.label}</a></p>)}
    {content.links.map(link => <p key={link.href} className="text-sm"><Link href={link.href} className="text-primary underline">{link.label}</Link></p>)}
  </section>;
}
