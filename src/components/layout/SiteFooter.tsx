"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { PackIcon } from "@/components/ui/PackIcon";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { SECTIONS, sectionKey } from "@/config/categories";
import type { LegalSlug } from "@/config/legal/definitions";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { NEWSLETTER_ACTION, SOCIAL_LINKS } from "@/config/site";
import { useLocale } from "@/lib/locale-context";
import { sectionPath, swapLocale } from "@/lib/routes";

/** The legal pages the footer lists; the rest are linked from within them. */
const SUPPORT_PAGES: LegalSlug[] = ["privacy", "terms"];

/** Languages listed in the footer; the header picker offers every one. */
const FOOTER_LANGUAGES = 5;

/** The footer lists Guides last, after the tool sections. */
const FOOTER_SECTIONS = [...SECTIONS.filter((s) => s !== "guides"), ...SECTIONS.filter((s) => s === "guides")];

/**
 * The navy footer from the landing-page design: brand, quick links, popular
 * calculators, languages and support, with back-to-top in the bottom-right
 * corner, then a compact bottom bar with the copyright centred. (The disclaimer
 * is in the TopBar above every page, so the footer does not repeat it.)
 *
 * The social icons and the newsletter field appear only once they are
 * configured in config/site.ts: until then there are no accounts to link to,
 * and the privacy policy says the site has no forms, so neither is shown.
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

  const heading = "mb-5 text-[0.9375rem] font-bold tracking-wide text-white";
  // Soft text that turns brand blue (the on-navy shade) and nudges along on
  // hover; keyboard focus gets a visible ring.
  const link =
    "group inline-flex items-center gap-1.5 rounded-sm text-sm text-on-navy-muted transition-[color,translate] duration-200 hover:translate-x-0.5 hover:text-primary-on-navy rtl:hover:-translate-x-0.5 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-on-navy";

  return (
    <footer className="relative mt-20 overflow-hidden bg-navy text-on-navy">
      {/* A faint glow in the corner, echoing the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="container-page relative pb-20 pt-16 sm:pb-16">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-[1.8fr_1fr_1.25fr_1fr_1fr] lg:gap-10 xl:gap-12">
          {/* Brand, set apart from the link columns by a faint rule on desktop. */}
          <div className="lg:border-e lg:border-white/10 lg:pe-10">
            <Link
              href={base}
              className="inline-block rounded-sm transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-on-navy"
            >
              <Logo name={t("app.name")} onDark large />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-navy-muted">
              {t("footer.brandBlurb")}
            </p>
            {SOCIAL_LINKS.length ? (
              <ul className="mt-5 flex gap-2">
                {SOCIAL_LINKS.map((profile) => (
                  <li key={profile.network}>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      aria-label={profile.network}
                      className="grid rounded-full transition-transform duration-300 hover:-translate-y-0.5 hover:scale-110"
                    >
                      <PackIcon name={profile.network} size={36} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {NEWSLETTER_ACTION ? (
              <form action={NEWSLETTER_ACTION} method="post" className="mt-5 max-w-xs">
                <label htmlFor="newsletter-email" className="mb-2 block text-sm font-bold text-white">
                  {t("footer.newsletter")}
                </label>
                <div className="flex rounded-md bg-white/10 p-1 ring-1 ring-white/15 focus-within:ring-primary">
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    placeholder={t("footer.newsletterPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-on-navy-muted"
                  />
                  <button type="submit" aria-label={t("footer.newsletterSubmit")} className="btn btn-primary btn-sm btn-square">
                    <ArrowRight aria-hidden className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          <nav aria-labelledby="footer-sections">
            <h2 id="footer-sections" className={heading}>
              {t("footer.explore")}
            </h2>
            <ul className="space-y-3">
              {FOOTER_SECTIONS.map((section) => (
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
            <ul className="space-y-3">
              {popular.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-languages">
            <h2 id="footer-languages" className={heading}>
              {t("header.language")}
            </h2>
            <ul className="space-y-3">
              {ready.slice(0, FOOTER_LANGUAGES).map((code) => (
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

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className={heading}>
              {t("footer.support")}
            </h2>
            <ul className="space-y-3">
              {SUPPORT_PAGES.map((page) => (
                <li key={page}>
                  <Link href={`${base}/${page}`} className={link}>
                    {t(`footer.${page}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Back to top, in the footer's bottom-right corner. */}
        <div className="absolute bottom-5 end-[var(--gutter)] sm:bottom-8">
          <ScrollToTop label={t("common.backToTop")} inline />
        </div>
      </div>

      {/* Bottom bar: the copyright, centred. */}
      <div className="relative border-t border-white/10">
        <p className="container-page py-4 text-center text-xs text-on-navy-muted sm:text-[0.8125rem]">
          {t("footer.rights", { year: new Date().getFullYear(), app: t("app.name") })}
        </p>
      </div>
    </footer>
  );
}
