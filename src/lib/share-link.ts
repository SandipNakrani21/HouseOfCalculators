import type { CalculatorField, FieldValues } from "@/config/calculators/types";
import { isCountryCode, type CountryCode } from "@/config/countries";
import { calculatorFieldError, resolveFields, MAX_LIST_CHARACTERS } from "@/lib/validation";

/**
 * A calculator's share link: the page URL with the visitor's inputs in the
 * URL fragment, plus the country they were calculating for, so a ₹30,00,000
 * loan does not open as $3,000,000 on the other end.
 *
 * Fragments are not sent in HTTP requests. Older query links remain readable.
 * Reading a link treats its values as untrusted input. Only keys that are
 * fields of this calculator are used, every value is checked against its
 * field's kind and range, and anything that fails is dropped - the field then
 * keeps its default. These URLs are never canonical (the canonical tag points
 * to the clean page), so they stay out of the index.
 */

/** The query key for the country. No calculator field uses it. */
export const SHARE_COUNTRY_PARAM = "country";

/** Free-text fields are lists of numbers; nothing legitimate is this long. */
export const MAX_TEXT = MAX_LIST_CHARACTERS;

export function buildShareUrl(href: string, values: FieldValues, country?: CountryCode, version?: number): string {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  const inputs = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    inputs.set(key, String(value));
  }
  if (country) inputs.set(SHARE_COUNTRY_PARAM, country);
  if (version !== undefined) inputs.set("modelVersion", String(version));
  url.hash = `calc=${inputs.toString()}`;
  return url.toString();
}

export type SharedInputs = {
  /** Only the fields present and valid in the link. */
  values: FieldValues;
  country: CountryCode | null;
  obsolete?: boolean;
};

export function readShareQuery(search: string, fields: CalculatorField[], version?: number): SharedInputs | null {
  if (!search || search === "?") return null;
  const query = new URLSearchParams(search.startsWith("#calc=") ? search.slice(6) : search);
  const requestedCountry = query.get(SHARE_COUNTRY_PARAM);
  const countryCode = requestedCountry && isCountryCode(requestedCountry) ? requestedCountry : "us";
  const oldFieldNames = ["income", "salary", "period", "purchase", "sale", "holding", "balance", "extra", "years", "rate"];
  const hasCalculatorInputs = [...query.keys()].some(key => fields.some(field => field.id === key) || oldFieldNames.includes(key));
  if (version !== undefined && hasCalculatorInputs && query.get("modelVersion") !== String(version)) {
    return { values: {}, country: requestedCountry && isCountryCode(requestedCountry) ? requestedCountry : null, obsolete: true };
  }

  const values: FieldValues = {};
  const selection = Object.fromEntries(fields.filter(f => f.kind === "select").map(f => [f.id, query.get(f.id) ?? f.default]));
  for (const field of resolveFields(fields, selection)) {
    const raw = query.get(field.id);
    if (raw === null) continue;
    const value = parseField(field, raw, countryCode);
    if (value !== undefined) values[field.id] = value;
  }

  const country = query.get(SHARE_COUNTRY_PARAM);
  const shared = { values, country: country && isCountryCode(country) ? country : null };
  return Object.keys(shared.values).length || shared.country ? shared : null;
}

function parseField(field: CalculatorField, raw: string, country: CountryCode): FieldValues[string] | undefined {
  switch (field.kind) {
    case "toggle":
      return raw === "true" ? true : raw === "false" ? false : undefined;
    case "select":
      return field.options?.some((option) => option.value === raw) ? raw : undefined;
    case "text":
      return !calculatorFieldError(field, raw, country) ? raw : undefined;
    default: {
      return !calculatorFieldError(field, raw, country) ? Number(raw) : undefined;
    }
  }
}
