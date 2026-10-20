"use client";

import { CountrySelector } from "@/components/navigation/CountrySelector";
import { LocaleSelector } from "@/components/navigation/LocaleSelector";
import type { LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";

/**
 * The navy strip above the header: a static, expandable notice alongside
 * the language and country pickers. Readers choose when to view its full text.
 */
export function TopBar({ ready }: { ready: LocaleCode[] }) {
  const { t } = useLocale();
  const text = t("footer.disclaimer", { app: t("app.name") });

  return (
    <div data-print-exclude className="relative bg-navy text-white">
      {/* The header's own container, so the pickers' right edge lines up
          with the header's search field at every width. */}
      <div className="container-page flex items-center [--container:var(--container-xwide)]">
        {/* The asterisk stays put at the start edge while the line scrolls past it. */}
        <span aria-hidden className="relative z-10 shrink-0 bg-navy pe-2 text-base font-bold leading-none text-alert-on-navy">
          *
        </span>
        <details className="min-w-0 flex-1 py-2 text-xs font-semibold sm:text-sm">
          <summary className="cursor-pointer rounded-sm py-2 underline decoration-white/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-white">{t("notice.readFull")}</summary>
          <p className="absolute inset-x-4 top-full z-[60] max-h-[60dvh] overflow-y-auto rounded-lg border border-white/20 bg-navy p-5 text-sm font-normal leading-relaxed shadow-lift">{text}</p>
        </details>
        {/* Language, then country: white dropdowns on the navy bar. */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-navy py-2 ps-3 sm:gap-3 sm:py-2.5">
          <LocaleSelector ready={ready} size="sm" />
          <CountrySelector flagOnly size="sm" />
        </div>
      </div>
    </div>
  );
}
