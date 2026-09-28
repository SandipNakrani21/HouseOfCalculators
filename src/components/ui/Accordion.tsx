import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * FAQ-style disclosure list, built on <details>: it works without scripting,
 * browsers can find-in-page inside closed answers, and the answer eases open.
 *
 *   <Accordion items={[{ id, question, answer }]} />
 */
export function Accordion({
  items,
  className = "",
}: {
  items: { id: string; question: ReactNode; answer: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={`divide-y divide-border ${className}`}>
      {items.map((item) => (
        <details key={item.id} className="accordion-item group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-3 text-heading transition-colors hover:text-primary">
            {/* A real heading: the question is the section's title, which is
                what search and answer engines key a direct answer on. Sits
                under the FAQ's h2 wherever the accordion is used. */}
            <h3 className="text-[0.9375rem] font-semibold leading-snug tracking-normal text-inherit">{item.question}</h3>
            <ChevronDown
              aria-hidden
              className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-primary"
            />
          </summary>
          <div className="accordion-panel pb-4 text-sm leading-relaxed text-muted">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
