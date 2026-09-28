"use client";

import { ChevronDown } from "lucide-react";
import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import { useInView } from "@/hooks/useInView";

/**
 * "Load more on scroll" for long lists.
 *
 * Every item is rendered into the HTML; the ones past the current page carry
 * `data-more-hidden`, which CSS hides only once scripting is running. So a
 * crawler, or a visitor without JavaScript, gets the whole list, and nobody
 * waits on a network request: the next batch appears as the end of the list
 * nears the viewport, cascading in. The button does the same for keyboard and
 * screen-reader users, and reports how many are showing.
 */
export function LoadMore({
  children,
  pageSize,
  label,
  className,
}: {
  children: ReactNode;
  pageSize: number;
  label: string;
  className: string;
}) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(pageSize);
  const more = () => setShown((current) => Math.min(current + pageSize, items.length));
  const remaining = items.length - shown;

  // Loads the next batch a little before the end of the list is reached.
  const sentinel = useInView<HTMLDivElement>(more, { once: false, rootMargin: "0px 0px 240px 0px" });

  return (
    <>
      <ul data-reveal="stagger" className={className}>
        {items.map((item, index) => {
          const hidden = index >= shown;
          // Items that arrive in a later batch animate in themselves: the
          // grid's own stagger has already run by then.
          const late = index >= pageSize && !hidden;
          // Children are the grid's own <li>s; props are added, not wrapped.
          if (!isValidElement(item)) return item;
          const element = item as ReactElement<{ className?: string; style?: CSSProperties }>;
          return cloneElement(element, {
            "data-more-hidden": hidden ? "" : undefined,
            className: late
              ? `${element.props.className ?? ""} animate-fade-up`.trim()
              : element.props.className,
            style: late
              ? ({ ...element.props.style, "--delay": `${((index - pageSize) % pageSize) * 60}ms` } as CSSProperties)
              : element.props.style,
          } as Record<string, unknown>);
        })}
      </ul>

      {remaining > 0 ? (
        <div ref={sentinel} className="mt-6 flex flex-col items-center gap-2">
          <button type="button" onClick={more} className="btn btn-outline btn-md">
            {label}
            <ChevronDown aria-hidden className="h-4 w-4" />
          </button>
          <p className="text-xs text-muted" aria-live="polite">
            {shown} / {items.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
