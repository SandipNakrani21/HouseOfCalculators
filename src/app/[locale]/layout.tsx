import type { Metadata } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdScript } from "@/components/ads/AdSlot";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ConsentScript } from "@/components/consent/ConsentScript";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { WelcomeDialog } from "@/components/navigation/WelcomeDialog";
import { calculatorsFor } from "@/config/calculators";
import { COUNTRIES } from "@/config/countries";
import { LOCALES, localeFromPath } from "@/config/locales";
import { createFormatter } from "@/lib/format";
import { createTranslator, getDictionary } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/locale-context";
import { calculatorPath, siteUrl } from "@/lib/routes";
import {
  SITE_NAME,
  buildMetadata,
  jsonLd,
  organizationSchema,
  readyLocales,
  websiteSchema,
} from "@/lib/seo";

import "../globals.css";

/*
 * The design is set in Plus Jakarta Sans. next/font self-hosts it and
 * subsets it to Latin, so there is no request to Google at runtime and no
 * layout shift while it loads. Other scripts fall back to system faces (see
 * --font-app-sans in globals.css).
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

/* The handwritten flourish on the landing hero. One weight, never preloaded. */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

/*
 * Set before first paint so scroll-reveal content starts hidden only when
 * script is actually running. Without it, everything is simply visible.
 */
const JS_FLAG = "document.documentElement.classList.add('js')";

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
  if (!locale) return {};

  const t = createTranslator(locale.language);
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

  const dictionary = getDictionary(locale.language);
  const t = createTranslator(locale.language);
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
    fmt: createFormatter(country, locale.language),
  };
  const popular = calculatorsFor(country)
    .slice(0, 6)
    .map((calc) => ({
      title: t(calc.titleKey, calc.params?.(calcContext)),
      href: calculatorPath(locale.code, calc, locale.defaultCountry),
    }));

  return (
    <html
      lang={locale.code}
      dir={locale.dir}
      className={`h-full ${jakarta.variable} ${caveat.variable}`}
      // globals.css sets smooth scrolling for in-page links. This tells
      // Next 16 to switch it off during route changes, so a new page opens
      // at the top instantly instead of gliding up from where you were.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-contrast"
        >
          {t("a11y.skipToContent")}
        </a>

        <LocaleProvider localeCode={locale.code} dictionary={dictionary}>
          <SiteHeader ready={ready} />
          <main id="main" className="relative isolate flex-1">
            <div aria-hidden className="page-wash" />
            {children}
          </main>
          <SiteFooter ready={ready} popular={popular} />
          <WelcomeDialog ready={ready} />
          <ConsentBanner />
          <RevealObserver />
        </LocaleProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(websiteSchema(locale.code)),
          }}
        />
        <ConsentScript />
        <AdScript />
      </body>
    </html>
  );
}
