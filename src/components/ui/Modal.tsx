"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * A dialog over a dimmed, blurred page. `variant="drawer"` slides in from the
 * end edge instead (the mobile menu).
 *
 *   <Modal open={open} onClose={() => setOpen(false)} label="Search" closeLabel="Close">...</Modal>
 *
 * Escape and a click on the backdrop close it; the page behind stops
 * scrolling; focus moves into the dialog on open, stays inside it while Tab is
 * pressed, and returns to what was focused before on close.
 */
export function Modal({
  open,
  onClose,
  label,
  closeLabel,
  title,
  variant = "dialog",
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name when there is no visible title. */
  label: string;
  closeLabel: string;
  /** Optional visible heading, with the close button beside it. */
  title?: ReactNode;
  variant?: "dialog" | "drawer";
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const isolated: { element: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement | null = panel.current?.parentElement ?? null;
    while (branch?.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)) {
          isolated.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }

    // Focus the first field if there is one (search), else the panel itself.
    const first = panel.current?.querySelector<HTMLElement>('input:not([disabled]), [autofocus], button:not([disabled]), a[href]');
    (first ?? panel.current)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = [...panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); panel.current.focus(); return; }
      const firstItem = focusable[0]!;
      const lastItem = focusable[focusable.length - 1]!;
      if (!focusable.includes(document.activeElement as HTMLElement)) {
        event.preventDefault();
        (event.shiftKey ? lastItem : firstItem).focus();
      } else if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      isolated.forEach(({ element, inert }) => { element.inert = inert; });
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const drawer = variant === "drawer";

  return (
    <div
      className={`animate-fade-in fixed inset-0 z-50 flex bg-navy/45 backdrop-blur-sm ${
        drawer ? "justify-end" : "items-start justify-center px-4 pt-[12vh]"
      }`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? undefined : label}
        aria-labelledby={typeof title === "string" ? "modal-title" : undefined}
        tabIndex={-1}
        className={`bg-surface shadow-lift outline-none ${
          drawer
            ? "animate-drawer-end flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto border-s border-border p-5"
            : "animate-pop max-h-[88dvh] w-full min-w-0 max-w-2xl overflow-y-auto rounded-xl border border-border p-4 sm:p-5"
        } ${className}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? (
            <p id="modal-title" className="text-sm font-bold text-heading">
              {title}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="grid h-9 w-9 place-items-center rounded-sm text-muted transition-colors hover:bg-bg-soft hover:text-heading"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
