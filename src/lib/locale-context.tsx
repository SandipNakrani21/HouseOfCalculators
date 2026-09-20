"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { COUNTRIES, isCountryCode, type Country, type CountryCode } from "@/config/countries";
import { LANGUAGES, type Language } from "@/config/languages";
import { LOCALES, type Locale, type LocaleCode } from "@/config/locales";
import { createFormatter, type Formatter } from "@/lib/format";
import { readStoredCountry, storeCountry } from "@/lib/preferences";
import { translate, type Dictionary, type TranslateFn } from "@/lib/i18n";

export type LocaleValue = {
  locale: Locale;
  localeCode: LocaleCode;
  language: Language;
  dir: "ltr" | "rtl";
  /** Path prefix for links, e.g. `/en-us`. */
  base: string;
  t: TranslateFn;

  /**
   * Country context. Defaults to the locale's country and can be overridden by
   * the visitor, so language and country stay independent.
   */
  country: Country;
  countryCode: CountryCode;
  setCountry: (next: CountryCode) => void;
  /** True when the visitor picked a country rather than inheriting one. */
  countryIsExplicit: boolean;

  fmt: Formatter;
};

const LocaleContext = createContext<LocaleValue | null>(null);

/**
 * The stored country is read as an external store rather than in an effect, so
 * the server snapshot (the locale's default) renders first and the visitor's
 * override is applied without a hydration mismatch.
 */
const countryStore = {
  subscribe(onChange: () => void) {
    const handler = () => onChange();
    window.addEventListener("hoc:country", handler);
    return () => window.removeEventListener("hoc:country", handler);
  },
  snapshot(): string | null {
    return readStoredCountry();
  },
  serverSnapshot(): string | null {
    return null;
  },
};

export function LocaleProvider({
  localeCode,
  dictionary,
  /** Fixed country for pages that are about one country, e.g. country tools. */
  forcedCountry,
  children,
}: {
  localeCode: LocaleCode;
  dictionary: Dictionary;
  forcedCountry?: CountryCode;
  children: ReactNode;
}) {
  const stored = useSyncExternalStore(
    countryStore.subscribe,
    countryStore.snapshot,
    countryStore.serverSnapshot,
  );

  const locale = LOCALES[localeCode];

  // A country tool is about its own country, so the visitor's preference does
  // not silently change what the page is showing.
  const countryCode: CountryCode =
    forcedCountry ??
    (stored && isCountryCode(stored) ? stored : locale.defaultCountry);

  const setCountry = useCallback((next: CountryCode) => {
    storeCountry(next);
    window.dispatchEvent(new Event("hoc:country"));
  }, []);

  const value = useMemo<LocaleValue>(() => {
    const t: TranslateFn = (key, params) => translate(dictionary, key, params);
    return {
      locale,
      localeCode,
      language: LANGUAGES[locale.language],
      dir: locale.dir,
      base: `/${locale.path}`,
      t,
      country: COUNTRIES[countryCode],
      countryCode,
      setCountry,
      countryIsExplicit: forcedCountry !== undefined || stored !== null,
      fmt: createFormatter(countryCode, locale.language),
    };
  }, [locale, localeCode, dictionary, countryCode, setCountry, forcedCountry, stored]);

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
