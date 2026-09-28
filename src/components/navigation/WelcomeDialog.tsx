"use client";

import { ArrowRight, Globe2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

import { countryOptions } from "@/components/navigation/CountrySelector";
import { localeOptions } from "@/components/navigation/LocaleSelector";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { CountryCode } from "@/config/countries";
import type { LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { hasStoredLocale, storeCountry, storeLocale } from "@/lib/preferences";
import { swapLocale } from "@/lib/routes";

/** The cookie never changes without a navigation, so there is nothing to subscribe to. */
const subscribe = () => () => {};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Shown once, on a first visit, so a new visitor lands in their own language
 * and country rather than a guess: one headline, two dropdowns, one button.
 * Language and country are separate questions because they are separate
 * settings.
 *
 * The cookie is read as an external store so pages stay statically rendered,
 * and the server snapshot assumes a choice exists so the dialog never flashes
 * for returning visitors.
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

  // Focus moves into the dialog and the page behind stops scrolling.
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
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
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-4 backdrop-blur-md">
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="animate-dialog relative max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-[36rem] overflow-y-auto rounded-xl bg-surface shadow-[0_40px_80px_-24px_rgba(15,27,61,0.55)] outline-none"
      >
        {/* Header: a soft blue band with a slowly breathing glow behind the mark. */}
        <header className="relative overflow-hidden bg-bg-tint px-6 pb-7 pt-8 sm:px-8">
          <div aria-hidden className="animate-glow absolute -end-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_28%,transparent),transparent_70%)]" />
          <div aria-hidden className="animate-glow absolute -bottom-24 -start-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-sky)_24%,transparent),transparent_70%)] [animation-delay:-3s]" />
          <span aria-hidden className="animate-pop relative grid h-12 w-12 place-items-center rounded-lg bg-gradient-cta text-white shadow-primary">
            <Globe2 className="h-6 w-6" />
          </span>
          <h2
            id="welcome-title"
            className="animate-fade-up relative mt-5 text-[1.375rem] font-extrabold leading-snug tracking-tight text-heading sm:text-2xl"
            style={delay(120)}
          >
            {t("gate.headline")}
          </h2>
        </header>

        {/* min-w-0: grid items otherwise refuse to shrink below their longest
            unbroken text, which pushed the panel off-screen on phones. */}
        <div className="grid grid-cols-1 gap-5 px-6 py-7 sm:grid-cols-2 sm:px-8">
          <div className="animate-fade-up min-w-0" style={delay(200)}>
            <Select
              showLabel
              label={t("header.language")}
              value={draftLocale}
              onChange={setDraftLocale}
              options={localeOptions(ready).map((option) => ({
                ...option,
                icon: <Globe2 aria-hidden className="h-[18px] w-[18px] text-primary" />,
              }))}
            />
          </div>
          <div className="animate-fade-up min-w-0" style={delay(280)}>
            <Select
              showLabel
              label={t("header.country")}
              value={draftCountry}
              onChange={setDraftCountry}
              options={countryOptions(t)}
              searchable
              searchPlaceholder={t("common.searchCountries")}
              noResults={t("common.noMatches")}
            />
          </div>
        </div>

        <footer
          className="animate-fade-up flex flex-col-reverse gap-4 border-t border-border bg-bg-soft px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
          style={delay(360)}
        >
          <p className="text-xs leading-relaxed text-muted">
            <span aria-hidden className="me-1 font-bold text-alert">*</span>
            {t("gate.note")}
          </p>
          <Button onClick={confirm} size="md" iconEnd={<ArrowRight />} className="w-full sm:w-auto">
            {t("common.continue")}
          </Button>
        </footer>
      </div>
    </div>
  );
}
