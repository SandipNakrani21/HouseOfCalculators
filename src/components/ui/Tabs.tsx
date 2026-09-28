"use client";

import type { KeyboardEvent } from "react";

/**
 * A pill tab strip. Controlled: the parent owns which tab is active and
 * renders the matching panel.
 *
 *   <TabList label="Breakdown" tabs={[{ id: "year", label: "Yearly" }, ...]} value={id} onChange={setId} />
 *
 * Arrow keys, Home and End move between tabs, as the ARIA tabs pattern expects.
 */
export function TabList<T extends string>({
  label,
  tabs,
  value,
  onChange,
  idPrefix = "tab",
}: {
  label: string;
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  /** Prefix for tab ids, so panels can point back with aria-labelledby. */
  idPrefix?: string;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === value);
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (event.key === forward) next = (index + 1) % tabs.length;
    else if (event.key === back) next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    onChange(tab.id);
    event.currentTarget.querySelector<HTMLButtonElement>(`#${idPrefix}-${tab.id}`)?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-md bg-bg-soft p-1">
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`rounded-sm px-3.5 py-1.5 text-sm font-semibold transition-all duration-300 ${
              selected ? "bg-surface text-primary shadow-card" : "text-muted hover:text-heading"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
