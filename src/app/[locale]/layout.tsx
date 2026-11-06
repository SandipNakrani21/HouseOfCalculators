import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdsterraBanner, AdsterraChoices } from "@/components/consent/Adsterra";
import { AdScript } from "@/components/ui/AdSlot";
import { Analytics } from "@/components/consent/Analytics";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ConsentScript } from "@/components/consent/ConsentScript";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Interactions } from "@/components/motion/Interactions";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { RouteProgress } from "@/components/motion/RouteProgress";
import { WelcomeDialog } from "@/components/navigation/WelcomeDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { calculatorsFor } from "@/config/calculators";
import { COUNTRIES } from "@/config/countries";
import { LOCALES, localeFromPath } from "@/config/locales";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { LocaleDictionaryProvider } from "@/lib/i18n/LocaleDictionaryProvider";
import { buildNavMenu } from "@/lib/nav-menu";
import { calculatorPath, siteUrl } from "@/lib/routes";
import { SITE_NAME, buildMetadata, readyLocales } from "@/lib/seo";

import "../globals.css";

/**
 * One theme: light, on white. Tells the browser not to darken form controls,
 * scrollbars or the page when the device is in dark mode.
 */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

type LocaleParams = { locale: string };

/** Pre-render every locale that ships. */
export function generateStaticParams(): LocaleParams[] {
  return readyLocales().map((code) => ({ locale: LOCALES[code].path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale: path } = await params;
  const locale = localeFromPath(path);
  if (!locale) return { metadataBase: new URL(siteUrl()) };

  const t = createTranslator(locale.language, locale.code);
  return {
    ...buildMetadata({
      locale: locale.code,
      path: `/${locale.path}`,
      title: `${SITE_NAME} - ${t("app.positioning")}`,
      description: t("app.tagline"),
    }),
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${SITE_NAME} - ${t("app.positioning")}`,
      template: `%s | ${SITE_NAME}`,
    },
    applicationName: SITE_NAME,
    other: {
      // AdSense's "verify site" step looks for this tag on the home page.
      ...(ADSENSE_CLIENT ? { "google-adsense-account": ADSENSE_CLIENT } : {}),
      // Ahrefs Webmaster Tools ownership (free site audit and backlink data).
      "ahrefs-site-verification": "91753911f878be9114f279f406c0715f49b40029228f683a2cf8bb7818985e3b",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleParams>;
}) {
  const { locale: path } = await params;
  const locale = localeFromPath(path);
  if (!locale) notFound();

  const t = createTranslator(locale.language, locale.code);
  const ready = readyLocales();

  // A short, stable list for the footer: the calculators most visitors arrive
  // looking for, resolved for this locale's default country.
  // Titles take the country's parameters, so the consumption-tax calculator
  // reads "Sales Tax Calculator" rather than a raw "{tax} Calculator".
  const country = locale.defaultCountry;
  const calcContext = {
    countryCode: country,
    country: COUNTRIES[country],
    t,
    fmt: createFormatter(country, locale.language, t),
  };
  const popular = calculatorsFor(country)
    .slice(0, 6)
    .map((calc) => ({
      title: t(calc.titleKey, calc.params?.(calcContext)),
      href: calculatorPath(locale.code, calc, locale.defaultCountry),
    }));

  const navMenu = buildNavMenu({ locale: locale.code, country, t, calcContext });

  return (
    <html
      lang={locale.code}
      dir={locale.dir}
      className="h-full"
      // globals.css sets smooth scrolling for in-page links. This tells
      // Next 16 to switch it off during route changes, so a new page opens
      // at the top instantly instead of gliding up from where you were.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Keep the original Latin preloads; other subsets load as needed. */}
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin.636a5ac981f94f8b.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin-ext.9e7b0a821b9dfcb4.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* The Content-Security-Policy from next.config.ts, also kept in the
            page itself: Hostinger's CDN replaces the response header with its
            own one-line policy. */}
        <meta httpEquiv="Content-Security-Policy" content={process.env.CSP_META} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-contrast"
        >
          {t("a11y.skipToContent")}
        </a>

        <LocaleDictionaryProvider localeCode={locale.code}>
          <ToastProvider closeLabel={t("common.close")}>
            <RouteProgress />
            <SiteHeader ready={ready} menu={navMenu} />
            {/* overflow-x-clip: decorative glows run past the screen edge. Clipping
                on <body> alone does not stop phone browsers zooming out to fit
                them; it has to be on an ordinary element. Clip (not hidden)
                keeps sticky elements inside working. */}
            <main id="main" className="relative isolate flex-1 overflow-x-clip">
              <div aria-hidden className="page-wash" />
              {children}
              <AdsterraBanner />
            </main>
            <AdsterraChoices />
            <SiteFooter ready={ready} popular={popular} />
            <WelcomeDialog ready={ready} />
            <ConsentBanner />
            <RevealObserver />
            <Interactions />
          </ToastProvider>
        </LocaleDictionaryProvider>

        {/* Organization and WebSite structured data live on the homepage. */}
        <ConsentScript />
        <AdScript />
        <Analytics />
      </body>
    </html>
  );
}
