"use client";

import { ArrowRight, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { CountrySelector } from "@/components/navigation/CountrySelector";
import { TopBar } from "@/components/layout/TopBar";
import { SearchBox } from "@/components/search/SearchBox";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { sectionKey, type Section } from "@/config/categories";
import type { LocaleCode } from "@/config/locales";
import { useScrolledPast } from "@/hooks/useScrollY";
import { useLocale } from "@/lib/locale-context";
import type { NavMenu } from "@/lib/nav-menu";
import { sectionPath } from "@/lib/routes";
import { sectionVisual } from "@/lib/visuals";

/**
 * The site header: the navy TopBar, then one sticky white bar - the logo,
 * the sections (xl+), search, and the country and language pickers. Below
 * xl the sections move into the drawer behind the menu button.
 *
 * Past 50px of scroll the bar shrinks and gains a shadow and a stronger blur.
 * Search opens as a dialog; "/" and Ctrl/⌘+K open it from anywhere.
 *
 * On desktop each section opens a menu on hover (or keyboard focus) with its
 * three most used pages and an "Explore all" link.
 */

/** Header order: guides last, country tools just before them. */
const NAV_SECTIONS: Section[] = ["calculators", "converters", "tools", "charts", "countries", "guides"];

export function SiteHeader({ ready, menu = {} }: { ready: LocaleCode[]; menu?: NavMenu }) {
  const { t, base, localeCode } = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // A section whose hover menu was just used: kept shut until the pointer leaves.
  const [dismissed, setDismissed] = useState<Section | null>(null);
  const compact = useScrolledPast(50);

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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isHome = pathname === base || pathname === `${base}/`;
  const isActive = (section: Section) => pathname.startsWith(sectionPath(localeCode, section));

  const links = [
    { href: base, label: t("nav.home"), active: isHome, section: null },
    ...NAV_SECTIONS.map((section) => ({
      href: sectionPath(localeCode, section),
      label: t(sectionKey(section)),
      active: isActive(section),
      section,
    })),
  ];

  return (
    <>
      <TopBar ready={ready} />

      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color,margin] duration-300 ease-premium ${
          // The bar shrinks, and a bottom margin takes up the difference, so
          // the page below never moves (no layout shift while scrolling).
          compact
            ? "mb-[calc(var(--header-height)-var(--header-height-compact))] border-border bg-surface/90 shadow-[var(--shadow-header)] backdrop-blur-xl"
            : "border-border bg-surface/80 backdrop-blur"
        }`}
      >
        {/* One row: logo, menu (xl+), search, pickers; below xl the menu
            lives in the drawer behind the menu button. */}
        <div className="container-page [--container:var(--container-xwide)]">
          <div
            className={`flex items-center gap-2 transition-[height] duration-300 ease-premium sm:gap-4 xl:gap-3 2xl:gap-5 3xl:gap-6 ${
              compact ? "h-[var(--header-height-compact)]" : "h-[var(--header-height)]"
            }`}
          >
            <Link
              href={base}
              className="shrink-0 rounded-sm transition-[opacity,transform] duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Logo name={t("app.name")} large priority />
            </Link>

            <nav aria-label={t("header.primary")} className="hidden flex-1 xl:block">
              <ul className="flex items-center justify-center gap-0.5">
                {links.map((link) => {
                  const items = link.section ? menu[link.section] : undefined;
                  const section = link.section;
                  const dismiss = () => {
                    setDismissed(section);
                    (document.activeElement as HTMLElement | null)?.blur();
                  };
                  return (
                    <li
                      key={link.href}
                      className="group/nav relative"
                      onMouseLeave={() => setDismissed(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape" && section) setDismissed(section);
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={items?.length ? dismiss : undefined}
                        aria-current={link.active ? "page" : undefined}
                        className={`group relative flex items-center whitespace-nowrap rounded-md px-2 py-2 text-[0.9rem] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary 2xl:px-2.5 3xl:px-3 3xl:text-[0.95rem] ${
                          link.active
                            ? "text-primary"
                            : "text-heading hover:bg-primary-light hover:text-primary"
                        }`}
                      >
                        {link.label}
                        {/* The active page's indicator; grows in on hover elsewhere. */}
                        <span
                          aria-hidden
                          className={`absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary transition-transform duration-200 2xl:inset-x-2.5 3xl:inset-x-3 ${
                            link.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </Link>

                      {items?.length ? (
                        <div
                          className={`invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-[opacity,translate,visibility] duration-200 ease-premium ${
                            dismissed === section
                              ? ""
                              : "group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
                          }`}
                        >
                          <div className="rounded-lg border border-border bg-surface p-2 shadow-lift">
                            <ul>
                              {items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    onClick={dismiss}
                                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-bg-soft hover:text-primary focus-visible:bg-bg-soft"
                                  >
                                    <span className={`tile tone-${item.visual.tone} h-8 w-8 shrink-0 rounded-sm`}>
                                      <Icon name={item.visual.icon} className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 truncate">{item.title}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link
                              href={link.href}
                              onClick={dismiss}
                              className="mt-1 flex items-center justify-between gap-2 rounded-md border-t border-border px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light focus-visible:bg-primary-light"
                            >
                              {t("header.exploreAll")}
                              <ArrowRight aria-hidden className="h-4 w-4 rtl:-scale-x-100" />
                            </Link>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Search as a field from lg; an icon button on phones and small
                tablets. Both open the search dialog. */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="ms-auto hidden h-12 min-w-[9rem] shrink basis-[26rem] items-center xl:ms-0 3xl:basis-[28rem] gap-3 rounded-md border border-border-control bg-surface px-4 text-start text-[0.9375rem] text-muted transition-[border-color,box-shadow] duration-200 hover:border-primary focus-visible:border-primary focus-visible:shadow-[0_0_0_4px_var(--ring)] focus-visible:outline-none lg:flex"
            >
              <Search aria-hidden className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{t("common.searchPlaceholder")}</span>
              <kbd className="hidden shrink-0 rounded-[6px] border border-border-strong bg-bg-soft px-2 py-0.5 font-sans text-xs font-semibold text-text lg:inline">
                /
              </kbd>
            </button>

            <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-3 lg:ms-0 xl:hidden">
              <span className="flex lg:hidden">
                <Button
                  variant="primary"
                  size="md"
                  square
                  onClick={() => setSearchOpen(true)}
                  aria-label={t("common.search")}
                  title={`${t("common.search")} ( / )`}
                  className="!h-10 !w-10 sm:!h-12 sm:!w-12"
                  icon={<Search />}
                />
              </span>

              <Button
                variant="outline"
                size="md"
                square
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-label={t("header.menu")}
                className="!h-10 !w-10 sm:!h-12 sm:!w-12 xl:!hidden"
                icon={<Menu />}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile and tablet navigation: a drawer from the end edge. */}
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        variant="drawer"
        label={t("header.primary")}
        closeLabel={t("common.close")}
        title={<Logo name={t("app.name")} />}
      >
        <nav aria-label={t("header.primary")} className="flex flex-1 flex-col">
          <ul className="space-y-1">
            {links.map((link, index) => (
              <li
                key={link.href}
                className="animate-fade-up"
                style={{ "--delay": `${80 + index * 45}ms` } as React.CSSProperties}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={link.active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9375rem] font-semibold transition-colors ${
                    link.active ? "bg-primary-light text-primary" : "text-heading hover:bg-bg-soft"
                  }`}
                >
                  {link.section ? (
                    <span className={`tile tone-${sectionVisual(link.section).tone} h-8 w-8 rounded-sm`}>
                      <Icon name={sectionVisual(link.section).icon} className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="tile tone-blue h-8 w-8 rounded-sm">
                      <Icon name="Home" className="h-4 w-4" />
                    </span>
                  )}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-border pt-4 sm:hidden">
            <p className="field-label mb-2">{t("header.country")}</p>
            <CountrySelector />
          </div>
        </nav>
      </Modal>

      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        label={t("common.search")}
        closeLabel={t("common.close")}
        title={t("header.searchTitle")}
      >
        <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
        <p className="mt-3 text-xs text-muted">{t("header.searchHint")}</p>
      </Modal>
    </>
  );
}
