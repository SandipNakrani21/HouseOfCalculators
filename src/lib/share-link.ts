import type { CalculatorField, FieldValues } from "@/config/calculators/types";
import { isCountryCode, type CountryCode } from "@/config/countries";

/**
 * A calculator's share link: the page URL with the visitor's inputs in the
 * query string, plus the country they were calculating for, so a ₹30,00,000
 * loan does not open as $3,000,000 on the other end.
 *
 * Reading a link back treats the query as untrusted input. Only keys that are
 * fields of this calculator are used, every value is checked against its
 * field's kind and range, and anything that fails is dropped - the field then
 * keeps its default. These URLs are never canonical (the canonical tag points
 * to the clean page), so they stay out of the index.
 */

/** The query key for the country. No calculator field uses it. */
export const SHARE_COUNTRY_PARAM = "country";

/** Free-text fields are lists of numbers; nothing legitimate is this long. */
export const MAX_TEXT = 500;

export function buildShareUrl(href: string, values: FieldValues, country?: CountryCode): string {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  for (const [key, value] of Object.entries(values)) {
    url.searchParams.set(key, String(value));
  }
  if (country) url.searchParams.set(SHARE_COUNTRY_PARAM, country);
  return url.toString();
}

export type SharedInputs = {
  /** Only the fields present and valid in the link. */
  values: FieldValues;
  country: CountryCode | null;
};

export function readShareQuery(search: string, fields: CalculatorField[]): SharedInputs | null {
  if (!search || search === "?") return null;
  const query = new URLSearchParams(search);

  const values: FieldValues = {};
  for (const field of fields) {
    const raw = query.get(field.id);
    if (raw === null) continue;
    const value = parseField(field, raw);
    if (value !== undefined) values[field.id] = value;
  }

  const country = query.get(SHARE_COUNTRY_PARAM);
  const shared = { values, country: country && isCountryCode(country) ? country : null };
  return Object.keys(shared.values).length || shared.country ? shared : null;
}

function parseField(field: CalculatorField, raw: string): FieldValues[string] | undefined {
  switch (field.kind) {
    case "toggle":
      return raw === "true" ? true : raw === "false" ? false : undefined;
    case "select":
      return field.options?.some((option) => option.value === raw) ? raw : undefined;
    case "text":
      return raw.length <= MAX_TEXT ? raw : undefined;
    default: {
      // The same bounds the input clamps to on blur (FieldControl).
      if (raw.trim() === "") return undefined;
      const value = Number(raw);
      if (!Number.isFinite(value)) return undefined;
      return Math.min(Math.max(value, field.min ?? 0), field.max ?? 100);
    }
  }
}
