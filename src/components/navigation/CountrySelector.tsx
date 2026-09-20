"use client";

import { CountryBadge } from "@/components/shared/CountryBadge";
import { Dropdown } from "@/components/shared/Dropdown";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/config/countries";
import { useLocale } from "@/lib/locale-context";

/** "$ USD", but just "CHF" where the symbol already is the code. */
function currencyLabel(code: CountryCode): string {
  const { symbol, code: iso } = COUNTRIES[code].currency;
  return symbol === iso ? iso : `${symbol} ${iso}`;
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
}: {
  only?: CountryCode[];
}) {
  const { t, countryCode, setCountry } = useLocale();

  const codes = (only ?? COUNTRY_CODES)
    .slice()
    .sort((a, b) => t(`country.${a}`).localeCompare(t(`country.${b}`)));

  return (
    <Dropdown
      label={t("header.country")}
      trigger={
        <>
          <CountryBadge code={countryCode} />
          <span className="hidden font-medium text-foreground sm:inline">
            {t(`country.${countryCode}`)}
          </span>
        </>
      }
    >
      {(close) => (
        <>
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t("header.country")}
          </p>
          <ul>
            {codes.map((code) => {
              const active = code === countryCode;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      setCountry(code);
                      close();
                    }}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors ${
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    <CountryBadge code={code} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {t(`country.${code}`)}
                      </span>
                      <span className="block text-xs text-muted">
                        {currencyLabel(code)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Dropdown>
  );
}
