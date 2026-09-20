"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  COUNTRIES,
  COUNTRY_CODES,
  resolveLanguage,
  type CountryCode,
} from "@/config/countries";
import { LANGUAGES } from "@/config/languages";
import { CountryBadge } from "@/components/ui/CountryBadge";
import { countryParams } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { storeLocale } from "@/lib/locale-cookie";

type Props = {
  open: boolean;
  /** `gate` is the first-visit flow and cannot be dismissed without choosing. */
  mode: "gate" | "switch";
  onClose: () => void;
};

export function LocaleDialog({ open, mode, onClose }: Props) {
  const { t, countryCode, lang } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStep] = useState<"country" | "language">("country");
  const [draftCountry, setDraftCountry] = useState<CountryCode>(countryCode);

  // Reopening the dialog should always start from the current selection.
  // Adjusted during render rather than in an effect, so the first paint of a
  // reopened dialog is already correct.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("country");
      setDraftCountry(countryCode);
    }
  }

  useEffect(() => {
    if (!open || mode === "gate") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mode, onClose]);

  const languages = useMemo(
    () => COUNTRIES[draftCountry].languages,
    [draftCountry],
  );

  if (!open) return null;

  const apply = (nextLang: string) => {
    const country = draftCountry;
    const language = resolveLanguage(country, nextLang);

    storeLocale(country, language);

    // Keep the visitor on the same page, just under the new locale prefix.
    const rest = pathname.split("/").filter(Boolean).slice(2);
    const next = `/${country}/${language}${rest.length ? `/${rest.join("/")}` : ""}`;

    onClose();
    if (next === pathname) {
      router.refresh();
    } else {
      router.push(next);
    }
  };

  const names = countryParams(t, draftCountry);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locale-dialog-title"
      onClick={mode === "switch" ? onClose : undefined}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-border px-6 pb-5 pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {t("gate.step", { current: step === "country" ? 1 : 2, total: 2 })}
          </p>
          <h2
            id="locale-dialog-title"
            className="mt-1 text-xl font-semibold text-foreground"
          >
            {step === "country" ? t("gate.country.title") : t("gate.language.title")}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {step === "country"
              ? t("gate.country.subtitle")
              : t("gate.language.for", names)}
          </p>
        </header>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
          {step === "country" ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {COUNTRY_CODES.map((code) => {
                const active = code === draftCountry;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftCountry(code);
                        setStep("language");
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-border-strong hover:bg-surface-muted"
                      }`}
                    >
                      <CountryBadge code={code} size="lg" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {t(`country.${code}`)}
                        </span>
                        <span className="block text-xs text-muted">
                          {COUNTRIES[code].currency.symbol}{" "}
                          {COUNTRIES[code].currency.code}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {languages.map((code) => {
                const active = code === lang && draftCountry === countryCode;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => apply(code)}
                      dir={LANGUAGES[code].dir}
                      className={`flex w-full flex-col rounded-xl border p-3 text-start transition-colors ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-border-strong hover:bg-surface-muted"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {LANGUAGES[code].native}
                      </span>
                      <span className="text-xs text-muted" dir="ltr">
                        {LANGUAGES[code].english}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted px-6 py-4">
          <p className="text-xs text-muted">{t("gate.note")}</p>
          {step === "language" ? (
            <button
              type="button"
              onClick={() => setStep("country")}
              className="shrink-0 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
            >
              {t("common.back")}
            </button>
          ) : mode === "switch" ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
            >
              {t("common.close")}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
