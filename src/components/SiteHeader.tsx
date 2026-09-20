"use client";

import Link from "next/link";
import { useState } from "react";

import { LocaleDialog } from "@/components/LocaleDialog";
import { CountryBadge } from "@/components/ui/CountryBadge";
import { useLocale } from "@/lib/locale-context";

export function SiteHeader() {
  const { t, base, country, language } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={base} className="flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-contrast"
            >
              C
            </span>
            <span className="text-lg font-semibold text-foreground">
              {t("app.name")}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("header.switcher")}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm transition-colors hover:border-border-strong hover:bg-surface-muted"
          >
            <CountryBadge code={country.code} />
            <span className="hidden font-medium text-foreground sm:inline">
              {t(`country.${country.code}`)}
            </span>
            <span aria-hidden className="text-muted">
              ·
            </span>
            <span className="font-medium text-foreground">{language.native}</span>
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="h-4 w-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <LocaleDialog open={open} mode="switch" onClose={() => setOpen(false)} />
    </>
  );
}
