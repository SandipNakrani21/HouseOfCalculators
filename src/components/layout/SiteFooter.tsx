"use client";

import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { SECTIONS, sectionKey } from "@/config/categories";
import { LEGAL_SLUGS } from "@/config/legal/definitions";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { sectionPath, swapLocale } from "@/lib/routes";

/**
 * The navy footer from the landing-page design: brand, quick links, popular
 * calculators, support and languages, then a bottom bar.
 *
 * Two things in the design are deliberately left out. The newsletter field:
 * the privacy policy says this site has no forms and collects no personal
 * data, and a sign-up box would make that untrue. The social icons: there are
 * no accounts for them to link to, and dead links would be worse than none.
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

  const heading = "mb-4 text-sm font-bold text-white";
  const link =
    "group inline-flex items-center gap-1.5 text-sm text-on-navy-muted transition-colors hover:text-white";

  return (
    <footer className="relative mt-20 overflow-hidden bg-navy text-on-navy">
      {/* A faint glow in the corner, echoing the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr_1fr]">
          <div>
            <Link href={base} className="inline-block">
              <Logo name={t("app.name")} onDark />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-navy-muted">
              {t("footer.brandBlurb")}
            </p>
          </div>

          <nav aria-labelledby="footer-sections">
            <h2 id="footer-sections" className={heading}>
              {t("footer.explore")}
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link href={base} className={link}>
                  {t("nav.home")}
                </Link>
              </li>
              {SECTIONS.map((section) => (
                <li key={section}>
                  <Link href={sectionPath(localeCode, section)} className={link}>
                    {t(sectionKey(section))}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-popular">
            <h2 id="footer-popular" className={heading}>
              {t("footer.popular")}
            </h2>
            <ul className="space-y-2.5">
              {popular.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className={heading}>
              {t("footer.support")}
            </h2>
            <ul className="space-y-2.5">
              {LEGAL_SLUGS.map((page) => (
                <li key={page}>
                  <Link href={`${base}/${page}`} className={link}>
                    {t(`footer.${page}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-languages">
            <h2 id="footer-languages" className={heading}>
              {t("header.language")}
            </h2>
            <ul className="space-y-2.5">
              {ready.map((code) => (
                <li key={code}>
                  <Link
                    href={swapLocale(base, code)}
                    hrefLang={code}
                    lang={LOCALES[code].language}
                    className={link}
                  >
                    {LOCALES[code].native}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="max-w-4xl text-xs leading-relaxed text-on-navy-muted">
            {t("footer.disclaimer", { app: t("app.name") })}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-on-navy-muted">
            <p>
              {t("footer.rights", {
                year: new Date().getFullYear(),
                app: t("app.name"),
              })}
            </p>
            <p className="font-medium text-on-navy">{t("footer.motto")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
