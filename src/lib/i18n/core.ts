
/**
 * The dictionary-free half of i18n: everything a client component may need.
 *
 * Nothing here imports a dictionary file. Client code must import from this
 * module, never from `@/lib/i18n` - that one bundles every language's JSON,
 * and reaching it from the browser ships all of them on every page. The page
 * already receives its own dictionary through `LocaleProvider`.
 */

export type Dictionary = Record<string, string>;

export type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

/**
 * Looks up `key` and fills `{placeholder}` slots from `params`.
 * An unknown key returns the key itself, which makes gaps obvious in the UI
 * rather than rendering an empty string.
 */
export function translate(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  const template = dict[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * A unit's name, plural where the language provides one and singular where it
 * does not. `Metres to Feet` is what people search for; `Metre to Foot` is not.
 *
 * Falling back to the English plural in a German sentence would be worse than
 * the German singular, so merged dictionaries leave out `*.plural` keys a
 * language does not define itself (see `getDictionary`); a missing key comes
 * back as the key, and the singular is used.
 */
export function unitName(t: TranslateFn, labelKey: string, plural = false): string {
  if (!plural) return t(labelKey);
  const pluralKey = `${labelKey}.plural`;
  const value = t(pluralKey);
  return value === pluralKey ? t(labelKey) : value;
}

const pluralRules = new Map<string, Intl.PluralRules>();

/**
 * A counted phrase in the right plural form: "1 day", "2 days".
 *
 * Keys come in CLDR categories - `key.one`, `key.other`, and `key.zero` /
 * `key.two` / `key.few` / `key.many` where a language has them (Arabic uses
 * all six). The category is chosen by `Intl.PluralRules` for the page's
 * locale, and `key.other` covers any category a dictionary leaves out.
 *
 * `{count}` receives `display` when given (the count already formatted for
 * the locale), otherwise the bare number. `decimals` must match how the count
 * is displayed: in English "1 year" but "1.0 years".
 */
export function plural(
  t: TranslateFn,
  locale: string,
  key: string,
  count: number,
  opts: { display?: string; decimals?: number; params?: Record<string, string | number> } = {},
): string {
  const decimals = opts.decimals ?? 0;
  const cacheKey = `${locale}|${decimals}`;
  let rules = pluralRules.get(cacheKey);
  if (!rules) {
    rules = new Intl.PluralRules(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    pluralRules.set(cacheKey, rules);
  }
  const params = { ...opts.params, count: opts.display ?? count };
  const exact = `${key}.${rules.select(count)}`;
  const text = t(exact, params);
  return text === exact ? t(`${key}.other`, params) : text;
}
