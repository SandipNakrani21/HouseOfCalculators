"use client";

import Link from "next/link";

import { SECTIONS, sectionKey } from "@/config/categories";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { sectionPath, swapLocale } from "@/lib/routes";

const LEGAL = ["privacy", "terms", "cookies", "contact", "about"] as const;

/**
 * Footer as a navigation aid rather than a keyword dump: the six sections, a
 * short list of popular tools, the languages the site actually ships in, and
 * the legal pages an advertising-supported site needs.
 */
export function SiteFooter({
  ready,
  popular,
}: {
  ready: LocaleCode[];
  /** A handful of high-traffic destinations, resolved by the caller. */
  popular: { title: string; href: string }[];
}) {
  const { t, base, localeCode } = useLocale();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href={base} className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-contrast"
              >
                H
              </span>
              <span className="text-base font-bold text-heading">
                {t("app.name")}
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted">{t("app.positioning")}</p>
          </div>

          <nav aria-labelledby="footer-sections">
            <h2 id="footer-sections" className="text-sm font-semibold text-heading">
              {t("footer.explore")}
            </h2>
            <ul className="mt-3 space-y-2">
              {SECTIONS.map((section) => (
                <li key={section}>
                  <Link
                    href={sectionPath(localeCode, section)}
                    className="text-sm text-muted hover:text-primary"
                  >
                    {t(sectionKey(section))}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-popular">
            <h2 id="footer-popular" className="text-sm font-semibold text-heading">
              {t("footer.popular")}
            </h2>
            <ul className="mt-3 space-y-2">
              {popular.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-primary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-6">
            <nav aria-labelledby="footer-languages">
              <h2
                id="footer-languages"
                className="text-sm font-semibold text-heading"
              >
                {t("header.language")}
              </h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {ready.map((code) => (
                  <li key={code}>
                    <Link
                      href={swapLocale(base, code)}
                      hrefLang={code}
                      lang={LOCALES[code].language}
                      className="text-sm text-muted hover:text-primary"
                    >
                      {LOCALES[code].native}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-legal">
              <h2 id="footer-legal" className="text-sm font-semibold text-heading">
                {t("footer.legal")}
              </h2>
              <ul className="mt-3 space-y-2">
                {LEGAL.map((page) => (
                  <li key={page}>
                    <Link
                      href={`${base}/${page}`}
                      className="text-sm text-muted hover:text-primary"
                    >
                      {t(`footer.${page}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 space-y-3 border-t border-border pt-6">
          <p className="max-w-4xl text-xs leading-relaxed text-muted">
            {t("footer.disclaimer", { app: t("app.name") })}
          </p>
          <p className="text-xs text-muted">
            {t("footer.rights", {
              year: new Date().getFullYear(),
              app: t("app.name"),
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
