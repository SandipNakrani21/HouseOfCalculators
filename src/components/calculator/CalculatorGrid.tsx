"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculatorsFor } from "@/config/calculators";
import type { CalcContext, Category } from "@/config/calculators/types";
import { useLocale } from "@/lib/locale-context";

export function CalculatorGrid() {
  const { t, fmt, countryCode, country, base } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const ctx = useMemo<CalcContext>(
    () => ({ countryCode, country, t, fmt }),
    [countryCode, country, t, fmt],
  );

  const items = useMemo(() => {
    return calculatorsFor(countryCode).map((calc) => {
      const params = calc.params?.(ctx);
      return {
        slug: calc.slug,
        icon: calc.icon,
        category: calc.category,
        title: t(calc.titleKey, params),
        desc: t(calc.descKey, params),
      };
    });
  }, [countryCode, ctx, t]);

  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category));
    return (["all", ...present] as (Category | "all")[]).filter(Boolean);
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!needle) return true;
      return (
        item.title.toLocaleLowerCase().includes(needle) ||
        item.desc.toLocaleLowerCase().includes(needle) ||
        item.slug.includes(needle)
      );
    });
  }, [items, query, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common.searchPlaceholder")}
            aria-label={t("common.search")}
            className="w-full rounded-xl border border-border bg-surface py-2.5 ps-9 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {categories.map((value) => {
            const active = value === category;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted hover:border-border-strong"
                }`}
              >
                {value === "all" ? t("home.category.all") : t(`category.${value}`)}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-strong p-10 text-center text-sm text-muted">
          {query.trim()
            ? t("common.noResults", { query: query.trim() })
            : t("home.empty")}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.slug}>
              <Link
                href={`${base}/${item.slug}`}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-card)]"
              >
                <span aria-hidden className="text-2xl">
                  {item.icon}
                </span>
                <span className="text-base font-semibold text-foreground group-hover:text-primary">
                  {item.title}
                </span>
                <span className="text-sm leading-relaxed text-muted">
                  {item.desc}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
