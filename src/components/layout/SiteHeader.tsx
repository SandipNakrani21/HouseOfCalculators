"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Logo } from "@/components/layout/Logo";
import { CountrySelector } from "@/components/navigation/CountrySelector";
import { LocaleSelector } from "@/components/navigation/LocaleSelector";
import { SearchBox } from "@/components/search/SearchBox";
import { SECTIONS, sectionKey, type Section } from "@/config/categories";
import type { LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { sectionPath } from "@/lib/routes";

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function isScrolled(): boolean {
  return window.scrollY > 8;
}

/**
 * The site header from the landing-page design: a thin navy strip, then a
 * sticky white bar with the logo, the six sections, the two selectors and a
 * blue search button.
 *
 * Search opens as a dialog rather than living in the bar, which is what makes
 * room for six sections and two selectors without wrapping. "/" and Ctrl/⌘+K
 * open it from anywhere.
 */
export function SiteHeader({ ready }: { ready: LocaleCode[] }) {
  const { t, base, localeCode } = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // A shadow appears once the page moves under the bar.
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, () => false);

  // Keyboard shortcut for search, ignored while typing in a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isHome = pathname === base || pathname === `${base}/`;
  const isActive = (section: Section) =>
    pathname.startsWith(sectionPath(localeCode, section));

  const links = [
    { href: base, label: t("nav.home"), active: isHome },
    ...SECTIONS.map((section) => ({
      href: sectionPath(localeCode, section),
      label: t(sectionKey(section)),
      active: isActive(section),
    })),
  ];

  return (
    <>
      {/* The thin strip above the bar, as in the design. Scrolls away. */}
      <div className="bg-navy text-on-navy-muted">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] font-medium sm:px-6">
          <span className="truncate">{t("header.strip.tagline")}</span>
          <span className="hidden shrink-0 items-center gap-2 sm:flex">
            {(["fast", "free", "accurate", "private"] as const).map((word, index) => (
              <span key={word} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden className="text-sky-400">•</span> : null}
                <span className="text-on-navy">{t(`header.strip.${word}`)}</span>
              </span>
            ))}
          </span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-surface/90 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl"
            : "border-transparent bg-surface/70 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[68px] items-center justify-between gap-3">
            <Link href={base} className="shrink-0 transition-opacity hover:opacity-90">
              <Logo name={t("app.name")} />
            </Link>

            <nav aria-label={t("header.primary")} className="hidden xl:block">
              <ul className="flex items-center gap-0.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={link.active ? "page" : undefined}
                      className={`group relative block px-3 py-2 text-sm font-semibold transition-colors ${
                        link.active ? "text-primary" : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                      {/* Underline that grows from the centre on hover and
                          stays under the current section. */}
                      <span
                        aria-hidden
                        className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary transition-transform duration-300 ${
                          link.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <CountrySelector />
              </div>
              <LocaleSelector ready={ready} />

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t("common.search")}
                title={`${t("common.search")} ( / )`}
                className="btn-primary h-10 w-10 !rounded-xl"
              >
                <Search aria-hidden className="h-[18px] w-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="primary-navigation"
                aria-label={t("header.menu")}
                className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted xl:hidden"
              >
                {menuOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen ? (
            <nav
              id="primary-navigation"
              aria-label={t("header.primary")}
              className="animate-fade-up border-t border-border pb-4 pt-3 xl:hidden"
            >
              <div className="mb-3 sm:hidden">
                <CountrySelector />
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={link.active ? "page" : undefined}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        link.active
                          ? "bg-primary-soft text-primary"
                          : "text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </header>

      {searchOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("common.search")}
          className="fixed inset-0 z-50 flex items-start justify-center bg-navy/40 px-4 pt-[12vh] backdrop-blur-sm"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="animate-pop w-full max-w-2xl rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-lift)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-heading">{t("header.searchTitle")}</p>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label={t("common.close")}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
            <p className="mt-3 text-xs text-muted">{t("header.searchHint")}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
