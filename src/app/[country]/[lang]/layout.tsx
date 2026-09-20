import type { Metadata } from "next";

import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LocaleGate } from "@/components/LocaleGate";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { COUNTRY_CODES, availableLanguages, isCountryCode } from "@/config/countries";
import { LANGUAGES, isLanguageCode } from "@/config/languages";
import { createTranslator, getDictionary } from "@/lib/i18n";

import { LocaleProvider } from "@/lib/locale-context";

import "../../globals.css";

type LocaleParams = { country: string; lang: string };

/**
 * Pre-render every country and language pair. There are only a couple of
 * dozen, and it keeps the locale prefix off the dynamic-rendering path.
 */
export function generateStaticParams(): LocaleParams[] {
  return COUNTRY_CODES.flatMap((country) =>
    availableLanguages(country).map((lang) => ({ country, lang })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { country, lang } = await params;
  if (!isCountryCode(country) || !isLanguageCode(lang)) return {};

  const t = createTranslator(lang);
  return {
    title: {
      default: `${t("app.name")} - ${t("app.tagline")}`,
      template: `%s | ${t("app.name")}`,
    },
    description: t("app.tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleParams>;
}) {
  const { country, lang } = await params;
  if (!isCountryCode(country) || !isLanguageCode(lang)) notFound();
  if (!availableLanguages(country).includes(lang)) notFound();

  const dictionary = getDictionary(lang);
  const dir = LANGUAGES[lang].dir;

  return (
    <html lang={lang} dir={dir} className="h-full">
      <body className="flex min-h-full flex-col">
        <LocaleProvider countryCode={country} lang={lang} dictionary={dictionary}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <LocaleGate />
        </LocaleProvider>
      </body>
    </html>
  );
}
