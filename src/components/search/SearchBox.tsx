"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { CalcContext } from "@/config/calculators/types";
import { SECTIONS, sectionKey, type Section } from "@/config/categories";
import { useLocale } from "@/lib/locale-context";
import { allContent, type ContentItem } from "@/lib/content";
import { search } from "@/lib/search";

/**
 * Global search across every section. Results are grouped by section so a
 * query like "EMI" can show the calculator, the guide and the reference table
 * as distinct kinds of answer rather than one flat list.
 */
export function SearchBox({
  compact = false,
  autoFocus = false,
}: {
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const { t, fmt, localeCode, countryCode, country } = useLocale();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useMemo(() => {
    const calcContext: CalcContext = { countryCode, country, t, fmt };
    return allContent({ locale: localeCode, country: countryCode, t, calcContext });
  }, [localeCode, countryCode, country, t, fmt]);

  const results = useMemo(() => search(items, query, 18), [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<Section, ContentItem[]>();
    for (const result of results) {
      const list = map.get(result.section) ?? [];
      list.push(result);
      map.set(result.section, list);
    }
    return SECTIONS.filter((section) => map.has(section)).map(
      (section) => [section, map.get(section)!] as const,
    );
  }, [results]);

  const showPanel = open && query.trim().length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a result lands before the panel unmounts.
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={t("common.searchPlaceholder")}
          aria-label={t("common.search")}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-results"
          className={`w-full rounded-xl border border-border bg-surface ps-9 pe-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary ${
            compact ? "py-2 text-sm" : "py-3 text-base"
          }`}
        />
      </div>

      {showPanel ? (
        <div
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-2 max-h-[70vh] w-full min-w-72 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-card)]"
          onPointerDown={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {grouped.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              {t("common.noResults", { query: query.trim() })}
            </p>
          ) : (
            grouped.map(([section, sectionResults]) => (
              <section key={section} className="mb-1 last:mb-0">
                <h3 className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
                  {t(sectionKey(section))}
                </h3>
                <ul>
                  {sectionResults.map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.href}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-muted"
                      >
                        <span aria-hidden className="mt-0.5 text-base">
                          {result.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {result.title}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {result.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
