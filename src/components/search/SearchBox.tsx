"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";

import { IconTile } from "@/components/ui/Icon";
import type { CalcContext } from "@/config/calculators/types";
import { SECTIONS, sectionKey, type Section } from "@/config/categories";
import { useLocale } from "@/lib/locale-context";
import { allContent, type ContentItem } from "@/lib/content";
import { search } from "@/lib/search";

/**
 * Global search across every section. Results are grouped by section so a
 * query like "EMI" can show the calculator, the guide and the reference table
 * as distinct kinds of answer rather than one flat list.
 *
 * Three sizes: `compact` for the header and menus, `default`, and `hero` for
 * the landing page, which adds the blue Search button from the design.
 * Arrow keys move through the results and Enter opens the highlighted one -
 * or the best match, when nothing is highlighted yet.
 */
export function SearchBox({
  variant = "default",
  compact,
  autoFocus = false,
  onNavigate,
}: {
  variant?: "compact" | "default" | "hero";
  /** Older call sites pass `compact`; it maps onto the compact variant. */
  compact?: boolean;
  autoFocus?: boolean;
  /** Called after a result is chosen, e.g. to close a dialog around the box. */
  onNavigate?: () => void;
}) {
  const size = compact ? "compact" : variant;
  const { t, fmt, localeCode, countryCode, country } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

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

  // The order the keyboard walks, which is the grouped display order.
  const flat = useMemo(() => grouped.flatMap(([, list]) => list), [grouped]);

  const showPanel = open && query.trim().length > 0;

  const go = (item: ContentItem | undefined) => {
    if (!item) return;
    setOpen(false);
    setQuery("");
    setActive(-1);
    onNavigate?.();
    router.push(item.href);
  };

  const inputClass = {
    compact: "rounded-sm py-2.5 ps-9 pe-3 text-sm",
    default: "rounded-sm py-3.5 ps-11 pe-4 text-base",
    // Room for the button: icon-only on phones, labelled from sm up.
    hero: "rounded-md py-4 ps-12 pe-16 text-base sm:py-5 sm:ps-14 sm:pe-40 sm:text-lg lg:py-6 lg:text-xl",
  }[size];

  return (
    <div className="relative">
      <form
        role="search"
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          go(flat[active] ?? flat[0]);
        }}
      >
        <Search
          aria-hidden
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${
            size === "compact" ? "start-3 h-4 w-4" : size === "hero" ? "start-4 h-5 w-5 sm:start-5" : "start-4 h-5 w-5"
          }`}
        />
        <input
          type="search"
          maxLength={100}
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a result lands before the panel unmounts.
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActive(-1);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActive((index) => Math.min(index + 1, flat.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, -1));
            }
          }}
          placeholder={t("common.searchPlaceholder")}
          aria-label={t("common.search")}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className={`w-full border border-border bg-surface text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-[var(--ring)] ${inputClass} ${
            size === "hero" ? "shadow-[var(--shadow-card)]" : ""
          }`}
        />
        {size === "hero" ? (
          <button
            type="submit"
            aria-label={t("common.search")}
            className="btn btn-primary btn-md absolute end-2 top-1/2 -translate-y-1/2 max-sm:w-11 max-sm:px-0 sm:end-2.5 sm:h-12 sm:px-6 sm:text-base lg:h-14 lg:px-8 lg:text-lg"
          >
            <Search aria-hidden className="h-4 w-4" />
            <span className="max-sm:sr-only">{t("common.search")}</span>
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="animate-pop absolute z-50 mt-2 max-h-[70vh] w-full min-w-72 origin-top overflow-y-auto rounded-lg border border-border bg-surface p-2 shadow-[var(--shadow-lift)]"
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
                <h3 className="px-3 pb-1 pt-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
                  {t(sectionKey(section))}
                </h3>
                <ul>
                  {sectionResults.map((result) => {
                    const index = flat.indexOf(result);
                    const highlighted = index === active;
                    return (
                      <li key={result.id}>
                        <Link
                          id={`${listId}-${index}`}
                          role="option"
                          aria-selected={highlighted}
                          href={result.href}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                            onNavigate?.();
                          }}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                            highlighted ? "bg-primary-soft" : "hover:bg-surface-muted"
                          }`}
                        >
                          <IconTile visual={result.visual} size="sm" shape="rounded" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-heading">
                              {result.title}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {result.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
