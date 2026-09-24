"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { CountryBadge } from "@/components/shared/CountryBadge";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/config/countries";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { hasStoredLocale, storeCountry, storeLocale } from "@/lib/preferences";
import { swapLocale } from "@/lib/routes";

/** The cookie never changes without a navigation, so there is nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * Shown once, on a first visit, so a new visitor lands in their own language
 * and country rather than a guess. Language and country are asked as two
 * separate questions because they are two separate settings.
 *
 * The cookie is read as an external store so pages stay statically rendered -
 * reading it on the server would make every page dynamic - and the server
 * snapshot assumes a choice exists so the dialog never flashes for returning
 * visitors.
 */
export function WelcomeDialog({ ready }: { ready: LocaleCode[] }) {
  const stored = useSyncExternalStore(subscribe, hasStoredLocale, () => true);
  const [dismissed, setDismissed] = useState(false);
  const { t, localeCode, countryCode } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);

  const [draftLocale, setDraftLocale] = useState<LocaleCode>(localeCode);
  const [draftCountry, setDraftCountry] = useState<CountryCode>(countryCode);

  const open = !stored && !dismissed;

  // Focus moves into the dialog so keyboard and screen-reader users are not
  // left behind the overlay.
  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  if (!open) return null;

  const confirm = () => {
    storeLocale(draftLocale);
    storeCountry(draftCountry);
    window.dispatchEvent(new Event("hoc:country"));
    setDismissed(true);
    if (draftLocale !== localeCode) {
      router.push(swapLocale(pathname, draftLocale));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-surface shadow-xl outline-none sm:rounded-2xl"
      >
        <header className="border-b border-border px-6 pb-5 pt-6">
          <h2 id="welcome-title" className="text-xl font-bold">
            {t("gate.title", { app: t("app.name") })}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("gate.subtitle")}</p>
        </header>

        <div className="space-y-6 px-6 py-5">
          <section>
            <h3 className="mb-1 text-sm font-semibold">{t("gate.language.title")}</h3>
            <p className="mb-3 text-xs text-muted">{t("gate.language.subtitle")}</p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {ready.map((code) => {
                const locale = LOCALES[code];
                const active = code === draftLocale;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      lang={locale.language}
                      dir={locale.dir}
                      onClick={() => setDraftLocale(code)}
                      aria-pressed={active}
                      className={`w-full rounded-xl border p-2.5 text-start transition-colors ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-border-strong hover:bg-surface-muted"
                      }`}
                    >
                      <span className="block text-sm font-medium">{locale.native}</span>
                      <span className="block text-xs text-muted" dir="ltr">
                        {locale.code}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold">{t("gate.country.title")}</h3>
            <p className="mb-3 text-xs text-muted">{t("gate.country.subtitle")}</p>
            <ul className="grid max-h-56 gap-2 overflow-y-auto pe-1 sm:grid-cols-3">
              {COUNTRY_CODES.map((code) => {
                const active = code === draftCountry;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => setDraftCountry(code)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-2 rounded-xl border p-2.5 text-start transition-colors ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-border-strong hover:bg-surface-muted"
                      }`}
                    >
                      <CountryBadge code={code} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {t(`country.${code}`)}
                        </span>
                        <span className="block text-xs text-muted">
                          {COUNTRIES[code].currency.code}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted px-6 py-4">
          <p className="text-xs text-muted">{t("gate.note")}</p>
          <button
            type="button"
            onClick={confirm}
            className="shrink-0 btn-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover"
          >
            {t("common.continue")}
          </button>
        </footer>
      </div>
    </div>
  );
}
