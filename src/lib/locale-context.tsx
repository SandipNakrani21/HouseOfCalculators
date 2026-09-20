"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { COUNTRIES, type Country, type CountryCode } from "@/config/countries";
import { LANGUAGES, type Language, type LanguageCode } from "@/config/languages";
import { createFormatter, type Formatter } from "@/lib/format";
import { translate, type Dictionary, type TranslateFn } from "@/lib/i18n";

export type LocaleValue = {
  country: Country;
  language: Language;
  countryCode: CountryCode;
  lang: LanguageCode;
  /** Path prefix for links, e.g. `/in/hi`. */
  base: string;
  t: TranslateFn;
  fmt: Formatter;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({
  countryCode,
  lang,
  dictionary,
  children,
}: {
  countryCode: CountryCode;
  lang: LanguageCode;
  /** Pre-merged dictionary passed down from the server layout. */
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<LocaleValue>(() => {
    const t: TranslateFn = (key, params) => translate(dictionary, key, params);
    return {
      countryCode,
      lang,
      country: COUNTRIES[countryCode],
      language: LANGUAGES[lang],
      base: `/${countryCode}/${lang}`,
      t,
      fmt: createFormatter(countryCode, lang),
      dir: LANGUAGES[lang].dir,
    };
  }, [countryCode, lang, dictionary]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale must be used inside a <LocaleProvider>");
  }
  return value;
}
