"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * The site's dropdown: a button that opens a list of options.
 *
 *   <Select label="Country" value={code} onChange={setCode} options={[...]} searchable />
 *
 * `variant="field"` is full width and input-shaped (forms, the welcome
 * dialog); `variant="pill"` is the compact rounded trigger (header, cards).
 *
 * The list is rendered into <body> and positioned against the trigger, so no
 * card, animation, overflow or stacking context can clip or cover it. It
 * opens below, or above when there is more room there, and follows the
 * trigger on scroll and resize.
 *
 * Keyboard: Enter, Space or the arrow keys open it; arrows, Home and End move;
 * Enter picks; Escape closes and returns focus; typing filters when
 * `searchable`, or jumps to the first match otherwise.
 */

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  /** Second line or trailing hint, e.g. a currency or locale code. */
  hint?: string;
  /** Leading visual, e.g. a flag. */
  icon?: ReactNode;
  lang?: string;
  dir?: "ltr" | "rtl";
};

type Position = { left: number; width: number; top?: number; bottom?: number; maxHeight: number; above: boolean };

const GAP = 6;
const EDGE = 8;
const MAX_HEIGHT = 320;

export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  showLabel = false,
  variant = "field",
  size = "md",
  searchable = false,
  searchPlaceholder = "Search…",
  noResults = "No matches",
  align = "start",
  trigger,
  menuWidth = 280,
  className = "",
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name; shown above the trigger with `showLabel`. */
  label: string;
  showLabel?: boolean;
  variant?: "field" | "pill";
  /** Pill height: `lg` matches a large button; `xl` is the desktop header's. */
  size?: "sm" | "md" | "lg" | "xl";
  searchable?: boolean;
  searchPlaceholder?: string;
  noResults?: string;
  /** Which edge of the trigger the list lines up with (pill only). */
  align?: "start" | "end";
  /** Custom trigger content; defaults to the selected option's icon and label. */
  trigger?: (selected: SelectOption<T> | undefined) => ReactNode;
  /** Minimum list width for the pill variant. */
  menuWidth?: number;
  className?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);

  const selected = options.find((option) => option.value === value);
  const needle = query.trim().toLocaleLowerCase();
  const shown = needle
    ? options.filter(
        (option) =>
          option.label.toLocaleLowerCase().includes(needle) ||
          option.hint?.toLocaleLowerCase().includes(needle),
      )
    : options;

  const place = useCallback(() => {
    const trigger = button.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(
      variant === "field" ? rect.width : Math.max(rect.width, menuWidth),
      viewportWidth - EDGE * 2,
    );
    const rtl = getComputedStyle(trigger).direction === "rtl";
    const alignEnd = (align === "end") !== rtl;
    const preferred = alignEnd ? rect.right - width : rect.left;
    const left = Math.min(Math.max(preferred, EDGE), viewportWidth - width - EDGE);
    const below = viewportHeight - rect.bottom - GAP - EDGE;
    const aboveSpace = rect.top - GAP - EDGE;
    const above = below < 220 && aboveSpace > below;
    const maxHeight = Math.min(MAX_HEIGHT, above ? aboveSpace : below);
    setPosition(
      above
        ? { left, width, bottom: viewportHeight - rect.top + GAP, maxHeight, above }
        : { left, width, top: rect.bottom + GAP, maxHeight, above },
    );
  }, [align, menuWidth, variant]);

  const openMenu = () => {
    place();
    setQuery("");
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    setPosition(null);
    if (refocus) button.current?.focus();
  }, []);

  const pick = (option: SelectOption<T> | undefined) => {
    if (!option) return;
    onChange(option.value);
    close(true);
  };

  useEffect(() => {
    if (!open) return;
    const follow = () => place();
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) close(false);
    };
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    document.addEventListener("pointerdown", outside);
    // Focus the search box, or the list, once it is on screen.
    const frame = requestAnimationFrame(() => (searchable ? search.current : list.current)?.focus());
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      document.removeEventListener("pointerdown", outside);
      cancelAnimationFrame(frame);
    };
  }, [open, place, close, searchable]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openMenu();
    }
  };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = shown.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => Math.min(index + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        if (searchable) break;
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        if (searchable) break;
        event.preventDefault();
        setActive(last);
        break;
      case "Enter":
        event.preventDefault();
        pick(shown[active]);
        break;
      case "Escape":
        event.preventDefault();
        // Keep a surrounding dialog open: this Escape belongs to the list.
        event.stopPropagation();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
      default:
        // Type-ahead when there is no search box.
        if (!searchable && event.key.length === 1) {
          const letter = event.key.toLocaleLowerCase();
          const index = shown.findIndex((option) => option.label.toLocaleLowerCase().startsWith(letter));
          if (index >= 0) setActive(index);
        }
    }
  };

  const field = variant === "field";
  const activeId = shown[active] ? `${id}-opt-${active}` : undefined;

  return (
    <div className={`${field ? "w-full" : "inline-block"} ${className}`}>
      {showLabel ? (
        <p id={labelId} className="field-label mb-2">
          {label}
        </p>
      ) : null}
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={showLabel ? undefined : label}
        aria-labelledby={showLabel ? `${labelId} ${id}-value` : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKey}
        className={`group flex items-center gap-2.5 border bg-surface text-start transition-[border-color,box-shadow,background-color] duration-200 ${
          field
            ? "h-[3rem] w-full rounded-sm px-4 text-[0.9375rem]"
            : size === "sm"
              ? "h-9 gap-2 rounded-sm px-3 text-[0.8125rem] sm:h-10 sm:px-3.5 sm:text-sm"
              : size === "xl"
              ? "h-11 rounded-sm px-3 text-sm shadow-[var(--shadow-card)] sm:h-12 sm:px-4 sm:text-[0.9375rem] xl:h-[3.25rem] xl:gap-3 xl:px-5 xl:text-base"
              : size === "lg"
                ? "h-10 rounded-sm px-3 text-sm sm:h-12 sm:px-4 sm:text-[0.9375rem]"
                : "h-10 rounded-sm px-3 text-sm sm:h-[2.625rem] sm:px-3.5"
        } ${
          open
            ? "border-primary shadow-[0_0_0_4px_var(--ring)]"
            : field
              ? "border-border-strong hover:border-primary/50 hover:bg-primary-light/60"
              : // A dropdown trigger has to read as a control: a firm outline
                // (the control token, darker than a card's) and a clear chevron.
                "border-border-control hover:border-primary hover:bg-primary-light/60"
        }`}
      >
        <span id={`${id}-value`} className="flex min-w-0 flex-1 items-center gap-2.5">
          {trigger ? (
            trigger(selected)
          ) : (
            <>
              {selected?.icon ? <span className="flex shrink-0">{selected.icon}</span> : null}
              <span className="truncate font-semibold text-heading" lang={selected?.lang}>
                {selected?.label}
              </span>
              {field && selected?.hint ? (
                <span className="ms-auto shrink-0 text-xs font-medium text-muted">{selected.hint}</span>
              ) : null}
            </>
          )}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-text transition-transform duration-300 group-hover:text-primary ${size === "xl" ? "xl:h-5 xl:w-5" : ""} ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menu}
              onKeyDown={onMenuKey}
              className={`animate-menu fixed z-[80] flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lift ${
                position.above ? "origin-bottom" : "origin-top"
              }`}
              style={
                {
                  left: position.left,
                  width: position.width,
                  top: position.top,
                  bottom: position.bottom,
                  maxHeight: position.maxHeight,
                } as CSSProperties
              }
            >
              {searchable ? (
                <div className="relative shrink-0 border-b border-border p-2">
                  <Search aria-hidden className="pointer-events-none absolute start-5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                  <input
                    ref={search}
                    type="text"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={activeId}
                    aria-autocomplete="list"
                    aria-label={label}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    placeholder={searchPlaceholder}
                    className="h-10 w-full rounded-md bg-bg-soft ps-9 pe-3 text-sm text-heading outline-none placeholder:text-subtle focus:bg-surface focus:shadow-[0_0_0_2px_var(--ring)]"
                  />
                </div>
              ) : null}
              <ul
                ref={list}
                id={listId}
                role="listbox"
                tabIndex={searchable ? undefined : -1}
                aria-label={label}
                aria-activedescendant={searchable ? undefined : activeId}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none"
              >
                {shown.length ? (
                  shown.map((option, index) => {
                    const isSelected = option.value === value;
                    const isActive = index === active;
                    return (
                      <li
                        key={option.value}
                        id={`${id}-opt-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={isSelected}
                        lang={option.lang}
                        dir={option.dir}
                        onPointerMove={() => setActive(index)}
                        onClick={() => pick(option)}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive ? "bg-bg-soft" : ""
                        } ${isSelected ? "font-semibold text-primary" : "text-heading"}`}
                      >
                        {option.icon ? <span className="flex shrink-0">{option.icon}</span> : null}
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {option.hint ? (
                          <span className="shrink-0 text-xs font-medium text-muted" dir="ltr">
                            {option.hint}
                          </span>
                        ) : null}
                        <Check
                          aria-hidden
                          className={`h-4 w-4 shrink-0 text-primary ${isSelected ? "opacity-100" : "opacity-0"}`}
                        />
                      </li>
                    );
                  })
                ) : (
                  <li role="presentation" className="px-3 py-6 text-center text-sm text-muted">
                    {noResults}
                  </li>
                )}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
