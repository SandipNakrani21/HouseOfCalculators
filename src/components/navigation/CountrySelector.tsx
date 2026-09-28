"use client";

import { CountryBadge } from "@/components/ui/CountryBadge";
import { Select, type SelectOption } from "@/components/ui/Select";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/config/countries";
import { useLocale } from "@/lib/locale-context";

/** "$ USD", but just "CHF" where the symbol already is the code. */
export function currencyLabel(code: CountryCode): string {
  const { symbol, code: iso } = COUNTRIES[code].currency;
  return symbol === iso ? iso : `${symbol} ${iso}`;
}

/** Every country as a dropdown option: flag, name, currency. Sorted by name. */
export function countryOptions(
  t: (key: string) => string,
  only?: CountryCode[],
): SelectOption<CountryCode>[] {
  return (only ?? COUNTRY_CODES)
    .map((code) => ({
      value: code,
      label: t(`country.${code}`),
      hint: currencyLabel(code),
      icon: <CountryBadge code={code} />,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Country context: currency, units, formatting and statutory rules. Changing
 * it never navigates, because the country is a setting rather than a location
 * in the site - except on a country tool, where the page is about one country
 * and the selector is hidden.
 */
export function CountrySelector({
  /** Restrict the list, e.g. to the countries a calculator supports. */
  only,
  /** Flag only until 2xl, where the header has room for the name. */
  compact = false,
  /** Never show the name. */
  flagOnly = false,
  align = "end",
  size = "md",
}: {
  only?: CountryCode[];
  compact?: boolean;
  flagOnly?: boolean;
  align?: "start" | "end";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const { t, countryCode, setCountry } = useLocale();

  return (
    <Select
      variant="pill"
      size={size}
      align={align}
      label={t("header.country")}
      value={countryCode}
      onChange={setCountry}
      options={countryOptions(t, only)}
      searchable
      searchPlaceholder={t("common.searchCountries")}
      noResults={t("common.noMatches")}
      trigger={(selected) => (
        <>
          {size === "xl" && selected ? (
            // The header's larger trigger gets a larger flag.
            <CountryBadge code={selected.value} size="md" />
          ) : (
            selected?.icon
          )}
          <span
            className={`whitespace-nowrap font-semibold text-heading ${
              flagOnly ? "hidden" : compact ? "hidden 2xl:inline" : "inline"
            }`}
          >
            {selected?.label}
          </span>
        </>
      )}
    />
  );
}
