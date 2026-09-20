import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdScript } from "@/components/ads/AdSlot";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WelcomeDialog } from "@/components/navigation/WelcomeDialog";
import { calculatorsFor } from "@/config/calculators";
import { LOCALES, localeFromPath } from "@/config/locales";
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
  const popular = calculatorsFor(locale.defaultCountry)
    .slice(0, 6)
    .map((calc) => ({
      title: t(calc.titleKey),
      href: calculatorPath(locale.code, calc, locale.defaultCountry),
    }));

  return (
    <html lang={locale.code} dir={locale.dir} className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-contrast"
        >
          {t("a11y.skipToContent")}
        </a>

        <LocaleProvider localeCode={locale.code} dictionary={dictionary}>
          <SiteHeader ready={ready} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter ready={ready} popular={popular} />
          <WelcomeDialog ready={ready} />
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
        <AdScript />
      </body>
    </html>
  );
}
