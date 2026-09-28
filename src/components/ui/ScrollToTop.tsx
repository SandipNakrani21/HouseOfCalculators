"use client";

import { ArrowUp } from "lucide-react";

import { useScrolledPast } from "@/hooks/useScrollY";

/**
 * Back to the top of the page. By default a button fixed in the corner that
 * appears after scrolling a screen or so; `inline` places it in the flow
 * (the footer's bottom bar), always visible, with a small lift on hover.
 */
export function ScrollToTop({ label, inline = false }: { label: string; inline?: boolean }) {
  const scrolled = useScrolledPast(700);
  const shown = inline || scrolled;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      className={
        inline
          ? "btn btn-primary btn-lg btn-square shadow-primary transition-[translate,background-color,color] duration-200 hover:-translate-y-1"
          : `btn btn-primary btn-md btn-square fixed bottom-5 end-5 z-40 transition-all duration-300 sm:bottom-6 sm:end-6 ${
              shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`
      }
    >
      <ArrowUp aria-hidden className={inline ? "h-6 w-6" : "h-5 w-5"} />
    </button>
  );
}
