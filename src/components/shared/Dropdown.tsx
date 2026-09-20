"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Button plus panel, closed by Escape or a click outside. Used for the locale
 * and country selectors, which need a list rather than a native `select` so
 * each entry can show its own script and a secondary line.
 */
export function Dropdown({
  label,
  trigger,
  align = "end",
  children,
}: {
  /** Accessible name for the trigger button. */
  label: string;
  trigger: ReactNode;
  align?: "start" | "end";
  /** Receives a `close` callback so items can dismiss the panel. */
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-border-strong hover:bg-surface-muted"
      >
        {trigger}
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className={`absolute z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-card)] ${
            align === "end" ? "end-0" : "start-0"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
