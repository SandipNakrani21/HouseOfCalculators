"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { CountrySelector } from "@/components/navigation/CountrySelector";
import { LocaleSelector } from "@/components/navigation/LocaleSelector";
import { SearchBox } from "@/components/search/SearchBox";
import { SECTIONS, sectionKey, type Section } from "@/config/categories";
import type { LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { sectionPath } from "@/lib/routes";

export function SiteHeader({ ready }: { ready: LocaleCode[] }) {
  const { t, base, localeCode } = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (section: Section) =>
    pathname.startsWith(sectionPath(localeCode, section));

  const nav = (
    <ul className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1">
      {SECTIONS.map((section) => (
        <li key={section}>
          <Link
            href={sectionPath(localeCode, section)}
            onClick={() => setMenuOpen(false)}
            aria-current={isActive(section) ? "page" : undefined}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(section)
                ? "bg-primary-soft text-primary"
                : "text-foreground hover:bg-surface-muted"
            }`}
          >
            {t(sectionKey(section))}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href={base} className="flex shrink-0 items-center gap-2">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-contrast"
            >
              H
            </span>
            <span className="text-base font-bold leading-tight text-heading sm:text-lg">
              {t("app.name")}
            </span>
          </Link>

          <nav aria-label={t("header.primary")} className="hidden lg:block">
            {nav}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block md:w-56 xl:w-72">
              <SearchBox compact />
            </div>
            <CountrySelector />
            <LocaleSelector ready={ready} />

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              aria-label={t("header.menu")}
              className="rounded-lg border border-border p-2 lg:hidden"
            >
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="h-5 w-5 text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M5 5l10 10M15 5L5 15" />
                ) : (
                  <path d="M3 6h14M3 10h14M3 14h14" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            id="primary-navigation"
            aria-label={t("header.primary")}
            className="border-t border-border py-3 lg:hidden"
          >
            <div className="mb-3 md:hidden">
              <SearchBox compact />
            </div>
            {nav}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
