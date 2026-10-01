import "server-only";

import { LANGUAGE_CODES, type LanguageCode } from "@/config/languages";
import type { LocaleCode } from "@/config/locales";

import { translate, type Dictionary, type TranslateFn } from "./core";
import ar from "./dictionaries/ar.json";
import de from "./dictionaries/de.json";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";
import gu from "./dictionaries/gu.json";
import hi from "./dictionaries/hi.json";
import it from "./dictionaries/it.json";
import ja from "./dictionaries/ja.json";
import mr from "./dictionaries/mr.json";
import nl from "./dictionaries/nl.json";
import pt from "./dictionaries/pt.json";
import ru from "./dictionaries/ru.json";
import tr from "./dictionaries/tr.json";
import zh from "./dictionaries/zh.json";
import enGB from "./dictionaries/regional/en-GB.json";
import enUS from "./dictionaries/regional/en-US.json";

export * from "./core";

/**
 * SERVER-ONLY. This module bundles every language's dictionary, so importing
 * it (even indirectly) from a client component ships all of them to every
 * page. Client code imports `@/lib/i18n/core` and receives the active
 * dictionary through `LocaleProvider`.
 */

/**
 * English is the source of truth; other languages fall back to it key by key.
 * A language with no entry here simply has no translation yet - it stays in
 * the language registry, but `isLanguageReady` keeps it out of the picker
 * until its file exists and covers enough of the site.
 */
const RAW: Partial<Record<LanguageCode, Dictionary>> = {
  en,
  hi,
  gu,
  mr,
  es,
  ar,
  de,
  fr,
  pt,
  it,
  nl,
  ru,
  tr,
  ja,
  zh,
};

/**
 * Each language over English, minus the English `*.plural` unit names the
 * language does not define itself: `unitName` then uses the language's own
 * singular rather than an English plural in the middle of a German sentence.
 */
const MERGED = LANGUAGE_CODES.reduce(
  (all, code) => {
    const own = RAW[code] ?? {};
    const merged: Dictionary = { ...en, ...own };
    if (code !== "en") {
      for (const key of Object.keys(en)) {
        if (key.endsWith(".plural") && !(key in own)) delete merged[key];
      }
    }
    all[code] = merged;
    return all;
  },
  {} as Record<LanguageCode, Dictionary>,
);

/**
 * Regional wording on top of a language: the same English, spelt and worded
 * for its market. en-US reads "Meters", "Amortization" and "installment";
 * en-GB reads "Maths". Only keys that differ are listed, and they apply to
 * that locale's pages alone - titles, descriptions, headings, FAQs and
 * structured data all come from the same dictionary, so search and answer
 * engines see each market's own spelling.
 *
 * A regional file may only override keys English defines (`npm run i18n`
 * reports any that do not).
 */
const REGIONAL: Partial<Record<LocaleCode, Dictionary>> = {
  "en-US": enUS,
  "en-GB": enGB,
};

const BY_LOCALE = new Map<LocaleCode, Dictionary>();

export function getDictionary(lang: LanguageCode, locale?: LocaleCode): Dictionary {
  const base = MERGED[lang] ?? MERGED.en;
  const regional = locale ? REGIONAL[locale] : undefined;
  if (!locale || !regional) return base;
  let dict = BY_LOCALE.get(locale);
  if (!dict) {
    dict = { ...base, ...regional };
    BY_LOCALE.set(locale, dict);
  }
  return dict;
}

/**
 * Long reading text that only server components render: calculator and tool
 * explanations and FAQs, guide bodies, and the legal pages. It reaches the
 * browser already in the HTML, so the browser's copy of the dictionary leaves
 * it out. Titles, descriptions (the search index), labels, hints, notes and
 * results stay. A key matched here that a client component needs would show
 * as the raw key, which the QA pass looks for.
 */
const SERVER_ONLY_KEY =
  /^(?:(?:calc|tool|chart|conv)\.[^.]+\.(?:faq|explain)(?:\.|$)|guide\.[^.]+\.(?!(?:title|desc)$)[^.]+|legal\.)/;

const CLIENT_DICTIONARIES = new Map<string, Dictionary>();

/**
 * The part of a dictionary the browser needs (see SERVER_ONLY_KEY). Every page
 * embeds this for the client-side translator, so trimming it shrinks every
 * page in every language.
 */
export function getClientDictionary(lang: LanguageCode, locale?: LocaleCode): Dictionary {
  const cacheKey = `${lang}|${locale ?? ""}`;
  let dict = CLIENT_DICTIONARIES.get(cacheKey);
  if (!dict) {
    dict = Object.fromEntries(
      Object.entries(getDictionary(lang, locale)).filter(([key]) => !SERVER_ONLY_KEY.test(key)),
    );
    CLIENT_DICTIONARIES.set(cacheKey, dict);
  }
  return dict;
}

/**
 * A translator for a language, worded for `locale`'s market when given. Pages
 * always pass their locale; only language-level code (the coverage gate)
 * leaves it out.
 */
export function createTranslator(lang: LanguageCode, locale?: LocaleCode): TranslateFn {
  const dict = getDictionary(lang, locale);
  return (key, params) => translate(dict, key, params);
}

/**
 * A language is only offered once its dictionary actually covers the site.
 *
 * Every key falls back to English when it is missing, which is the right
 * runtime behaviour but the wrong promise to make in the picker: choosing
 * 日本語 and getting an English page is worse than not being offered it. The
 * threshold is measured against English, so a language switches itself on as
 * soon as its file is filled in - there is no separate list to maintain.
 */
export const READINESS_THRESHOLD = 0.75;

const ENGLISH_KEYS = Object.keys(en);

export const LANGUAGE_COVERAGE = LANGUAGE_CODES.reduce(
  (all, code) => {
    const dict = RAW[code];
    const covered = dict ? ENGLISH_KEYS.filter((key) => key in dict).length : 0;
    all[code] = covered / ENGLISH_KEYS.length;
    return all;
  },
  {} as Record<LanguageCode, number>,
);

export function isLanguageReady(lang: LanguageCode): boolean {
  return lang === "en" || LANGUAGE_COVERAGE[lang] >= READINESS_THRESHOLD;
}
